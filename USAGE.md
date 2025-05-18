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
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Calculation Rules",
    "description": "Basic arithmetic operations"
  }'
```

Response (201 Created):
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
```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Accept: application/json"
```

Response (200 OK):
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
```bash
curl -X PUT http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Updated Rules",
    "description": "Updated description"
  }'
```

Response (200 OK):
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
```bash
curl -X DELETE http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000
```

Response: 204 No Content

### Rule Versions

#### Create a Code-Based Rule Version
```bash
curl -X POST http://localhost:3000/api/categories/:categoryId/versions/code \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "inputColumns": {
      "num1": { "name": "num1", "type": "number" },
      "num2": { "name": "num2", "type": "number" }
    },
    "outputColumns": {
      "sum": {
        "name": "sum",
        "type": "number",
        "code": "return num1 + num2;"
      },
      "product": {
        "name": "product",
        "type": "number",
        "code": "return num1 * num2;"
      }
    }
  }'
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "version": "1.0.0",
  "inputColumns": {
    "num1": { "name": "num1", "type": "number" },
    "num2": { "name": "num2", "type": "number" }
  },
  "outputColumns": {
    "sum": {
      "name": "sum",
      "type": "number",
      "code": "return num1 + num2;"
    },
    "product": {
      "name": "product",
      "type": "number",
      "code": "return num1 * num2;"
    }
  },
  "isActive": false,
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

#### Create an Excel-Based Rule Version
```bash
curl -X POST http://localhost:3000/api/categories/:categoryId/versions/upload \
  -H "Content-Type: multipart/form-data" \
  -H "Accept: application/json" \
  -F "file=@rules.xlsx"
```

Response (201 Created):
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
```bash
curl -X GET http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000/versions \
  -H "Accept: application/json"
```

Response (200 OK):
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
```bash
curl -X GET http://localhost:3000/api/versions/7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000 \
  -H "Accept: application/json"
```

Response (200 OK):
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

#### Update Version (Excel-based)
```bash
curl -X PUT http://localhost:3000/api/versions/5e3d118b-062b-4a9d-b98b-994b7b1d4d12 \
  -H "Accept: application/json" \
  -F "file=@/path/to/your/rules.xlsx"
```

Response (200 OK):
```json
{
    "id": "5e3d118b-062b-4a9d-b98b-994b7b1d4d12",
    "categoryId": "679bca33-df52-4798-b84e-2fe4d936b9db",
    "version": "1.2.0",
    "isActive": false,
    "filePath": "uploads/4c60041d-d941-4566-be59-5faf5709471f.xlsx",
    "inputColumns": {
        "policy_premium": {
            "name": "policy_premium",
            "type": "number",
            "value": 1118.63
        }
    },
    "outputColumns": {
        "total_premium": {
            "name": "total_premium",
            "type": "number",
            "formula": "K4+(K4)*0.15"
        }
    },
    "createdAt": "2025-05-06T02:27:07.288Z",
    "updatedAt": "2025-05-06T08:54:48.583Z"
}
```

#### Update Version (Code-based)
```bash
curl -X PUT http://localhost:3000/api/versions/5e3d118b-062b-4a9d-b98b-994b7b1d4d12 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "inputColumns": {
      "num1": { "name": "num1", "type": "number" },
      "num2": { "name": "num2", "type": "number" }
    },
    "outputColumns": {
      "sum": {
        "name": "sum",
        "type": "number",
        "code": "return num1 + num2;"
      },
      "product": {
        "name": "product",
        "type": "number",
        "code": "return num1 * num2;"
      }
    }
  }'
```

Response (200 OK):
```json
{
    "id": "5e3d118b-062b-4a9d-b98b-994b7b1d4d12",
    "categoryId": "679bca33-df52-4798-b84e-2fe4d936b9db",
    "version": "1.2.0",
    "isActive": false,
    "inputColumns": {
        "num1": { "name": "num1", "type": "number" },
        "num2": { "name": "num2", "type": "number" }
    },
    "outputColumns": {
        "sum": {
            "name": "sum",
            "type": "number",
            "code": "return num1 + num2;"
        },
        "product": {
            "name": "product",
            "type": "number",
            "code": "return num1 * num2;"
        }
    },
    "createdAt": "2025-05-06T02:27:07.288Z",
    "updatedAt": "2025-05-06T08:54:48.583Z"
}
```

#### Delete Version
```bash
curl -X DELETE http://localhost:3000/api/versions/7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000
```

Response: 204 No Content

#### Toggle Version Status
```bash
curl -X PATCH http://localhost:3000/api/versions/7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "isActive": false
  }'
```

Response (200 OK):
```json
{
    "versions": [
        {
            "id": "be3ed138-dc73-4bcc-bbb5-570ff3e46f91",
            "categoryId": "679bca33-df52-4798-b84e-2fe4d936b9db",
            "version": "1.0.0",
            "isActive": true,
            "filePath": "uploads\\05c003e3-59fc-4224-bb8d-0879909bda79.xlsx",
            "inputColumns": {
                "policy_premium": {
                    "name": "policy_premium",
                    "type": "number",
                    "value": 1118.63
                }
            },
            "outputColumns": {
                "total_premium": {
                    "name": "total_premium",
                    "type": "number",
                    "formula": "K4+(K4)*0.15"
                }
            },
            "createdAt": "2025-05-06T03:47:02.967Z",
            "updatedAt": "2025-05-06T03:49:56.022Z"
        }
    ]
}
```

### Rule Execution

#### Execute Latest Version (Excel-based)
```bash
curl --location 'http://localhost:3000/api/categories/679bca33-df52-4798-b84e-2fe4d936b9db/latest/execute' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "policy_premium": 10000
  }'
```

Response (200 OK):
```json
{
    "version": "1.0.0",
    "results": {
        "total_premium": 1458.3495
    }
}
```

#### Execute Latest Version (Code-based)
```bash
curl --location 'http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000/latest/execute' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "num1": 10,
    "num2": 20
  }'
```

Response (200 OK):
```json
{
    "version": "1.0.0",
    "results": {
        "sum": 30,
        "product": 200
    }
}
```

#### Execute Specific Version
```bash
curl --location 'http://localhost:3000/api/categories/679bca33-df52-4798-b84e-2fe4d936b9db/versions/be3ed138-dc73-4bcc-bbb5-570ff3e46f91/execute' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "policy_premium": 100
  }'
```

Response (200 OK):
```json
{
    "version": "1.0.0",
    "results": {
        "total_premium": 286.925
    }
}
```

#### Execute Rules by Category
```bash
curl --location 'http://localhost:3000/api/execute/679bca33-df52-4798-b84e-2fe4d936b9db' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "policy_premium": 100
  }'
```

Response (200 OK):
```json
{
    "version": "1.0.0",
    "results": {
        "total_premium": 286.925
    }
}

```

#### Delete a Version
```bash
curl -X DELETE http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000/versions/7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000
```

Response: 204 No Content

### Rule Execution

#### Execute Flow Version
```bash
curl -X POST http://localhost:3000/api/categories/:categoryId/versions/:versionId/execute \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "amount": 100,
    "rate": 1.5
  }'
```

Response (200 OK):
```json
{
  "version": "1.0.0",
  "results": {
    "total": 150,
    "tax": 15
  }
}
```

#### Error Responses

400 Bad Request - Invalid input data:
```json
{
  "error": "Invalid input: Missing required field 'IP_A1'"
}
```

404 Not Found - Category or version not found:
```json
{
  "error": "Category not found"
}
```

422 Unprocessable Entity - Rule execution error:
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

## Excel File Format

The Rules Manager accepts Excel files with named ranges for inputs and outputs:

1. Input named ranges must be prefixed with `IP_`
2. Output named ranges must be prefixed with `OP_`
3. Named ranges can reference single cells or ranges
4. Excel formulas in output ranges can reference input ranges

Example Excel file structure:

### Sheet: Premium Calculation

| Cell | Named Range | Formula/Value | Description |
|------|-------------|---------------|-------------|
| A1   | IP_base_premium | 1000 | Base premium amount |
| A2   | IP_risk_factor | 1.5 | Risk multiplier |
| B1   | OP_total_premium | =IP_base_premium * IP_risk_factor | Calculated total premium |
| B2   | OP_tax_amount | =OP_total_premium * 0.15 | 15% tax calculation |
| B3   | OP_final_amount | =OP_total_premium + OP_tax_amount | Final premium with tax |

When executing rules with this Excel template:

```bash
curl -X POST http://localhost:3000/api/categories/:categoryId/versions/flow \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "1.0.0",
    "description": "Basic calculation flow",
    "type": "flow",
    "inputColumns": {
      "amount": { "type": "number", "name": "amount" },
      "rate": { "type": "number", "name": "rate" }
    },
    "outputColumns": {
      "total": { "type": "number", "name": "total" },
      "tax": { "type": "number", "name": "tax" }
    },
    "variables": {
      "taxRate": {
        "type": "number",
        "default": 0.1,
        "description": "Tax rate percentage"
      }
    },
    "flowConfig": {
      "nodes": [
        {
          "id": "calc1",
          "type": "code",
          "config": {
            "mode": "inline",
            "code": "return amount * rate;",
            "input_mapping": {
              "amount": "amount",
              "rate": "rate"
            },
            "output_mapping": {
              "result": "total"
            }
          }
        },
        {
          "id": "calc2",
          "type": "code",
          "config": {
            "mode": "inline",
            "code": "return total * taxRate;",
            "input_mapping": {
              "total": "total",
              "taxRate": "taxRate"
            },
            "output_mapping": {
              "result": "tax"
            }
          }
        }
      ],
      "connections": [
        {
          "from": {
            "node": "calc1",
            "outputs": { "result": "total" }
          },
          "to": {
            "node": "calc2",
            "inputs": { "total": "total" }
          }
        }
      ]
    }
  }'

Response (201 Created):
```json
{
  "id": "7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0.0",
  "description": "Basic calculation flow",
  "type": "flow",
  "isActive": false,
  "inputColumns": {
    "amount": { "type": "number", "name": "amount" },
    "rate": { "type": "number", "name": "rate" }
  },
  "outputColumns": {
    "total": { "type": "number", "name": "total" },
    "tax": { "type": "number", "name": "tax" }
  },
  "variables": {
    "taxRate": {
      "type": "number",
      "default": 0.1,
      "description": "Tax rate percentage"
    }
  },
  "flowConfig": {
    "nodes": [...],
    "connections": [...]
  },
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

Expected response:
```json
{
  "version": "1.0.0",
  "results": {
    "total_premium": 3600,
    "tax_amount": 540,
    "final_amount": 4140
  }
}
```

This example demonstrates:
- Using meaningful named ranges for inputs and outputs
- Complex formula calculations using named ranges
- Proper Excel template structure for rule execution

### Flow Version Execution

#### Execute Flow Version with Conditions and Transforms
```bash
curl -X POST http://localhost:3000/api/execute/your-category-id \
  -H "Content-Type: application/json" \
  -d '{
        "policy_premium": 1000,
        "initial_status": "APPROVED",
        "credit_rating": 750
      }'
```

Response (200 OK):
```json
{
  "version": "1.0.0",
  "results": {
    "total_premium": 1000,
    "approval_status": "APPROVED",
    "combined_score": 750
  }
}
```

### Complete Workflow Example

#### Create a Category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Insurance Rules",
    "description": "Rules for insurance policy calculations"
  }'
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Insurance Rules",
  "description": "Rules for insurance policy calculations",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

#### Create a Flow Version
```bash
curl -X POST http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000/versions/flow \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Flow Version 1",
    "description": "Sample flow version",
    "type": "flow",
    "inputColumns": {
      "policy_premium": {
        "type": "number"
      }
    },
    "outputColumns": {
      "result": {
        "type": "number"
      }
    },
    "variables": {
      "initial_status": {
        "type": "string",
        "default": "PENDING"
      },
      "credit_rating": {
        "type": "number",
        "default": 0
      }
    },
    "flow": {
      "nodes": [
        {
          "id": "excel-1",
          "type": "excel",
          "config": {
            "mode": "inline",
            "excel_file": "example.xlsx",
            "input_mapping": {
              "IP_policy_premium": "$.flow.policy_premium"
            },
            "output_mapping": {
              "$.flow.result": "$.OP_result"
            },
            "metadata": {
              "name": "Premium Calculator",
              "description": "Calculates premium based on input",
              "tags": [
                "premium",
                "calculation"
              ]
            }
          }
        },
        {
          "id": "code-1",
          "type": "code",
          "config": {
            "mode": "inline",
            "code": "return { status: 'APPROVED', credit: 750 };",
            "input_mapping": {
              "status": "$.flow.initial_status",
              "credit": "$.flow.credit_rating"
            },
            "output_mapping": {
              "$.flow.status": "status",
              "$.flow.credit": "credit"
            },
            "metadata": {
              "name": "Credit Check",
              "description": "Performs credit check",
              "tags": [
                "credit",
                "check"
              ]
            }
          }
        },
        {
          "id": "version-1",
          "type": "code",
          "config": {
            "mode": "inline",
            "code": "return { combined_score: (risk_score + compliance_score) / 2 };",
            "input_mapping": {
              "risk_score": "$.flow.risk_score",
              "compliance_score": "$.flow.compliance_score"
            },
            "output_mapping": {
              "$.flow.combined_score": "combined_score"
            },
            "metadata": {
              "name": "Score Aggregator",
              "description": "Aggregates risk and compliance scores",
              "tags": [
                "score",
                "aggregation"
              ]
            }
          }
        },
        {
          "id": "notification-1",
          "type": "code",
          "config": {
            "mode": "inline",
            "code": "console.log('Notification sent with status:', status);",
            "input_mapping": {
              "status": "$.flow.approval_status"
            },
            "output_mapping": {},
            "metadata": {
              "name": "Notification Sender",
              "description": "Sends notification",
              "tags": [
                "notification",
                "send"
              ]
            }
          }
        },
        {
          "id": "audit-1",
          "type": "code",
          "config": {
            "mode": "inline",
            "code": "console.log('Audit logged with decision:', decision);",
            "input_mapping": {
              "decision": "$.flow.approval_status"
            },
            "output_mapping": {},
            "metadata": {
              "name": "Audit Logger",
              "description": "Logs audit decision",
              "tags": [
                "audit",
                "log"
              ]
            }
          }
        }
      ],
      "connections": [
        {
          "from": {
            "node": "excel-1",
            "outputs": {
              "$.flow.initial_status": "$.OP_STATUS",
              "$.flow.credit_rating": "$.OP_CREDIT"
            }
          },
          "to": {
            "node": "code-1",
            "inputs": {
              "status": "$.flow.initial_status",
              "credit": "$.flow.credit_rating"
            }
          },
          "condition": "$.flow.initial_status !== 'REJECTED'"
        },
        {
          "from": [
            {
              "node": "excel-1",
              "output": "$.flow.risk_score"
            },
            {
              "node": "code-1",
              "output": "$.flow.compliance_score"
            }
          ],
          "to": {
            "node": "version-1",
            "input": "$.flow.combined_score",
            "transform": "($.flow.risk_score + $.flow.compliance_score) / 2"
          }
        },
        {
          "from": {
            "node": "version-1",
            "output": "$.flow.approval_status"
          },
          "to": [
            {
              "node": "notification-1",
              "input": "status",
              "value": "$.flow.approval_status"
            },
            {
              "node": "audit-1",
              "input": "decision",
              "value": "$.flow.approval_status"
            }
          ]
        }
      ]
    }
  }'
```

Response (201 Created):
```json
{
  "id": "7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0.0",
  "description": "Sample flow version",
  "type": "flow",
  "isActive": false,
  "inputColumns": {
    "policy_premium": {
      "type": "number"
    }
  },
  "outputColumns": {
    "result": {
      "type": "number"
    }
  },
  "variables": {
    "initial_status": {
      "type": "string",
      "default": "PENDING"
    },
    "credit_rating": {
      "type": "number",
      "default": 0
    }
  },
  "flow": {
    "nodes": [
      {
        "id": "excel-1",
        "type": "excel",
        "config": {
          "mode": "inline",
          "excel_file": "example.xlsx",
          "input_mapping": {
            "IP_policy_premium": "$.flow.policy_premium"
          },
          "output_mapping": {
            "$.flow.result": "$.OP_result"
          },
          "metadata": {
            "name": "Premium Calculator",
            "description": "Calculates premium based on input",
            "tags": [
              "premium",
              "calculation"
            ]
          }
        }
      },
      {
        "id": "code-1",
        "type": "code",
        "config": {
          "mode": "inline",
          "code": "return { status: 'APPROVED', credit: 750 };",
          "input_mapping": {
            "status": "$.flow.initial_status",
            "credit": "$.flow.credit_rating"
          },
          "output_mapping": {
            "$.flow.status": "status",
            "$.flow.credit": "credit"
          },
          "metadata": {
            "name": "Credit Check",
            "description": "Performs credit check",
            "tags": [
              "credit",
              "check"
            ]
          }
        }
      },
      {
        "id": "version-1",
        "type": "code",
        "config": {
          "mode": "inline",
          "code": "return { combined_score: (risk_score + compliance_score) / 2 };",
          "input_mapping": {
            "risk_score": "$.flow.risk_score",
            "compliance_score": "$.flow.compliance_score"
          },
          "output_mapping": {
            "$.flow.combined_score": "combined_score"
          },
          "metadata": {
            "name": "Score Aggregator",
            "description": "Aggregates risk and compliance scores",
            "tags": [
              "score",
              "aggregation"
            ]
          }
        }
      },
      {
        "id": "notification-1",
        "type": "code",
        "config": {
          "mode": "inline",
          "code": "console.log('Notification sent with status:', status);",
          "input_mapping": {
            "status": "$.flow.approval_status"
          },
          "output_mapping": {},
          "metadata": {
            "name": "Notification Sender",
            "description": "Sends notification",
            "tags": [
              "notification",
              "send"
            ]
          }
        }
      },
      {
        "id": "audit-1",
        "type": "code",
        "config": {
          "mode": "inline",
          "code": "console.log('Audit logged with decision:', decision);",
          "input_mapping": {
            "decision": "$.flow.approval_status"
          },
          "output_mapping": {},
          "metadata": {
            "name": "Audit Logger",
            "description": "Logs audit decision",
            "tags": [
              "audit",
              "log"
            ]
          }
        }
      }
    ],
    "connections": [
      {
        "from": {
          "node": "excel-1",
          "outputs": {
            "$.flow.initial_status": "$.OP_STATUS",
            "$.flow.credit_rating": "$.OP_CREDIT"
          }
        },
        "to": {
          "node": "code-1",
          "inputs": {
            "status": "$.flow.initial_status",
            "credit": "$.flow.credit_rating"
          }
        },
        "condition": "$.flow.initial_status !== 'REJECTED'"
      },
      {
        "from": [
          {
            "node": "excel-1",
            "output": "$.flow.risk_score"
          },
          {
            "node": "code-1",
            "output": "$.flow.compliance_score"
          }
        ],
        "to": {
          "node": "version-1",
          "input": "$.flow.combined_score",
          "transform": "($.flow.risk_score + $.flow.compliance_score) / 2"
        }
      },
      {
        "from": {
          "node": "version-1",
          "output": "$.flow.approval_status"
        },
        "to": [
          {
            "node": "notification-1",
            "input": "status",
            "value": "$.flow.approval_status"
          },
          {
            "node": "audit-1",
            "input": "decision",
            "value": "$.flow.approval_status"
          }
        ]
      }
    ]
  }
}
```

#### Execute Flow Version
```bash
curl -X POST http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000/versions/7c0e9a5d-8d0a-4f00-9a1c-6b5f3c7d0000/execute \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "policy_premium": 1000,
    "initial_status": "APPROVED",
    "credit_rating": 750
  }'
```

Response (200 OK):
```json
{
  "version": "1.0.0",
  "results": {
    "total_premium": 1000,
    "approval_status": "APPROVED",
    "combined_score": 750
  }
}
```
