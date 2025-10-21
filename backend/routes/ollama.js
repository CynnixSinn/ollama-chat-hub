const express = require('express');
const router = express.Router();
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Get list of available models
router.get('/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate embeddings
router.post('/embeddings', async (req, res) => {
  try {
    const { model, input } = req.body;
    const response = await axios.post(`${OLLAMA_HOST}/api/embeddings`, {
      model,
      prompt: input
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error generating embeddings:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate a completion
router.post('/generate', async (req, res) => {
  try {
    const { model, prompt, system, options } = req.body;
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model,
      prompt,
      system,
      options: options || {},
      stream: false
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error generating completion:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create a chat completion
router.post('/chat', async (req, res) => {
  try {
    const { model, messages, stream, options } = req.body;
    
    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      });

      const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
        model,
        messages,
        options: options || {},
        stream: true
      }, {
        responseType: 'stream'
      });

      response.data.on('data', (chunk) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        res.end();
      });
    } else {
      const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
        model,
        messages,
        options: options || {},
        stream: false
      });
      res.json(response.data);
    }
  } catch (error) {
    console.error('Error in chat:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Pull a model
router.post('/pull', async (req, res) => {
  try {
    const { name } = req.body;
    const response = await axios.post(`${OLLAMA_HOST}/api/pull`, {
      name
    }, {
      responseType: 'stream'
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    });

    response.data.on('data', (chunk) => {
      res.write(chunk);
    });

    response.data.on('end', () => {
      res.end();
    });
  } catch (error) {
    console.error('Error pulling model:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create model from Modelfile
router.post('/create', async (req, res) => {
  try {
    const { name, modelfile, stream } = req.body;
    const response = await axios.post(`${OLLAMA_HOST}/api/create`, {
      name,
      modelfile,
      stream: stream !== false
    }, {
      responseType: stream !== false ? 'stream' : 'json'
    });

    if (stream) {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      });

      response.data.on('data', (chunk) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        res.end();
      });
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('Error creating model:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Copy a model
router.post('/copy', async (req, res) => {
  try {
    const { source, destination } = req.body;
    const response = await axios.post(`${OLLAMA_HOST}/api/copy`, {
      source,
      destination
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error copying model:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a model
router.delete('/delete', async (req, res) => {
  try {
    const { name } = req.body;
    const response = await axios.delete(`${OLLAMA_HOST}/api/delete`, {
      data: { name }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting model:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Show model information
router.post('/show', async (req, res) => {
  try {
    const { name, system, template, options } = req.body;
    const response = await axios.post(`${OLLAMA_HOST}/api/show`, {
      name,
      system,
      template,
      options
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error showing model info:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;