# Quick Setup Guide

## Prerequisites
- Install Node.js (v14 or higher)
- Install and run Ollama: https://ollama.ai/
- Pull at least one model: `ollama pull llama3`

## One-Time Setup
```bash
# Clone the repository
git clone <repository-url>
cd ollama-chat-hub

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Configure your mcp.json as needed (optional)
```

## Running the Application
```bash
# Method 1: Run backend and frontend separately
npm run backend  # Terminal 1
npm run frontend # Terminal 2

# Method 2: Run both with one command
npm run dev
```

## Configure Ollama Endpoint (Optional)
```bash
export OLLAMA_HOST=http://localhost:11434
npm run dev
```

## Configure MCP Tools
Edit the `mcp.json` file to add or modify tools and servers as needed.
See `CONFIGURATION.md` for detailed instructions.