# पायरी १: बिल्ड करण्यासाठी Maven वापरा
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# पायरी २: रन करण्यासाठी Amazon Corretto वापरा (ही इमेज Render वर नक्की चालते)
FROM amazoncorretto:17-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]