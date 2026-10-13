
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend

COPY backend/pom.xml ./
RUN mvn -B dependency:go-offline

COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static/

RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S -G app app

COPY --from=backend-build --chown=app:app /app/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar

USER app

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
