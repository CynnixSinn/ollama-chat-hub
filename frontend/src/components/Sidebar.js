import React, { useEffect } from 'react';
import { FaComments, FaRobot, FaHistory, FaCog, FaTimes } from 'react-icons/fa';
import { useAppStore } from '../state/appStore';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const setShowSettings = useAppStore(state => state.setShowSettings);
  const models = useAppStore(state => state.models);
  const loadingModels = useAppStore(state => state.loadingModels);
  const selectedModel = useAppStore(state => state.selectedModel);
  const setSelectedModel = useAppStore(state => state.setSelectedModel);
  const loadModels = useAppStore(state => state.loadModels);

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div className="sidebar w-64 flex-shrink-0">
      <div className="p-4 border-b border-dark-600">
        <h1 className="text-xl font-bold flex items-center">
          <FaRobot className="mr-2" /> Ollama Chat Hub
        </h1>
      </div>
      
      <div className="p-4">
        <label className="block text-sm font-medium mb-2">Active Model</label>
        {loadingModels ? (
          <div className="animate-pulse h-10 bg-dark-700 rounded"></div>
        ) : (
          <select 
            className="model-selector w-full"
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name} ({model.size})
              </option>
            ))}
          </select>
        )}
      </div>
      
      <nav className="flex-grow">
        <div className="mb-2">
          <button
            className={`sidebar-item w-full text-left ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <FaComments className="mr-3" /> Chat
          </button>
          <button
            className={`sidebar-item w-full text-left ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <FaRobot className="mr-3" /> Models
          </button>
          <button
            className={`sidebar-item w-full text-left ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="mr-3" /> History
          </button>
        </div>
        
        <div className="mt-auto pt-4 border-t border-dark-600">
          <button
            className="sidebar-item w-full text-left"
            onClick={() => setShowSettings(true)}
          >
            <FaCog className="mr-3" /> Settings
          </button>
        </div>
      </nav>
    </div>
  );
};