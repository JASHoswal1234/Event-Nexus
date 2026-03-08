import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      // Lock scroll when modal opens
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll when modal closes
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg p-6 w-full mx-4 sm:max-w-md max-h-[90vh] overflow-y-auto relative ${className}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
