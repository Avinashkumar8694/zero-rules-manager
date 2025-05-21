# API Documentation

## Overview
The Rules Manager exposes a comprehensive RESTful API that enables programmatic access to all system features. This document provides detailed information about available endpoints, request/response formats, and authentication requirements.

## Base URL
All API endpoints are relative to the base URL: `http://your-domain.com/api`

<!-- ## Authentication
API requests must include a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

To obtain a token, use the authentication endpoints (refer to the Authentication API section). -->

## Categories API

### Create Category
**Endpoint:** `POST /categories`

**Request Body:**
```json
{
  "name": "Calculation Rules",
  "description": "Rules for financial calculations"
}
```

**Response:** (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Calculation Rules",
  "description": "Rules for financial calculations",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

### List Categories
**Endpoint:** `GET /categories`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** (200 OK)
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Calculation Rules",
      "description": "Rules for financial calculations",
      "createdAt": "2024-01-20T12:00:00Z",
      "updatedAt": "2024-01-20T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

## Versions API

### Create Excel Version
**Endpoint:** `POST /categories/:categoryId/versions/upload`

**Request Body (multipart/form-data):**
- `file`: Excel file containing rule definitions (required)
- `version` (optional): Version string (e.g., "1.0.0")
- `description` (optional): Version description

### Create Code Version
**Endpoint:** `POST /categories/:categoryId/versions/code`

**Request Body:**
```json
{
  "code": "return inputs.value * 2;",
  "version": "1.0.0",
  "description": "Multiplication logic"
}
```

**Response:** (201 Created)
```json
{
  "id": "7a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p",
  "version": "1.0.0",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Initial version",
  "isActive": true,
  "inputColumns": ["IP_amount", "IP_rate"],
  "outputColumns": ["OP_result"],
  "createdAt": "2024-01-20T12:00:00Z"
}
```

## Execution API

### Execute Active Version
**Endpoint:** `POST /categories/:categoryId/execute`

**Request Body:**
```json
{
  "inputs": {
    "IP_amount": 1000,
    "IP_rate": 0.05
  }
}
```

**Response:** (200 OK)
```json
{
  "outputs": {
    "OP_result": 1050
  },
  "executionTime": 125,
  "versionId": "7a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p"
}
```

### Execute Specific Version
**Endpoint:** `POST /categories/:categoryId/versions/:versionId/execute`

**Request Body:**
```json
{
  "inputs": {
    "IP_amount": 1000,
    "IP_rate": 0.05
  }
}
```

**Response:** (200 OK)
```json
{
  "outputs": {
    "OP_result": 1050
  },
  "executionTime": 125,
  "versionId": "7a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p"
}
```

### Execute Latest Version
**Endpoint:** `POST /categories/:categoryId/versions/latest/execute`

**Request Body:** Same as Execute Active Version

**Response:** Same as Execute Active Version

## Error Handling

The API uses standard HTTP status codes and returns error details in a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "IP_amount": ["Must be a positive number"]
    }
  }
}
```

### Common Error Codes
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Version conflict
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Version Management

### Update Version Status
**Endpoint:** `PATCH /versions/:id`

**Request Body:**
```json
{
  "isActive": true
}
```

**Response:** (200 OK)
```json
{
  "id": "7a0b1c2d-3e4f-5g6h-7i8j-9k0l1m2n3o4p",
  "version": "1.0.0",
  "isActive": true,
  "updatedAt": "2024-01-20T12:30:00Z"
}
```

### Delete Version
**Endpoint:** `DELETE /versions/:id`

**Response:** (204 No Content)

## Rate Limiting
API requests are rate-limited based on the endpoint type:
- 100 requests per minute for regular endpoints
- 50 requests per minute for execution endpoints

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1516131012
```

## Pagination
List endpoints support pagination through query parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Response includes pagination metadata:
```json
{
  "items": [...],
  "total": 100,
  "page": 2,
  "limit": 10,
  "hasMore": true
}
```

## Best Practices
1. Always specify required input parameters
2. Handle rate limiting appropriately
3. Implement proper error handling
4. Use pagination for large datasets
5. Cache responses when appropriate

For detailed examples and use cases, refer to the [Usage Guide](../USAGE.md).