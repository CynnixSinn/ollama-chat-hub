# Ollama Chat Hub
![Lucid_Origin_create_a_logo_for_an_app_called_ollama_chat_hub_i_0](https://github.com/user-attachments/assets/052f5b00-437e-4c8f-a394-513edde92804)

A powerful interface for chatting with local Ollama models and managing their tools, features, and artifacts.

## Features

- **Model Management**: Automatically detect and list all Ollama models available locally
- **Dark-Themed Chat Interface**: Sleek, modern dark-mode-only UI with message bubbles and code highlighting
- **Multi-Modal Input**: Text input and speech-to-text functionality
- **Tool Calling / MCP Integration**: Automatic loading of tool functions and MCP servers with editable configuration
- **Artifact Rendering & Downloads**: Automatic detection and rendering of images, code, and files with download capabilities
- **Feature-Rich UX**: Sidebar navigation, settings panel, and keyboard shortcuts
- **WebSocket Streaming**: Real-time streaming of model responses

## Prerequisites

- Node.js (v14 or higher)
- Ollama installed and running on your system
- Models installed in Ollama (e.g., `ollama pull llama3`)

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

## Configuration

- Ollama API endpoint can be configured in the settings panel or via the `OLLAMA_HOST` environment variable
- MCP tools and servers can be configured via the `mcp.json` file or through the settings UI
- Voice recognition settings can be toggled in the settings panel
- For detailed configuration options, see [CONFIGURATION.md](CONFIGURATION.md)

## Keyboard Shortcuts

- `Ctrl + /` : Focus model selector
- `Ctrl + M` : Toggle microphone
- `Ctrl + T` : Open settings
- `Ctrl + Shift + M` : Toggle settings panel
- `Ctrl + Shift + K` : Show keyboard shortcuts help
- `Shift + Enter` : New line in chat input
- `Enter` : Send message

## Architecture

- **Frontend**: React + Next.js + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom dark theme
- **Real-time Communication**: WebSocket for streaming responses

## Project Structure

```
/ollama-chat-hub
├── backend/
│   ├── main.js
│   ├── routes/
│   │   ├── ollama.js
│   │   ├── tools.js
│   │   └── mcp.js
│   └── utils/
│       ├── speech_to_text.js
│       └── artifacts_manager.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── state/
│   │   ├── utils/
│   │   └── assets/
│   └── public/
├── mcp.json
└── package.json
```

## Customization

- To add new tools, modify the `mcp.json` file or use the settings UI
- To add new themes, modify the `frontend/src/assets/globals.css` file
- To customize the UI, modify the React components in `frontend/src/components/`

## Troubleshooting

- Make sure Ollama is running and accessible at the configured endpoint
- Check that you have models installed in Ollama
- Verify that the backend is running and accessible
- If speech recognition doesn't work, ensure your browser supports the Web Speech API

## License

MIT
