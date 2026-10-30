package com.college.kafka.reliability.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dlq_events")
public class DlqEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String eventId;

    @Column(columnDefinition = "TEXT")
    private String eventContent;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    private int totalAttempts;

    private LocalDateTime timestamp;

    private boolean reprocessed;

    public DlqEventEntity() {
        this.timestamp = LocalDateTime.now();
        this.reprocessed = false;
    }

    public DlqEventEntity(String eventId, String eventContent, String failureReason, int totalAttempts) {
        this.eventId = eventId;
        this.eventContent = eventContent;
        this.failureReason = failureReason;
        this.totalAttempts = totalAttempts;
        this.timestamp = LocalDateTime.now();
        this.reprocessed = false;
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

    public String getEventContent() {
        return eventContent;
    }

    public void setEventContent(String eventContent) {
        this.eventContent = eventContent;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public int getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(int totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isReprocessed() {
        return reprocessed;
    }

    public void setReprocessed(boolean reprocessed) {
        this.reprocessed = reprocessed;
    }
}
