import React from 'react';
import { useToastContext } from '../../contexts/ToastContext';

const ToastDemo = () => {
  const toast = useToastContext();

  return (
    <div className="card bg-base-100 shadow-xl p-6 max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Toast Notifications Demo</h2>
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="btn btn-success" 
          onClick={() => toast.success('Operation completed successfully!')}
        >
          Success Toast
        </button>
        
        <button 
          className="btn btn-error" 
          onClick={() => toast.error('Something went wrong!')}
        >
          Error Toast
        </button>
        
        <button 
          className="btn btn-warning" 
          onClick={() => toast.warning('Please be careful with this action.')}
        >
          Warning Toast
        </button>
        
        <button 
          className="btn btn-info" 
          onClick={() => toast.info('Here is some information for you.')}
        >
          Info Toast
        </button>
        
        <button 
          className="btn btn-primary col-span-2" 
          onClick={() => {
            const id = toast.info('This will disappear in 10 seconds...', 10000);
            console.log('Toast ID:', id);
          }}
        >
          Long Duration Toast (10s)
        </button>
      </div>
    </div>
  );
};

export default ToastDemo; 