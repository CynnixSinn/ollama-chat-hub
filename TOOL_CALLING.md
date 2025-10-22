# Tool Calling Implementation

## Overview
This application implements real tool calling with Ollama integration, allowing AI models to execute functions like web search, code execution, and file management.

## Available Tools

### 1. Web Search (`web_search`)
- **Description**: Search the web using DuckDuckGo API
- **Parameters**:
  - `query` (string): The search query
- **Example**: `{ "query": "latest news about AI" }`

### 2. Code Executor (`code_executor`)
- **Description**: Execute code snippets in Python, JavaScript, or Bash
- **Parameters**:
  - `language` (string): "python", "javascript", or "bash"
  - `code` (string): The code to execute
- **Security**: 
  - 5-second execution timeout
  - 50KB output limit
  - Isolated temp directory
  - No network access by default
- **Example**: `{ "language": "python", "code": "print('Hello, World!')" }`

### 3. File Manager (`file_manager`)
- **Description**: Manage files in a sandboxed directory
- **Parameters**:
  - `action` (string): "read", "write", "list", or "delete"
  - `path` (string): File path (relative to user_files directory)
  - `content` (string, optional): Content to write (for write action)
- **Security**: All paths are sanitized and restricted to `user_files/` directory
- **Example**: `{ "action": "write", "path": "notes.txt", "content": "My notes" }`

## Usage

### Direct Tool Execution (API)
Tools can be called directly via the REST API:

```bash
curl -X POST http://localhost:5000/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "web_search",
    "parameters": {
      "query": "Ollama models"
    }
  }'
```

### Ollama Integration (Chat)
When chatting with Ollama models, tools are automatically sent in the request. When a model decides to use a tool:

1. The tool is executed automatically
2. Results are emitted to the client via WebSocket
3. **Note**: Full conversation loop completion requires frontend support

## Current Status & Limitations

### ✅ Implemented
- Real tool execution handlers
- Ollama API integration (tools sent in chat requests)
- Tool call detection from Ollama responses
- Direct API tool execution
- Security measures (timeouts, output limits, path sanitization)

### ⚠️ Limitations
- **Tool Loop**: Tool results are not automatically sent back to Ollama to continue the conversation
  - Tools execute successfully
  - Results are emitted to the client
  - But the conversation doesn't automatically continue after tool execution
  - This requires frontend modifications to append tool results and continue the chat

- **Code Executor Security**: 
  - NOT fully sandboxed (no Docker/VM isolation)
  - Suitable for trusted users only
  - DO NOT expose to untrusted/public users without additional sandboxing
  - Resource limits are basic (timeout, output size)

### 🔄 Future Improvements
1. **Complete Tool Loop**: Modify frontend to send tool results back to Ollama
2. **Enhanced Security**: Add Docker-based sandboxing for code execution
3. **More Tools**: Add tools for image generation, database queries, etc.
4. **Tool Permissions**: Add user confirmation before executing sensitive tools

## Security Considerations

### Code Executor
- ⚠️ **WARNING**: Code executor runs on the host system
- Use only in trusted environments
- For production use, implement proper sandboxing (Docker, Firecracker, etc.)
- Current mitigations:
  - Execution timeout (5 seconds)
  - Output size limit (50KB)
  - Temp directory isolation
  - Limited environment variables

### File Manager
- ✅ All file operations are restricted to `user_files/` directory
- ✅ Path traversal attempts are blocked
- ✅ No access to system files or parent directories

### Web Search
- ✅ Uses DuckDuckGo public API
- ✅ No API keys required
- ✅ Results are publicly available information

## Configuration

Tools are defined in `mcp.json`. To add or modify tools:

1. Edit `mcp.json` to add tool definition
2. Implement tool handler in `backend/handlers/`
3. Add tool execution case in `backend/main.js` `executeToolInternal()`
4. Restart the server

Example tool definition:
```json
{
  "name": "my_tool",
  "description": "Description of what the tool does",
  "endpoint": "/api/tools/my_tool",
  "input_schema": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Description of parameter"
      }
    },
    "required": ["param1"]
  }
}
```

## Testing Tools

### Test Web Search
```bash
curl -X POST http://localhost:5000/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"toolName": "web_search", "parameters": {"query": "test"}}'
```

### Test Code Executor
```bash
curl -X POST http://localhost:5000/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"toolName": "code_executor", "parameters": {"language": "python", "code": "print(2+2)"}}'
```

### Test File Manager
```bash
curl -X POST http://localhost:5000/api/tools/execute \
  -H "Content-Type: application/json" \
  -d '{"toolName": "file_manager", "parameters": {"action": "write", "path": "test.txt", "content": "Hello"}}'
```

## Development

When running locally, tools will work without ngrok. The application will use `http://localhost:11434` for Ollama by default.

## Production Notes

1. **Disable Code Executor**: Set environment variable `DISABLE_CODE_EXECUTOR=true` for untrusted environments
2. **Monitor Tool Usage**: Add logging and monitoring for tool execution
3. **Rate Limiting**: Implement rate limiting for tool calls
4. **User Permissions**: Add authorization checks before tool execution
