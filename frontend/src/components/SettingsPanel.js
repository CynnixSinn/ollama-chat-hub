import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { useAppStore } from '../state/appStore';
import axios from 'axios';

export const SettingsPanel = () => {
  const [mcpConfig, setMcpConfig] = useState({ tools: [], servers: [] });
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [newTool, setNewTool] = useState({ name: '', description: '', endpoint: '' });
  const [newServer, setNewServer] = useState({ name: '', url: '', capabilities: '' });
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'tools', 'servers'
  const setShowSettings = useAppStore(state => state.setShowSettings);

  // Load initial config
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get('/api/mcp');
      setMcpConfig(response.data);
      
      // Load Ollama host from localStorage or use default
      const savedHost = localStorage.getItem('ollamaHost');
      if (savedHost) {
        setOllamaHost(savedHost);
      }
      
      const savedVoice = localStorage.getItem('voiceEnabled');
      if (savedVoice !== null) {
        setVoiceEnabled(savedVoice === 'true');
      }
    } catch (error) {
      console.error('Error loading config:', error);
      // Use default config if loading fails
      setMcpConfig({ tools: [], servers: [] });
    }
  };

  const saveSettings = async () => {
    try {
      // Save MCP config
      await axios.post('/api/mcp', mcpConfig);
      
      // Save other settings locally
      localStorage.setItem('ollamaHost', ollamaHost);
      localStorage.setItem('voiceEnabled', voiceEnabled.toString());
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please check the server is running.');
    }
  };

  const addTool = () => {
    if (newTool.name && newTool.description && newTool.endpoint) {
      const tool = {
        ...newTool,
        input_schema: {
          type: "object",
          properties: {},
          required: []
        },
        output_schema: {
          type: "object",
          properties: {},
          required: []
        }
      };
      
      setMcpConfig(prev => ({
        ...prev,
        tools: [...prev.tools, tool]
      }));
      
      setNewTool({ name: '', description: '', endpoint: '' });
    }
  };

  const removeTool = (index) => {
    setMcpConfig(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }));
  };

  const addServer = () => {
    if (newServer.name && newServer.url) {
      const server = {
        ...newServer,
        capabilities: newServer.capabilities.split(',').map(cap => cap.trim()).filter(cap => cap),
        enabled: true
      };
      
      setMcpConfig(prev => ({
        ...prev,
        servers: [...prev.servers, server]
      }));
      
      setNewServer({ name: '', url: '', capabilities: '' });
    }
  };

  const removeServer = (index) => {
    setMcpConfig(prev => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="settings-panel w-96">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Settings</h2>
        <button 
          onClick={() => setShowSettings(false)}
          className="btn-icon"
        >
          <FaTimes />
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-dark-600 mb-4">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'general' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-dark-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'tools' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-dark-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('tools')}
        >
          Tools
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'servers' 
              ? 'text-primary-500 border-b-2 border-primary-500' 
              : 'text-dark-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('servers')}
        >
          Servers
        </button>
      </div>
      
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Ollama Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Ollama Host</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={ollamaHost}
                    onChange={(e) => setOllamaHost(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Voice Settings</h3>
              <div className="flex items-center justify-between">
                <span>Voice Recognition</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Tools Configuration */}
        {activeTab === 'tools' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">MCP Tools</h3>
            <div className="space-y-4">
              {/* Add New Tool */}
              <div className="bg-dark-700 p-3 rounded">
                <h4 className="font-medium mb-2">Add New Tool</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="Tool Name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                  />
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="Description"
                    value={newTool.description}
                    onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                  />
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="Endpoint"
                    value={newTool.endpoint}
                    onChange={(e) => setNewTool({...newTool, endpoint: e.target.value})}
                  />
                  <button 
                    onClick={addTool}
                    className="btn-secondary w-full flex items-center justify-center text-sm"
                  >
                    <FaPlus className="mr-2" /> Add Tool
                  </button>
                </div>
              </div>
              
              {/* Existing Tools */}
              <div className="bg-dark-700 p-3 rounded">
                <h4 className="font-medium mb-2">Configured Tools</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mcpConfig.tools.map((tool, index) => (
                    <div key={index} className="p-2 bg-dark-600 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-dark-300">{tool.description}</div>
                      </div>
                      <button 
                        onClick={() => removeTool(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  {mcpConfig.tools.length === 0 && (
                    <div className="text-center text-dark-400 py-4">
                      No tools configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Servers Configuration */}
        {activeTab === 'servers' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">MCP Servers</h3>
            <div className="space-y-4">
              {/* Add New Server */}
              <div className="bg-dark-700 p-3 rounded">
                <h4 className="font-medium mb-2">Add New Server</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="Server Name"
                    value={newServer.name}
                    onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                  />
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="Server URL"
                    value={newServer.url}
                    onChange={(e) => setNewServer({...newServer, url: e.target.value})}
                  />
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="Capabilities (comma-separated)"
                    value={newServer.capabilities}
                    onChange={(e) => setNewServer({...newServer, capabilities: e.target.value})}
                  />
                  <button 
                    onClick={addServer}
                    className="btn-secondary w-full flex items-center justify-center text-sm"
                  >
                    <FaPlus className="mr-2" /> Add Server
                  </button>
                </div>
              </div>
              
              {/* Existing Servers */}
              <div className="bg-dark-700 p-3 rounded">
                <h4 className="font-medium mb-2">Configured Servers</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mcpConfig.servers.map((server, index) => (
                    <div key={index} className="p-2 bg-dark-600 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{server.name}</div>
                        <div className="text-xs text-dark-300">{server.url}</div>
                        <div className="text-xs text-dark-300">
                          Capabilities: {server.capabilities?.join(', ') || 'None'}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeServer(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  {mcpConfig.servers.length === 0 && (
                    <div className="text-center text-dark-400 py-4">
                      No servers configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Save Button */}
        <div className="pt-4">
          <button 
            onClick={saveSettings}
            className="btn-primary w-full flex items-center justify-center"
          >
            <FaSave className="mr-2" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};