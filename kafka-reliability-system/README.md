# Kafka Event-Driven Reliability System
*(Combining Experiment 3.1.1 and Experiment 3.1.2)*

A minimal, robust demonstration of event-driven reliability in Apache Kafka and Spring Boot. This application combines **Exponential Backoff Retries**, **Dead Letter Queues (DLQ)**, and **Database-enforced Idempotency** into a single, unified web system.

---

## 1. System Overview

- **Main Event Topic**: `scheduled-posts`
- **Dead Letter Topic (DLQ)**: `scheduled-posts-dlt`
- **Consumer Group**: `reliability-consumer-group`
- **Persistent Storage**: H2 Database (file-based persistence at `./data/kafkadb` with unique constraint on `eventId`)
- **Port**: `8080` (Web UI & REST APIs)

---

## 2. Key Reliability Features

1. **Exponential Backoff Retry Mechanism**:
   - Delay formula:  
     $$\text{Delay} = \text{Initial Delay} \times (\text{Backoff Multiplier}^{\text{Retry Attempt}})$$
   - Defaults: Maximum Retries = `3`, Initial Delay = `2000 ms`, Multiplier = `2.0`.
   - Dynamic configuration allows adjusting retry parameters on-the-fly from the UI or API.

2. **Dead Letter Queue (DLQ)**:
   - When an event exhausts all configured retries, Spring Kafka's `DefaultErrorHandler` routes the message to `scheduled-posts-dlt`.
   - DLQ entries are recorded with failure reasons, attempt counts, and timestamps.
   - Includes a safe **Reprocess DLQ Event** endpoint that retains the original event ID without duplicate side effects.

3. **Database-Enforced Idempotency**:
   - The persistent database applies a unique constraint on `eventId`.
   - Prevents duplicate business operations (e.g. duplicate post creations) even when identical messages are re-delivered concurrently or across application restarts.
   - Duplicates are gracefully acknowledged and marked as `Duplicate Ignored`.

---

## 3. Technology Stack

- **Java**: JDK 17 or later (compatible with Java 24)
- **Framework**: Spring Boot 3.3.5
- **Event Streaming**: Apache Kafka & Spring Kafka 3.2.4
- **Database**: H2 Database (File mode for persistent storage)
- **Containerization**: Docker & Docker Compose (KRaft ZooKeeper-less Kafka)
- **Frontend**: Lightweight HTML5/CSS3/Vanilla JavaScript (responsive, minimal design)

---

## 4. REST API Specification

| HTTP Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/events` | Publish a new event (with optional failure simulation & duplicate test) |
| `GET` | `/api/events` | Retrieve statuses and results of all processed events |
| `GET` | `/api/events/{eventId}` | Retrieve details of a specific event |
| `GET` | `/api/dlq` | Retrieve events sent to the Dead Letter Queue |
| `POST` | `/api/events/{eventId}/retry` | Reprocess a failed DLQ event with its original event ID |
| `GET` | `/api/logs` | Retrieve recent consumer and retry activity logs |
| `POST` | `/api/logs/clear` | Clear processing logs |
| `GET` | `/api/config` | Retrieve current retry parameters and active retry count |
| `POST` | `/api/config` | Dynamically update retry attempts, initial delay, and multiplier |
| `POST` | `/api/tests/run` | Execute automated test (`SUCCESS`, `TEMPORARY`, `PERMANENT`, `DUPLICATE`, `ALL`) |
| `GET` | `/api/tests/report` | Retrieve automated test execution reports |
| `POST` | `/api/tests/clear` | Clear test execution reports |

---

## 5. How to Run the Project

### Option A: Direct Local Run (Self-Contained Embedded Kafka)
The application includes automatic KRaft embedded broker support. If no external Kafka is running on `localhost:9092`, the application automatically boots an embedded Kafka broker on startup.

```bash
cd "L:\FULL STACK\kafka-reliability-system"
mvn compile spring-boot:run
```
*(Or use the local Maven installation at `C:\Users\Kushaan\AppData\Local\apache-maven-3.9.6\bin\mvn.cmd`)*

### Option B: Docker Compose
To run external Apache Kafka in Docker and run the application container:

```bash
cd "L:\FULL STACK\kafka-reliability-system"
docker compose up --build
```

Access the application in your browser:
```
http://localhost:8080/
```

Access H2 Database Console (Optional):
```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:file:./data/kafkadb
User: sa
Password: (empty)
```

---

## 6. Testing & College Viva Demonstration Guide

1. **Successful Event Test**:
   - Go to **Section A (Event Producer)**.
   - Leave Failure Simulation as **No Failure**.
   - Click **Publish Event**.
   - Observe in **Section C** that status transitions from `Pending` -> `Success`.

2. **Temporary Failure & Retry Test**:
   - Select Failure Simulation: **Temporary Failure**.
   - Click **Publish Event**.
   - In **Section G (Processing Logs)**, observe:
     1. Attempt 1 fails (`Simulated transient connection timeout`).
     2. Wait with calculated exponential delay (e.g., `2000 ms`).
     3. Attempt 2 retries and succeeds!
     4. Status in **Section C** updates to `Success`.

3. **Permanent Failure & Dead Letter Queue (DLQ) Test**:
   - Select Failure Simulation: **Permanent Failure**.
   - Click **Publish Event**.
   - Watch retries exhaust in **Section G**:
     - Attempt 1: delay 2000 ms
     - Attempt 2: delay 4000 ms
     - Attempt 3: delay 8000 ms
     - Maximum retries reached -> Routed to `scheduled-posts-dlt`.
   - In **Section D (Dead Letter Queue)**, the event appears with failure reason.
   - Click **View Details** to inspect payload.
   - Click **Retry DLQ Event** to reprocess safely with the original ID.

4. **Idempotency Verification Test**:
   - In **Section E (Idempotency Testing)**, enter an ID (e.g., `EVT-IDEMP-100`).
   - Click **Send Event** -> Processed for the first time (`Success`).
   - Click **Send Same Event Again** -> Duplicate detected by unique DB constraint; marked as `Duplicate Ignored`. No repeated post is created!

5. **Automated Test Report**:
   - In **Section F**, click **5. Run All Tests**.
   - The backend runs all 4 test cases against live Kafka and generates an official `PASS` report.
