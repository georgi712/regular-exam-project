import React, { createContext, useContext } from 'react';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

// Create toast context
const ToastContext = createContext(null);

// Custom hook to use toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const toast = useToast();
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastContext; 