import { useEffect } from "react";

export default function ErrorToast({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="error-toast">
      <span>{message}</span>
      <button onClick={onClose} className="error-toast-close">&times;</button>
    </div>
  );
}
