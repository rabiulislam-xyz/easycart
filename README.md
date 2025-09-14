# EasyCart - Modern E-commerce Platform

A complete, production-ready e-commerce platform built with Go, Echo, Next.js, and PostgreSQL. EasyCart provides everything you need to build and manage online stores with a focus on simplicity, performance, and developer experience.

## 🚀 Features

### For Merchants
- **Shop Management**: Create and customize your online store with themes and branding
- **Product Catalog**: Full CRUD operations for products with categories and media management
- **Order Management**: Track orders, update status, and manage fulfillment
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **Dashboard**: Comprehensive admin interface for store management

### For Customers  
- **Public Storefront**: Beautiful, responsive store pages with product browsing
- **Shopping Cart**: Add/remove products with local storage persistence
- **Search & Filter**: Find products by name, description, or category
- **Checkout**: Complete order flow with customer information collection
- **Order Tracking**: Order confirmation and status updates

### Technical Features
- **RESTful API**: Well-structured backend API with proper HTTP status codes
- **JWT Authentication**: Secure user authentication and authorization
- **File Upload**: Image upload and management with MinIO S3-compatible storage
- **Database**: PostgreSQL with proper relationships and migrations
- **Docker**: Full containerization for easy deployment
- **Testing**: Comprehensive test suite for backend and frontend

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Go + Echo)   │◄──►│ (PostgreSQL)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  File Storage   │
                       │    (MinIO)      │
                       └─────────────────┘
```

## Tech Stack

### Backend (Go + Echo)
- **Framework**: Echo v4 web framework
- **Database**: PostgreSQL 15 with GORM ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: MinIO (S3-compatible object storage)
- **Testing**: Go testing with comprehensive API tests
- **Validation**: Request validation and sanitization

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **UI**: React 18 + Tailwind CSS
- **State Management**: React hooks + localStorage
- **Data Fetching**: Custom API service layer
- **Testing**: Jest unit tests + Cypress E2E tests

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15 with health checks
- **Object Storage**: MinIO with bucket policies
- **Reverse Proxy**: Ready for nginx/traefik
- **Monitoring**: Health check endpoints

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd easycart
cp .env.example .env
```

### 2. Run the Application
```bash
docker compose up --build
```

This will start:
- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **MinIO**: http://localhost:9001 (admin UI)

### 3. Verify Installation
Test the backend health check:
```bash
curl http://localhost:8080/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "easycart-backend"
}
```

## Development

### Backend Development
```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
easycart/
├── backend/                 # Go backend service
│   ├── cmd/server/         # Application entry point
│   ├── internal/           # Private application code
│   │   ├── config/        # Configuration management
│   │   ├── handler/       # HTTP handlers
│   │   └── middleware/    # Custom middleware
│   ├── go.mod             # Go module definition
│   └── Dockerfile         # Backend container
├── frontend/               # Next.js frontend
│   ├── src/app/           # App Router pages
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml      # Multi-service orchestration
└── README.md              # This file
```

## API Documentation

### Health Check
```bash
GET /api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "easycart-backend"
}
```

## Environment Variables

See `.env.example` for all available configuration options.

### Key Variables:
- `DB_*`: Database connection settings
- `MINIO_*`: Object storage settings
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend

## 📊 Project Status

✅ **COMPLETE**: All core e-commerce functionality implemented and tested!

### Completed Milestones

- [x] **Milestone 0**: Project scaffold with Docker Compose ✅
- [x] **Milestone 1**: Authentication and shop management ✅
- [x] **Milestone 2**: Product CRUD and file uploads ✅  
- [x] **Milestone 3**: Public storefront and checkout ✅
- [x] **Milestone 4**: Testing, documentation, and CI ✅

### What's Working

✅ User registration and JWT authentication  
✅ Shop creation and customization  
✅ Product management with categories  
✅ Image upload and media management  
✅ Public storefront with search/filter  
✅ Shopping cart with localStorage  
✅ Complete checkout flow  
✅ Order management and tracking  
✅ Comprehensive test suite  
✅ Full Docker containerization  
✅ Production-ready API design  

## 🧪 Testing

The platform includes comprehensive testing:

### Backend Tests (Go)
```bash
cd backend
chmod +x scripts/test.sh
./scripts/test.sh
```

Test Coverage:
- ✅ Authentication handlers
- ✅ Product CRUD operations
- ✅ Storefront public API
- ✅ Order creation and management
- ✅ Database models and relationships

### Frontend Tests (Jest + Cypress)
```bash
cd frontend
npm test                  # Unit tests
npm run test:coverage     # Coverage report
npm run test:e2e         # E2E tests
```

Test Coverage:
- ✅ Storefront service layer
- ✅ Component rendering
- ✅ Cart functionality
- ✅ E2E checkout flow
- ✅ User interactions

## License

MIT License - see LICENSE file for details.