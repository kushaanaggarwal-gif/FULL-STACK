package com.college.kafka.reliability;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaKraftBroker;

import java.net.InetSocketAddress;
import java.net.Socket;

@SpringBootApplication
public class KafkaReliabilityApplication {

    private static final Logger log = LoggerFactory.getLogger(KafkaReliabilityApplication.class);
    private static EmbeddedKafkaBroker embeddedBroker;

    public static void main(String[] args) {
        startEmbeddedBrokerIfNeeded();
        SpringApplication.run(KafkaReliabilityApplication.class, args);
    }

    private static void startEmbeddedBrokerIfNeeded() {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("localhost", 9092), 600);
            log.info("Detected active Kafka broker on localhost:9092. Connecting to external Kafka broker.");
        } catch (Exception e) {
            log.info("No external Kafka broker detected on localhost:9092. Starting Embedded Kafka Broker (KRaft)...");
            try {
                EmbeddedKafkaKraftBroker kraftBroker = new EmbeddedKafkaKraftBroker(1, 1, "scheduled-posts", "scheduled-posts-dlt");
                kraftBroker.afterPropertiesSet();
                embeddedBroker = kraftBroker;

                String brokerAddress = kraftBroker.getBrokersAsString();
                System.setProperty("spring.kafka.bootstrap-servers", brokerAddress);
                log.info("Embedded Kafka Broker (KRaft) successfully initialized and listening on: {}", brokerAddress);

                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    if (embeddedBroker != null) {
                        try {
                            embeddedBroker.destroy();
                        } catch (Exception ignored) {}
                    }
                }));
            } catch (Exception ex) {
                log.error("Could not start Embedded Kafka broker: {}", ex.getMessage(), ex);
            }
        }
    }
}
