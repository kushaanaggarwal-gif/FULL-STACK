package com.college.kafka.reliability.config;

import org.springframework.context.annotation.Configuration;

/**
 * Placeholder config. Embedded Kafka broker is booted in KafkaReliabilityApplication.main()
 * to ensure Kafka is ready prior to Spring context and AdminClient bean initialization.
 */
@Configuration
public class EmbeddedKafkaAutoConfig {
}
