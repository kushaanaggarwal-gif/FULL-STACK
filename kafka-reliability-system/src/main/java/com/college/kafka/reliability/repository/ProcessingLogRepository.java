package com.college.kafka.reliability.repository;

import com.college.kafka.reliability.entity.ProcessingLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessingLogRepository extends JpaRepository<ProcessingLogEntity, Long> {
    List<ProcessingLogEntity> findTop100ByOrderByTimestampDesc();
}
