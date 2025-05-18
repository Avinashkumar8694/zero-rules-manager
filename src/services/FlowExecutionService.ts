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
          const nodeResult = await this.executeNode(node, nodeInputs);

          nodeResults[node.id] = nodeResult;
          this.updateContext(context, node, nodeResult, version.flowConfig.connections);

          executedNodes.add(node.id);
        });

        await Promise.all(executionPromises);
      }

      return this.mapOutputs(version, context.flow);
    } catch (error) {
      throw new Error(`Failed to execute flow version: ${error.message}`);
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
    for (const [sourcePath, targetPath] of Object.entries(node.config.output_mapping)) {
      context['flow'] = {
        ...context['flow'],
        ...nodeResult,
        [node.id]: nodeResult
      };
      const value = this.resolveValue(sourcePath, context.flow);
      this.setValueByPath(context.flow, targetPath, value);
    }

    for (const connection of connections) {
      if (connection.transform) {
        this.handleTransform(connection, context);
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

  private evaluateCondition(condition: string, context: { flow: Record<string, any> }): boolean {
    try {
      const conditionFunction = new Function('context', `with (context) { return ${condition}; }`);
      return conditionFunction(context.flow);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private synchronizeResults(context: { flow: Record<string, any> }, nodeResults: Record<string, any>) {
    for (const [nodeId, result] of Object.entries(nodeResults)) {
      for (const [key, value] of Object.entries(result)) {
        this.setValueByPath(context.flow, `$.flow.${key}`, value);
      }
    }
  }

  private handleTransform(connection: RuleVersion['flowConfig']['connections'][0], context: { flow: Record<string, any> }) {
    try {
      const transformFunction = new Function('context', `with (context) { return ${connection.transform}; }`);
      const transformedValue = transformFunction(context.flow);
      this.setValueByPath(context.flow, connection.to.input, transformedValue);
    } catch (error) {
      console.error('Error handling transform:', error);
    }
  }
}
