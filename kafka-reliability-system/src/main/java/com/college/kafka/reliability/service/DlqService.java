package com.college.kafka.reliability.service;

import com.college.kafka.reliability.entity.DlqEventEntity;
import com.college.kafka.reliability.entity.ProcessedEventEntity;
import com.college.kafka.reliability.model.PostEvent;
import com.college.kafka.reliability.repository.DlqEventRepository;
import com.college.kafka.reliability.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DlqService {

    private static final Logger log = LoggerFactory.getLogger(DlqService.class);

    private final DlqEventRepository dlqEventRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final LoggingService loggingService;
    private final EventConsumerService eventConsumerService;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topic.main:scheduled-posts}")
    private String mainTopic;

    public DlqService(DlqEventRepository dlqEventRepository,
                      ProcessedEventRepository processedEventRepository,
                      KafkaTemplate<String, String> kafkaTemplate,
                      LoggingService loggingService,
                      EventConsumerService eventConsumerService,
                      ObjectMapper objectMapper) {
        this.dlqEventRepository = dlqEventRepository;
        this.processedEventRepository = processedEventRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.loggingService = loggingService;
        this.eventConsumerService = eventConsumerService;
        this.objectMapper = objectMapper;
    }

    public List<DlqEventEntity> getAllDlqEvents() {
        return dlqEventRepository.findAllByOrderByTimestampDesc();
    }

    public Optional<DlqEventEntity> getDlqEvent(String eventId) {
        return dlqEventRepository.findByEventId(eventId);
    }

    @Transactional
    public boolean retryDlqEvent(String eventId) {
        Optional<DlqEventEntity> dlqOpt = dlqEventRepository.findByEventId(eventId);
        if (dlqOpt.isEmpty()) {
            return false;
        }

        DlqEventEntity dlqEntry = dlqOpt.get();
        try {
            PostEvent event;
            try {
                event = objectMapper.readValue(dlqEntry.getEventContent(), PostEvent.class);
            } catch (Exception e) {
                event = new PostEvent(eventId, dlqEntry.getEventContent(), "NONE", false);
            }

            // Retain original eventId, reset failure simulation so it can succeed
            event.setFailureSimulation("NONE");
            event.setReprocessedFromDlq(true);
            event.setAttempt(1);

            // Reset attempt counter in consumer
            eventConsumerService.resetAttemptCounter(eventId);

            // Remove from DLQ repository
            dlqEventRepository.delete(dlqEntry);

            // Update processed event status
            Optional<ProcessedEventEntity> entityOpt = processedEventRepository.findByEventId(eventId);
            if (entityOpt.isPresent()) {
                ProcessedEventEntity entity = entityOpt.get();
                entity.setStatus("Pending");
                entity.setProcessingResult("Re-queued from Dead Letter Queue for reprocessing");
                entity.setFailureSimulation("NONE");
                processedEventRepository.save(entity);
            }

            // Publish back to main Kafka topic
            String jsonPayload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(mainTopic, eventId, jsonPayload);

            loggingService.recordLog(eventId, 0, "Reprocess DLQ Event",
                    "Event ID '" + eventId + "' safely re-queued to topic '" + mainTopic + "' with original ID.");

            return true;
        } catch (Exception e) {
            log.error("Failed to reprocess DLQ event {}: {}", eventId, e.getMessage());
            return false;
        }
    }
}
