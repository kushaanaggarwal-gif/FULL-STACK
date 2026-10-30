package com.college.kafka.reliability.controller;

import com.college.kafka.reliability.service.ReliabilityConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ReliabilityConfigService reliabilityConfigService;

    public ConfigController(ReliabilityConfigService reliabilityConfigService) {
        this.reliabilityConfigService = reliabilityConfigService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("maxRetryAttempts", reliabilityConfigService.getMaxRetries());
        config.put("initialRetryDelay", reliabilityConfigService.getInitialDelayMs());
        config.put("backoffMultiplier", reliabilityConfigService.getBackoffMultiplier());
        config.put("currentRetryAttempt", reliabilityConfigService.getCurrentRetryAttempt());
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> payload) {
        if (payload.containsKey("maxRetryAttempts")) {
            int max = Integer.parseInt(payload.get("maxRetryAttempts").toString());
            reliabilityConfigService.setMaxRetries(max);
        }
        if (payload.containsKey("initialRetryDelay")) {
            long delay = Long.parseLong(payload.get("initialRetryDelay").toString());
            reliabilityConfigService.setInitialDelayMs(delay);
        }
        if (payload.containsKey("backoffMultiplier")) {
            double multiplier = Double.parseDouble(payload.get("backoffMultiplier").toString());
            reliabilityConfigService.setBackoffMultiplier(multiplier);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Reliability configuration updated");
        response.put("config", Map.of(
                "maxRetryAttempts", reliabilityConfigService.getMaxRetries(),
                "initialRetryDelay", reliabilityConfigService.getInitialDelayMs(),
                "backoffMultiplier", reliabilityConfigService.getBackoffMultiplier()
        ));
        return ResponseEntity.ok(response);
    }
}
