# Ollama Chat Hub - Replit Project

## Overview
Ollama Chat Hub is a powerful interface for chatting with local Ollama models. The application has been migrated from Vercel to Replit and configured to run in the Replit environment.

## Recent Changes (October 22, 2025)

### Migration from Vercel to Replit
- Configured Next.js frontend to serve on port 5000 with 0.0.0.0 binding for Replit compatibility
- Updated backend Express server to bind to 0.0.0.0
- Fixed frontend API endpoints to use relative URLs instead of hardcoded localhost:3001
- Added 'use client' directive to AppLayout component for Next.js App Router compatibility
- Fixed import paths in frontend components
- Built Next.js static export to frontend/out directory
- Backend serves static frontend files in production mode (NODE_ENV=production)

### Tool Calling Implementation
- Implemented real tool execution handlers (web_search, code_executor, file_manager)
- Integrated tools with Ollama's chat API (OpenAI-compatible format)
- Added DuckDuckGo web search capability
- Added code execution for Python, JavaScript, and Bash with safety limits
- Added file management with sandboxed directory restrictions
- Tools are sent to Ollama during chat and can be executed
- See TOOL_CALLING.md for detailed documentation

**Security Note**: Code executor has basic safety measures (5s timeout, 50KB output limit) but is NOT fully sandboxed. Suitable for trusted users only.

## Project Architecture

### Frontend (Next.js 14)
- Location: `frontend/`
- Framework: Next.js 14 with App Router
- UI: TailwindCSS, Framer Motion
- State Management: Zustand
- Build output: `frontend/out/` (static export)
- Development: `npm run dev` in frontend directory
- Production: Built files served by backend Express server

### Backend (Express.js)
- Location: `backend/`
- Framework: Express with Socket.IO for real-time communication
- Routes:
  - `/api/ollama` - Ollama model interaction
  - `/api/tools` - Tools management
  - `/api/mcp` - MCP configuration
- Serves static frontend from `frontend/out/` in production

### Dependencies
- Root package.json: Backend dependencies
- frontend/package.json: Frontend dependencies
- Both use npm as package manager

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3001, Replit uses 5000)
- `OLLAMA_HOST`: Ollama API endpoint (default: http://localhost:11434)
- `NODE_ENV`: Set to 'production' for production mode

### Workflow
- Name: "Ollama Chat Hub"
- Command: `NODE_ENV=production PORT=5000 node backend/main.js`
- Port: 5000 (webview)

## Running the Application

### Development
```bash
npm run dev
```
This runs both backend and frontend concurrently.

### Production (Replit)
The workflow automatically runs:
```bash
NODE_ENV=production PORT=5000 node backend/main.js
```
This serves the built frontend and backend API on port 5000.

### Building Frontend
```bash
cd frontend && npm run build
```
Builds the Next.js static export to `frontend/out/`.

## User Preferences
- None set yet

## Next Steps
- User needs to configure OLLAMA_HOST environment variable to point to their Ollama instance
- The application will connect to Ollama once OLLAMA_HOST is properly configured
