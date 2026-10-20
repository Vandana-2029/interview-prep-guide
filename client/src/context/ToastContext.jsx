import { createContext, useCallback, useContext, useRef, useState } from 'react';

// A tiny message that pops up at the bottom ("Streak: 3 days") and disappears after 2 seconds.
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef();

  const toast = useCallback((message) => {
    setText(message);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
        {text}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
