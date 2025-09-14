# EasyCart Deployment Guide

This guide covers different deployment strategies for the EasyCart e-commerce platform.

## Table of Contents

- [Docker Compose (Recommended)](#docker-compose-recommended)
- [Kubernetes](#kubernetes)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)

## Docker Compose (Recommended)

The easiest way to deploy EasyCart is using Docker Compose.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2+
- 2GB+ RAM
- 10GB+ disk space

### Production Deployment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd easycart
   ```

2. **Create production environment file**
   ```bash
   cp .env.example .env.prod
   ```

3. **Update environment variables**
   ```bash
   # .env.prod
   DB_PASSWORD=your-secure-db-password
   JWT_SECRET=your-very-secure-jwt-secret-key-at-least-32-chars
   MINIO_ACCESS_KEY=your-minio-access-key
   MINIO_SECRET_KEY=your-minio-secret-key
   
   # For external access
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

4. **Create production Docker Compose file**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: easycart
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./backups:/backups
       restart: unless-stopped
       networks:
         - easycart
   
     minio:
       image: minio/minio:latest
       command: server /data --console-address ":9001"
       environment:
         MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
         MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
       volumes:
         - minio_data:/data
       restart: unless-stopped
       networks:
         - easycart
   
     backend:
       image: ghcr.io/your-org/easycart-backend:latest
       environment:
         - DB_HOST=postgres
         - DB_PASSWORD=${DB_PASSWORD}
         - JWT_SECRET=${JWT_SECRET}
         - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
         - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
       depends_on:
         - postgres
         - minio
       restart: unless-stopped
       networks:
         - easycart
   
     frontend:
       image: ghcr.io/your-org/easycart-frontend:latest
       environment:
         - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
       depends_on:
         - backend
       restart: unless-stopped
       networks:
         - easycart
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf:ro
         - ./ssl:/etc/nginx/ssl:ro
       depends_on:
         - frontend
         - backend
       restart: unless-stopped
       networks:
         - easycart
   
   volumes:
     postgres_data:
     minio_data:
   
   networks:
     easycart:
       driver: bridge
   ```

5. **Create nginx configuration**
   ```nginx
   # nginx.conf
   events {
       worker_connections 1024;
   }
   
   http {
       upstream backend {
           server backend:8080;
       }
       
       upstream frontend {
           server frontend:3000;
       }
       
       # Redirect HTTP to HTTPS
       server {
           listen 80;
           server_name yourdomain.com;
           return 301 https://$server_name$request_uri;
       }
       
       # Main application
       server {
           listen 443 ssl http2;
           server_name yourdomain.com;
           
           ssl_certificate /etc/nginx/ssl/cert.pem;
           ssl_certificate_key /etc/nginx/ssl/key.pem;
           
           # API routes
           location /api/ {
               proxy_pass http://backend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
           
           # Frontend routes
           location / {
               proxy_pass http://frontend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
       }
       
       # API subdomain (optional)
       server {
           listen 443 ssl http2;
           server_name api.yourdomain.com;
           
           ssl_certificate /etc/nginx/ssl/cert.pem;
           ssl_certificate_key /etc/nginx/ssl/key.pem;
           
           location / {
               proxy_pass http://backend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
       }
   }
   ```

6. **Deploy the application**
   ```bash
   # Load environment variables
   set -a && source .env.prod && set +a
   
   # Pull latest images
   docker compose -f docker-compose.prod.yml pull
   
   # Start services
   docker compose -f docker-compose.prod.yml up -d
   
   # Check status
   docker compose -f docker-compose.prod.yml ps
   ```

7. **Verify deployment**
   ```bash
   # Check backend health
   curl https://yourdomain.com/api/v1/health
   
   # Check frontend
   curl https://yourdomain.com
   ```

### Auto-deployment with GitHub Actions

Set up automatic deployment using GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/easycart
          git pull origin main
          docker compose -f docker-compose.prod.yml pull
          docker compose -f docker-compose.prod.yml up -d
          docker system prune -f
```

## Kubernetes

For larger scale deployments, use Kubernetes:

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.0+

### Deployment

1. **Create namespace**
   ```bash
   kubectl create namespace easycart
   ```

2. **Create secrets**
   ```bash
   kubectl create secret generic easycart-secrets \
     --from-literal=db-password=your-secure-password \
     --from-literal=jwt-secret=your-jwt-secret \
     --from-literal=minio-access-key=your-access-key \
     --from-literal=minio-secret-key=your-secret-key \
     -n easycart
   ```

3. **Deploy PostgreSQL**
   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm install postgres bitnami/postgresql \
     --set auth.postgresPassword=your-secure-password \
     --set auth.database=easycart \
     -n easycart
   ```

4. **Deploy MinIO**
   ```bash
   helm install minio bitnami/minio \
     --set auth.rootUser=your-access-key \
     --set auth.rootPassword=your-secret-key \
     -n easycart
   ```

5. **Deploy EasyCart**
   ```yaml
   # k8s/deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: easycart-backend
     namespace: easycart
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: easycart-backend
     template:
       metadata:
         labels:
           app: easycart-backend
       spec:
         containers:
         - name: backend
           image: ghcr.io/your-org/easycart-backend:latest
           env:
           - name: DB_HOST
             value: postgres-postgresql
           - name: DB_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: easycart-secrets
                 key: db-password
           - name: JWT_SECRET
             valueFrom:
               secretKeyRef:
                 name: easycart-secrets
                 key: jwt-secret
   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: easycart-frontend
     namespace: easycart
   spec:
     replicas: 2
     selector:
       matchLabels:
         app: easycart-frontend
     template:
       metadata:
         labels:
           app: easycart-frontend
       spec:
         containers:
         - name: frontend
           image: ghcr.io/your-org/easycart-frontend:latest
           env:
           - name: NEXT_PUBLIC_API_URL
             value: https://api.yourdomain.com
   ```

## Manual Deployment

For manual deployment without Docker:

### Backend (Go)

1. **Install dependencies**
   ```bash
   # Install Go 1.21+
   # Install PostgreSQL 15+
   # Install MinIO
   ```

2. **Build the application**
   ```bash
   cd backend
   go mod download
   CGO_ENABLED=0 GOOS=linux go build -o easycart-backend cmd/server/main.go
   ```

3. **Configure systemd service**
   ```ini
   # /etc/systemd/system/easycart-backend.service
   [Unit]
   Description=EasyCart Backend
   After=network.target postgresql.service
   
   [Service]
   Type=simple
   User=easycart
   WorkingDirectory=/opt/easycart/backend
   ExecStart=/opt/easycart/backend/easycart-backend
   Restart=always
   Environment=DB_HOST=localhost
   Environment=DB_PASSWORD=your-password
   Environment=JWT_SECRET=your-secret
   
   [Install]
   WantedBy=multi-user.target
   ```

### Frontend (Next.js)

1. **Build the application**
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Configure systemd service**
   ```ini
   # /etc/systemd/system/easycart-frontend.service
   [Unit]
   Description=EasyCart Frontend
   After=network.target
   
   [Service]
   Type=simple
   User=easycart
   WorkingDirectory=/opt/easycart/frontend
   ExecStart=/usr/bin/npm start
   Restart=always
   Environment=NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   
   [Install]
   WantedBy=multi-user.target
   ```

## Environment Configuration

### Required Environment Variables

#### Backend
```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secure-password
DB_NAME=easycart

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=easycart
MINIO_USE_SSL=false

# Security
JWT_SECRET=your-very-secure-jwt-secret-key-at-least-32-characters

# Server
PORT=8080
```

#### Frontend
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Optional Environment Variables

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_RPS=100

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (for future notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=smtp-password
```

## SSL/TLS Setup

### Using Let's Encrypt

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain certificates**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Using Custom Certificates

1. **Create SSL directory**
   ```bash
   mkdir -p ssl
   ```

2. **Copy certificates**
   ```bash
   cp your-cert.pem ssl/cert.pem
   cp your-key.pem ssl/key.pem
   chmod 600 ssl/key.pem
   ```

## Monitoring & Logging

### Health Checks

EasyCart provides health check endpoints:

```bash
# Backend health
curl https://api.yourdomain.com/api/v1/health

# Frontend health  
curl https://yourdomain.com
```

### Logging

Configure centralized logging:

```yaml
# docker-compose.prod.yml (add to services)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Monitoring with Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'easycart-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/api/v1/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

## Backup Strategy

### Database Backup

1. **Automated backups**
   ```bash
   #!/bin/bash
   # backup.sh
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/backups"
   
   docker exec easycart-postgres-1 pg_dump -U postgres easycart > \
     "$BACKUP_DIR/easycart_$DATE.sql"
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "easycart_*.sql" -type f -mtime +30 -delete
   ```

2. **Cron job**
   ```bash
   # Daily backup at 2 AM
   0 2 * * * /opt/easycart/backup.sh
   ```

### MinIO Backup

1. **Use MinIO client**
   ```bash
   # Install mc
   wget https://dl.min.io/client/mc/release/linux-amd64/mc
   chmod +x mc
   
   # Configure
   ./mc alias set local http://localhost:9000 access-key secret-key
   
   # Backup
   ./mc mirror local/easycart /backup/minio/
   ```

## Security Considerations

### Network Security

1. **Firewall rules**
   ```bash
   # Allow only necessary ports
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw deny 5432   # PostgreSQL (internal only)
   ufw deny 9000   # MinIO (internal only)
   ufw deny 8080   # Backend (internal only)
   ufw enable
   ```

2. **Docker network isolation**
   - Use custom networks
   - Don't expose internal services
   - Use secrets for sensitive data

### Application Security

1. **JWT Secret**
   - Use strong, random secret (32+ characters)
   - Rotate periodically
   - Store securely

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular security updates

3. **File Upload Security**
   - Validate file types
   - Scan for malware
   - Size limitations

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   ```nginx
   upstream backend {
       server backend-1:8080;
       server backend-2:8080;
       server backend-3:8080;
   }
   
   upstream frontend {
       server frontend-1:3000;
       server frontend-2:3000;
   }
   ```

2. **Database Scaling**
   - Read replicas
   - Connection pooling
   - Query optimization

### Vertical Scaling

1. **Resource allocation**
   ```yaml
   # docker-compose.prod.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '0.5'
           reservations:
             memory: 512M
             cpus: '0.25'
   ```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   ```bash
   # Check database is running
   docker compose ps postgres
   
   # Check logs
   docker compose logs postgres
   
   # Test connection
   docker exec -it easycart-postgres-1 psql -U postgres -d easycart
   ```

2. **MinIO connection errors**
   ```bash
   # Check MinIO status
   curl http://localhost:9000/minio/health/live
   
   # Check logs
   docker compose logs minio
   ```

3. **Frontend not loading**
   ```bash
   # Check backend connectivity
   curl http://localhost:8080/api/v1/health
   
   # Check environment variables
   docker exec easycart-frontend-1 env | grep NEXT_PUBLIC
   ```

### Performance Optimization

1. **Database optimization**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_products_shop_active ON products(shop_id, is_active);
   CREATE INDEX idx_orders_shop_status ON orders(shop_id, status);
   ```

2. **CDN Configuration**
   - Serve static assets from CDN
   - Enable gzip compression
   - Cache static files

For additional support, see the main [README](../README.md) or open an issue on GitHub.