import React from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';

const ToastContainer = ({ toasts, removeToast }) => {
  return ReactDOM.createPortal(
    <div className="toast-container fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer; 