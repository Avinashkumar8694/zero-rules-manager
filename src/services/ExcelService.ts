import * as xlsx from 'xlsx';

interface Parameter {
  name: string;
  type: string;
  value?: any;
  formula?: string;
}

export class ExcelService {
  async processExcelFile(filePath: string): Promise<{
    inputs: Parameter[];
    outputs: Parameter[];
  }> {
    try {
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const inputs: Parameter[] = [];
      const outputs: Parameter[] = [];

      // Process named ranges
      if (workbook.Workbook?.Names) {
        for (const name of workbook.Workbook.Names) {
          const nameStr = name.Name;
          const ref = name.Ref;
          
          // Get the cell reference from the name definition
          const cellAddress = ref.split('!')[1];
          const cell = worksheet[cellAddress];
          
          if (!cell) continue;
          
          // Process input parameters (IP_ prefix)
          if (nameStr.startsWith('IP_')) {
            const parameter: Parameter = {
              name: nameStr.substring(3), // Remove IP_ prefix
              type: typeof cell.v,
              value: cell.v
            };
            inputs.push(parameter);
          }
          // Process output parameters (OP_ prefix)
          else if (nameStr.startsWith('OP_')) {
            const parameter: Parameter = {
              name: nameStr.substring(3), // Remove OP_ prefix
              type: typeof cell.v,
              formula: cell.f
            };
            outputs.push(parameter);
          }
        }
      }

      // Also process cells with IP_ and OP_ prefixes for backward compatibility
      for (const cellAddress in worksheet) {
        if (cellAddress[0] === '!') continue; // Skip special keys

        const cell = worksheet[cellAddress];
        const cellValue = cell.v;
        const cellFormula = cell.f;

        if (typeof cellValue === 'string') {
          if (cellValue.startsWith('IP_') && !inputs.some(p => p.name === cellValue.substring(3))) {
            const parameter: Parameter = {
              name: cellValue.substring(3),
              type: typeof cell.v,
              value: cell.v
            };
            inputs.push(parameter);
          }
          else if (cellValue.startsWith('OP_') && !outputs.some(p => p.name === cellValue.substring(3))) {
            const parameter: Parameter = {
              name: cellValue.substring(3),
              type: typeof cell.v,
              formula: cellFormula
            };
            outputs.push(parameter);
          }
        }
      }

      // Also process traditional row-based format for backward compatibility
      const data = xlsx.utils.sheet_to_json(worksheet);
      data.forEach((row: any) => {
        if (row.Parameter_Name && row.Parameter_Type) {
          const parameter: Parameter = {
            name: row.Parameter_Name,
            type: row.Data_Type || typeof row.Value,
            value: row.Value,
            formula: row.Formula
          };

          if (row.Parameter_Type?.toLowerCase() === 'input') {
            inputs.push(parameter);
          } else if (row.Parameter_Type?.toLowerCase() === 'output') {
            outputs.push(parameter);
          }
        }
      });

      return { inputs, outputs };
    } catch (error) {
      throw new Error('Failed to process Excel file');
    }
  }

  async executeRules(filePath: string, inputValues: Record<string, any>): Promise<Record<string, any>> {
    try {
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Create a new worksheet for calculations
      const newWorksheet: any = {};

      // First, copy all cells to maintain structure and formulas
      for (const cellAddress in worksheet) {
        if (cellAddress[0] === '!') continue; // Skip special keys
        newWorksheet[cellAddress] = { ...worksheet[cellAddress] };
      }

      // Process named ranges first
      if (workbook.Workbook?.Names) {
        for (const name of workbook.Workbook.Names) {
          const nameStr = name.Name;
          const ref = name.Ref;
          const cellAddress = ref.split('!')[1];

          if (nameStr.startsWith('IP_')) {
            const paramName = nameStr.substring(3);
            if (cellAddress in newWorksheet) {
              newWorksheet[cellAddress] = {
                t: typeof inputValues[paramName] === 'number' ? 'n' : 's',
                v: inputValues[paramName] ?? worksheet[cellAddress].v
              };
            }
          }
        }
      }

      // Then process cells with IP_ and OP_ prefixes for backward compatibility
      for (const cellAddress in worksheet) {
        if (cellAddress[0] === '!') continue;

        const cell = worksheet[cellAddress];
        const cellValue = cell.v;

        if (typeof cellValue === 'string') {
          if (cellValue.startsWith('IP_')) {
            const paramName = cellValue.substring(3);
            newWorksheet[cellAddress] = {
              t: typeof inputValues[paramName] === 'number' ? 'n' : 's',
              v: inputValues[paramName] ?? cell.v
            };
          }
        }
      }

      // Process traditional row-based format for backward compatibility
      const data = xlsx.utils.sheet_to_json(worksheet);
      data.forEach((row: any) => {
        if (row.Parameter_Type?.toLowerCase() === 'input') {
          const value = inputValues[row.Parameter_Name] || row.Value;
          newWorksheet[`A${data.indexOf(row) + 2}`] = {
            t: typeof value === 'number' ? 'n' : 's',
            v: value
          };
        } else if (row.Parameter_Type?.toLowerCase() === 'output' && row.Formula) {
          newWorksheet[`A${data.indexOf(row) + 2}`] = {
            t: 'n',
            f: row.Formula
          };
        }
      });

      // Create a new workbook with the calculation sheet
      const newWorkbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');

      // Calculate formulas
      xlsx.utils.sheet_add_aoa(newWorksheet, [[]], { origin: 'A1' });
      
      // Extract output values
      const outputs: Record<string, any> = {};

      // First process named ranges for outputs
      if (workbook.Workbook?.Names) {
        for (const name of workbook.Workbook.Names) {
          const nameStr = name.Name;
          const ref = name.Ref;
          const cellAddress = ref.split('!')[1];

          if (nameStr.startsWith('OP_')) {
            const paramName = nameStr.substring(3);
            if (cellAddress in newWorksheet) {
              outputs[paramName] = newWorksheet[cellAddress].v;
            }
          }
        }
      }

      // Then process cells with OP_ prefix for backward compatibility
      for (const cellAddress in newWorksheet) {
        if (cellAddress[0] === '!') continue;

        const cell = newWorksheet[cellAddress];
        const cellValue = worksheet[cellAddress]?.v;

        if (typeof cellValue === 'string' && cellValue.startsWith('OP_')) {
          const paramName = cellValue.substring(3);
          if (!(paramName in outputs)) { // Only add if not already processed via named range
            outputs[paramName] = cell.v;
          }
        }
      }

      // Finally process traditional format outputs
      const outputData = xlsx.utils.sheet_to_json(worksheet);
      outputData.forEach((row: any) => {
        if (row.Parameter_Type?.toLowerCase() === 'output' && row.Parameter_Name) {
          if (!(row.Parameter_Name in outputs)) { // Only add if not already processed
            outputs[row.Parameter_Name] = newWorksheet[`A${outputData.indexOf(row) + 2}`]?.v;
          }
        }
      });

      return outputs;
    } catch (error) {
      throw new Error('Failed to execute rules');
    }
  }
}