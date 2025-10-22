import { create } from 'zustand';
import { io } from 'socket.io-client';

// Create a socket connection to the backend
const socket = io({
  transports: ['websocket', 'polling']
});

export const useAppStore = create((set, get) => ({
  // App state
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
  
  // Model state
  models: [],
  selectedModel: null,
  loadingModels: false,
  setSelectedModel: (model) => set({ selectedModel: model }),
  loadModels: async () => {
    set({ loadingModels: true });
    socket.emit('getModels');
    
    // Remove previous listeners to prevent duplicates
    socket.off('models').on('models', (data) => {
      set({ models: data.models || [], loadingModels: false });
      if (!get().selectedModel && data.models && data.models.length > 0) {
        set({ selectedModel: data.models[0].name });
      }
    });
  },
  
  // Chat state
  messages: [],
  isTyping: false,
  currentMessage: '',
  setCurrentMessage: (message) => set({ currentMessage: message }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  startTyping: () => set({ isTyping: true }),
  stopTyping: () => set({ isTyping: false }),
  clearMessages: () => set({ messages: [] }),
  
  // Artifacts state
  artifacts: [],
  addArtifact: (artifact) => set((state) => ({ artifacts: [...state.artifacts, artifact] })),
  
  // Tools state
  tools: [],
  loadingTools: false,
  loadTools: async () => {
    // In a real implementation, this would fetch tools from the backend
    set({ loadingTools: true });
    try {
      // Simulate loading tools
      setTimeout(() => {
        set({ tools: [], loadingTools: false });
      }, 500);
    } catch (error) {
      set({ loadingTools: false });
    }
  },
  
  // MCP state
  mcpServers: [],
  connectedMcpServers: [],
  
  // Socket connection
  socket,
  
  // Initialize the store
  init: () => {
    // Set up socket listeners
    socket.off('artifactCreated').on('artifactCreated', (artifact) => {
      get().addArtifact(artifact);
    });
    
    // Load initial data
    get().loadModels();
    get().loadTools();
  }
}));