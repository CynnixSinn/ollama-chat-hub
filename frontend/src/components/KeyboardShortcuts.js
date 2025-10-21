import { useEffect } from 'react';
import { useAppStore } from '../state/appStore';

export const KeyboardShortcuts = () => {
  const setShowSettings = useAppStore(state => state.setShowSettings);
  const models = useAppStore(state => state.models);
  const setSelectedModel = useAppStore(state => state.setSelectedModel);
  const selectedModel = useAppStore(state => state.selectedModel);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts from triggering when in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl + / : Open model selector
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        document.querySelector('.model-selector')?.focus();
      }
      
      // Ctrl + M : Toggle microphone/voice input
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        const micButton = document.querySelector('[title="Toggle Recording"]');
        if (micButton) {
          micButton.click();
        }
      }
      
      // Ctrl + T : Toggle tool calling mode (this would open tool settings)
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        setShowSettings(true);
      }
      
      // Ctrl + Shift + M : Toggle settings panel
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      
      // Ctrl + Shift + K : Show keyboard shortcuts help
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        alert(`
Keyboard Shortcuts:
- Ctrl + / : Focus model selector
- Ctrl + M : Toggle microphone
- Ctrl + T : Open settings
- Ctrl + Shift + M : Toggle settings panel
- Ctrl + Shift + K : Show this help
- Shift + Enter : New line in chat input
- Enter : Send message
        `);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowSettings]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;