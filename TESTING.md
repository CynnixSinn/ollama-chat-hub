# Testing Ollama Chat Hub

## Pre-flight Check

Before running the application, ensure:

1. Ollama is installed and running on your system
2. At least one model is available (e.g., run `ollama pull llama3`)
3. Node.js and npm are installed (v14 or higher)

## Running the Application

1. **Navigate to the project directory:**
   ```bash
   cd /data/data/com.termux/files/home/ollama_chat/ollama-chat-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Start the backend server:**
   ```bash
   npm run backend
   ```
   (This starts the server on port 3001)

4. **In a new terminal, start the frontend:**
   ```bash
   cd frontend && npm run dev
   ```
   (This starts the frontend on port 3000)

5. **Open your browser and navigate to:**
   http://localhost:3000

## Testing All Features

### 1. Model Listing
- [ ] Verify that available Ollama models are listed in the sidebar
- [ ] Check that the model dropdown is populated automatically
- [ ] Test selecting different models

### 2. Chat Interface
- [ ] Test sending a text message to the selected model
- [ ] Verify that responses are displayed in message bubbles
- [ ] Check that code blocks are properly syntax-highlighted
- [ ] Verify the typing indicator shows when waiting for responses

### 3. Speech Recognition
- [ ] Click the microphone button and speak
- [ ] Verify the speech is converted to text in the input field
- [ ] Check that the converted text can be sent as a message

### 4. Artifacts Panel
- [ ] Ask the model to generate code (e.g., "Write a simple Python function")
- [ ] Verify the code appears in the Artifacts panel
- [ ] Test the download and copy buttons for artifacts
- [ ] Check that images (if generated) render in the panel

### 5. Settings Panel
- [ ] Click the Settings button in the sidebar
- [ ] Verify the settings panel opens
- [ ] Test changing Ollama host setting
- [ ] Toggle voice recognition setting
- [ ] Add and remove tools using the tools tab
- [ ] Add and remove MCP servers using the servers tab
- [ ] Save settings and verify they persist

### 6. Keyboard Shortcuts
- [ ] Test `Ctrl+/` to focus the model selector
- [ ] Test `Ctrl+M` to toggle microphone
- [ ] Test `Ctrl+T` to open settings
- [ ] Test `Ctrl+Shift+K` to show shortcuts help

### 7. WebSocket Streaming
- [ ] Send a longer prompt to the model
- [ ] Verify the response streams in real-time rather than waiting for completion
- [ ] Check there are no delays or missing content

### 8. MCP/Tool Integration
- [ ] Verify tools from `mcp.json` appear in the settings
- [ ] Test that the application can connect to configured MCP servers
- [ ] Check tool calling functionality if available

## Expected Results

- All components should render without errors
- WebSocket connections should establish successfully
- Ollama API calls should complete without errors
- The UI should be responsive and follow the dark theme
- All interactive elements should function as expected
- Keyboard shortcuts should work globally
- Artifacts should be properly detected, saved, and downloadable

## Troubleshooting Common Issues

- If models don't appear, verify Ollama is running and accessible
- If WebSocket connections fail, check that both backend and frontend are running
- If speech recognition doesn't work, check if your browser supports the Web Speech API
- If artifacts don't appear, verify that the models are generating content that matches artifact patterns