package com.college.kafka.reliability.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "processed_events", uniqueConstraints = {
    @UniqueConstraint(columnNames = "eventId")
})
public class ProcessedEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String eventId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String status; // Pending, Processing, Success, Retrying, Duplicate Ignored, Sent to DLQ

    private int retryAttempts;

    @Column(columnDefinition = "TEXT")
    private String processingResult;

    private String failureSimulation;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProcessedEventEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public ProcessedEventEntity(String eventId, String content, String status, int retryAttempts, String processingResult, String failureSimulation) {
        this.eventId = eventId;
        this.content = content;
        this.status = status;
        this.retryAttempts = retryAttempts;
        this.processingResult = processingResult;
        this.failureSimulation = failureSimulation;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public int getRetryAttempts() {
        return retryAttempts;
    }

    public void setRetryAttempts(int retryAttempts) {
        this.retryAttempts = retryAttempts;
    }

    public String getProcessingResult() {
        return processingResult;
    }

    public void setProcessingResult(String processingResult) {
        this.processingResult = processingResult;
        this.updatedAt = LocalDateTime.now();
    }

    public String getFailureSimulation() {
        return failureSimulation;
    }

    public void setFailureSimulation(String failureSimulation) {
        this.failureSimulation = failureSimulation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
