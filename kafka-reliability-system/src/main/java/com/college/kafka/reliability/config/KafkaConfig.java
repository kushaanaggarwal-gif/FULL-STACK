package com.college.kafka.reliability.config;

import com.college.kafka.reliability.entity.DlqEventEntity;
import com.college.kafka.reliability.entity.ProcessedEventEntity;
import com.college.kafka.reliability.model.PostEvent;
import com.college.kafka.reliability.repository.DlqEventRepository;
import com.college.kafka.reliability.repository.ProcessedEventRepository;
import com.college.kafka.reliability.service.LoggingService;
import com.college.kafka.reliability.service.ReliabilityConfigService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.ConsumerRecordRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.listener.RetryListener;
import org.springframework.util.backoff.BackOff;
import org.springframework.util.backoff.BackOffExecution;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Configuration
@EnableKafka
public class KafkaConfig {

    private static final Logger log = LoggerFactory.getLogger(KafkaConfig.class);

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${kafka.topic.main:scheduled-posts}")
    private String mainTopic;

    @Value("${kafka.topic.dlt:scheduled-posts-dlt}")
    private String dltTopic;

    private final ReliabilityConfigService reliabilityConfigService;
    private final LoggingService loggingService;
    private final ProcessedEventRepository processedEventRepository;
    private final DlqEventRepository dlqEventRepository;
    private final ObjectMapper objectMapper;

    public KafkaConfig(ReliabilityConfigService reliabilityConfigService,
                       LoggingService loggingService,
                       ProcessedEventRepository processedEventRepository,
                       DlqEventRepository dlqEventRepository,
                       ObjectMapper objectMapper) {
        this.reliabilityConfigService = reliabilityConfigService;
        this.loggingService = loggingService;
        this.processedEventRepository = processedEventRepository;
        this.dlqEventRepository = dlqEventRepository;
        this.objectMapper = objectMapper;
    }

    @Bean
    public NewTopic scheduledPostsTopic() {
        return TopicBuilder.name(mainTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic scheduledPostsDltTopic() {
        return TopicBuilder.name(dltTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "reliability-consumer-group");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        return new DefaultKafkaConsumerFactory<>(config);
    }

    /**
     * Dynamic exponential backoff that adapts to the current user configuration
     */
    @Bean
    public CommonErrorHandler errorHandler(KafkaTemplate<String, String> template) {
        // Recoverer sends to DLQ topic when max retries are reached
        ConsumerRecordRecoverer recoverer = (record, exception) -> {
            String eventId = "UNKNOWN";
            String eventContent = (String) record.value();
            try {
                PostEvent event = objectMapper.readValue(eventContent, PostEvent.class);
                eventId = event.getEventId();
            } catch (Exception ignored) {
                eventId = String.valueOf(record.key());
            }

            int totalRetries = reliabilityConfigService.getMaxRetries();
            String reason = exception != null && exception.getCause() != null
                    ? exception.getCause().getMessage()
                    : (exception != null ? exception.getMessage() : "Exhausted retries");

            loggingService.recordLog(eventId, totalRetries, "Maximum retries reached",
                    "Exhausted " + totalRetries + " retries. Routing event to Dead Letter Queue (" + dltTopic + ").");

            // Update processed event status
            Optional<ProcessedEventEntity> entityOpt = processedEventRepository.findByEventId(eventId);
            if (entityOpt.isPresent()) {
                ProcessedEventEntity entity = entityOpt.get();
                entity.setStatus("Sent to DLQ");
                entity.setRetryAttempts(totalRetries);
                entity.setProcessingResult("Failed after " + totalRetries + " retries: " + reason);
                processedEventRepository.save(entity);
            }

            // Record into DLQ table
            DlqEventEntity dlqEntity = new DlqEventEntity(eventId, eventContent, reason, totalRetries + 1);
            dlqEventRepository.save(dlqEntity);

            // Publish to Kafka DLQ Topic
            try {
                template.send(dltTopic, eventId, eventContent);
                loggingService.recordLog(eventId, totalRetries, "Event sent to DLQ",
                        "Successfully published failed event to topic: " + dltTopic);
            } catch (Exception ex) {
                log.error("Failed to publish to DLQ topic: {}", ex.getMessage());
            }
        };

        // Custom BackOff implementation with dynamic exponential calculation:
        // Delay = Initial Delay * (Backoff Multiplier ^ Retry Attempt)
        BackOff dynamicBackOff = () -> new BackOffExecution() {
            private int attempt = 0;

            @Override
            public long nextBackOff() {
                int maxRetries = reliabilityConfigService.getMaxRetries();
                if (attempt >= maxRetries) {
                    return STOP;
                }
                long delay = reliabilityConfigService.calculateDelay(attempt);
                attempt++;
                reliabilityConfigService.setCurrentRetryAttempt(attempt);
                return delay;
            }
        };

        DefaultErrorHandler errorHandler = new DefaultErrorHandler(recoverer, dynamicBackOff);

        // Retry listener for logging each retry step with calculated delay
        errorHandler.setRetryListeners(new RetryListener() {
            @Override
            public void failedDelivery(ConsumerRecord<?, ?> record, Exception ex, int deliveryAttempt) {
                String eventId = "UNKNOWN";
                try {
                    PostEvent event = objectMapper.readValue((String) record.value(), PostEvent.class);
                    eventId = event.getEventId();
                } catch (Exception ignored) {
                    eventId = String.valueOf(record.key());
                }

                String errorMsg = ex != null && ex.getCause() != null ? ex.getCause().getMessage() : (ex != null ? ex.getMessage() : "Processing failed");
                int retryIndex = deliveryAttempt - 1;
                long delay = reliabilityConfigService.calculateDelay(retryIndex);

                loggingService.recordLog(eventId, deliveryAttempt, "Processing attempt " + deliveryAttempt + " failed",
                        errorMsg);

                loggingService.recordLog(eventId, deliveryAttempt, "Waiting before retry",
                        "Calculated exponential backoff delay: " + delay + " ms (Attempt: " + deliveryAttempt + ")");

                // Update status to Retrying
                Optional<ProcessedEventEntity> entityOpt = processedEventRepository.findByEventId(eventId);
                if (entityOpt.isPresent()) {
                    ProcessedEventEntity entity = entityOpt.get();
                    entity.setStatus("Retrying");
                    entity.setRetryAttempts(deliveryAttempt);
                    entity.setProcessingResult("Attempt " + deliveryAttempt + " failed. Waiting " + delay + " ms before retry.");
                    processedEventRepository.save(entity);
                }
            }
        });

        return errorHandler;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory(
            ConsumerFactory<String, String> consumerFactory,
            CommonErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }
}
