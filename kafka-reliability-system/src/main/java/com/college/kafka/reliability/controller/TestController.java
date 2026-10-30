package com.college.kafka.reliability.controller;

import com.college.kafka.reliability.entity.TestReportEntity;
import com.college.kafka.reliability.service.TestRunnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "*")
public class TestController {

    private final TestRunnerService testRunnerService;

    public TestController(TestRunnerService testRunnerService) {
        this.testRunnerService = testRunnerService;
    }

    @PostMapping("/run")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> runTest(@RequestBody(required = false) Map<String, String> payload) {
        String testType = (payload != null && payload.containsKey("test")) ? payload.get("test") : "ALL";
        return testRunnerService.runTest(testType).thenApply(result -> {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("testType", testType);
            response.put("result", result);
            return ResponseEntity.ok(response);
        });
    }

    @GetMapping("/report")
    public ResponseEntity<List<TestReportEntity>> getTestReports() {
        return ResponseEntity.ok(testRunnerService.getAllReports());
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clearTestReports() {
        testRunnerService.clearReports();
        return ResponseEntity.ok(Map.of("message", "Test reports cleared successfully"));
    }

    @DeleteMapping("/report")
    public ResponseEntity<Map<String, String>> deleteTestReports() {
        testRunnerService.clearReports();
        return ResponseEntity.ok(Map.of("message", "Test reports cleared successfully"));
    }
}
