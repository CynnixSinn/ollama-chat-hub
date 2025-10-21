import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
import { useAppStore } from '../state/appStore';

export const ChatInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const currentMessage = useAppStore(state => state.currentMessage);
  const setCurrentMessage = useAppStore(state => state.setCurrentMessage);
  const addMessage = useAppStore(state => state.addMessage);
  const startTyping = useAppStore(state => state.startTyping);
  const stopTyping = useAppStore(state => state.stopTyping);
  const selectedModel = useAppStore(state => state.selectedModel);
  const socket = useAppStore(state => state.socket);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedModel) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: inputValue };
    addMessage(userMessage);

    // Prepare messages for API (include history)
    const messages = [...useAppStore.getState().messages, userMessage];

    // Start typing indicator
    startTyping();

    // Send message to backend via socket
    socket.emit('sendMessage', {
      model: selectedModel,
      messages: messages
    });

    // Clear input
    setInputValue('');

    // Listen for response
    socket.off('messageResponse').on('messageResponse', (data) => {
      if (data.done) {
        stopTyping();
      } else if (data.message?.content) {
        // Update the last AI message or add a new one
        const currentState = useAppStore.getState();
        const lastMessage = currentState.messages[currentState.messages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update existing message
          const updatedMessages = [...currentState.messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + data.message.content
          };
          useAppStore.setState({ messages: updatedMessages });
        } else {
          // Add new message
          const aiMessage = { role: 'assistant', content: data.message.content };
          addMessage(aiMessage);
        }
      }
    });

    socket.off('messageComplete').on('messageComplete', () => {
      stopTyping();
    });

    socket.off('messageError').on('messageError', (error) => {
      stopTyping();
      addMessage({ 
        role: 'assistant', 
        content: `Error: ${error.error}` 
      });
    });
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
      setInputValue('');
    }
  };

  return (
    <div className="input-area">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-grow">
          <textarea
            className="input-field resize-none"
            rows="2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here... (Press Ctrl+Enter to send)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-lg flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-dark-600 hover:bg-dark-500'
            } transition-colors duration-200`}
          >
            {isRecording ? <FaStop className="text-white" /> : <FaMicrophone className="text-white" />}
          </button>
          <button
            type="submit"
            disabled={!inputValue.trim() || !selectedModel}
            className="btn-primary p-3 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            <FaPaperPlane className="text-white" />
          </button>
        </div>
      </form>
      <div className="mt-2 text-xs text-dark-400 flex justify-between">
        <div>
          {selectedModel ? `Model: ${selectedModel}` : 'Select a model to start chatting'}
        </div>
        <div>
          Press Ctrl+Enter to send
        </div>
      </div>
    </div>
  );
};