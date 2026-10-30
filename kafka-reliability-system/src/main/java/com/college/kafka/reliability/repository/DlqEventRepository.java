package com.college.kafka.reliability.repository;

import com.college.kafka.reliability.entity.DlqEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DlqEventRepository extends JpaRepository<DlqEventEntity, Long> {
    Optional<DlqEventEntity> findByEventId(String eventId);
    List<DlqEventEntity> findAllByOrderByTimestampDesc();
}
