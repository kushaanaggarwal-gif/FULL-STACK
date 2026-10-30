package com.college.kafka.reliability.service;

import com.college.kafka.reliability.entity.ProcessingLogEntity;
import com.college.kafka.reliability.repository.ProcessingLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoggingService {

    private static final Logger log = LoggerFactory.getLogger(LoggingService.class);
    private final ProcessingLogRepository logRepository;

    public LoggingService(ProcessingLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public synchronized void recordLog(String eventId, int retryAttempt, String action, String result) {
        try {
            ProcessingLogEntity entity = new ProcessingLogEntity(eventId, retryAttempt, action, result);
            logRepository.save(entity);
            log.info("[Event: {} | Attempt: {}] {} -> {}", eventId, retryAttempt, action, result);
        } catch (Exception e) {
            log.error("Failed to save processing log: {}", e.getMessage());
        }
    }

    public List<ProcessingLogEntity> getRecentLogs() {
        return logRepository.findTop100ByOrderByTimestampDesc();
    }

    public void clearLogs() {
        logRepository.deleteAll();
    }
}
