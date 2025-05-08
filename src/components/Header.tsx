import React from 'react';
import { Save, Play, Undo, Redo, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFlowStore } from '../store/flowStore';

const Header: React.FC = () => {
  const { projectName, setProjectName } = useFlowStore();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/admin')}
          className="mr-4 p-1.5 text-gray-600 hover:bg-gray-100 rounded-md flex items-center"
          title="Back to Admin"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <div className="relative">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
              placeholder="Untitled Project"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
          <Undo className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
          <Redo className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
          <Settings className="h-4 w-4" />
        </button>
        <button className="hidden sm:flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm">
          <Save className="h-4 w-4 mr-1" /> Save
        </button>
        <button className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
          <Play className="h-4 w-4 mr-1" /> Run
        </button>
      </div>
    </header>
  );
};

export default Header;