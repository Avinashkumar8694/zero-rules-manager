# Version Flow Execution

## Overview
Version Flow Execution extends the Rules Manager's capabilities by introducing a flow-based execution system. This feature allows creating versions with multiple execution steps that can be connected in sequence or parallel, with configurable input/output mapping between steps.

## Flow Definition

### Basic Structure
```json
{
  "version": {
    "name": "loan-approval-flow",
    "description": "Loan approval decision flow",
    "inputs": [
      {"name": "income", "type": "number"},
      {"name": "credit_score", "type": "number"}
    ],
    "outputs": [
      {"name": "approval_status", "type": "string"},
      {"name": "loan_amount", "type": "number"}
    ],
    "variables": {
      "initial_status": {"type": "string", "default": null},
      "risk_score": {"type": "number", "default": 0},
      "compliance_score": {"type": "number", "default": 0},
      "combined_score": {"type": "number", "default": 0}
    },
    "flow": {
      "nodes": [...],
      "connections": [...]
    }
  }
}
```

### Legacy Basic Structure
```json
{
  "version": {
    "name": "loan-approval-flow",
    "description": "Loan approval decision flow",
    "inputs": [
      {"name": "income", "type": "number"},
      {"name": "credit_score", "type": "number"}
    ],
    "outputs": [
      {"name": "approval_status", "type": "string"},
      {"name": "loan_amount", "type": "number"}
    ],
    "flow": {
      "nodes": [...],
      "connections": [...]
    }
  }
}
```

### Node Types

Nodes in a flow can be either references to existing versions or new inline definitions. Both types support reusability and can be referenced in other flows.

1. **Excel Node**
   ```json
   {
     "id": "excel-1",
     "type": "excel",
     "config": {
       "mode": "reference",  // "reference" or "inline"
       "version_id": "uuid-of-excel-version",  // required for reference mode
       "excel_file": "path/to/excel.xlsx",    // required for inline mode
       "input_mapping": {
         "IP_INCOME": "$.flow.income",
         "IP_CREDIT": "$.flow.credit_score"
       },
       "output_mapping": {
         "initial_status": "$.OP_STATUS",
         "suggested_amount": "$.OP_AMOUNT"
       },
       "metadata": {  // Optional metadata for node reusability
         "name": "Income Evaluation",
         "description": "Evaluates income and credit score",
         "tags": ["finance", "credit-check"]
       }
     }
   }
   ```

2. **Code Node**
   ```json
   {
     "id": "code-1",
     "type": "code",
     "config": {
       "mode": "inline",  // "reference" or "inline"
       "version_id": "uuid-of-code-version",  // required for reference mode
       "code": "function execute(input) { return { status: input.status, amount: input.amount * 1.1 }; }",  // required for inline mode
       "input_mapping": {
         "status": "$.flow.initial_status",
         "amount": "$.flow.suggested_amount"
       },
       "output_mapping": {
         "$.flow.final_status": "$.status",
         "$.flow.final_amount": "$.amount"
       },
       "metadata": {
         "name": "Amount Adjustment",
         "description": "Adjusts final loan amount",
         "tags": ["calculation", "adjustment"]
       }
     }
   }
   ```

3. **Version Node**
   ```json
   {
     "id": "version-1",
     "type": "version",
     "config": {
       "version_id": "uuid-of-existing-version",
       "input_mapping": {
         "income": "$.flow.income",
         "credit_score": "$.flow.credit_rating"
       },
       "output_mapping": {
         "$.flow.decision": "$.approval_decision",
         "$.flow.limit": "$.credit_limit"
       },
       "metadata": {
         "name": "Credit Decision",
         "description": "Final credit decision logic",
         "tags": ["decision", "final-approval"]
       }
     }
   }
   ```

### Connection Definition
```json
{
  "connections": [
    {
      "from": {
        "node": "excel-1",
        "outputs": {
          "$.flow.initial_status": "$.OP_STATUS",
          "$.flow.credit_rating": "$.OP_CREDIT"  // Outputs directly to flow variables
        }
      },
      "to": {
        "node": "code-1",
        "inputs": {  // Using flow variables as inputs
          "status": "$.flow.initial_status",
          "credit": "$.flow.credit_rating"
        }
      },
      "condition": "$.flow.initial_status !== 'REJECTED'"  // Conditions using flow variables
    },
    {
      "from": [  // Multiple source nodes updating flow variables
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
        "input": "$.flow.combined_score",  // Store result in flow variable
        "transform": "($.flow.risk_score + $.flow.compliance_score) / 2"  // Transform using flow variables
      }
    },
    {
      "from": {
        "node": "version-1",
        "output": "$.flow.approval_status"  // Store in flow variable
      },
      "to": [  // Broadcasting flow variable to multiple nodes
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
```

## Execution Patterns

### Sequential Execution
- Nodes are executed in order based on their dependencies
- Output of one node feeds as input to the next node
- System automatically determines execution order based on connections

### Parallel Execution
- Independent nodes can be executed simultaneously
- System identifies parallel execution paths
- Results are synchronized before feeding into dependent nodes

## Input/Output Mapping

### Flow Variables
- Flow-level variables that persist throughout execution
- Declared in flow definition with initial values
- Can be updated by node outputs
- Accessible via `$.flow.<variable_name>`
- Support for complex data types and nested structures

### JSONPath Support
- Use JSONPath expressions for flexible data mapping
- Access flow inputs and variables: `$.flow.<name>`
- Access node outputs (legacy): `$.nodes.<node_id>.<output_name>`
- Support for array operations and filtering

### Mapping Types
1. **Direct Mapping**
   - One-to-one mapping between source and target
   - Example: `"target_field": "$.source_field"`

2. **Transform Mapping**
   - Apply transformations during mapping
   - Example: `"target_field": "${Math.round($.source_field)}"`

3. **Conditional Mapping**
   - Map based on conditions
   - Example: `"target_field": "${$.field1 > 100 ? 'High' : 'Low'}"`

## Node Storage and Reusability

### Database Structure
Nodes are stored in a dedicated `node_definitions` table with the following key attributes:
- Unique identifier (UUID)
- Name and description
- Node type (excel, code, version)
- Mode (reference or inline)
- Reference version ID (for referenced nodes)
- Excel file path or code content
- Input/output mappings
- Metadata (tags, etc.)
- Version tracking

### Node Reusability
1. **Independent Versioning**
   - Nodes are versioned separately from flows
   - Multiple flows can reference the same node version
   - Version changes don't affect existing references

2. **Reference Mode**
   - Nodes can reference existing versions
   - Changes to referenced version propagate to all flows
   - Supports centralized rule management

3. **Inline Mode**
   - Node configuration embedded in flow
   - Independent of referenced versions
   - Suitable for flow-specific logic

4. **Metadata Support**
   - Tagging for easy discovery
   - Description for documentation
   - Custom metadata for organization

## Error Handling

### Node-Level Errors
- Each node can specify error handling strategy
- Options: FAIL_FAST, CONTINUE, RETRY
- Custom error handlers can be defined

### Flow-Level Errors
- Global error handling policies
- Rollback mechanisms for failed flows
- Error propagation rules

## Future Extensions

### HTTP Request Node
```json
{
  "id": "http-1",
  "type": "http",
  "config": {
    "url": "https://api.example.com/data",
    "method": "POST",
    "headers": {...},
    "input_mapping": {...},
    "output_mapping": {...}
  }
}
```

### File Processing Node
```json
{
  "id": "file-1",
  "type": "file",
  "config": {
    "operation": "read",
    "format": "csv",
    "input_mapping": {...},
    "output_mapping": {...}
  }
}
```

### Custom Function Node
```json
{
  "id": "function-1",
  "type": "function",
  "config": {
    "function": "customTransform",
    "input_mapping": {...},
    "output_mapping": {...}
  }
}
```

## Best Practices

1. **Flow Design**
   - Keep flows modular and focused
   - Minimize dependencies between nodes
   - Use meaningful node and field names

2. **Performance**
   - Optimize parallel execution paths
   - Cache frequently used data
   - Monitor execution times

3. **Maintenance**
   - Document flow purpose and logic
   - Version control flow definitions
   - Regular testing and validation

## API Integration

### Create Flow Version
```http
POST /api/versions/flow
Content-Type: application/json

{
  "name": "loan-approval-flow",
  "description": "Loan approval decision flow",
  "flow_definition": {...}
}
```

### Execute Flow Version
```http
POST /api/versions/{version_id}/execute-flow
Content-Type: application/json

{
  "inputs": {
    "income": 50000,
    "credit_score": 750
  }
}
```