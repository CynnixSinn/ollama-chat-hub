import React, { useEffect, useRef } from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ArtifactPanel } from './ArtifactPanel';
import { useAppStore } from '../state/appStore';

export const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const messages = useAppStore(state => state.messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex w-full h-full">
      <div className="flex-grow flex flex-col">
        <ChatMessages />
        <ChatInput />
        <div ref={messagesEndRef} />
      </div>
      <ArtifactPanel />
    </div>
  );
};