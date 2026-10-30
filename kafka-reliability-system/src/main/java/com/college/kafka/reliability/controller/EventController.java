package com.college.kafka.reliability.controller;

import com.college.kafka.reliability.entity.ProcessedEventEntity;
import com.college.kafka.reliability.model.PostEvent;
import com.college.kafka.reliability.repository.ProcessedEventRepository;
import com.college.kafka.reliability.service.DlqService;
import com.college.kafka.reliability.service.EventProducerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventProducerService eventProducerService;
    private final ProcessedEventRepository processedEventRepository;
    private final DlqService dlqService;

    public EventController(EventProducerService eventProducerService,
                           ProcessedEventRepository processedEventRepository,
                           DlqService dlqService) {
        this.eventProducerService = eventProducerService;
        this.processedEventRepository = processedEventRepository;
        this.dlqService = dlqService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> publishEvent(@RequestBody PostEvent event) {
        PostEvent published = eventProducerService.publishEvent(event);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Event successfully submitted to Kafka topic 'scheduled-posts'");
        response.put("event", published);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProcessedEventEntity>> getAllEvents() {
        return ResponseEntity.ok(processedEventRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEventDetails(@PathVariable String eventId) {
        Optional<ProcessedEventEntity> entity = processedEventRepository.findByEventId(eventId);
        if (entity.isPresent()) {
            return ResponseEntity.ok(entity.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Event not found with ID: " + eventId));
    }

    @PostMapping("/{eventId}/retry")
    public ResponseEntity<Map<String, Object>> retryEvent(@PathVariable String eventId) {
        boolean reprocessed = dlqService.retryDlqEvent(eventId);
        Map<String, Object> response = new HashMap<>();
        if (reprocessed) {
            response.put("status", "SUCCESS");
            response.put("message", "DLQ event " + eventId + " re-queued for processing");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "FAILED");
            response.put("message", "Event " + eventId + " is not in the Dead Letter Queue or could not be reprocessed");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
