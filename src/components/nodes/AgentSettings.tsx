import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { X, ChevronDown } from 'lucide-react';

// Mock AI connections - in a real app, this would come from your store or API
const mockAIConnections = [
  {
    id: '1',
    name: 'OpenAI GPT-4',
    provider: 'OpenAI',
    model: 'gpt-4',
    status: 'active',
  },
  {
    id: '2',
    name: 'Claude 3',
    provider: 'Anthropic',
    model: 'claude-3-opus',
    status: 'active',
  },
  {
    id: '3',
    name: 'Gemini Pro',
    provider: 'Google',
    model: 'gemini-pro',
    status: 'active',
  }
];

interface AgentSettingsProps {
  nodeId: string;
}

const AgentSettings: React.FC<AgentSettingsProps> = ({ nodeId }) => {
  const { nodes, updateNodeData } = useFlowStore();
  const node = nodes.find(n => n.id === nodeId);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get all system prompt nodes
  const systemPromptNodes = nodes.filter(n => n.type === 'systemPromptNode');
  
  // Get all prompt nodes
  const promptNodes = nodes.filter(n => n.type === 'promptNode');
  
  // Get all groups nodes and extract memory and tools groups
  const groupsNode = nodes.find(n => n.type === 'groupsNode');
  const memoryGroups = groupsNode?.data.config?.groups?.filter(g => g.type === 'memory') || [];
  const toolsGroups = groupsNode?.data.config?.groups?.filter(g => g.type === 'tools') || [];

  // Get selected tools from node config
  const selectedTools = node?.data.config?.selectedTools || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelChange = (value: string) => {
    updateNodeData(nodeId, {
      ...node?.data,
      config: {
        ...node?.data.config,
        model: value
      }
    });
  };

  const handleSystemPromptChange = (value: string) => {
    updateNodeData(nodeId, {
      ...node?.data,
      config: {
        ...node?.data.config,
        systemPromptNode: value
      }
    });
  };

  const handleUserPromptChange = (value: string) => {
    updateNodeData(nodeId, {
      ...node?.data,
      config: {
        ...node?.data.config,
        userPromptNode: value
      }
    });
  };

  const handleChatHistoryChange = (value: string) => {
    updateNodeData(nodeId, {
      ...node?.data,
      config: {
        ...node?.data.config,
        chatHistoryNode: value
      }
    });
  };

  const toggleTool = (toolId: string) => {
    const newSelectedTools = selectedTools.includes(toolId)
      ? selectedTools.filter(id => id !== toolId)
      : [...selectedTools, toolId];

    updateNodeData(nodeId, {
      ...node?.data,
      config: {
        ...node?.data.config,
        selectedTools: newSelectedTools
      }
    });
  };

  const removeTool = (event: React.MouseEvent, toolId: string) => {
    event.stopPropagation();
    const newSelectedTools = selectedTools.filter(id => id !== toolId);
    updateNodeData(nodeId, {
      ...node?.data,
      config: {
        ...node?.data.config,
        selectedTools: newSelectedTools
      }
    });
  };

  // Filter active AI connections
  const activeConnections = mockAIConnections.filter(conn => conn.status === 'active');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Agent Settings</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Model
          </label>
          <select
            value={node?.data.config?.model || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select a model</option>
            {activeConnections.map((conn) => (
              <option key={conn.id} value={conn.model}>
                {conn.name} ({conn.model})
              </option>
            ))}
          </select>
          {activeConnections.length === 0 && (
            <p className="text-xs text-amber-500">
              No AI models configured. Please add models in the AI Model Keys section.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            System Prompt
          </label>
          <select
            value={node?.data.config?.systemPromptNode || ''}
            onChange={(e) => handleSystemPromptChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select system prompt node</option>
            {systemPromptNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.data.label}
              </option>
            ))}
          </select>
          {systemPromptNodes.length === 0 && (
            <p className="text-xs text-amber-500">
              No system prompt nodes found in the workflow
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            User Prompt
          </label>
          <select
            value={node?.data.config?.userPromptNode || ''}
            onChange={(e) => handleUserPromptChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select user prompt node</option>
            {promptNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.data.label}
              </option>
            ))}
          </select>
          {promptNodes.length === 0 && (
            <p className="text-xs text-amber-500">
              No prompt nodes found in the workflow
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Memory Group
          </label>
          <select
            value={node?.data.config?.chatHistoryNode || ''}
            onChange={(e) => handleChatHistoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select memory group</option>
            {memoryGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {memoryGroups.length === 0 && (
            <p className="text-xs text-amber-500">
              No memory groups found. Add memory groups in the Groups node.
            </p>
          )}
        </div>

        <div className="space-y-2" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-600">
            Tools
          </label>
          <div
            className="bg-white border border-gray-300 rounded-md p-2 min-h-[42px] flex flex-wrap items-center cursor-pointer"
            onClick={() => setIsToolsOpen(!isToolsOpen)}
          >
            {selectedTools.length > 0 ? (
              toolsGroups
                .filter(tool => selectedTools.includes(tool.id))
                .map((tool) => (
                  <span
                    key={tool.id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm mr-2 mb-1 flex items-center"
                  >
                    {tool.name}
                    <button
                      onClick={(e) => removeTool(e, tool.id)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))
            ) : (
              <span className="text-gray-500 text-sm">Select tools</span>
            )}
            <div className="ml-auto">
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
          {isToolsOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {toolsGroups.length > 0 ? (
                toolsGroups.map((tool) => (
                  <div
                    key={tool.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      selectedTools.includes(tool.id) ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTools.includes(tool.id)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <div>
                        <div className="font-medium text-sm">{tool.name}</div>
                        {tool.description && (
                          <div className="text-xs text-gray-500">{tool.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No tools available. Add tools in the Groups node.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Output Format</h4>
        <pre className="text-xs text-blue-600 bg-white p-3 rounded border border-blue-100">
{`{
  "response": "Agent's response",
  "model": "gpt-4",
  "tokens": {
    "prompt": 123,
    "completion": 456,
    "total": 579
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default AgentSettings;