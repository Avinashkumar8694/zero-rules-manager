# Rules Manager - Usage Guide

## Table of Contents
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
  - [Categories](#categories)
  - [Rule Versions](#rule-versions)
  - [Rule Execution](#rule-execution)
- [Excel File Format](#excel-file-format)
- [Complete Workflow Example](#complete-workflow-example)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rules-manager
```

2. Install dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=rules_manager
```

## API Documentation

### Categories

#### Create a Category
- **Endpoint**: `POST /api/categories`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "name": "Calculation Rules",
  "description": "Basic arithmetic operations"
}
```
- **Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Calculation Rules",
  "description": "Basic arithmetic operations",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

#### Get All Categories
- **Endpoint**: `GET /api/categories`
- **Response** (200 OK):
```json
{
  "categories": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Calculation Rules",
      "description": "Basic arithmetic operations",
      "createdAt": "2024-01-20T12:00:00Z",
      "updatedAt": "2024-01-20T12:00:00Z"
    }
  ]
}
```

#### Update a Category
- **Endpoint**: `PUT /api/categories/:categoryId`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "name": "Updated Rules",
  "description": "Updated description"
}
```
- **Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Rules",
  "description": "Updated description",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T13:30:00Z"
}
```

#### Delete a Category
- **Endpoint**: `DELETE /api/categories/:categoryId`
- **Response** (204 No Content)

### Rule Versions

#### Upload a Rule Version
- **Endpoint**: `POST /api/categories/:categoryId/versions`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: Excel file (required)
  - `version`: Version string (optional)
- **Response** (201 Created):
```json
{
  "id": "7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0.0",
  "isActive": true,
  "filePath": "/uploads/rules_v1.xlsx",
  "inputColumns": ["IP_A1", "IP_A2"],
  "outputColumns": ["OP_SUM", "OP_PRODUCT"],
  "createdAt": "2024-01-20T12:30:00Z",
  "updatedAt": "2024-01-20T12:30:00Z"
}
```

#### Get Category Versions
- **Endpoint**: `GET /api/categories/:categoryId/versions`
- **Response** (200 OK):
```json
{
  "versions": [
    {
      "id": "7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000",
      "version": "1.0.0",
      "isActive": true,
      "inputColumns": ["IP_A1", "IP_A2"],
      "outputColumns": ["OP_SUM", "OP_PRODUCT"],
      "createdAt": "2024-01-20T12:30:00Z",
      "updatedAt": "2024-01-20T12:30:00Z"
    }
  ]
}
```

#### Get Specific Version
- **Endpoint**: `GET /api/categories/:categoryId/versions/:versionId`
- **Response** (200 OK):
```json
{
  "id": "7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000",
  "version": "1.0.0",
  "isActive": true,
  "inputColumns": ["IP_A1", "IP_A2"],
  "outputColumns": ["OP_SUM", "OP_PRODUCT"],
  "createdAt": "2024-01-20T12:30:00Z",
  "updatedAt": "2024-01-20T12:30:00Z"
}
```

#### Toggle Version Status
- **Endpoint**: `PATCH /api/categories/:categoryId/versions/:versionId`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "isActive": false
}
```
- **Response** (200 OK):
```json
{
  "id": "7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000",
  "isActive": false,
  "updatedAt": "2024-01-20T13:00:00Z"
}
```

#### Delete a Version
- **Endpoint**: `DELETE /api/categories/:categoryId/versions/:versionId`
- **Response** (204 No Content)

### Rule Execution

#### Execute Latest Active Version
- **Endpoint**: `POST /api/execute/:categoryId`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "IP_A1": 20,
  "IP_A2": 30
}
```
- **Response** (200 OK):
```json
{
  "version": "1.0.0",
  "results": {
    "OP_SUM": 50,
    "OP_PRODUCT": 600
  }
}
```

#### Execute Specific Version
- **Endpoint**: `POST /api/execute/:categoryId/versions/:versionId`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "IP_A1": 15,
  "IP_A2": 25
}
```
- **Response** (200 OK):
```json
{
  "version": "1.0.0",
  "results": {
    "OP_SUM": 40,
    "OP_PRODUCT": 375
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid input data
```json
{
  "error": "Invalid input: Missing required field 'IP_A1'"
}
```
- **404 Not Found**: Category or version not found
```json
{
  "error": "Category not found"
}
```
- **422 Unprocessable Entity**: Rule execution error
```json
{
  "error": "Error executing rules: Invalid formula in cell C2"
}
```

## Excel File Format

The Rules Manager accepts Excel files with specific formatting requirements:

1. Input columns must be prefixed with `IP_`
2. Output columns must be prefixed with `OP_`
3. Each row represents a rule case
4. Excel formulas can be used in output columns

Example Excel file format:

| IP_A1 | IP_A2 | OP_SUM | OP_PRODUCT |
|-------|-------|---------|------------|
| 10    | 20    | =A2+B2  | =A2*B2     |
| 5     | 8     | =A3+B3  | =A3*B3     |

## Complete Workflow Example

1. Create a rule category:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name": "Calculation Rules", "description": "Basic arithmetic operations"}'
```

2. Prepare an Excel file (rules.xlsx) with the following content:
   - Column A (IP_A1): Input values
   - Column B (IP_A2): Input values
   - Column C (OP_SUM): Formula =A2+B2
   - Column D (OP_PRODUCT): Formula =A2*B2

3. Upload the rule version:
```bash
curl -X POST http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000/versions \
  -H "Accept: application/json" \
  -F "file=@rules.xlsx" \
  -F "version=1.0.0"
```

4. Execute the rules:
```bash
curl -X POST http://localhost:3000/api/execute/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"IP_A1": 20, "IP_A2": 30}'
```

Expected response:
```json
{
  "OP_SUM": 50,
  "OP_PRODUCT": 600
}
```

This workflow demonstrates:
1. Creating a category for arithmetic operations
2. Uploading an Excel file with input/output definitions and formulas
3. Executing the rules with sample input values
4. Receiving calculated results based on the Excel formulas