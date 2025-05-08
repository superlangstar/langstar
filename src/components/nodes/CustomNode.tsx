import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ChevronRight, X, Play, Loader, Edit2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useFlowStore } from '../../store/flowStore';

export const CustomNode = memo(({ data, isConnectable, selected, id, type }: NodeProps) => {
  const { removeNode, executeNode, updateNodeData, nodes, edges } = useFlowStore();
  const isExecuting = data.isExecuting || false;
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState(data.label);
  const isStartNode = type === 'startNode';
  const isEndNode = type === 'endNode';
  const isConditionNode = type === 'conditionNode';
  const isGroupsNode = type === 'groupsNode';

  const groups = data.config?.groups || [];
  const memoryGroups = groups.filter(g => g.type === 'memory');
  const toolsGroups = groups.filter(g => g.type === 'tools');

  // Get validation status for condition node
  const hasValidationError = React.useMemo(() => {
    if (!isConditionNode) return false;

    const startNode = nodes.find(node => node.type === 'startNode');
    const className = startNode?.data.config?.className || '';
    const nodeEdges = edges.filter(edge => edge.source === id);

    return nodeEdges.some(edge => {
      const condition = edge.data?.label || '';
      const conditionRegex = new RegExp(`^${className}\\['[\\w_]+'\\]`);
      return !conditionRegex.test(condition);
    });
  }, [isConditionNode, id, nodes, edges]);

  const getNodeStyle = () => {
    const baseStyle = {
      'agentNode': 'bg-blue-50 border-blue-200',
      'conditionNode': 'bg-yellow-50 border-yellow-200',
      'functionNode': 'bg-purple-50 border-purple-200',
      'toolNode': 'bg-green-50 border-green-200',
      'startNode': 'bg-gray-50 border-gray-200',
      'endNode': 'bg-red-50 border-red-200',
      'groupsNode': 'bg-white border-gray-200',
    }[data.nodeType] || 'bg-white border-gray-200';

    if (isConditionNode && hasValidationError) {
      return 'bg-red-50 border-red-300';
    }

    return baseStyle;
  };

  const getIconStyle = () => {
    const baseStyle = {
      'agentNode': 'text-blue-600 bg-blue-100',
      'conditionNode': 'text-yellow-600 bg-yellow-100',
      'functionNode': 'text-purple-600 bg-purple-100',
      'toolNode': 'text-green-600 bg-green-100',
      'startNode': 'text-gray-600 bg-gray-100',
      'endNode': 'text-red-600 bg-red-100',
      'groupsNode': 'text-gray-600 bg-gray-100',
    }[data.nodeType] || 'text-gray-600 bg-gray-100';

    if (isConditionNode && hasValidationError) {
      return 'text-red-600 bg-red-100';
    }

    return baseStyle;
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this node?')) {
      removeNode(id);
    }
  };

  const handleExecute = async (event: React.MouseEvent) => {
    console.log("asdasdasdasdasd")
    event.stopPropagation();
    if (!isExecuting) {
      await executeNode(id);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(event.target.value);
  };

  const handleNameSubmit = () => {
    const trimmedName = nodeName.trim();
    if (trimmedName && trimmedName !== data.label) {
      updateNodeData(id, { ...data, label: trimmedName });
    } else {
      setNodeName(data.label);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleNameSubmit();
    } else if (event.key === 'Escape') {
      setNodeName(data.label);
      setIsEditing(false);
    }
  };

  const checkNameExists = (name: string, type: 'memory' | 'tools'): boolean => {
    const existingGroups = groups.filter(g => g.type === type);
    return existingGroups.some(g => g.name.toLowerCase() === name.toLowerCase());
  };

  const handleAddGroup = (type: 'memory' | 'tools') => {
    const defaultName = `New ${type === 'memory' ? 'Memory' : 'Tools'} Group`;
    let newName = defaultName;
    let counter = 1;

    while (checkNameExists(newName, type)) {
      newName = `${defaultName} ${counter}`;
      counter++;
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      name: newName,
      description: '',
      nodes: [],
      type
    };

    updateNodeData(id, {
      ...data,
      config: {
        ...data.config,
        groups: [...groups, newGroup]
      }
    });
  };

  const handleDeleteGroup = (event: React.MouseEvent, groupId: string) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group?')) {
      updateNodeData(id, {
        ...data,
        config: {
          ...data.config,
          groups: groups.filter(g => g.id !== groupId)
        }
      });
    }
  };

  const renderGroups = (groups: any[], type: 'memory' | 'tools') => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-700">{type === 'memory' ? 'Memory' : 'Tools'}</span>
      </div>
      {groups.map((group) => (
        <div 
          key={group.id} 
          className="bg-gray-50 rounded p-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors relative group"
          onClick={() => updateNodeData(id, { ...data, selectedGroupId: group.id })}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{group.name}</span>
            <div className="flex items-center">
              <button
                onClick={(e) => handleDeleteGroup(e, group.id)}
                className="opacity-0 group-hover:opacity-100 mr-2 p-1 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight size={14} className="text-gray-400" />
            </div>
          </div>
          {group.description && (
            <p className="text-xs text-gray-500 mt-1">{group.description}</p>
          )}
        </div>
      ))}
      <button
        onClick={() => handleAddGroup(type)}
        className="w-full flex items-center justify-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
      >
        <Plus size={14} className="mr-1" />
        Add {type === 'memory' ? 'Memory' : 'Tools'} Group
      </button>
    </div>
  );

  return (
    <div
      className={`${getNodeStyle()} border-2 rounded-md p-4 w-64 shadow-sm transition-shadow relative ${
        selected ? 'shadow-md ring-2 ring-blue-300' : ''
      }`}
    >
      {!isStartNode && !isGroupsNode && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-gray-400"
        />
      )}
      
      <div className="absolute -top-2 -right-2 flex gap-2">
        {!isGroupsNode && (
          <button
            onClick={handleExecute}
            disabled={isExecuting || (isConditionNode && hasValidationError)}
            className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasValidationError ? "Fix validation errors before executing" : "Execute Node"}
          >
            {isExecuting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 rounded-md ${getIconStyle()} mr-2 flex items-center justify-center`}>
          {data.icon}
        </div>
        <div className="flex-1 flex items-center">
          {isEditing ? (
            <input
              type="text"
              value={nodeName}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="font-medium text-gray-800 truncate">{data.label}</div>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Rename Node"
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-500 mb-2">{data.description}</div>
      )}

      {isGroupsNode && (
        <div className="mt-4 space-y-4">
          {renderGroups(memoryGroups, 'memory')}
          {renderGroups(toolsGroups, 'tools')}
        </div>
      )}

      {isConditionNode && hasValidationError && (
        <div className="mt-2 text-xs text-red-500 flex items-center bg-red-50 p-2 rounded">
          <AlertCircle size={12} className="mr-1" />
          Invalid condition format
        </div>
      )}
      
      {data.code && (
        <div className="mt-2 text-xs bg-gray-100 p-2 rounded max-h-20 overflow-y-auto font-mono">
          {data.code.split('\n').slice(0, 3).join('\n')}
          {data.code.split('\n').length > 3 && '...'}
        </div>
      )}
      
      {!isEndNode && !isGroupsNode && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-gray-400"
        />
      )}
    </div>
  );
});

export default CustomNode;