# Stage 1: Builder
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Descargar dependencias primero para aprovechar caché de Docker
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar binario estático
RUN CGO_ENABLED=0 GOOS=linux go build -o backend main.go

# Stage 2: Runner
FROM alpine:latest

WORKDIR /app

# Copiar el binario desde el stage builder
COPY --from=builder /app/backend .

# Copiar archivos JSON de configuración
COPY --from=builder /app/data ./data

# Crear carpeta para la base de datos persistida
RUN mkdir -p /app/db

EXPOSE 8080

CMD ["./backend"]
