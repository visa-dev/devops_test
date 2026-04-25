FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy the jar built by Gradle
COPY build/libs/*.jar app.jar

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]