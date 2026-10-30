package com.college.kafka.reliability.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "processing_logs")
public class ProcessingLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    @Column(length = 100)
    private String eventId;

    private int retryAttempt;

    @Column(length = 100)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String result;

    public ProcessingLogEntity() {
        this.timestamp = LocalDateTime.now();
    }

    public ProcessingLogEntity(String eventId, int retryAttempt, String action, String result) {
        this.timestamp = LocalDateTime.now();
        this.eventId = eventId;
        this.retryAttempt = retryAttempt;
        this.action = action;
        this.result = result;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public int getRetryAttempt() {
        return retryAttempt;
    }

    public void setRetryAttempt(int retryAttempt) {
        this.retryAttempt = retryAttempt;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}
