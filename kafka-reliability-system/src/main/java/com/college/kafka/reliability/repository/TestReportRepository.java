package com.college.kafka.reliability.repository;

import com.college.kafka.reliability.entity.TestReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestReportRepository extends JpaRepository<TestReportEntity, Long> {
    List<TestReportEntity> findAllByOrderByRunAtDesc();
}
