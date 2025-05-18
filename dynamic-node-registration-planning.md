# Dynamic Node Registration Planning

## Overview of Dynamic Node Registration

Dynamic node registration allows nodes to be registered dynamically in the system and utilized in flow versions. This approach provides flexibility and scalability, enabling the system to adapt to changing requirements without requiring manual updates to the codebase.

## Steps to Implement Dynamic Node Registration

1. **Define Node Interface**: Create a common interface for all nodes to implement. This interface should include methods for initialization, execution, and cleanup.

2. **Node Registry**: Implement a registry to manage the registration and retrieval of nodes. The registry should support adding, removing, and retrieving nodes by their unique identifiers.

3. **Dynamic Injection**: Allow nodes to be injected dynamically into the system. This can be achieved by providing a URL or file path to the node's JavaScript file, which will be loaded and registered at runtime.

4. **Lifecycle Management**: Define lifecycle methods for nodes, such as `onInit`, `onExecute`, and `onCleanup`. These methods will be called at appropriate stages of the node's lifecycle.

5. **Error Handling**: Implement robust error handling mechanisms to ensure that any issues during node registration or execution are gracefully handled.

6. **Security Considerations**: Ensure that dynamically loaded nodes are secure and do not introduce vulnerabilities. This may involve validating the source of the node and sandboxing its execution environment.

## Lifecycle Methods for Dynamic Nodes

1. **onInit**: Called when the node is initialized. This method can be used to set up any necessary resources or configurations.

2. **onExecute**: Called when the node is executed. This method contains the core logic of the node and processes the input data to produce the desired output.

3. **onCleanup**: Called when the node is cleaned up. This method can be used to release any resources or perform any necessary cleanup tasks.



### Comprehensive Plan for Dynamic Node Registration
1. **Define Advanced Node Interface**: Extend the basic node interface to include additional lifecycle methods and metadata support.
2. **Enhanced Node Registry**: Implement an enhanced registry to manage advanced nodes, including metadata retrieval and versioning.
3. **Advanced Dynamic Injection**: Support versioning and metadata during dynamic injection.
4. **Advanced Error Handling**: Implement advanced error handling mechanisms to support retries and custom error handlers.
5. **Security Enhancements**: Enhance security by implementing sandboxing and strict validation of node sources.
6. **Example Implementations**: Provide example implementations of advanced nodes and their registration.

## Creating a Node Using a JS File

To create a node using a JS file, follow these steps:

1. **Define the Node Class**: Create a JavaScript file that defines the node class implementing the required interface.

```javascript
// myNode.js
export default class MyNode {
  onInit() {
    console.log('MyNode initialized');
  }

  onExecute(input) {
    console.log('MyNode executed with input:', input);
    return { result: 'MyNode execution result' };
  }

  onCleanup() {
    console.log('MyNode cleaned up');
  }

  getConfig() {
  return {
    id: 'myNode',
    type: 'custom',

    inputs: [
      {
        key: 'input1',
        label: 'Input 1',
        type: 'string',
        required: true,
        default: '',
        mapping: '$.flow.input1',
        description: 'Enter the first input value'
      },
      {
        key: 'input2',
        label: 'Input 2',
        type: 'string',
        required: false,
        default: '',
        mapping: '$.flow.input2',
        description: 'Enter the second input value'
      }
    ],

    outputs: [
      {
        key: 'result',
        label: 'Result',
        type: 'object',
        description: 'Final output from execution',
        mapping: '$.flow.output'
      }
    ],

    metadata: {
      name: 'My Custom Node',
      description: 'A custom node implementation',
      tags: ['custom', 'example'],
      icon: 'fas fa-cogs',
      category: 'Data Processing'
    }
  };
}

}
```

2. **Register the Node Dynamically**: Use the dynamic injection mechanism to load and register the node at runtime.

```javascript
import { NodeRegistry } from './NodeRegistry';
import { loadNode } from './dynamicInjection';

const registry = new NodeRegistry();

async function registerMyNode() {
  try {
    const node = await loadNode('./myNode.js');
    const config = node.getConfig();
    registry.registerNode(config.id, node);
    node.onInit();
    console.log('MyNode registered successfully with config:', config);
  } catch (error) {
    console.error('Failed to register MyNode:', error);
  }
}

registerMyNode();
```

## Registering a Node Dynamically

To register a node dynamically, follow these steps:

1. **Load the Node**: Use the `loadNode` function to load the node from the specified URL or file path.

```javascript
async function loadNode(url) {
  const module = await import(url);
  return module.default;
}
```

2. **Register the Node**: Use the `registerNode` function to register the loaded node with the node registry.

```javascript
async function registerNode(url, registry, id) {
  const node = await loadNode(url);
  registry.registerNode(id, node);
  node.onInit();
}
```

## Executing a Node in a Flow

To execute a node in a flow, follow these steps:

1. **Prepare the Node Inputs**: Map the input data to the node's input parameters.

```javascript
const nodeInputs = {
  input1: 'value1',
  input2: 'value2'
};
```

2. **Execute the Node**: Call the `onExecute` method of the node with the prepared inputs.

```javascript
const node = registry.getNode('myNode');
const result = node.onExecute(nodeInputs);
console.log('Node execution result:', result);
```

3. **Handle the Node Output**: Process the output data returned by the node.

```javascript
const output = result.result;
console.log('Processed output:', output);
```

## Example of an HTTP Request Node

To create an HTTP request node that can be injected dynamically, follow these steps:

1. **Define the HTTP Request Node Class**: Create a JavaScript file that defines the HTTP request node class implementing the required interface.

```javascript
// httpRequestNode.js
import axios from 'axios';

export default class HttpRequestNode {
  onInit() {
    console.log('HttpRequestNode initialized');
  }

  async onExecute(input) {
    console.log('HttpRequestNode executed with input:', input);
    try {
      const response = await axios({
        method: input.method,
        url: input.url,
        headers: input.headers,
        data: input.data
      });
      return { result: response.data };
    } catch (error) {
      console.error('HTTP request failed:', error);
      return { error: error.message };
    }
  }

  onCleanup() {
    console.log('HttpRequestNode cleaned up');
  }

  getConfig() {
  return {
    id: 'myNode',
    type: 'custom',

    inputs: [
      {
        key: 'input1',
        label: 'Input 1',
        type: 'string',
        required: true,
        default: '',
        mapping: '$.flow.input1',
        description: 'Enter the first input value'
      },
      {
        key: 'input2',
        label: 'Input 2',
        type: 'string',
        required: false,
        default: '',
        mapping: '$.flow.input2',
        description: 'Enter the second input value'
      }
    ],

    outputs: [
      {
        key: 'result',
        label: 'Result',
        type: 'object',
        description: 'Final output from execution',
        mapping: '$.flow.output'
      }
    ],

    metadata: {
      name: 'My Custom Node',
      description: 'A custom node implementation',
      tags: ['custom', 'example'],
      icon: 'fas fa-cogs',
      category: 'Data Processing'
    }
  };
}

}
```

2. **Register the HTTP Request Node Dynamically**: Use the dynamic injection mechanism to load and register the HTTP request node at runtime.

```javascript
import { NodeRegistry } from './NodeRegistry';
import { loadNode } from './dynamicInjection';

const registry = new NodeRegistry();

async function registerHttpRequestNode() {
  try {
    await loadNode('./httpRequestNode.js', registry, 'httpRequestNode');
    console.log('HttpRequestNode registered successfully');
  } catch (error) {
    console.error('Failed to register HttpRequestNode:', error);
  }
}

registerHttpRequestNode();
```

3. **Execute the HTTP Request Node in a Flow**: Prepare the input data, execute the node, and handle the output.

```javascript
const nodeInputs = {
  method: 'POST',
  url: 'https://api.example.com/data',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    key: 'value'
  }
};

const node = registry.getNode('httpRequestNode');
const result = await node.onExecute(nodeInputs);
console.log('HTTP request result:', result);
```

## How `executeFlow` Method Will Execute This Node

The `executeFlow` method in the `FlowExecutionService` class will handle the execution of dynamically registered nodes by following these steps:

1. **Validate Inputs**: Ensure that all required inputs are provided and have the correct types.
2. **Initialize Flow Variables**: Initialize flow variables with default values.
3. **Initialize Context**: Create the context object with input parameters and flow variables.
4. **Execute Nodes**: Execute nodes in topological order, considering conditions and transforms.
5. **Update Context**: Update the context with the results of executed nodes.
6. **Synchronize Results**: Synchronize results at convergence points.
7. **Map Outputs**: Map the flow variables to the output columns.

### Example Execution Flow

```typescript
async executeFlow(version: RuleVersion, inputs: Record<string, any>): Promise<Record<string, any>> {
  try {
    this.validateInputs(version, inputs);
    const flowVariables = this.initializeFlowVariables(version);
    const context = {
      flow: {
        ...inputs,
        ...flowVariables
      }
    };

    const executedNodes = new Set<string>();
    const nodeResults: Record<string, any> = {};

    while (executedNodes.size < version.flowConfig.nodes.length) {
      const executionPromises = version.flowConfig.nodes.map(async (node) => {
        if (executedNodes.has(node.id)) return;

        const inputNodes = this.getInputNodes(node.id, version.flowConfig.connections);
        if (!this.areInputNodesExecuted(inputNodes, executedNodes)) return;

        const nodeInputs = this.prepareNodeInputs(node, context, version.flowConfig.connections, nodeResults);

        // Evaluate conditions before executing the node
        const connections = version.flowConfig.connections.filter(connection => {
          if (Array.isArray(connection.to)) {
            return connection.to.some(target => target.node === node.id);
          }
          return connection.to.node === node.id;
        });
        for (const connection of connections) {
          if (connection.condition && !this.evaluateCondition(connection.condition, context)) {
            return;
          }
        }

        const nodeResult = await this.executeNode(node, nodeInputs);

        nodeResults[node.id] = nodeResult;
        this.updateContext(context, node, nodeResult, version.flowConfig.connections);

        executedNodes.add(node.id);
      });

      await Promise.all(executionPromises);
    }

    this.synchronizeResults(context, nodeResults);

    return this.mapOutputs(version, context.flow);
  } catch (error) {
    throw new Error(`Failed to execute flow version: ${error.message}`);
  }
}
```

## Node Details for Dynamic Nodes

All nodes, including dynamically registered nodes, should have a similar structure to ensure consistency and compatibility within the flow execution system. The node details should include the following:

1. **ID**: A unique identifier for the node.
2. **Type**: The type of the node (e.g., `http`, `code`, `excel`).
3. **Config**: Configuration details for the node, including input/output mappings and any specific settings required for the node type.
4. **Metadata**: Optional metadata for the node, such as name, description, and tags.

### Example Node Details

```json
{
  "id": "httpRequestNode",
  "type": "http",
  "config": {
    "url": "https://api.example.com/data",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "input_mapping": {
      "data": "$.flow.inputData"
    },
    "output_mapping": {
      "$.flow.outputData": "result"
    }
  },
  "metadata": {
    "name": "HTTP Request Node",
    "description": "Sends an HTTP request and processes the response",
    "tags": ["http", "request"]
  }
}
```

## Handling Node Output for Dynamically Registered Nodes

The output of dynamically registered nodes should be handled in a consistent manner to ensure seamless integration with the flow execution system. The following steps outline how to handle node output:

1. **Execute Node**: Call the `onExecute` method of the node with the prepared inputs.
2. **Process Output**: Process the output data returned by the node.
3. **Update Context**: Update the context with the results of the executed node.
4. **Map Outputs**: Map the flow variables to the output columns.

### Example Output Handling

```typescript
const node = registry.getNode('httpRequestNode');
const result = await node.onExecute(nodeInputs);
console.log('Node execution result:', result);

const output = result.result;
context.flow.outputData = output;
```

## Auto-Preparing Nodes List on Registration and Deregistration

To ensure that the nodes list is automatically prepared when a node is registered or deregistered, the node registry should be enhanced to manage the nodes list dynamically. The following steps outline how to achieve this:

1. **Register Node**: Add the node to the registry and update the nodes list.
2. **Deregister Node**: Remove the node from the registry and update the nodes list.

### Example Node Registry with Auto-Preparation

```typescript
class AutoPreparedNodeRegistry {
  private nodes: Map<string, Node> = new Map();
  private nodesList: string[] = [];

  registerNode(id: string, node: Node): void {
    this.nodes.set(id, node);
    this.updateNodesList();
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    this.updateNodesList();
  }

  private updateNodesList(): void {
    this.nodesList = Array.from(this.nodes.keys());
  }

  getNodesList(): string[] {
    return this.nodesList;
  }
}

// Usage
const registry = new AutoPreparedNodeRegistry();
const exampleNode = new ExampleNode();
registry.registerNode('exampleNode', exampleNode);
console.log('Nodes list:', registry.getNodesList());

registry.removeNode('exampleNode');
console.log('Nodes list after removal:', registry.getNodesList());
```

## How Node (JS File) Can Provide Config While Registration

Each node should have the responsibility to provide its own configuration during registration. This can be achieved by defining a method in the node class that returns the configuration details.

### Example Node Configuration Method

```javascript
// myNode.js
export default class MyNode {
  onInit() {
    console.log('MyNode initialized');
  }

  onExecute(input) {
    console.log('MyNode executed with input:', input);
    return { result: 'MyNode execution result' };
  }

  onCleanup() {
    console.log('MyNode cleaned up');
  }

  getConfig() {
    return {
        id: 'myNode',
        type: 'custom',

        inputs: [
        {
            key: 'input1',
            label: 'Input 1',
            type: 'string',
            required: true,
            default: '',
            mapping: '$.flow.input1',
            description: 'Enter the first input value'
        },
        {
            key: 'input2',
            label: 'Input 2',
            type: 'string',
            required: false,
            default: '',
            mapping: '$.flow.input2',
            description: 'Enter the second input value'
        }
        ],

        outputs: [
        {
            key: 'result',
            label: 'Result',
            type: 'object',
            description: 'Final output from execution',
            mapping: '$.flow.output'
        }
        ],

        metadata: {
        name: 'My Custom Node',
        description: 'A custom node implementation',
        tags: ['custom', 'example'],
        icon: 'fas fa-cogs',
        category: 'Data Processing'
        }
    };
    }

}
```

### Registering Node with Configuration

```javascript
import { NodeRegistry } from './NodeRegistry';
import { loadNode } from './dynamicInjection';

const registry = new NodeRegistry();

async function registerMyNode() {
  try {
    const node = await loadNode('./myNode.js');
    const config = node.getConfig();
    registry.registerNode(config.id, node);
    node.onInit();
    console.log('MyNode registered successfully with config:', config);
  } catch (error) {
    console.error('Failed to register MyNode:', error);
  }
}

registerMyNode();
```

## Examples and Solutions

### Example 1: HTTP Request Node

```javascript
// httpRequestNode.js
import axios from 'axios';

export default class HttpRequestNode {
  onInit() {
    console.log('HttpRequestNode initialized');
  }

  async onExecute(input) {
    console.log('HttpRequestNode executed with input:', input);
    try {
      const response = await axios({
        method: input.method,
        url: input.url,
        headers: input.headers,
        data: input.data
      });
      return { result: response.data };
    } catch (error) {
      console.error('HTTP request failed:', error);
      return { error: error.message };
    }
  }

  onCleanup() {
    console.log('HttpRequestNode cleaned up');
  }

  getConfig() {
  return {
    id: 'myNode',
    type: 'custom',

    inputs: [
      {
        key: 'input1',
        label: 'Input 1',
        type: 'string',
        required: true,
        default: '',
        mapping: '$.flow.input1',
        description: 'Enter the first input value'
      },
      {
        key: 'input2',
        label: 'Input 2',
        type: 'string',
        required: false,
        default: '',
        mapping: '$.flow.input2',
        description: 'Enter the second input value'
      }
    ],

    outputs: [
      {
        key: 'result',
        label: 'Result',
        type: 'object',
        description: 'Final output from execution',
        mapping: '$.flow.output'
      }
    ],

    metadata: {
      name: 'My Custom Node',
      description: 'A custom node implementation',
      tags: ['custom', 'example'],
      icon: 'fas fa-cogs',
      category: 'Data Processing'
    }
  };
}

}
```

### Example 2: Custom Calculation Node

```javascript
// customCalculationNode.js
export default class CustomCalculationNode {
  onInit() {
    console.log('CustomCalculationNode initialized');
  }

  onExecute(input) {
    console.log('CustomCalculationNode executed with input:', input);
    const result = input.value1 + input.value2;
    return { result };
  }

  onCleanup() {
    console.log('CustomCalculationNode cleaned up');
  }

  getConfig() {
    return {
      id: 'customCalculationNode',
      type: 'custom',
      input_mapping: {
        value1: '$.flow.value1',
        value2: '$.flow.value2'
      },
      output_mapping: {
        '$.flow.result': 'result'
      },
      metadata: {
        name: 'Custom Calculation Node',
        description: 'Performs a custom calculation',
        tags: ['custom', 'calculation']
      }
    };
  }
}
```

### Solution for Dynamic Node Registration

1. **Define Node Class**: Create a JavaScript file that defines the node class implementing the required interface and configuration method.
2. **Load and Register Node**: Use the dynamic injection mechanism to load and register the node at runtime, utilizing the configuration provided by the node.
3. **Execute Node in Flow**: Prepare the input data, execute the node, and handle the output within the flow execution system.

By following these steps and examples, dynamic node registration can be effectively implemented, providing flexibility and scalability to the system.
