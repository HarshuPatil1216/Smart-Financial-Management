# पायरी १: बिल्ड करण्यासाठी Maven वापरा
FROM maven:3.8.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# -X टाकल्यामुळे आपल्याला नेमका एरर कुठे आहे ते डिटेलमध्ये कळेल
RUN mvn clean package -DskipTests

# पायरी २: रन करण्यासाठी JRE वापरा
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]