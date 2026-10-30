package com.college.kafka.reliability.service;

import com.college.kafka.reliability.entity.DlqEventEntity;
import com.college.kafka.reliability.entity.ProcessedEventEntity;
import com.college.kafka.reliability.model.PostEvent;
import com.college.kafka.reliability.repository.DlqEventRepository;
import com.college.kafka.reliability.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class EventConsumerService {

    private static final Logger log = LoggerFactory.getLogger(EventConsumerService.class);

    private final IdempotencyService idempotencyService;
    private final LoggingService loggingService;
    private final ProcessedEventRepository processedEventRepository;
    private final DlqEventRepository dlqEventRepository;
    private final ObjectMapper objectMapper;

    // In-memory tracker for retry attempt simulation per event
    private final ConcurrentHashMap<String, AtomicInteger> attemptTracker = new ConcurrentHashMap<>();

    public EventConsumerService(IdempotencyService idempotencyService,
                                LoggingService loggingService,
                                ProcessedEventRepository processedEventRepository,
                                DlqEventRepository dlqEventRepository,
                                ObjectMapper objectMapper) {
        this.idempotencyService = idempotencyService;
        this.loggingService = loggingService;
        this.processedEventRepository = processedEventRepository;
        this.dlqEventRepository = dlqEventRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${kafka.topic.main:scheduled-posts}", groupId = "reliability-consumer-group")
    public void consumeMainTopic(ConsumerRecord<String, String> record) throws Exception {
        String payload = record.value();
        PostEvent event = objectMapper.readValue(payload, PostEvent.class);
        String eventId = event.getEventId();

        AtomicInteger counter = attemptTracker.computeIfAbsent(eventId, k -> new AtomicInteger(0));
        int currentAttempt = counter.incrementAndGet();

        loggingService.recordLog(eventId, currentAttempt, "Event received by consumer",
                "Consumer processing message at partition=" + record.partition() + ", offset=" + record.offset());

        // Update entity state to Processing
        Optional<ProcessedEventEntity> entityOpt = processedEventRepository.findByEventId(eventId);
        if (entityOpt.isPresent()) {
            ProcessedEventEntity entity = entityOpt.get();
            // Check if already succeeded -> Idempotency check!
            if ("Success".equalsIgnoreCase(entity.getStatus())) {
                loggingService.recordLog(eventId, 0, "Duplicate Event Ignored",
                        "Event ID '" + eventId + "' was already processed. Skipped duplicate business operation.");
                entity.setStatus("Duplicate Ignored");
                entity.setProcessingResult("Duplicate event ignored by consumer idempotency verification");
                processedEventRepository.save(entity);
                return;
            }
            entity.setStatus("Processing");
            entity.setRetryAttempts(currentAttempt - 1);
            processedEventRepository.save(entity);
        } else {
            boolean isNew = idempotencyService.registerOrDetectDuplicate(eventId, event.getContent(), event.getFailureSimulation());
            if (!isNew) {
                return;
            }
        }

        // Handle Failure Simulations
        String failureMode = event.getFailureSimulation() != null ? event.getFailureSimulation().toUpperCase() : "NONE";

        if ("PERMANENT".equals(failureMode)) {
            // Fails on every single attempt to trigger retries and DLQ
            throw new SimulatedPermanentException("Simulated permanent processing failure on attempt " + currentAttempt);
        } else if ("TEMPORARY".equals(failureMode)) {
            // Fails on the first attempt, succeeds on the second attempt to demonstrate retry mechanism
            if (currentAttempt <= 1) {
                throw new SimulatedTemporaryException("Simulated transient connection timeout on attempt " + currentAttempt);
            }
            // Once attempt > 1, temporary issue has resolved!
            log.info("Temporary failure resolved for event {} on attempt {}", eventId, currentAttempt);
        }

        // Business Operation Execution: Commit post
        idempotencyService.markSuccess(eventId, event.getContent());
        loggingService.recordLog(eventId, currentAttempt, "Processing Success",
                "Event successfully processed and saved to persistent database.");

        // Clear attempt tracker
        attemptTracker.remove(eventId);
    }

    @KafkaListener(topics = "${kafka.topic.dlt:scheduled-posts-dlt}", groupId = "reliability-dlq-consumer-group")
    public void consumeDlqTopic(ConsumerRecord<String, String> record) {
        String eventId = record.key();
        String payload = record.value();
        loggingService.recordLog(eventId, 0, "DLQ Topic Monitored",
                "Dead letter queue verified delivery on topic: " + record.topic());
    }

    public void resetAttemptCounter(String eventId) {
        attemptTracker.remove(eventId);
    }
}
