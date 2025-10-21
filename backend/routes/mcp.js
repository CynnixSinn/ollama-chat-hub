const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get MCP configuration
router.get('/', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../mcp.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    res.json(config);
  } catch (error) {
    console.error('Error reading MCP config:', error.message);
    // Return default config if file doesn't exist
    res.json({
      tools: [],
      servers: []
    });
  }
});

// Update MCP configuration
router.post('/', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../mcp.json');
    const config = req.body;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating MCP config:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// List MCP servers
router.get('/servers', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../mcp.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    res.json({ servers: config.servers || [] });
  } catch (error) {
    console.error('Error reading MCP servers:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Connect to an MCP server
router.post('/connect', async (req, res) => {
  try {
    const { serverName } = req.body;
    
    // In a real implementation, you would connect to the specified MCP server
    // For now, we'll simulate a successful connection
    const connection = {
      server: serverName,
      connected: true,
      timestamp: new Date().toISOString()
    };
    
    res.json(connection);
  } catch (error) {
    console.error('Error connecting to MCP server:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect from an MCP server
router.post('/disconnect', async (req, res) => {
  try {
    const { serverName } = req.body;
    
    // In a real implementation, you would disconnect from the specified MCP server
    // For now, we'll simulate a successful disconnection
    const connection = {
      server: serverName,
      connected: false,
      timestamp: new Date().toISOString()
    };
    
    res.json(connection);
  } catch (error) {
    console.error('Error disconnecting from MCP server:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;