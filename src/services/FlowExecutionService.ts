import { RuleVersion } from '../models/RuleVersion';
import { ExcelService } from './ExcelService';
import { CodeExecutionService } from './CodeExecutionService';
import { DatabaseService } from './DatabaseService';

export class FlowExecutionService {
  private excelService = new ExcelService();
  private codeService = new CodeExecutionService();
  private versionRepository: any;

  constructor() {
    this.initialize().catch(error => {
      console.error('FlowExecutionService initialization failed:', error);
    });
  }

  private async initialize() {
    try {
      if (!DatabaseService.getInstance().getDataSource().isInitialized) {
        await DatabaseService.initializeDatabase();
      }
      const dataSource = DatabaseService.getInstance().getDataSource();
      this.versionRepository = dataSource.getRepository(RuleVersion);
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error('Failed to initialize database connection');
    }
  }

  private async getReferencedVersion(versionId: string): Promise<RuleVersion | null> {
    try {
      if (!this.versionRepository) {
        await this.initialize();
      }
      return await this.versionRepository.findOne({
        where: { id: versionId }
      });
    } catch (error) {
      console.error('Error fetching referenced version:', error);
      return null;
    }
  }

  private evaluateCondition(condition: string, context: { flow: Record<string, any> }): boolean {
    try {
      // Simple evaluation for now - can be enhanced with a proper expression evaluator
      const value = this.resolveValue(condition, context.flow);
      return Boolean(value);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private async executeParallelPaths(
    node: RuleVersion['flowConfig']['nodes'][0],
    context: { flow: Record<string, any> },
    connections: RuleVersion['flowConfig']['connections'],
    nodeResults: Record<string, any>,
    executedNodes: Set<string>,
    version: RuleVersion
  ): Promise<void> {
    // Get all outgoing connections for this node
    const outgoingConnections = connections.filter(conn => {
      if (Array.isArray(conn.from)) {
        return conn.from.some(f => f.node === node.id);
      }
      return conn.from.node === node.id;
    });

    // Filter valid connections based on conditions
    const validConnections = outgoingConnections.filter(conn => {
      return !conn.condition || this.evaluateCondition(conn.condition, context);
    });

    // Execute all valid paths in parallel
    const executionPromises = validConnections.map(async (conn) => {
      const targetNodes = Array.isArray(conn.to) ? conn.to : [conn.to];
      
      const nodePromises = targetNodes.map(async (target) => {
        const targetNode = this.findNode(target.node, version);
        if (!targetNode) return;

        const nodeInputs = this.prepareNodeInputs(targetNode, context, connections, nodeResults);
        try {
          const result = await this.executeNode(targetNode, nodeInputs);
          nodeResults[targetNode.id] = result;
          this.updateContext(context, targetNode, result, connections);
          executedNodes.add(targetNode.id);
        } catch (error) {
          console.error(`Error executing node ${targetNode.id}:`, error);
          // Continue with other paths despite error
        }
      });

      await Promise.all(nodePromises);
    });

    await Promise.all(executionPromises);
  }

  async executeFlow(version: RuleVersion, inputs: Record<string, any>): Promise<Record<string, any>> {
    try {
      // Validate inputs against version's inputColumns
      this.validateInputs(version, inputs);

      // Initialize flow variables with default values
      const flowVariables = this.initializeFlowVariables(version);

      // Create execution context with inputs and flow variables
      const context = {
        flow: {
          ...inputs,
          ...flowVariables
        }
      };

      // Execute nodes in topological order with parallel support
      const executedNodes = new Set<string>();
      const nodeResults: Record<string, any> = {};
      const errorNodes = new Set<string>();

      // Keep executing nodes until all nodes are processed or no more nodes can be executed
      while (executedNodes.size + errorNodes.size < version.flowConfig.nodes.length) {
        const nodesToExecute = version.flowConfig.nodes.filter(node => {
          // Skip already executed or error nodes
          if (executedNodes.has(node.id) || errorNodes.has(node.id)) return false;
          
          // Get input nodes and check their status
          const inputNodes = this.getInputNodes(node.id, version.flowConfig.connections);
          const allInputsExecuted = this.areInputNodesExecuted(inputNodes, executedNodes);
          const hasFailedDependencies = inputNodes.some(nodeId => errorNodes.has(nodeId));

          // Node can be executed if all inputs are executed and none have failed
          return allInputsExecuted && !hasFailedDependencies;
        });

        if (nodesToExecute.length === 0) {
          // If no nodes can be executed but we haven't processed all nodes,
          // it means we have a deadlock or all remaining nodes have failed dependencies
          const remainingNodes = version.flowConfig.nodes.filter(node => 
            !executedNodes.has(node.id) && !errorNodes.has(node.id)
          );
          
          if (remainingNodes.length > 0) {
            console.warn('Some nodes could not be executed due to failed dependencies:', 
              remainingNodes.map(n => n.id));
          }
          break;
        }

        // Execute independent nodes in parallel with error handling
        const executionResults = await Promise.allSettled(
          nodesToExecute.map(async node => {
            try {
              await this.handleNodeExecution(node, context, version.flowConfig.connections, nodeResults, executedNodes, version);
              return { nodeId: node.id, success: true };
            } catch (error) {
              console.error(`Error executing node ${node.id}:`, error);
              errorNodes.add(node.id);
              // Stop flow execution on node failure
              throw new Error(`Flow execution stopped due to failure in node ${node.id}: ${error.message}`);
            }
          })
        );

        // Process execution results and stop on any failure
        for (const result of executionResults) {
          if (result.status === 'rejected') {
            throw new Error(result.reason);
          }
        }
      }

      // Process any failed nodes
      if (errorNodes.size > 0) {
        console.warn('Some nodes failed during execution:', Array.from(errorNodes));
      }

      // Map flow variables to output columns
      return this.mapOutputs(version, context.flow);
    } catch (error) {
      throw new Error(`Failed to execute flow version: ${error.message}`);
    }
  }

  private findNode(nodeId: string, version: RuleVersion): RuleVersion['flowConfig']['nodes'][0] | undefined {
    if (!version.flowConfig?.nodes) {
      console.error('Flow configuration or nodes not found');
      return undefined;
    }
    return version.flowConfig.nodes.find(n => n.id === nodeId);
  }

  private async handleNodeExecution(
    node: RuleVersion['flowConfig']['nodes'][0],
    context: { flow: Record<string, any> },
    connections: RuleVersion['flowConfig']['connections'],
    nodeResults: Record<string, any>,
    executedNodes: Set<string>,
    version: RuleVersion
  ): Promise<void> {
    try {
      const nodeInputs = this.prepareNodeInputs(node, context, connections, nodeResults);
      const nodeResult = await this.executeNode(node, nodeInputs);
      nodeResults[node.id] = nodeResult;
      this.updateContext(context, node, nodeResult, connections);
      executedNodes.add(node.id);

      // Handle parallel paths from this node
      await this.executeParallelPaths(node, context, connections, nodeResults, executedNodes, version);
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      // Continue with other paths despite error
    }
  }

  private validateInputs(version: RuleVersion, inputs: Record<string, any>) {
    if (!version.inputColumns) {
      throw new Error('No input columns defined for this version');
    }

    for (const [key, input] of Object.entries(version.inputColumns)) {
      if (!(key in inputs)) {
        throw new Error(`Missing required input: ${key}`);
      }

      if (typeof inputs[key] !== input.type) {
        throw new Error(`Invalid type for input ${key}: expected ${input.type}, got ${typeof inputs[key]}`);
      }
    }
  }

  private initializeFlowVariables(version: RuleVersion): Record<string, any> {
    const variables: Record<string, any> = {};
    if (version.variables) {
      for (const [key, variable] of Object.entries(version.variables)) {
        variables[key] = variable.default;
      }
    }
    return variables;
  }

  private getInputNodes(nodeId: string, connections: RuleVersion['flowConfig']['connections']): string[] {
    const inputNodes = new Set<string>();
    for (const connection of connections) {
      if (Array.isArray(connection.to)) {
        for (const target of connection.to) {
          if (target.node === nodeId) {
            if (Array.isArray(connection.from)) {
              connection.from.forEach(source => inputNodes.add(source.node));
            } else {
              inputNodes.add(connection.from.node);
            }
          }
        }
      } else if (connection.to.node === nodeId) {
        if (Array.isArray(connection.from)) {
          connection.from.forEach(source => inputNodes.add(source.node));
        } else {
          inputNodes.add(connection.from.node);
        }
      }
    }
    return Array.from(inputNodes);
  }

  private areInputNodesExecuted(inputNodes: string[], executedNodes: Set<string>): boolean {
    return inputNodes.every(nodeId => executedNodes.has(nodeId));
  }

  private prepareNodeInputs(
    node: RuleVersion['flowConfig']['nodes'][0],
    context: { flow: Record<string, any> },
    connections: RuleVersion['flowConfig']['connections'],
    nodeResults: Record<string, any>
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    // Map inputs from flow variables using input_mapping
    for (const [targetKey, sourcePath] of Object.entries(node.config.input_mapping)) {
      const value = this.resolveValue(sourcePath, context.flow);
      inputs[targetKey] = value;
    }

    return inputs;
  }

  private async executeNode(
    node: RuleVersion['flowConfig']['nodes'][0],
    inputs: Record<string, any>
  ): Promise<Record<string, any>> {
    switch (node.type) {
      case 'excel':
        if (node.config.mode === 'reference' && node.config.version_id) {
          // Execute referenced Excel version
          const referencedVersion = await this.getReferencedVersion(node.config.version_id);
          if (!referencedVersion || !referencedVersion.filePath) {
            throw new Error('Referenced Excel version not found or invalid');
          }
          return this.excelService.executeRules(referencedVersion.filePath, inputs);
        } else if (node.config.excel_file) {
          return this.excelService.executeRules(node.config.excel_file, inputs);
        }
        throw new Error('Invalid Excel node configuration');

      case 'code':
        if (node.config.mode === 'reference' && node.config.version_id) {
          // Execute referenced Code version
          const referencedVersion = await this.getReferencedVersion(node.config.version_id);
          if (!referencedVersion) {
            throw new Error('Referenced Code version not found');
          }
          return this.codeService.executeRules(referencedVersion, inputs);
        } else if (node.config.code) {
          const codeVersion = {
            inputColumns: {},
            outputColumns: {},
            code: node.config.code
          };
          return this.codeService.executeRules(codeVersion, inputs);
        }
        throw new Error('Invalid Code node configuration');

      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  private updateContext(
    context: { flow: Record<string, any> },
    node: RuleVersion['flowConfig']['nodes'][0],
    nodeResult: Record<string, any>,
    connections: RuleVersion['flowConfig']['connections']
  ) {
    // Update flow variables based on output_mapping
    for (const [sourcePath, targetPath] of Object.entries(node.config.output_mapping)) {
      context['flow'] = {
        ...context['flow'],
        ...nodeResult,
        [node.id]: nodeResult
      };
      const value = this.resolveValue(sourcePath, context.flow);
      this.setValueByPath(context.flow, targetPath, value);
    }

    // Process connections with transforms
    for (const connection of connections) {
      if (connection.transform) {
        // Handle transform logic
        // This would require implementing a safe way to evaluate transform expressions
      }
    }
  }

  private resolveValue(path: string, context: Record<string, any>): any {
    const parts = path.replace('$.flow.', '')?.replace('$.', '').split('.');
    let value = context;
    for (const part of parts) {
      value = value[part];
      if (value === undefined) break;
    }
    return value;
  }

  private setValueByPath(obj: Record<string, any>, path: string, value: any) {
    const parts = path.replace('$.flow.', '').split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  private mapOutputs(version: RuleVersion, flowVariables: Record<string, any>): Record<string, any> {
    const outputs: Record<string, any> = {};
    if (version.outputColumns) {
      for (const [key, output] of Object.entries(version.outputColumns)) {
        const value = this.resolveValue(`$.flow.${key}`, flowVariables );
        outputs[key] = value;
      }
    }
    return outputs;
  }
}