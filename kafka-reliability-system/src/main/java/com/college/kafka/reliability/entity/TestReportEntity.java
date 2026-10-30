package com.college.kafka.reliability.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_reports")
public class TestReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String testCase;

    @Column(columnDefinition = "TEXT")
    private String expectedResult;

    @Column(columnDefinition = "TEXT")
    private String actualResult;

    private String status; // PASS, FAIL

    private LocalDateTime runAt;

    public TestReportEntity() {
        this.runAt = LocalDateTime.now();
    }

    public TestReportEntity(String testCase, String expectedResult, String actualResult, String status) {
        this.testCase = testCase;
        this.expectedResult = expectedResult;
        this.actualResult = actualResult;
        this.status = status;
        this.runAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTestCase() {
        return testCase;
    }

    public void setTestCase(String testCase) {
        this.testCase = testCase;
    }

    public String getExpectedResult() {
        return expectedResult;
    }

    public void setExpectedResult(String expectedResult) {
        this.expectedResult = expectedResult;
    }

    public String getActualResult() {
        return actualResult;
    }

    public void setActualResult(String actualResult) {
        this.actualResult = actualResult;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRunAt() {
        return runAt;
    }

    public void setRunAt(LocalDateTime runAt) {
        this.runAt = runAt;
    }
}
