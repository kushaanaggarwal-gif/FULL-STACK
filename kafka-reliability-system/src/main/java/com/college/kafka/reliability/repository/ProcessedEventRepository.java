package com.college.kafka.reliability.repository;

import com.college.kafka.reliability.entity.ProcessedEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessedEventRepository extends JpaRepository<ProcessedEventEntity, Long> {
    Optional<ProcessedEventEntity> findByEventId(String eventId);
    boolean existsByEventId(String eventId);
    List<ProcessedEventEntity> findAllByOrderByCreatedAtDesc();
}
