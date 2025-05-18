# Parallel Flow Execution

## Overview
Parallel flow execution enables multiple paths of execution from a single node, with optional conditions determining which paths are taken. This document outlines the technical implementation and scenarios for parallel execution in the Rules Manager.

## Key Concepts

### Parallel Connections
- Multiple outgoing connections from a single node
- Independent execution paths
- Optional conditions per connection
- Synchronization at convergence points
- Support for array-based connections

### Execution Order
1. Nodes are executed in topological order using getInputNodes and areInputNodesExecuted
2. Parallel paths are executed concurrently through Promise.all
3. Dependent nodes wait for all incoming connections to complete
4. Results are synchronized using updateContext and synchronizeResults

## Connection Types

### Unconditional Parallel
```json
{
  "connections": [
    {
      "from": { "node": "node-1" },
      "to": { "node": "node-2" }
    },
    {
      "from": { "node": "node-1" },
      "to": { "node": "node-3" }
    }
  ]
}
```
- Both paths execute when node-1 completes
- No conditions to evaluate
- Results available independently

### Conditional Parallel
```json
{
  "connections": [
    {
      "from": { "node": "node-1" },
      "to": { "node": "node-2" },
      "condition": "$.flow.risk_score > 700"
    },
    {
      "from": { "node": "node-1" },
      "to": { "node": "node-3" },
      "condition": "$.flow.credit_score < 600"
    }
  ]
}
```
- Each path evaluated independently
- Multiple conditions can be true simultaneously
- Paths execute only when conditions are met

### Mixed Parallel
```json
{
  "connections": [
    {
      "from": { "node": "node-1" },
      "to": { "node": "node-2" },
      "condition": "$.flow.risk_score > 700"
    },
    {
      "from": { "node": "node-1" },
      "to": { "node": "node-3" }
    }
  ]
}
```
- Combines conditional and unconditional paths
- Unconditional paths always execute
- Conditional paths execute based on evaluation

## Execution Scenarios

### Scenario 1: All Paths Valid
1. Source node completes execution
2. All conditions evaluate to true
3. All parallel paths execute concurrently
4. Results synchronized at convergence

### Scenario 2: Partial Path Execution
1. Source node completes execution
2. Some conditions evaluate to false
3. Only valid paths execute
4. System tracks completed paths

### Scenario 3: No Valid Paths
1. Source node completes execution
2. All conditions evaluate to false
3. No parallel paths execute
4. Flow continues to next available path

### Scenario 4: Error Handling
1. Source node completes execution
2. Parallel paths begin execution
3. Error occurs in one path
4. Other paths continue execution
5. Error propagated to error handling system

## Implementation Details

### Connection Evaluation
```typescript
interface Connection {
  from: NodeReference;
  to: NodeReference;
  condition?: string;
}

interface ExecutionContext {
  flowVariables: Record<string, any>;
  nodeResults: Record<string, any>;
}

function evaluateConnection(connection: Connection, context: ExecutionContext): boolean {
  if (!connection.condition) {
    return true;
  }
  return evaluateCondition(connection.condition, context);
}
```

### Parallel Execution
```typescript
async function executeParallelPaths(
  connections: Connection[],
  context: ExecutionContext
): Promise<void> {
  const validConnections = connections.filter(conn => 
    evaluateConnection(conn, context)
  );

  const executionPromises = validConnections.map(conn =>
    executeNode(conn.to.node, context)
  );

  await Promise.all(executionPromises);
}
```

### Variable Context Management
```typescript
interface ExecutionContext {
  flow: Record<string, any>;
  nodeResults: Record<string, any>;
}

function initializeContext(inputs: Record<string, any>, flowVariables: Record<string, any>): ExecutionContext {
  return {
    flow: {
      ...inputs,
      ...flowVariables
    },
    nodeResults: {}
  };
}

function updateContext(
  context: ExecutionContext,
  node: FlowNode,
  nodeResult: Record<string, any>
): void {
  // Update flow variables based on output_mapping
  for (const [sourcePath, targetPath] of Object.entries(node.config.output_mapping)) {
    const value = resolveValue(sourcePath, context.flow);
    setValueByPath(context.flow, targetPath, value);
  }
  
  // Store node results for reference
  context.nodeResults[node.id] = nodeResult;
}

function resolveValue(path: string, context: Record<string, any>): any {
  const parts = path.replace('$.flow.', '').split('.');
  let value = context;
  for (const part of parts) {
    value = value[part];
    if (value === undefined) break;
  }
  return value;
}
```

## Best Practices

### Flow Design
1. Keep conditions simple and independent
2. Avoid circular dependencies
3. Plan for error scenarios
4. Document expected parallel paths

### Performance
1. Monitor execution times
2. Optimize condition evaluation
3. Handle resource constraints
4. Implement timeouts

### Testing
1. Test all condition combinations
2. Verify parallel execution
3. Validate result synchronization
4. Check error propagation

## Future Enhancements

### Priority Execution
- Add priority levels to connections
- Control execution order of parallel paths
- Support resource allocation

### Advanced Conditions
- Support complex condition expressions
- Add custom condition functions
- Enable dynamic condition evaluation

### Monitoring
- Track parallel execution metrics
- Monitor resource usage
- Alert on execution issues

### Flow Control
- Pause/resume parallel execution
- Cancel specific paths
- Dynamic path selection