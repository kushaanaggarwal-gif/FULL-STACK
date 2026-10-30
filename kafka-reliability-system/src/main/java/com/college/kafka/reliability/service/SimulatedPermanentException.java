package com.college.kafka.reliability.service;

public class SimulatedPermanentException extends RuntimeException {
    public SimulatedPermanentException(String message) {
        super(message);
    }
}
