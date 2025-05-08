import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { nanoid } from 'nanoid';

export interface NodeData {
  label: string;
  code?: string;
  description?: string;
  icon?: React.ReactNode;
  config?: {
    className?: string;
    classType?: 'TypedDict' | 'BaseModel';
    variables?: Array<{
      name: string;
      type: string;
      defaultValue: string;
      selectVariable: string;
    }>;
    repetitions?: number;
    template?: string;
    model?: string;
    inputColumn?: string;
    outputColumn?: string;
    [key: string]: any;
  };
  output?: any;
  isExecuting?: boolean;
}

export interface FlowState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  projectName: string;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setProjectName: (name: string) => void;
  addNode: (nodeData: { type: string; position: { x: number; y: number }; data: NodeData }) => void;
  updateNodeData: (nodeId: string, data: NodeData) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  getNodeById: (nodeId: string) => Node<NodeData> | undefined;
  setNodeOutput: (nodeId: string, output: any) => void;
  setEdgeOutput: (edgeId: string, output: any) => void;
  executeNode: (nodeId: string) => Promise<void>;
  setNodeExecuting: (nodeId: string, isExecuting: boolean) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: 'start',
    type: 'startNode',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Start',
      description: 'Starting point of the workflow',
      output: null,
      isExecuting: false,
      config: {
        className: '',
        classType: 'TypedDict',
        variables: []
      }
    },
  }
];

const initialEdges: Edge[] = [];

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (key === 'icon' || typeof value === 'function') {
      return undefined;
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
};

const safeCompare = (obj1: any, obj2: any): boolean => {
  try {
    return JSON.stringify(obj1, getCircularReplacer()) === JSON.stringify(obj2, getCircularReplacer());
  } catch (error) {
    console.error('Error comparing objects:', error);
    return false;
  }
};

const validateStartNode = (node: Node<NodeData>): string | null => {
  if (!node.data.config?.className?.trim()) {
    return 'Class Name is required';
  }

  const variables = node.data.config?.variables || [];
  for (let i = 0; i < variables.length; i++) {
    if (!variables[i].name.trim()) {
      return `Variable Name is required for variable ${i + 1}`;
    }
  }

  return null;
};

const getUniqueNodeName = (nodes: Node<NodeData>[], baseLabel: string): string => {
  const existingNames = nodes.map(node => node.data.label);
  let newName = baseLabel;
  let counter = 1;

  while (existingNames.includes(newName)) {
    newName = `${baseLabel} ${counter}`;
    counter++;
  }

  return newName;
};

interface TransformedStartNodeVariable {
  variableName: string;
  variableType: string;
  defaultValue: any; // 처리된 기본값
  selectVariable: string;
}

interface TransformedStartNodeOutput {
  className: string;
  classType: 'TypedDict' | 'BaseModel';
  variables: TransformedStartNodeVariable[];
}

const generateStartNodeOutput = (node: Node<NodeData>): TransformedStartNodeOutput => {
  const config = node.data.config || {};
  const inputVariables = config.variables || [];

  const processedVariables: TransformedStartNodeVariable[] = inputVariables.map(variable => {
    let processedDefaultValue = variable.defaultValue;

    switch (variable.type) {
      case 'int':
        processedDefaultValue = parseInt(variable.defaultValue, 10) || 0;
        break;
      case 'float':
        processedDefaultValue = parseFloat(variable.defaultValue) || 0.0;
        break;
      case 'list':
        try {
          processedDefaultValue = JSON.parse(variable.defaultValue || '[]');
        } catch {
          processedDefaultValue = [];
        }
        break;
      case 'dict':
        try {
          processedDefaultValue = JSON.parse(variable.defaultValue || '{}');
        } catch {
          processedDefaultValue = {};
        }
        break;
      default:
        processedDefaultValue = variable.defaultValue || '';
    }
    return {
      variableName: variable.name,
      variableType: variable.type,
      defaultValue: processedDefaultValue,
      selectVariable: variable.selectVariable,
    };
  });

  return {
    className: config.className || '',
    classType: config.classType || 'TypedDict',
    variables: processedVariables,
  };
};

const processPromptTemplate = (template: string, input: Record<string, any>, outputVariable: string): Record<string, any> => {
  const output = { ...input };
  let processedTemplate = template || '';
  
  processedTemplate = processedTemplate.replace(/\{([^}]+)\}/g, (match, key) => {
    return input[key] !== undefined ? String(input[key]) : match;
  });

  if (outputVariable) {
    output[outputVariable] = processedTemplate;
  }

  return output;
};

const evaluateCondition = (condition: string, input: Record<string, any>, className: string): boolean => {
  try {
    const context = { [className]: input };
    const evalFunction = new Function(className, `return ${condition};`);
    return evalFunction.call(null, input);
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
};

const generateEmbedding = (input: Record<string, any>, config: NodeData['config']): Record<string, any> => {
  if (!config?.inputColumn || !config?.outputColumn) {
    throw new Error('Input and output columns must be specified');
  }

  const result = { ...input };
  result[config.outputColumn] = [1, 2, 3, 4];
  return result;
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  projectName: 'New Workflow',
  
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection: Connection) => {
    const sourceNode = get().nodes.find(node => node.id === connection.source);
    const isConditionNode = sourceNode?.type === 'conditionNode';
    const startNode = get().nodes.find(node => node.type === 'startNode');
    const className = startNode?.data.config?.className || 'data';
    
    set({
      edges: addEdge({ 
        ...connection, 
        animated: true,
        data: { 
          output: null,
          label: isConditionNode ? `${className}['value'] > 0` : undefined
        }
      }, get().edges),
    });
  },
  
  setProjectName: (name: string) => set({ projectName: name }),
  
  addNode: ({ type, position, data }) => {
    const id = nanoid();
    const uniqueLabel = getUniqueNodeName(get().nodes, data.label);
    const defaultConfig = type === 'startNode' ? {
      className: '',
      classType: 'TypedDict',
      variables: []
    } : type === 'loopNode' ? {
      repetitions: 1
    } : type === 'promptNode' ? {
      template: '# Enter your prompt template here\n\nSystem: You are a helpful AI assistant.\n\nUser: {user_input}\n\nAssistant:'
    } : {};

    const newNode: Node<NodeData> = {
      id,
      type,
      position,
      data: {
        ...data,
        label: uniqueLabel,
        output: null,
        isExecuting: false,
        config: defaultConfig
      },
    };
    
    set({
      nodes: [...get().nodes, newNode],
    });
    
    return id;
  },
  
  updateNodeData: (nodeId: string, data: NodeData) => {
    const currentNode = get().nodes.find(node => node.id === nodeId);
    if (!currentNode) return;

    if (safeCompare(currentNode.data, data)) return;

    set(state => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, data };
        }
        return node;
      });

      if (!safeCompare(currentNode.data.output, data.output)) {
        const updatedEdges = state.edges.map(edge => {
          if (edge.source === nodeId) {
            return {
              ...edge,
              data: { ...edge.data, output: data.output }
            };
          }
          return edge;
        });
        return { nodes: updatedNodes, edges: updatedEdges };
      }

      return { nodes: updatedNodes };
    });
  },
  
  removeNode: (nodeId: string) => {
    set(state => {
      const connectedEdges = state.edges.filter(
        edge => edge.source === nodeId || edge.target === nodeId
      );

      const affectedNodeIds = new Set<string>();
      connectedEdges.forEach(edge => {
        if (edge.source === nodeId) {
          affectedNodeIds.add(edge.target);
        } else {
          affectedNodeIds.add(edge.source);
        }
      });

      const updatedNodes = state.nodes
        .filter(node => node.id !== nodeId)
        .map(node => {
          if (affectedNodeIds.has(node.id)) {
            return {
              ...node,
              data: { ...node.data, output: null }
            };
          }
          return node;
        });

      const updatedEdges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );

      return {
        nodes: updatedNodes,
        edges: updatedEdges
      };
    });
  },

  removeEdge: (edgeId: string) => {
    const edge = get().edges.find(e => e.id === edgeId);
    if (!edge) return;

    set(state => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === edge.source) {
          return {
            ...node,
            data: { ...node.data, output: null }
          };
        }
        return node;
      });

      return {
        nodes: updatedNodes,
        edges: state.edges.filter(e => e.id !== edgeId)
      };
    });
  },
  
  getNodeById: (nodeId: string) => {
    return get().nodes.find((node) => node.id === nodeId);
  },

  setNodeOutput: (nodeId: string, output: any) => {
    set(state => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, output }
          };
        }
        return node;
      });

      const updatedEdges = state.edges.map(edge => {
        if (edge.source === nodeId) {
          const sourceNode = state.nodes.find(n => n.id === nodeId);
          if (sourceNode?.type === 'conditionNode') {
            const condition = edge.data?.label || '';
            const startNode = state.nodes.find(node => node.type === 'startNode');
            const className = startNode?.data.config?.className || 'data';
            const isTrue = evaluateCondition(condition, output, className);
            return {
              ...edge,
              data: { ...edge.data, output: isTrue ? output : null }
            };
          }
          return {
            ...edge,
            data: { ...edge.data, output }
          };
        }
        return edge;
      });

      return { nodes: updatedNodes, edges: updatedEdges };
    });
  },

  setEdgeOutput: (edgeId: string, output: any) => {
    set(state => {
      const updatedEdges = state.edges.map(edge => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: { ...edge.data, output }
          };
        }
        return edge;
      });

      return { edges: updatedEdges };
    });
  },

  setNodeExecuting: (nodeId: string, isExecuting: boolean) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, isExecuting }
          };
        }
        return node;
      })
    });
  },

  updateEdgeLabel: (edgeId: string, label: string) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: { ...edge.data, label }
          };
        }
        return edge;
      })
    });
  },

  executeNode: async (nodeId: string) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;

    get().setNodeExecuting(nodeId, true);

    const incomingEdge = get().edges.find(edge => edge.target === nodeId);
    const input = incomingEdge?.data?.output || {};

    try {
      let output;
      switch (node.type) {
        case 'promptNode': {
          const template = node.data.config?.template || '';
          const outputVariable = node.data.config?.outputVariable || '';
          
          if (!outputVariable) {
            output = { error: 'Output variable name is required' };
            break;
          }
          console.log( template )
          console.log( input )
          console.log( outputVariable )
          output = processPromptTemplate(template, input, outputVariable);
          break;
        }
        case 'startNode':
          try {
            const payload = generateStartNodeOutput(node);
            console.log(payload)
            const response = await fetch('http://localhost:8000/workflow/node/startnode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }
            output = await response.json();
            console.log(output)
          } catch (apiError) {
            console.error('StartNode API call failed:', apiError);
            output = { error: 'Failed to connect to start node API', details: (apiError as Error).message };
          }
          break;
        case 'functionNode':
          output = { result: 'Function executed', input };
          break;
        case 'agentNode':
          output = { message: "Agent processed input", result: input };
          break;
        case 'embeddingNode': {
          if (!node.data.config?.model) {
            output = { error: 'Embedding model must be selected' };
            break;
          }
          if (!node.data.config?.inputColumn) {
            output = { error: 'Input column must be selected' };
            break;
          }
          if (!node.data.config?.outputColumn) {
            output = { error: 'Output column must be selected' };
            break;
          }
          output = generateEmbedding(input, node.data.config);
          break;
        }
        case 'conditionNode': {
          const edges = get().edges.filter(edge => edge.source === nodeId);
          output = input;
          
          const startNode = get().nodes.find(node => node.type === 'startNode');
          const className = startNode?.data.config?.className || 'data';
          
          edges.forEach(edge => {
            const condition = edge.data?.label || '';
            const isTrue = evaluateCondition(condition, input, className);
            if (isTrue) {
              get().setEdgeOutput(edge.id, input);
            } else {
              get().setEdgeOutput(edge.id, null);
            }
          });
          break;
        }
        case 'loopNode':
          output = { 
            message: `Loop will execute ${node.data.config?.repetitions || 1} times`,
            repetitions: node.data.config?.repetitions || 1,
            currentIteration: 0,
            input 
          };
          break;
        default:
          output = input;
      }

      get().setNodeOutput(nodeId, output);
    } catch (error) {
      console.error('Error executing node:', error);
      get().setNodeOutput(nodeId, { error: 'Execution failed' });
    } finally {
      get().setNodeExecuting(nodeId, false);
    }
  }
}));