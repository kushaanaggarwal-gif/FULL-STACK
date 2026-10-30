package com.college.kafka.reliability.service;

public class SimulatedTemporaryException extends RuntimeException {
    public SimulatedTemporaryException(String message) {
        super(message);
    }
}
