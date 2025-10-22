const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { webSearch } = require('../handlers/web_search');
const { executeCode } = require('../handlers/code_executor');
const { manageFile } = require('../handlers/file_manager');

// Get tools configuration
router.get('/', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../mcp.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    res.json(config);
  } catch (error) {
    console.error('Error reading tools config:', error.message);
    // Return default config if file doesn't exist
    res.json({
      tools: [],
      servers: []
    });
  }
});

// Update tools configuration
router.post('/', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../mcp.json');
    const config = req.body;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating tools config:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Execute a tool
router.post('/execute', async (req, res) => {
  try {
    const { toolName, parameters } = req.body;
    
    // Find the tool in the configuration
    const configPath = path.join(__dirname, '../../mcp.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    
    const tool = config.tools.find(t => t.name === toolName);
    if (!tool) {
      return res.status(404).json({ error: `Tool ${toolName} not found` });
    }
    
    let result;
    
    // Execute the actual tool based on its name
    switch (toolName) {
      case 'web_search':
        const searchResult = await webSearch(parameters.query);
        result = {
          tool: toolName,
          parameters,
          success: searchResult.success,
          result: searchResult.results,
          error: searchResult.error,
          timestamp: new Date().toISOString()
        };
        break;
      
      case 'code_executor':
        const execResult = await executeCode(parameters.language, parameters.code);
        result = {
          tool: toolName,
          parameters,
          success: execResult.success,
          output: execResult.output,
          error: execResult.error,
          timestamp: new Date().toISOString()
        };
        break;
      
      case 'file_manager':
        const fileResult = await manageFile(parameters.action, parameters.path, parameters.content);
        result = {
          tool: toolName,
          parameters,
          success: fileResult.success,
          result: fileResult.result,
          error: fileResult.error,
          timestamp: new Date().toISOString()
        };
        break;
      
      default:
        result = {
          tool: toolName,
          parameters,
          success: false,
          error: `Unknown tool: ${toolName}`,
          timestamp: new Date().toISOString()
        };
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error executing tool:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Ping an MCP server
router.post('/mcp-ping', async (req, res) => {
  try {
    const { server } = req.body;
    
    // In a real implementation, you would ping the MCP server
    // For now, we'll simulate a response
    const result = {
      server: server.name,
      status: 'online',
      capabilities: server.capabilities || [],
      timestamp: new Date().toISOString()
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error pinging MCP server:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;