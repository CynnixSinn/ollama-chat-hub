import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { SettingsPanel } from './SettingsPanel';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useAppStore } from '../state/appStore';

export const AppLayout = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'models', 'settings'
  const showSettings = useAppStore(state => state.showSettings);
  const setShowSettings = useAppStore(state => state.setShowSettings);

  return (
    <div className="flex w-full h-full">
      <KeyboardShortcuts />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-grow flex">
        {activeTab === 'chat' && <ChatArea />}
        {activeTab === 'models' && <div className="p-4">Models List Placeholder</div>}
        {activeTab === 'history' && <div className="p-4">Chat History Placeholder</div>}
      </div>
      {showSettings && (
        <SettingsPanel />
      )}
    </div>
  );
};