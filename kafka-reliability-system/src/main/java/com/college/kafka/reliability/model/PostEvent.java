package com.college.kafka.reliability.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostEvent {
    private String eventId;
    private String content;
    private String failureSimulation; // "NONE", "TEMPORARY", "PERMANENT"
    private boolean simulateDuplicate;
    private long timestamp;
    private int attempt;
    private boolean reprocessedFromDlq;

    public PostEvent() {
        this.timestamp = System.currentTimeMillis();
    }

    public PostEvent(String eventId, String content, String failureSimulation, boolean simulateDuplicate) {
        this.eventId = eventId;
        this.content = content;
        this.failureSimulation = failureSimulation == null ? "NONE" : failureSimulation;
        this.simulateDuplicate = simulateDuplicate;
        this.timestamp = System.currentTimeMillis();
        this.attempt = 1;
        this.reprocessedFromDlq = false;
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

    public String getFailureSimulation() {
        return failureSimulation;
    }

    public void setFailureSimulation(String failureSimulation) {
        this.failureSimulation = failureSimulation;
    }

    public boolean isSimulateDuplicate() {
        return simulateDuplicate;
    }

    public void setSimulateDuplicate(boolean simulateDuplicate) {
        this.simulateDuplicate = simulateDuplicate;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public int getAttempt() {
        return attempt;
    }

    public void setAttempt(int attempt) {
        this.attempt = attempt;
    }

    public boolean isReprocessedFromDlq() {
        return reprocessedFromDlq;
    }

    public void setReprocessedFromDlq(boolean reprocessedFromDlq) {
        this.reprocessedFromDlq = reprocessedFromDlq;
    }

    @Override
    public String toString() {
        return "PostEvent{" +
                "eventId='" + eventId + '\'' +
                ", content='" + content + '\'' +
                ", failureSimulation='" + failureSimulation + '\'' +
                ", simulateDuplicate=" + simulateDuplicate +
                ", timestamp=" + timestamp +
                ", attempt=" + attempt +
                ", reprocessedFromDlq=" + reprocessedFromDlq +
                '}';
    }
}
