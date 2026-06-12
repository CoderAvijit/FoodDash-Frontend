import { createContext, useContext, useState, useCallback } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = ++idSeq;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  const icon = {
    success: <FiCheckCircle className="text-green-500" />,
    error: <FiAlertCircle className="text-red-500" />,
    info: <FiInfo className="text-brand-500" />,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="card flex items-center gap-3 px-4 py-3 text-sm font-medium animate-pop-in"
          >
            <span className="text-lg">{icon[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
