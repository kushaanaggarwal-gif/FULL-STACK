package com.college.kafka.reliability.service;

import com.college.kafka.reliability.entity.ProcessedEventEntity;
import com.college.kafka.reliability.model.PostEvent;
import com.college.kafka.reliability.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class EventProducerService {

    private static final Logger log = LoggerFactory.getLogger(EventProducerService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ProcessedEventRepository processedEventRepository;
    private final LoggingService loggingService;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topic.main:scheduled-posts}")
    private String mainTopic;

    public EventProducerService(KafkaTemplate<String, String> kafkaTemplate,
                                ProcessedEventRepository processedEventRepository,
                                LoggingService loggingService,
                                ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.processedEventRepository = processedEventRepository;
        this.loggingService = loggingService;
        this.objectMapper = objectMapper;
    }

    public PostEvent publishEvent(PostEvent event) {
        // Auto-generate Event ID if empty
        if (event.getEventId() == null || event.getEventId().trim().isEmpty()) {
            event.setEventId("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (event.getContent() == null || event.getContent().trim().isEmpty()) {
            event.setContent("Automated post content for event " + event.getEventId());
        }

        // Initialize or update status in repository as Pending
        Optional<ProcessedEventEntity> existing = processedEventRepository.findByEventId(event.getEventId());
        if (existing.isEmpty()) {
            ProcessedEventEntity entity = new ProcessedEventEntity(
                    event.getEventId(),
                    event.getContent(),
                    "Pending",
                    0,
                    "Event placed on Kafka producer queue",
                    event.getFailureSimulation()
            );
            processedEventRepository.save(entity);
        }

        try {
            String jsonPayload = objectMapper.writeValueAsString(event);
            loggingService.recordLog(event.getEventId(), 0, "Producer sending event",
                    "Sent event payload to topic '" + mainTopic + "' with failureMode=" + event.getFailureSimulation());

            kafkaTemplate.send(mainTopic, event.getEventId(), jsonPayload);
            log.info("Published event {} to topic {}", event.getEventId(), mainTopic);

            // If duplicate simulation is checked, send duplicate event
            if (event.isSimulateDuplicate()) {
                CompletableFuture.runAsync(() -> {
                    try {
                        Thread.sleep(600); // small delay so initial event is received
                        loggingService.recordLog(event.getEventId(), 0, "Producer sending duplicate event",
                                "Simulating duplicate event delivery with identical ID: " + event.getEventId());
                        kafkaTemplate.send(mainTopic, event.getEventId(), jsonPayload);
                    } catch (Exception e) {
                        log.error("Failed to send simulated duplicate: {}", e.getMessage());
                    }
                });
            }

        } catch (Exception e) {
            log.error("Failed to serialize or send event: {}", e.getMessage(), e);
            loggingService.recordLog(event.getEventId(), 0, "Producer Error", "Failed to publish: " + e.getMessage());
        }

        return event;
    }
}
