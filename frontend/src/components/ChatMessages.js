import React from 'react';
import { MessageBubble } from './MessageBubble';
import { useAppStore } from '../state/appStore';
import { FaRobot, FaUser } from 'react-icons/fa';

export const ChatMessages = () => {
  const messages = useAppStore(state => state.messages);
  const isTyping = useAppStore(state => state.isTyping);

  return (
    <div className="message-container">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <FaRobot className="text-5xl text-primary-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Ollama Chat Hub</h2>
          <p className="text-dark-300 max-w-md">
            Start chatting with your local Ollama models. Select a model from the sidebar and type your message below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isTyping && (
            <div className="flex items-start space-x-3 p-4 message-ai rounded-lg fade-in">
              <div className="flex-shrink-0">
                <div className="bg-primary-500 p-2 rounded-full">
                  <FaRobot className="text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-3 bg-dark-500 rounded w-8"></div>
                  <div className="h-3 bg-dark-500 rounded w-8"></div>
                  <div className="h-3 bg-dark-500 rounded w-8"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};