@echo off
echo ========================================================
echo Starting Kafka Event-Driven Reliability System...
echo ========================================================
set MAVEN_CMD=C:\Users\Kushaan\AppData\Local\apache-maven-3.9.6\bin\mvn.cmd

if exist "%MAVEN_CMD%" (
    "%MAVEN_CMD%" compile spring-boot:run
) else (
    mvn compile spring-boot:run
)
pause
