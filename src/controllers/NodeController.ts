import { Request, Response } from 'express';

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
    mode: {
      type: 'select';
      label: string;
      options: Array<{ label: string; value: string }>;
      default: string;
    };
    fields: {
      reference: Array<{
        key: string;
        type: string;
        label: string;
        required: boolean;
      }>;
      inline: Array<{
        key: string;
        type: string;
        label: string;
        required: boolean;
      }>;
    };
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
      fields: {
        reference: [],
        inline: []
      }
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
      fields: {
        reference: [
          {
            key: 'version_id',
            type: 'select',
            label: 'Excel Version',
            required: true
          }
        ],
        inline: [
          {
            key: 'excel_file',
            type: 'file',
            label: 'Excel File',
            required: true
          }
        ]
      }
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
      fields: {
        reference: [
          {
            key: 'version_id',
            type: 'select',
            label: 'Code Version',
            required: true
          }
        ],
        inline: [
          {
            key: 'code',
            type: 'code',
            label: 'Code',
            required: true
          }
        ]
      }
    }
  }
};

export class NodeController {
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