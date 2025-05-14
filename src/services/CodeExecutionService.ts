import { RuleVersion } from '../models/RuleVersion';

export class CodeExecutionService {
  async executeCode(version: RuleVersion | { inputColumns?: Record<string, any>; outputColumns?: Record<string, any>; code?: string }, inputs: Record<string, any>): Promise<Record<string, any>> {
    try {
      // Validate inputs against version's inputColumns
      this.validateInputs(version, inputs);

      // Create a safe execution context with only the required inputs
      const context = { ...inputs };

      // Execute the code logic in a controlled environment
      const results: Record<string, any> = {};
      
      // Handle both inline code and output columns
      if ('code' in version && version.code) {
        // For inline code execution
        const calculateOutput = new Function(...Object.keys(inputs), version.code);
        return { result: calculateOutput(...Object.values(inputs)) };
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