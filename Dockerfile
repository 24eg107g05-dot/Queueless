FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app

COPY backend/pom.xml .
RUN mvn -B dependency:go-offline

COPY backend/src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine AS backend

WORKDIR /app

RUN addgroup -S app && adduser -S -G app app
COPY --from=backend-build --chown=app:app /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS frontend

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 8080
