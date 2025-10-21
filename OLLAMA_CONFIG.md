# Ollama Model Configuration Guide

## Table of Contents
1. [Supported Ollama Models](#supported-ollama-models)
2. [Model-Specific Configuration](#model-specific-configuration)
3. [Optimizing Model Performance](#optimizing-model-performance)
4. [Creating Custom Models](#creating-custom-models)
5. [Model Comparison](#model-comparison)

## Supported Ollama Models

Ollama Chat Hub works with all Ollama models. Here are some popular models you can use:

| Model | Size | Best For | Command to Pull |
|-------|------|----------|------------------|
| llama3 | 4.7-70B | General purpose | `ollama pull llama3` |
| mistral | 7B | Conversational | `ollama pull mistral` |
| codellama | 7-34B | Code generation | `ollama pull codellama` |
| phi3 | 3.8B | Lightweight | `ollama pull phi3` |
| gemma | 2-9B | Academic/research | `ollama pull gemma` |
| command-r | 35B | Instruction following | `ollama pull command-r` |

### Installing Models

To install models, run:

```bash
# Install a specific model
ollama pull llama3

# Install multiple models
ollama pull mistral
ollama pull codellama

# List installed models
ollama list
```

## Model-Specific Configuration

### Default Parameters

The application uses these default parameters for Ollama models in `/backend/main.js`:

```javascript
options: {
  temperature: 0.7,  // Controls randomness (0.0-2.0)
  top_p: 0.9,        // Nucleus sampling (0.0-1.0)
  top_k: 40          // Top-k sampling (1-100)
}
```

### Adjusting for Different Models

Different models may perform better with different parameters:

- **Llama3**: Works well with default settings
- **Code models** (codellama, starling-coder): Lower temperature (0.2-0.5) for more deterministic output
- **Creative models**: Higher temperature (0.8-1.0) for more creative output
- **Small models** (phi3, gemma): May benefit from higher temperature for better creativity

### Custom Model Configuration

You can override the default parameters by modifying the chat function in `/backend/main.js`:

```javascript
// Example: Adjust parameters based on model name
const getOptionsForModel = (modelName) => {
  switch(modelName) {
    case 'codellama':
      return {
        temperature: 0.3,
        top_p: 0.8,
        top_k: 40,
        num_ctx: 4096  // Context size
      };
    case 'phi3':
      return {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50
      };
    default:
      return {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40
      };
  }
};
```

## Optimizing Model Performance

### Memory Management

- **Context Window**: Larger models typically support longer context windows
  - Default: 2048 tokens
  - Llama3: Up to 8192 tokens
  - Phi3: Up to 4096 tokens

- **Concurrent Requests**: By default, the application handles one request at a time per model

### Performance Tips

1. **Use appropriate model size**:
   - Small models (3-7B): Good for basic tasks, faster response
   - Medium models (8-15B): Good balance of performance and capability
   - Large models (30B+): Best for complex tasks, but slower

2. **Adjust context length**:
   ```bash
   # Create a model with specific context size
   ollama create my-model -f Modelfile --parameter num_ctx 4096
   ```

3. **GPU Acceleration**:
   - Ensure Ollama is configured to use GPU acceleration
   - Set environment variables if needed:
   ```bash
   export OLLAMA_NUM_PARALLEL=2  # Number of parallel requests
   ```

## Creating Custom Models

### Using Modelfiles

You can create custom models with specific instructions or fine-tuning:

```Dockerfile
FROM llama3

# Set a custom system message
SYSTEM "You are a helpful AI assistant specialized in software development. Always provide code examples in TypeScript when asked about programming questions."

# Set parameter defaults
PARAMETER temperature 0.5
PARAMETER top_k 40
```

Save this as `Modelfile` and create the model:

```bash
ollama create my-custom-model -f Modelfile
```

### Integrating Custom Models

1. Create your Modelfile
2. Build the model: `ollama create model-name -f Modelfile`
3. Use in the chat interface - it will automatically appear in the model dropdown

### Example: Code Assistant Model

```Dockerfile
FROM codellama

# System prompt for code assistance
SYSTEM "You are an expert software developer. Provide accurate, efficient code examples. Be concise but thorough in explanations. When answering questions, provide working code first, then explanations."

# Parameters optimized for code generation
PARAMETER temperature 0.4
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
```

## Model Comparison

### Performance Characteristics

| Model | Speed (tokens/sec) | Memory Usage | Best Use Cases |
|-------|-------------------|--------------|----------------|
| phi3 | Fast | Low (2GB) | Quick responses, mobile |
| llama3:8b | Medium | Medium (5GB) | General purpose |
| mistral | Medium | Medium (5GB) | Conversational |
| codellama | Medium | Medium (5GB) | Coding tasks |
| llama3:70b | Slow | High (40GB) | Complex reasoning |

### Model Capabilities

- **General models** (llama3, mistral): Good for general conversations
- **Code models** (codellama, starling-coder): Better at programming tasks
- **Small models** (phi3, gemma): Faster but less capable
- **Specialized models**: Trained for specific domains

## Troubleshooting Ollama Models

### Common Issues

1. **Model not appearing in dropdown**:
   - Verify the model is installed: `ollama list`
   - Restart the application to refresh model list

2. **Slow responses**:
   - Check system resources (RAM/CPU)
   - Consider using a smaller model
   - Verify GPU acceleration is working

3. **"Model not found" errors**:
   - Confirm model name spelling: `ollama list`
   - Ensure Ollama is running: `ollama serve`

### Optimizing for Your Hardware

#### For Low-End Systems (<8GB RAM)
- Use phi3 or gemma models
- Limit concurrent requests
- Reduce context window size

#### For Mid-Range Systems (8-16GB RAM)
- Use llama3:8b or mistral
- Enable GPU acceleration if available
- Adjust temperature settings for better performance

#### For High-End Systems (>16GB RAM)
- Use larger models like llama3:70b
- Increase context window size
- Enable multiple concurrent requests

## Advanced Ollama Configuration

### Environment Variables

Ollama supports various environment variables:

```bash
# Number of parallel requests
export OLLAMA_NUM_PARALLEL=2

# GPU devices to use (for CUDA)
export OLLAMA_GPU_DEVICES="0,1"

# Memory fraction to use
export OLLAMA_FLASH_ATTENTION=1  # Enable Flash Attention if supported
```

### Model-Specific Endpoints

You can configure different Ollama endpoints for different purposes in your `mcp.json`:

```json
{
  "tools": [
    {
      "name": "fast_model",
      "description": "Quick responses with smaller model",
      "endpoint": "/api/tools/ollama_call_fast",
      "input_schema": { ... }
    },
    {
      "name": "large_model",
      "description": "Complex reasoning with larger model",
      "endpoint": "/api/tools/ollama_call_large",
      "input_schema": { ... }
    }
  ]
}
```

## Best Practices

1. **Start with default models** like llama3 before experimenting with others
2. **Monitor resource usage** and adjust model selection accordingly
3. **Test different parameters** to optimize for your specific use cases
4. **Use system messages** in modelfiles to specialize models for your needs
5. **Keep models updated** by regularly pulling the latest versions