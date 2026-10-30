package com.college.kafka.reliability.service;

import com.college.kafka.reliability.entity.ProcessedEventEntity;
import com.college.kafka.reliability.repository.ProcessedEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);

    private final ProcessedEventRepository processedEventRepository;
    private final LoggingService loggingService;

    public IdempotencyService(ProcessedEventRepository processedEventRepository, LoggingService loggingService) {
        this.processedEventRepository = processedEventRepository;
        this.loggingService = loggingService;
    }

    /**
     * Checks if the event has already been processed or previously committed.
     */
    public boolean isAlreadyProcessed(String eventId) {
        Optional<ProcessedEventEntity> existing = processedEventRepository.findByEventId(eventId);
        return existing.isPresent() && "Success".equalsIgnoreCase(existing.get().getStatus());
    }

    /**
     * Attempts to register the initial event processing record.
     * Uses DB unique constraint to guarantee single execution even during concurrent delivery.
     * Returns true if newly registered, false if already processed or duplicate.
     */
    @Transactional
    public boolean registerOrDetectDuplicate(String eventId, String content, String failureSimulation) {
        Optional<ProcessedEventEntity> existing = processedEventRepository.findByEventId(eventId);
        if (existing.isPresent()) {
            ProcessedEventEntity entity = existing.get();
            if ("Success".equalsIgnoreCase(entity.getStatus())) {
                loggingService.recordLog(eventId, 0, "Duplicate Event Detected",
                        "Idempotency check failed: Event ID '" + eventId + "' was already processed. Discarding duplicate.");
                entity.setStatus("Duplicate Ignored");
                entity.setProcessingResult("Duplicate event received - safely ignored by idempotency filter");
                processedEventRepository.save(entity);
                return false;
            }
            return true;
        }

        try {
            ProcessedEventEntity newEntity = new ProcessedEventEntity(
                    eventId,
                    content,
                    "Processing",
                    0,
                    "Event received by consumer, starting processing.",
                    failureSimulation
            );
            processedEventRepository.saveAndFlush(newEntity);
            return true;
        } catch (DataIntegrityViolationException dive) {
            log.warn("Concurrent duplicate insertion for eventId: {}", eventId);
            loggingService.recordLog(eventId, 0, "Concurrent Duplicate Blocked",
                    "Database uniqueness constraint prevented duplicate execution for eventId: " + eventId);
            return false;
        }
    }

    @Transactional
    public void markSuccess(String eventId, String content) {
        Optional<ProcessedEventEntity> existing = processedEventRepository.findByEventId(eventId);
        ProcessedEventEntity entity;
        if (existing.isPresent()) {
            entity = existing.get();
        } else {
            entity = new ProcessedEventEntity();
            entity.setEventId(eventId);
            entity.setContent(content);
        }
        entity.setStatus("Success");
        entity.setProcessingResult("Post successfully published and committed to storage.");
        processedEventRepository.save(entity);
    }
}
