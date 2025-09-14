# EasyCart API Documentation

Complete REST API reference for the EasyCart e-commerce platform.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

EasyCart uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "data": { /* response data */ },
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": "error"
}
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "easycart-backend"
}
```

---

## Authentication

### Register User

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `first_name`: Required
- `last_name`: Required

---

### Login User

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "shop": {
      "id": "uuid",
      "name": "My Shop",
      "slug": "my-shop"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get User Profile

#### GET /profile
Get current user's profile information. **Requires Authentication**

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "shop": {
    "id": "uuid",
    "name": "My Shop",
    "slug": "my-shop",
    "description": "My online store",
    "primary_color": "#3B82F6",
    "secondary_color": "#64748B"
  }
}
```

---

## Shop Management

### Get Shop

#### GET /shop
Get current user's shop. **Requires Authentication**

**Response (200):**
```json
{
  "id": "uuid",
  "name": "My Shop",
  "slug": "my-shop",
  "description": "My online store",
  "primary_color": "#3B82F6",
  "secondary_color": "#64748B",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Create Shop

#### POST /shop
Create a new shop for the current user. **Requires Authentication**

**Request Body:**
```json
{
  "name": "My Awesome Shop",
  "description": "The best products online",
  "primary_color": "#3B82F6",
  "secondary_color": "#64748B"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "My Awesome Shop",
  "slug": "my-awesome-shop",
  "description": "The best products online",
  "primary_color": "#3B82F6",
  "secondary_color": "#64748B",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Validation Rules:**
- `name`: Required
- `primary_color`: Optional, hex color
- `secondary_color`: Optional, hex color

---

### Update Shop

#### PUT /shop
Update current user's shop. **Requires Authentication**

**Request Body:**
```json
{
  "name": "Updated Shop Name",
  "description": "Updated description",
  "primary_color": "#EF4444",
  "secondary_color": "#94A3B8"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Shop Name",
  "slug": "updated-shop-name",
  "description": "Updated description",
  "primary_color": "#EF4444",
  "secondary_color": "#94A3B8",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Categories

### Get Categories

#### GET /categories
Get all categories for current user's shop. **Requires Authentication**

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### Create Category

#### POST /categories
Create a new category. **Requires Authentication**

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "image_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Update Category

#### PUT /categories/:id
Update a category. **Requires Authentication**

**Request Body:**
```json
{
  "name": "Updated Electronics",
  "description": "Updated description",
  "is_active": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Electronics",
  "description": "Updated description",
  "is_active": false,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Delete Category

#### DELETE /categories/:id
Delete a category. **Requires Authentication**

**Response (204):** No content

---

## Products

### Get Products

#### GET /products
Get all products for current user's shop. **Requires Authentication**

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or description
- `category_id`: Filter by category UUID
- `is_active`: Filter by active status (true/false)
- `is_featured`: Filter by featured status (true/false)

**Response (200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "iPhone 15",
      "description": "Latest iPhone",
      "sku": "IPHONE-15-001",
      "price": 99900,
      "compare_price": 109900,
      "stock": 50,
      "min_stock": 10,
      "weight": 171.0,
      "is_active": true,
      "is_featured": true,
      "category": {
        "id": "uuid",
        "name": "Electronics"
      },
      "media": [
        {
          "id": "uuid",
          "url": "https://storage.example.com/image.jpg",
          "alt": "iPhone 15"
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### Get Product

#### GET /products/:id
Get a single product by ID. **Requires Authentication**

**Response (200):**
```json
{
  "id": "uuid",
  "name": "iPhone 15",
  "description": "Latest iPhone with advanced features",
  "sku": "IPHONE-15-001",
  "price": 99900,
  "compare_price": 109900,
  "stock": 50,
  "min_stock": 10,
  "weight": 171.0,
  "is_active": true,
  "is_featured": true,
  "category": {
    "id": "uuid",
    "name": "Electronics"
  },
  "media": [
    {
      "id": "uuid",
      "url": "https://storage.example.com/image.jpg",
      "alt": "iPhone 15"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Create Product

#### POST /products
Create a new product. **Requires Authentication**

**Request Body:**
```json
{
  "name": "iPhone 15",
  "description": "Latest iPhone with advanced features",
  "category_id": "uuid",
  "price": 99900,
  "compare_price": 109900,
  "stock": 50,
  "min_stock": 10,
  "weight": 171.0,
  "is_active": true,
  "is_featured": true,
  "image_ids": ["uuid1", "uuid2"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "iPhone 15",
  "sku": "IPHONE-15-001",
  "price": 99900,
  "stock": 50,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Validation Rules:**
- `name`: Required
- `price`: Required, must be > 0 (in cents)
- `stock`: Required, must be >= 0
- `min_stock`: Optional, must be >= 0
- `weight`: Optional, must be > 0 (in grams)

---

### Update Product

#### PUT /products/:id
Update a product. **Requires Authentication**

**Request Body:**
```json
{
  "name": "Updated iPhone 15",
  "price": 89900,
  "stock": 25,
  "is_active": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated iPhone 15",
  "price": 89900,
  "stock": 25,
  "is_active": false,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### Delete Product

#### DELETE /products/:id
Delete a product. **Requires Authentication**

**Response (204):** No content

---

## File Uploads

### Upload File

#### POST /uploads
Upload a file (image). **Requires Authentication**

**Request:** Multipart form data with `file` field

**Response (201):**
```json
{
  "id": "uuid",
  "filename": "image.jpg",
  "url": "https://storage.example.com/uploads/uuid.jpg",
  "size": 1024000,
  "mime_type": "image/jpeg",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Validation:**
- File must be an image (jpeg, jpg, png, gif, webp)
- Maximum file size: 10MB

---

## Orders (Protected)

### Get Orders

#### GET /orders
Get all orders for current user's shop. **Requires Authentication**

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by order status
- `search`: Search by order number, customer name, or email

**Response (200):**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-1234567890",
      "customer_email": "customer@example.com",
      "customer_name": "Jane Doe",
      "customer_phone": "+1234567890",
      "shipping_address": "123 Main St",
      "shipping_city": "Anytown",
      "shipping_state": "NY",
      "shipping_zip": "12345",
      "shipping_country": "US",
      "subtotal": 99900,
      "tax_amount": 0,
      "shipping_cost": 0,
      "total": 99900,
      "status": "pending",
      "payment_status": "pending",
      "notes": "Please handle with care",
      "created_at": "2024-01-01T00:00:00Z",
      "items": [
        {
          "id": "uuid",
          "product_name": "iPhone 15",
          "product_sku": "IPHONE-15-001",
          "product_image": "https://storage.example.com/image.jpg",
          "unit_price": 99900,
          "quantity": 1,
          "total": 99900
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### Get Order

#### GET /orders/:id
Get a single order by ID. **Requires Authentication**

**Response (200):**
```json
{
  "id": "uuid",
  "order_number": "ORD-1234567890",
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "total": 99900,
  "status": "pending",
  "payment_status": "pending",
  "created_at": "2024-01-01T00:00:00Z",
  "items": [
    {
      "product_name": "iPhone 15",
      "quantity": 1,
      "unit_price": 99900,
      "total": 99900,
      "product": {
        "id": "uuid",
        "name": "iPhone 15",
        "sku": "IPHONE-15-001"
      }
    }
  ]
}
```

---

### Update Order Status

#### PUT /orders/:id/status
Update order status. **Requires Authentication**

**Request Body:**
```json
{
  "status": "processing",
  "payment_status": "paid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "processing",
  "payment_status": "paid",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Valid Status Values:**
- Order Status: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- Payment Status: `pending`, `paid`, `failed`, `refunded`

---

## Storefront (Public API)

### Get Shop by Slug

#### GET /store/:slug
Get shop information by slug. **Public endpoint**

**Response (200):**
```json
{
  "id": "uuid",
  "name": "My Shop",
  "slug": "my-shop",
  "description": "My online store",
  "primary_color": "#3B82F6",
  "secondary_color": "#64748B",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Get Shop Products

#### GET /store/:slug/products
Get products for a shop by slug. **Public endpoint**

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)
- `search`: Search by name or description
- `category_id`: Filter by category UUID

**Response (200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "iPhone 15",
      "description": "Latest iPhone",
      "price": 99900,
      "compare_price": 109900,
      "stock": 50,
      "category": {
        "id": "uuid",
        "name": "Electronics"
      },
      "media": [
        {
          "url": "https://storage.example.com/image.jpg",
          "alt": "iPhone 15"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### Get Shop Product

#### GET /store/:slug/products/:productId
Get single product from a shop. **Public endpoint**

**Response (200):**
```json
{
  "id": "uuid",
  "name": "iPhone 15",
  "description": "Latest iPhone with advanced features",
  "price": 99900,
  "compare_price": 109900,
  "stock": 50,
  "category": {
    "id": "uuid",
    "name": "Electronics"
  },
  "media": [
    {
      "url": "https://storage.example.com/image.jpg",
      "alt": "iPhone 15"
    }
  ]
}
```

---

### Get Shop Categories

#### GET /store/:slug/categories
Get categories for a shop by slug. **Public endpoint**

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic devices and gadgets"
    }
  ]
}
```

---

### Create Order

#### POST /store/:slug/orders
Create an order for a shop. **Public endpoint**

**Request Body:**
```json
{
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "customer_phone": "+1234567890",
  "shipping_address": "123 Main St",
  "shipping_city": "Anytown",
  "shipping_state": "NY",
  "shipping_zip": "12345",
  "shipping_country": "US",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "notes": "Please handle with care"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "order_number": "ORD-1234567890",
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "total": 99900,
  "status": "pending",
  "payment_status": "pending",
  "created_at": "2024-01-01T00:00:00Z",
  "items": [
    {
      "product_name": "iPhone 15",
      "quantity": 1,
      "unit_price": 99900,
      "total": 99900
    }
  ]
}
```

**Validation Rules:**
- `customer_email`: Required, valid email
- `customer_name`: Required
- `shipping_address`: Required
- `shipping_city`: Required
- `shipping_zip`: Required
- `items`: Required, must have at least one item
- `items[].product_id`: Required, valid UUID
- `items[].quantity`: Required, must be >= 1

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- Rate limiting by IP address
- Rate limiting by authenticated user
- Different limits for public vs protected endpoints

---

## Notes

- All prices are stored and returned in cents (e.g., $9.99 = 999)
- All timestamps are in ISO 8601 format with UTC timezone
- UUIDs are used for all primary keys
- File uploads are stored in MinIO with public read access
- Order numbers are automatically generated with format `ORD-{timestamp}`
- Product SKUs are automatically generated if not provided