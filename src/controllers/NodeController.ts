import { Request, Response } from 'express';
import { BaseController } from './BaseController';

interface NodeConfig {
  type: string;
  label: string;
  description?: string;
  category: string;
  icon?: string;
  color?: string;
  inputs: {
    [key: string]: {
      type: string;
      label: string;
      description?: string;
      required: boolean;
      default?: any;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
      };
    };
  };
  outputs: {
    [key: string]: {
      type: string;
      label: string;
      description?: string;
    };
  };
  configForm: {
    mode?: {
      type: 'select';
      label: string;
      options: Array<{ label: string; value: string }>;
      default: string;
    };
    fields?: Array<{
      key: string;
      type: string;
      label: string;
      required: boolean;
      mode?: string;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
      };
      metadata?: {
        description?: string;
        placeholder?: string;
        defaultValue?: any;
        accept?:any,
        language?:string,
      };
    }>
  };
}

const nodeConfigs: Record<string, NodeConfig> = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Initial node of the flow',
    category: 'Core',
    color: '#4CAF50',
    inputs: {},
    outputs: {
      data: {
        type: 'object',
        label: 'Output Data',
        description: 'Data to pass to next nodes'
      }
    },
    configForm: {
      mode: {
        type: 'select',
        label: 'Mode',
        options: [{ label: 'Inline', value: 'inline' }],
        default: 'inline'
      },
      fields: []
    }
  },
  excel: {
    type: 'excel',
    label: 'Excel',
    description: 'Execute Excel-based rules',
    category: 'Processing',
    color: '#2196F3',
    inputs: {
      data: {
        type: 'object',
        label: 'Input Data',
        description: 'Data to process',
        required: true
      }
    },
    outputs: {
      result: {
        type: 'object',
        label: 'Result',
        description: 'Processed data'
      }
    },
    configForm: {
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { label: 'Reference', value: 'reference' },
          { label: 'Inline', value: 'inline' }
        ],
        default: 'reference'
      },
      fields: [
        {
          key: 'version_id',
          type: 'select',
          label: 'Excel Version',
          required: true,
          mode: 'reference',
          metadata: {
            description: 'Select an existing Excel version to execute'
          }
        },
        {
          key: 'excel_file',
          type: 'file',
          label: 'Excel File',
          required: true,
          mode: 'inline',
          metadata: {
            description: 'Upload an Excel file with rules to execute',
            accept: '.xlsx,.xls'
          }
        }
      ]
    }
  },
  code: {
    type: 'code',
    label: 'Code',
    description: 'Execute custom code',
    category: 'Processing',
    color: '#FF9800',
    inputs: {
      data: {
        type: 'object',
        label: 'Input Data',
        description: 'Data to process',
        required: true
      }
    },
    outputs: {
      result: {
        type: 'object',
        label: 'Result',
        description: 'Processed data'
      }
    },
    configForm: {
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { label: 'Reference', value: 'reference' },
          { label: 'Inline', value: 'inline' }
        ],
        default: 'reference'
      },
      fields: [
        {
          key: 'version_id',
          type: 'select',
          label: 'Code Version',
          required: true,
          mode: 'reference',
          metadata: {
            description: 'Select an existing code version to execute'
          }
        },
        {
          key: 'code',
          type: 'code',
          label: 'Code',
          required: true,
          mode: 'inline',
          metadata: {
            description: 'Write custom code to execute',
            language: 'javascript',
            placeholder: '// Write your code here'
          }
        }
      ]
    }
  }
};

export class NodeController extends BaseController {
  constructor() {
    super();
  }
  public async getNodes(req: Request, res: Response) {
    try {
      const nodes = Object.values(nodeConfigs);
      return res.json(nodes);
    } catch (error) {
      console.error('Error fetching nodes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getNodeConfig(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const config = nodeConfigs[type];

      if (!config) {
        return res.status(404).json({ error: `Node type '${type}' not found` });
      }

      return res.json(config);
    } catch (error) {
      console.error('Error fetching node config:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}