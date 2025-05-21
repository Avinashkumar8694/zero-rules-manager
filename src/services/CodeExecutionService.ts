import { RuleVersion } from '../models/RuleVersion';

export class CodeExecutionService {
  async executeRules(version: RuleVersion | { inputColumns?: Record<string, any>; outputColumns?: Record<string, any>; code?: string }, inputs: Record<string, any>): Promise<Record<string, any>> {
    try {
      // Validate inputs against version's inputColumns
      this.validateInputs(version, inputs);

      // Create a safe execution context with flow variables
      const flowContext = { ...inputs };
      if ('variables' in version && version.variables) {
        for (const [key, variable] of Object.entries(version.variables)) {
          flowContext[key] = variable.default;
        }
      }

      // Create proxy for flow variable access
      const flowProxy = new Proxy(flowContext, {
        get: (target, prop) => {
          if (typeof prop === 'string') {
            return target[prop as keyof typeof target];
          }
          return undefined;
        },
        set: (target, prop, value) => {
          if (typeof prop === 'string') {
            target[prop as keyof typeof target] = value;
            return true;
          }
          return false;
        }
      });

      const context = { $: { flow: flowProxy } };
      const results: Record<string, any> = {};
      
      // Handle both inline code and output columns
      if ('code' in version && version.code) {
        // For inline code execution
        const calculateOutput = new Function('$', version.code);
        const result = calculateOutput(context.$);
        
        // Extract flow variables if specified in outputColumns
        if (version.outputColumns) {
          for (const [key, output] of Object.entries(version.outputColumns)) {
              results[key] = flowContext[key];
          }
        }
        
        return { ...results };
      } else if (version.outputColumns) {
        // For output columns with code
        for (const [key, output] of Object.entries(version.outputColumns)) {
          if ('code' in output && output.code) {
            const calculateOutput = new Function(...Object.keys(inputs), output.code);
            results[key] = calculateOutput(...Object.values(inputs));
          }
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to execute code-based rules: ${error.message}`);
    }
  }

  private validateInputs(version: RuleVersion | { inputColumns?: Record<string, any>; outputColumns?: Record<string, any>; code?: string }, inputs: Record<string, any>) {
    if (!version.inputColumns) {
      throw new Error('No input columns defined for this version');
    }

    // Check if all required inputs are provided
    for (const [key, input] of Object.entries(version.inputColumns)) {
      if (!(key in inputs)) {
        throw new Error(`Missing required input: ${key}`);
      }

      // Type validation could be added here
      if (typeof inputs[key] !== input.type) {
        throw new Error(`Invalid type for input ${key}: expected ${input.type}, got ${typeof inputs[key]}`);
      }
    }
  }
}