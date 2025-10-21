# Ollama Chat Hub Configuration Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Environment Variables](#environment-variables)
5. [MCP Configuration](#mcp-configuration)
6. [Ollama Integration](#ollama-integration)
7. [Adding Custom Tools](#adding-custom-tools)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js (v14 or higher)
- Ollama installed and running on your system
- Models installed in Ollama (e.g., `ollama pull llama3`)
- Git (for cloning the repository)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd ollama-chat-hub
```

2. Install backend dependencies:
```bash
cd ollama-chat-hub
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Development Mode
1. Start the backend server:
```bash
npm run backend
```

2. In a new terminal, start the frontend in development mode:
```bash
cd frontend
npm run dev
```

Or use the combined command to run both simultaneously:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Mode
```bash
npm run build
npm start
```

## Environment Variables

The application supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Backend server port |
| `OLLAMA_HOST` | http://localhost:11434 | Ollama API endpoint |
| `NODE_ENV` | undefined | Set to 'production' for production mode |

### Setting Environment Variables

#### Linux/Mac:
```bash
export OLLAMA_HOST=http://localhost:11434
npm run dev
```

#### Windows (Command Prompt):
```cmd
set OLLAMA_HOST=http://localhost:11434
npm run dev
```

#### Windows (PowerShell):
```powershell
$env:OLLAMA_HOST="http://localhost:11434"
npm run dev
```

## MCP Configuration

### Overview

The `mcp.json` file handles the Model Context Protocol (MCP) configuration, defining tools and servers that can be integrated with Ollama models. This enables advanced functionality like web search, code execution, and file management.

### MCP Configuration Structure

```json
{
  "tools": [
    {
      "name": "unique_tool_identifier",
      "description": "Brief description of what the tool does",
      "endpoint": "/api/tools/tool_endpoint",
      "input_schema": {
        "type": "object",
        "properties": {
          "parameter_name": {
            "type": "string/number/boolean",
            "description": "Description of the parameter"
          }
        },
        "required": ["required_parameter"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "result": {
            "type": "string",
            "description": "Description of the expected output"
          }
        }
      }
    }
  ],
  "servers": [
    {
      "name": "Server Display Name",
      "url": "http://server-address:port",
      "capabilities": ["tool1", "tool2"],
      "enabled": true
    }
  ]
}
```

### Example Configuration

Here's the default `mcp.json` configuration:

```json
{
  "tools": [
    {
      "name": "web_search",
      "description": "Search the web for current information",
      "endpoint": "/api/tools/web_search",
      "input_schema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "The search query"
          }
        },
        "required": ["query"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "results": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {"type": "string"},
                "url": {"type": "string"},
                "snippet": {"type": "string"}
              }
            }
          }
        }
      }
    },
    {
      "name": "code_executor",
      "description": "Execute code snippets in a sandboxed environment",
      "endpoint": "/api/tools/code_executor",
      "input_schema": {
        "type": "object",
        "properties": {
          "language": {
            "type": "string",
            "enum": ["python", "javascript", "bash"]
          },
          "code": {
            "type": "string",
            "description": "The code to execute"
          }
        },
        "required": ["language", "code"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "output": {
            "type": "string",
            "description": "The output from the code execution"
          },
          "error": {
            "type": "string",
            "description": "Any error that occurred during execution"
          }
        }
      }
    },
    {
      "name": "file_manager",
      "description": "Manage files on the local system",
      "endpoint": "/api/tools/file_manager",
      "input_schema": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["read", "write", "list", "delete"]
          },
          "path": {
            "type": "string",
            "description": "The file path to operate on"
          },
          "content": {
            "type": "string",
            "description": "The content to write (for write action)"
          }
        },
        "required": ["action", "path"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "result": {
            "type": "string",
            "description": "The result of the file operation"
          }
        }
      }
    }
  ],
  "servers": [
    {
      "name": "Local Tools Server",
      "url": "http://localhost:3002",
      "capabilities": ["web_search", "code_executor", "file_manager"],
      "enabled": true
    }
  ]
}
```

## Ollama Integration

### Available Models

The application automatically detects models available in your local Ollama installation. To see what models are available:

1. Run: `ollama list` in your terminal
2. Or check the model dropdown in the application UI

### Installing Ollama Models

To install models for use with the application:

```bash
# Install a base model
ollama pull llama3

# Or install other models
ollama pull mistral
ollama pull codellama
ollama pull phi3
```

### Using Different Ollama Endpoints

If your Ollama instance is running on a different machine or port, update the `OLLAMA_HOST` environment variable:

```bash
export OLLAMA_HOST=http://your-ollama-server:11434
npm run dev
```

## Adding Custom Tools

### Adding a New Tool

1. Update the `mcp.json` file to include your new tool:

```json
{
  "name": "custom_tool_name",
  "description": "Description of what your tool does",
  "endpoint": "/api/tools/custom_tool",
  "input_schema": {
    "type": "object",
    "properties": {
      "parameter1": {
        "type": "string",
        "description": "Description of first parameter"
      }
    },
    "required": ["parameter1"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "result": {
        "type": "string",
        "description": "Expected output format"
      }
    }
  }
}
```

2. Create the backend implementation for your tool in either:
   - `/backend/routes/tools.js` for API-based tools
   - A separate service that can be called by the tools endpoint

3. In the current implementation, you would need to modify the `/backend/routes/tools.js` file to implement the actual logic for your custom tool.

### Adding a Tool Server

To add an external server that provides tools:

1. Update the `servers` array in `mcp.json`:

```json
{
  "name": "My External Server",
  "url": "http://my-server:port",
  "capabilities": ["custom_tool_name"],
  "enabled": true
}
```

## Troubleshooting

### Common Issues

#### Ollama Not Detected
- Ensure Ollama is running: `ollama serve`
- Check that Ollama is accessible at the configured endpoint
- Verify the `OLLAMA_HOST` environment variable matches your Ollama instance

#### Frontend Can't Connect to Backend
- Ensure both backend and frontend are running
- Check that the backend is running on port 3001 by default
- If using different ports, update the frontend API calls accordingly

#### Tools Not Working
- Make sure your `mcp.json` is properly formatted
- Verify that the endpoints in your `mcp.json` match the actual API endpoints
- Check that your tools server is running if using external tools

#### Model Responses Slow
- This is typically due to hardware limitations
- Ensure your system has adequate resources (CPU/RAM/GPU)
- Consider using smaller models for faster responses

### Debugging Tips

1. Check the backend logs for error messages
2. Use the browser's developer tools to check for frontend errors
3. Verify that models are properly loaded in Ollama
4. Ensure network connectivity between Ollama, frontend, and backend

### Reset Configuration

If you encounter configuration issues, you can reset to the default by:

1. Backing up your current `mcp.json`:
```bash
mv mcp.json mcp.json.backup
```

2. The application will generate a default configuration automatically

## Customizing the Application

### Modifying the Theme

- Edit `frontend/src/assets/globals.css` to customize colors and styling
- The application currently uses a dark theme by default

### Adding Custom Models

The application will automatically detect any models installed in your local Ollama instance. Simply install a new model:

```bash
ollama pull model-name
```

Then refresh the application to see the new model in the dropdown.