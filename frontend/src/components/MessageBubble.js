import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { FaRobot, FaUser } from 'react-icons/fa';

export const MessageBubble = ({ message }) => {
  const { role, content } = message;

  // Function to handle code blocks in markdown
  const renderCodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={dracula}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg fade-in ${
      role === 'user' ? 'message-user' : 'message-ai'
    }`}>
      <div className="flex-shrink-0">
        <div className={`p-2 rounded-full ${
          role === 'user' ? 'bg-dark-500' : 'bg-primary-500'
        }`}>
          {role === 'user' ? (
            <FaUser className="text-white" />
          ) : (
            <FaRobot className="text-white" />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium mb-1">
          {role === 'user' ? 'You' : 'Assistant'}
        </div>
        <div className="text-white prose prose-invert max-w-none">
          <ReactMarkdown 
            components={{
              code: renderCodeBlock,
              pre: ({ node, ...props }) => (
                <pre className="bg-dark-700 p-3 rounded-md overflow-x-auto" {...props} />
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};