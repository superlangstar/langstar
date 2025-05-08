import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/common/langstar_logo.png';
import { PlusCircle, Settings, ChevronRight, Database, Key, Trash2, ChevronLeft, ChevronDown } from 'lucide-react';

const mockWorkflows = [
  { id: '1', name: 'Customer Support Bot', lastModified: '2024-03-15', status: 'active' },
  { id: '2', name: 'Data Processing Pipeline', lastModified: '2024-03-14', status: 'draft' },
  { id: '3', name: 'Email Automation', lastModified: '2024-03-13', status: 'active' },
];

const mockRagConfigs = [
  {
    id: '1',
    name: 'Customer Support Knowledge Base',
    description: 'RAG system for handling customer inquiries',
    lastModified: '2024-03-15',
    status: 'active',
    vectorDb: 'Pinecone',
    embeddingModel: 'OpenAI Ada 002',
    host: 'https://example.pinecone.io',
    port: '443',
  },
  {
    id: '2',
    name: 'Technical Documentation Assistant',
    description: 'API documentation and technical guides',
    lastModified: '2024-03-14',
    status: 'draft',
    vectorDb: 'Weaviate',
    embeddingModel: 'Cohere Embed',
    host: 'https://example.weaviate.io',
    port: '443',
  }
];

const mockAIConnections = [
  {
    id: '1',
    name: 'OpenAI GPT-4',
    provider: 'OpenAI',
    model: 'gpt-4',
    lastModified: '2024-03-15',
    status: 'active',
    type: 'language'
  },
  {
    id: '2',
    name: 'Claude 3',
    provider: 'Anthropic',
    model: 'claude-3-opus',
    lastModified: '2024-03-14',
    status: 'active',
    type: 'language'
  },
  {
    id: '3',
    name: 'Gemini Pro',
    provider: 'Google',
    model: 'gemini-pro',
    lastModified: '2024-03-13',
    status: 'draft',
    type: 'language'
  },
  {
    id: '4',
    name: 'OpenAI Ada 002',
    provider: 'OpenAI',
    model: 'text-embedding-ada-002',
    lastModified: '2024-03-15',
    status: 'active',
    type: 'embedding'
  },
  {
    id: '5',
    name: 'Cohere Embed',
    provider: 'Cohere',
    model: 'embed-english-v3.0',
    lastModified: '2024-03-14',
    status: 'active',
    type: 'embedding'
  }
];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = React.useState('chatflows');
  const [selectedRag, setSelectedRag] = React.useState<string | null>(null);
  const [selectedAIConnection, setSelectedAIConnection] = React.useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    aiKeys: false
  });
  const [selectedAIType, setSelectedAIType] = React.useState<'language' | 'embedding' | null>(null);
  const [newRag, setNewRag] = React.useState({
    name: '',
    description: '',
    vectorDb: 'Pinecone',
    host: '',
    port: '443',
    embeddingModel: 'OpenAI Ada 002'
  });

  const handleDeleteRag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this RAG configuration?')) {
      // Handle deletion
    }
  };

  const handleDeleteAIConnection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this AI connection?')) {
      // Handle deletion
    }
  };

  const handleSaveRag = () => {
    // Handle saving RAG configuration
    setSelectedRag(null);
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const filteredAIConnections = mockAIConnections.filter(conn => 
    selectedAIType ? conn.type === selectedAIType : true
  );

  const logoStyle = {
      height: "3rem"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div> */}
              <img src={logoImage} alt="LangStar Logo" style={logoStyle} />
            </div>
          </div>
          <nav className="p-4">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveMenu('chatflows')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeMenu === 'chatflows' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex-1 text-left">Chatflows</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setActiveMenu('rag')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeMenu === 'rag' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">RAG Configuration</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div>
                <button 
                  onClick={() => toggleMenu('aiKeys')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeMenu.startsWith('ai-') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Key className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-left">AI Model Keys</span>
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${
                    expandedMenus.aiKeys ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {expandedMenus.aiKeys && (
                  <div className="ml-6 mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setActiveMenu('ai-language');
                        setSelectedAIType('language');
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeMenu === 'ai-language'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1 text-left">Language Models</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenu('ai-embedding');
                        setSelectedAIType('embedding');
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeMenu === 'ai-embedding'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1 text-left">Embedding Models</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeMenu === 'chatflows' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Workflows</h1>
                <button
                  onClick={() => navigate('/flow/new')}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  New Workflow
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => navigate(`/flow/${workflow.id}`)}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Last modified: {workflow.lastModified}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {workflow.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'rag' && !selectedRag && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">RAG Configurations</h1>
                  <p className="text-gray-600 mt-2">Manage your Retrieval-Augmented Generation configurations</p>
                </div>
                <button
                  onClick={() => setSelectedRag('new')}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  New RAG
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRagConfigs.map((rag) => (
                  <div
                    key={rag.id}
                    onClick={() => setSelectedRag(rag.id)}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{rag.name}</h3>
                          <button
                            onClick={(e) => handleDeleteRag(rag.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rag.description}</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Vector DB:</span>
                            {rag.vectorDb}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Embedding:</span>
                            {rag.embeddingModel}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Host:</span>
                            {rag.host}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Modified: {rag.lastModified}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              rag.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {rag.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'rag' && selectedRag && (
            <div className="p-8">
              <div className="mb-6">
                <button
                  onClick={() => setSelectedRag(null)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back to RAG Configurations
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input 
                          type="text" 
                          value={newRag.name}
                          onChange={(e) => setNewRag({ ...newRag, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter RAG name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newRag.description}
                          onChange={(e) => setNewRag({ ...newRag, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter RAG description"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Vector Database Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Database Type
                        </label>
                        <select
                          value={newRag.vectorDb}
                          onChange={(e) => setNewRag({ ...newRag, vectorDb: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pinecone">Pinecone</option>
                          <option value="Weaviate">Weaviate</option>
                          <option value="Milvus">Milvus</option>
                          <option value="Qdrant">Qdrant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Host
                        </label>
                        <input 
                          type="text"
                          value={newRag.host}
                          onChange={(e) => setNewRag({ ...newRag, host: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter host URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Port
                        </label>
                        <input 
                          type="text"
                          value={newRag.port}
                          onChange={(e) => setNewRag({ ...newRag, port: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter port number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Embedding Configuration</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Embedding Model
                      </label>
                      <select
                        value={newRag.embeddingModel}
                        onChange={(e) => setNewRag({ ...newRag, embeddingModel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="OpenAI Ada 002">OpenAI Ada 002</option>
                        <option value="Cohere Embed">Cohere Embed</option>
                        <option value="GTE-Large">GTE-Large</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSaveRag}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeMenu === 'ai-language' || activeMenu === 'ai-embedding') && !selectedAIConnection && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">
                    {activeMenu === 'ai-language' ? 'Language Models' : 'Embedding Models'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage your {activeMenu === 'ai-language' ? 'language' : 'embedding'} model connections and API keys
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAIConnection('new')}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  New {activeMenu === 'ai-language' ? 'Language Model' : 'Embedding Model'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAIConnections.map((connection) => (
                  <div
                    key={connection.id}
                    onClick={() => setSelectedAIConnection(connection.id)}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{connection.name}</h3>
                          <button
                            onClick={(e) => handleDeleteAIConnection(connection.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Provider:</span>
                            {connection.provider}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Model:</span>
                            {connection.model}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Modified: {connection.lastModified}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              connection.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {connection.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeMenu === 'ai-language' || activeMenu === 'ai-embedding') && selectedAIConnection && (
            <div className="p-8">
              <div className="mb-6">
                <button
                  onClick={() => setSelectedAIConnection(null)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back to {activeMenu === 'ai-language' ? 'Language' : 'Embedding'} Models
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Connection Details</h2>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Connection Name
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter connection name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provider
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {activeMenu === 'ai-language' ? (
                            <>
                              <option>OpenAI</option>
                              <option>Anthropic</option>
                              <option>Google</option>
                              <option>Mistral</option>
                              <option>Cohere</option>
                            </>
                          ) : (
                            <>
                              <option>OpenAI</option>
                              <option>Cohere</option>
                              <option>HuggingFace</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {activeMenu === 'ai-language' ? (
                            <>
                              <option>gpt-4</option>
                              <option>gpt-3.5-turbo</option>
                              <option>claude-3-opus</option>
                              <option>claude-3-sonnet</option>
                              <option>gemini-pro</option>
                              <option>mistral-large</option>
                              <option>command</option>
                            </>
                          ) : (
                            <>
                              <option>text-embedding-ada-002</option>
                              <option>embed-english-v3.0</option>
                              <option>gte-large</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input 
                          type="password" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter API key"
                        />
                      </div>
                    </div>
                  </div>

                  {activeMenu === 'ai-language' && (
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-4">Advanced Settings</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Temperature
                          </label>
                          <input 
                            type="number" 
                            min="0" 
                            max="2" 
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.7"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Tokens
                          </label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="2048"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      Save Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;