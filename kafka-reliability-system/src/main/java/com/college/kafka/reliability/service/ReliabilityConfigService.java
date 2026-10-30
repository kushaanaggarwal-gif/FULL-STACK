package com.college.kafka.reliability.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ReliabilityConfigService {

    private volatile int maxRetries = 3;
    private volatile long initialDelayMs = 2000L;
    private volatile double backoffMultiplier = 2.0;
    private final AtomicInteger currentRetryAttempt = new AtomicInteger(0);

    public int getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(int maxRetries) {
        if (maxRetries >= 0 && maxRetries <= 10) {
            this.maxRetries = maxRetries;
        }
    }

    public long getInitialDelayMs() {
        return initialDelayMs;
    }

    public void setInitialDelayMs(long initialDelayMs) {
        if (initialDelayMs >= 100 && initialDelayMs <= 60000) {
            this.initialDelayMs = initialDelayMs;
        }
    }

    public double getBackoffMultiplier() {
        return backoffMultiplier;
    }

    public void setBackoffMultiplier(double backoffMultiplier) {
        if (backoffMultiplier >= 1.0 && backoffMultiplier <= 10.0) {
            this.backoffMultiplier = backoffMultiplier;
        }
    }

    public int getCurrentRetryAttempt() {
        return currentRetryAttempt.get();
    }

    public void setCurrentRetryAttempt(int attempt) {
        this.currentRetryAttempt.set(attempt);
    }

    /**
     * Calculates exponential backoff delay based on prompt formula:
     * Delay = Initial Delay * (Backoff Multiplier ^ Retry Attempt)
     */
    public long calculateDelay(int attemptIndex) {
        return (long) (initialDelayMs * Math.pow(backoffMultiplier, attemptIndex));
    }
}
