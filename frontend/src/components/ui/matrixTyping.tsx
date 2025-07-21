import React, { useEffect, useState } from 'react';

interface MatrixTypingProps {
  messages: string[];
  typingSpeed?: number;
  pauseBeforeScroll?: number;
  deleteSpeed?: number;
  deleteDirection?: 'left' | 'right';
}

const MatrixTyping: React.FC<MatrixTypingProps> = ({
  messages,
  typingSpeed = 100,
  pauseBeforeScroll = 1500,
  deleteSpeed = 50,
  deleteDirection = 'right',
}) => {
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const [currentText, setCurrentText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [deletingIndex, setDeletingIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const currentMessage = messages[messageIndex];

  useEffect(() => {
    let timeout: number;

    if (phase === 'typing') {
      if (typingIndex <= currentMessage.length) {
        timeout = window.setTimeout(() => {
          setCurrentText(currentMessage.slice(0, typingIndex));
          setTypingIndex(prev => prev + 1);
        }, typingSpeed);
      } else {
        timeout = window.setTimeout(() => {
          setPhase('pause');
        }, pauseBeforeScroll);
      }
    }

    if (phase === 'pause') {
      timeout = window.setTimeout(() => {
        setPhase('deleting');
        setDeletingIndex(0);
      }, pauseBeforeScroll);
    }

    if (phase === 'deleting') {
      if (deletingIndex < currentMessage.length) {
        timeout = window.setTimeout(() => {
          const newText =
            deleteDirection === 'right'
              ? currentMessage.slice(deletingIndex + 1)
              : currentMessage.slice(0, currentMessage.length - deletingIndex - 1);
          setCurrentText(newText);
          setDeletingIndex(prev => prev + 1);
        }, deleteSpeed);
      } else {
        timeout = window.setTimeout(() => {
          setTypingIndex(0);
          setDeletingIndex(0);
          setMessageIndex((prev) => (prev + 1) % messages.length); // cycle to next message
          setPhase('typing');
        }, 500);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    phase,
    typingIndex,
    deletingIndex,
    currentMessage,
    typingSpeed,
    pauseBeforeScroll,
    deleteSpeed,
    deleteDirection,
    messages.length,
  ]);

  return (
    <div className="text-green-500 font-mono text-xl" style={{ color: '#267697' }}>
      {currentText}
      {phase === 'typing' && <span className="animate-pulse">▌</span>}
    </div>
  );
};

export default MatrixTyping;
