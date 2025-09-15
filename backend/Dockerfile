FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the applications
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o admin ./cmd/admin

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binaries from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/admin .

EXPOSE 8080

CMD ["./main"]