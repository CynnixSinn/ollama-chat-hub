const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');
const schedule = require('node-schedule');
const NodeCache = require('node-cache');
const shelljs = require('shelljs');
const ArtifactsManager = require('./utils/artifacts_manager');

// Initialize cache for storing model information and other data
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/artifacts', express.static(path.join(__dirname, '../artifacts')));

// Initialize artifacts manager
const artifactsManager = new ArtifactsManager();

// Create artifacts directory if it doesn't exist
const artifactsDir = path.join(__dirname, '../artifacts');
shelljs.mkdir('-p', artifactsDir);

// Configuration
const PORT = process.env.PORT || 3001;
const OLLAMA_HOST = (process.env.OLLAMA_HOST || 'http://localhost:11434').trim();

// Routes
const ollamaRoutes = require('./routes/ollama');
const toolsRoutes = require('./routes/tools');
const mcpRoutes = require('./routes/mcp');

app.use('/api/ollama', ollamaRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/mcp', mcpRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/out')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
  });
}

// Function to list Ollama models
async function listOllamaModels() {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Ollama models:', error.message);
    return { models: [] };
  }
}

// Function to chat with Ollama model
async function chatWithOllama(req, res) {
  try {
    const { model, messages, stream } = req.body;
    
    const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
      model,
      messages,
      stream: stream !== false, // Default to true if not specified
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40
      }
    }, {
      responseType: 'stream'
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
      const result = await new Promise((resolve, reject) => {
        let data = '';
        response.data.on('data', (chunk) => {
          data += chunk;
        });
        response.data.on('end', () => {
          resolve(data);
        });
        response.data.on('error', (err) => {
          reject(err);
        });
      });
      res.json(JSON.parse(result));
    }
  } catch (error) {
    console.error('Error chatting with Ollama:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// Function to run shell commands
function runShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['-c', cmd], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

// Load MCP configuration
async function loadMCPConfig() {
  try {
    const configPath = path.join(__dirname, '../mcp.json');
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading MCP config:', error.message);
    // Return default config if file doesn't exist
    return {
      tools: [],
      servers: []
    };
  }
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle model listing request
  socket.on('getModels', async () => {
    const cachedModels = cache.get('ollamaModels');
    if (cachedModels) {
      socket.emit('models', cachedModels);
    } else {
      const models = await listOllamaModels();
      cache.set('ollamaModels', models);
      socket.emit('models', models);
    }
  });

  // Handle chat messages
  socket.on('sendMessage', async (data) => {
    const { model, messages } = data;
    
    try {
      const response = await axios.post(`${OLLAMA_HOST}/api/chat`, {
        model,
        messages,
        stream: true
      }, {
        responseType: 'stream'
      });

      let fullResponse = '';
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              
              // Check if the response contains artifacts (code, images, etc.)
              if (parsed.message && parsed.message.content) {
                fullResponse += parsed.message.content;
                
                // Check for artifacts in the response
                const artifacts = detectArtifacts(parsed.message.content);
                if (artifacts.length > 0) {
                  artifacts.forEach(artifact => {
                    // Save the artifact
                    artifactsManager.saveArtifact(
                      artifact.content, 
                      artifact.name, 
                      artifact.type, 
                      artifact.mimeType
                    ).then(savedArtifact => {
                      socket.emit('artifactCreated', savedArtifact);
                    }).catch(err => {
                      console.error('Error saving artifact:', err);
                    });
                  });
                }
              }
              
              socket.emit('messageResponse', parsed);
            } catch (e) {
              // Ignore malformed JSON chunks
              console.error('Error parsing JSON chunk:', e.message);
            }
          }
        }
      });

      response.data.on('end', () => {
        socket.emit('messageComplete');
      });
    } catch (error) {
      socket.emit('messageError', { error: error.message });
    }
  });

  // Handle tool calling
  socket.on('callTool', async (toolData) => {
    try {
      // In a real implementation, this would call the appropriate tool
      // For now, we'll simulate a response
      const result = {
        tool: toolData.name,
        result: `Simulated result for tool: ${toolData.name}`,
        ...toolData
      };
      socket.emit('toolResult', result);
    } catch (error) {
      socket.emit('toolError', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to detect artifacts in model responses
function detectArtifacts(content) {
  const artifacts = [];
  
  // Detect code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2];
    
    artifacts.push({
      type: 'code',
      name: `code_block_${Date.now()}.${getExtFromLang(language)}`,
      content: code,
      mimeType: getMimeTypeFromLang(language)
    });
  }
  
  // Detect file-like content (basic heuristic)
  const fileContentRegex = /(function|import|export|const|let|var|def|class)\s+\w+/;
  if (fileContentRegex.test(content) && content.length > 100) {
    // This looks like code but wasn't in a code block
    artifacts.push({
      type: 'code',
      name: `detected_code_${Date.now()}.txt`,
      content: content,
      mimeType: 'text/plain'
    });
  }
  
  return artifacts;
}

// Helper functions
function getExtFromLang(language) {
  const langMap = {
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'markdown': 'md',
    'md': 'md',
    'bash': 'sh',
    'shell': 'sh',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return langMap[language.toLowerCase()] || 'txt';
}

function getMimeTypeFromLang(language) {
  const langMap = {
    'javascript': 'application/javascript',
    'typescript': 'application/typescript',
    'python': 'text/x-python',
    'java': 'text/x-java-source',
    'cpp': 'text/x-c++src',
    'c': 'text/x-c',
    'html': 'text/html',
    'css': 'text/css',
    'json': 'application/json',
    'xml': 'application/xml',
    'markdown': 'text/markdown',
    'md': 'text/markdown',
    'bash': 'application/x-sh',
    'shell': 'application/x-sh',
    'sql': 'application/sql',
    'yaml': 'text/yaml',
    'yml': 'text/yaml'
  };
  return langMap[language.toLowerCase()] || 'text/plain';
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Ollama Chat Hub server running on port ${PORT}`);
  console.log(`Ollama API endpoint: ${OLLAMA_HOST}`);
});

// Schedule regular model updates
schedule.scheduleJob('*/5 * * * *', async () => {
  console.log('Refreshing Ollama models...');
  const models = await listOllamaModels();
  cache.set('ollamaModels', models);
});

module.exports = app;