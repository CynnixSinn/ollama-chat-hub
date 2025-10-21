import React, { useState } from 'react';
import { FaDownload, FaCopy, FaTimes } from 'react-icons/fa';
import { useAppStore } from '../state/appStore';

export const ArtifactPanel = () => {
  const artifacts = useAppStore(state => state.artifacts);
  const [expandedArtifact, setExpandedArtifact] = useState(null);

  const downloadArtifact = (artifact) => {
    // Create a temporary link to download the artifact
    const link = document.createElement('a');
    link.href = artifact.url || `data:${artifact.mimeType || 'application/octet-stream'};base64,${artifact.content}`;
    link.download = artifact.name || 'artifact';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      // Show a temporary notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
      notification.textContent = 'Copied to clipboard!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    });
  };

  const toggleExpand = (id) => {
    setExpandedArtifact(expandedArtifact === id ? null : id);
  };

  if (artifacts.length === 0) {
    return (
      <div className="w-80 border-l border-dark-600 p-4 flex items-center justify-center">
        <div className="text-center text-dark-400">
          <div className="text-4xl mb-2">📁</div>
          <p>No artifacts yet</p>
          <p className="text-sm">Artifacts will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-dark-600 p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <span>Artifacts</span>
        <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
          {artifacts.length}
        </span>
      </h3>
      
      <div className="space-y-4">
        {artifacts.map((artifact) => (
          <div key={artifact.id || artifact.name} className="artifact-container">
            <div className="artifact-header">
              <h4 className="font-medium truncate">{artifact.name || 'Unnamed Artifact'}</h4>
              <div className="flex space-x-1">
                {artifact.type === 'code' && (
                  <button 
                    onClick={() => copyToClipboard(artifact.content)}
                    className="btn-icon text-sm"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                )}
                <button 
                  onClick={() => downloadArtifact(artifact)}
                  className="btn-icon text-sm"
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button 
                  onClick={() => toggleExpand(artifact.id || artifact.name)}
                  className="btn-icon text-sm"
                  title={expandedArtifact === (artifact.id || artifact.name) ? "Collapse" : "Expand"}
                >
                  {expandedArtifact === (artifact.id || artifact.name) ? "-" : "+"}
                </button>
              </div>
            </div>
            
            <div className="artifact-content">
              {artifact.type === 'image' ? (
                <img 
                  src={artifact.url || `data:image/png;base64,${artifact.content}`} 
                  alt={artifact.name} 
                  className="w-full rounded-md"
                />
              ) : artifact.type === 'code' ? (
                <div className={`${expandedArtifact === (artifact.id || artifact.name) ? '' : 'max-h-32 overflow-hidden'} bg-dark-700 p-2 rounded`}>
                  <pre className="text-xs overflow-x-auto">
                    <code>{artifact.content}</code>
                  </pre>
                </div>
              ) : artifact.type === 'file' ? (
                <div className="text-sm">
                  <div className="flex items-center p-2 bg-dark-700 rounded">
                    <div className="mr-2">📄</div>
                    <div className="truncate">{artifact.name}</div>
                  </div>
                  <div className="mt-2 text-xs text-dark-400">
                    Size: {artifact.size || 'Unknown'}
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  {artifact.preview || 'Artifact preview'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};