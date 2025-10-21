const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

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
    
    // In a real implementation, you would execute the tool with the specified parameters
    // For now, we'll simulate a response
    const result = {
      tool: toolName,
      parameters,
      result: `Simulated result from tool: ${toolName}`,
      timestamp: new Date().toISOString()
    };
    
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