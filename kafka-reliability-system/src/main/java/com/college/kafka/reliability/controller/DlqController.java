package com.college.kafka.reliability.controller;

import com.college.kafka.reliability.entity.DlqEventEntity;
import com.college.kafka.reliability.service.DlqService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/dlq")
@CrossOrigin(origins = "*")
public class DlqController {

    private final DlqService dlqService;

    public DlqController(DlqService dlqService) {
        this.dlqService = dlqService;
    }

    @GetMapping
    public ResponseEntity<List<DlqEventEntity>> getDlqEvents() {
        return ResponseEntity.ok(dlqService.getAllDlqEvents());
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<?> getDlqEventDetails(@PathVariable String eventId) {
        Optional<DlqEventEntity> dlq = dlqService.getDlqEvent(eventId);
        if (dlq.isPresent()) {
            return ResponseEntity.ok(dlq.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "DLQ event not found with ID: " + eventId));
    }

    @PostMapping("/{eventId}/retry")
    public ResponseEntity<Map<String, Object>> retryDlqEvent(@PathVariable String eventId) {
        boolean success = dlqService.retryDlqEvent(eventId);
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("status", "SUCCESS");
            response.put("message", "Successfully initiated reprocessing for DLQ event: " + eventId);
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "FAILED");
            response.put("message", "Could not find or retry DLQ event: " + eventId);
            return ResponseEntity.badRequest().body(response);
        }
    }
}
