# Execute Flow Version

## Overview
This document provides a detailed explanation of the `executeFlow` method in the `FlowExecutionService` class. It includes a dry run example and a cURL command for executing a flow version.

## `executeFlow` Method
The `executeFlow` method is responsible for executing a flow version with the given inputs. It handles the execution of nodes in parallel flows, ensuring conditions are met before execution, and updates the context with the results of executed nodes.

### Method Signature
```typescript
async executeFlow(version: RuleVersion, inputs: Record<string, any>): Promise<Record<string, any>>
```

### Parameters
- `version`: The flow version to be executed.
- `inputs`: The input parameters for the flow execution.

### Returns
- A promise that resolves to the results of the flow execution.

### Steps
1. **Validate Inputs**: Ensure that all required inputs are provided and have the correct types.
2. **Initialize Flow Variables**: Initialize flow variables with default values.
3. **Initialize Context**: Create the context object with input parameters and flow variables.
4. **Execute Nodes**: Execute nodes in topological order, considering conditions and transforms.
5. **Update Context**: Update the context with the results of executed nodes.
6. **Synchronize Results**: Synchronize results at convergence points.
7. **Map Outputs**: Map the flow variables to the output columns.

## Dry Run Example
Here is a step-by-step dry run example of the `executeFlow` method:

### Input
```json
{
  "policy_premium": 1000,
  "initial_status": "APPROVED",
  "credit_rating": 750
}
```

### Flow Version
```json
{
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
}
```

### Execution Steps
1. **Initialization**: The flow execution starts by initializing the context with input parameters and flow variables.
2. **Node Execution**: Nodes are executed in topological order. For each node:
   - Input nodes are identified using `getInputNodes`.
   - Conditions for connections are evaluated using `evaluateCondition`.
   - If conditions are met, the node is executed.
   - Results are stored in the context.
3. **Parallel Execution**: Parallel paths are executed concurrently using `Promise.all`.
4. **Synchronization**: Dependent nodes wait for all incoming connections to complete. Results are synchronized using `updateContext` and `synchronizeResults`.
5. **Transforms**: Transform logic is applied to modify data before passing it to the target node using `handleTransform`.
6. **Completion**: The flow execution completes when all nodes have been executed and results are synchronized.

## cURL Command for Flow Version Execution
```sh
curl -X POST http://localhost:3000/api/execute/your-category-id \
  -H "Content-Type: application/json" \
  -d '{
        "policy_premium": 1000,
        "initial_status": "APPROVED",
        "credit_rating": 750
      }'
```
