package com.college.kafka.reliability.controller;

import com.college.kafka.reliability.entity.ProcessingLogEntity;
import com.college.kafka.reliability.service.LoggingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LogController {

    private final LoggingService loggingService;

    public LogController(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @GetMapping
    public ResponseEntity<List<ProcessingLogEntity>> getLogs() {
        return ResponseEntity.ok(loggingService.getRecentLogs());
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clearLogs() {
        loggingService.clearLogs();
        return ResponseEntity.ok(Map.of("message", "Processing logs cleared"));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteLogs() {
        loggingService.clearLogs();
        return ResponseEntity.ok(Map.of("message", "Processing logs cleared"));
    }
}
