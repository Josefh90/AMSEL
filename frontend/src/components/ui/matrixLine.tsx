import React, { useEffect, useState } from 'react';

interface MatrixTypingScrollProps {
  text: string;
  typingSpeed?: number;
  pauseBeforeScroll?: number;
  scrollSpeed?: number;
}

const MatrixTyping: React.FC<MatrixTypingScrollProps> = ({
  text,
  typingSpeed = 100,
  pauseBeforeScroll = 1500,
  scrollSpeed = 100,
}) => {
  const [phase, setPhase] = useState<'typing' | 'pause' | 'scrolling'>('typing');
  const [currentText, setCurrentText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    let timeout: number;

    if (phase === 'typing') {
      if (typingIndex <= text.length) {
        timeout = window.setTimeout(() => {
          setCurrentText(text.slice(0, typingIndex));
          setTypingIndex((prev) => prev + 1);
        }, typingSpeed);
      } else {
        timeout = window.setTimeout(() => {
          setPhase('pause');
        }, pauseBeforeScroll);
      }
    }

    if (phase === 'pause') {
      timeout = window.setTimeout(() => {
        setPhase('scrolling');
        setScrollIndex(0);
      }, pauseBeforeScroll);
    }

    if (phase === 'scrolling') {
      if (scrollIndex < text.length) {
        timeout = window.setTimeout(() => {
          setCurrentText(text.slice(scrollIndex + 1));
          setScrollIndex((prev) => prev + 1);
        }, scrollSpeed);
      } else {
        // restart the loop
        timeout = window.setTimeout(() => {
          setCurrentText('');
          setTypingIndex(0);
          setScrollIndex(0);
          setPhase('typing');
        }, 500);
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, typingIndex, scrollIndex, text, typingSpeed, pauseBeforeScroll, scrollSpeed]);

  return (
    <div className="text-green-500 font-mono text-xl whitespace-pre">
      {currentText}
      {phase === 'typing' && <span className="blink-cursor">▌</span>}
    </div>
  );
};

export default MatrixTyping;
