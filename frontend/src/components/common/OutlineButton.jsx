import React from 'react';

const OutlineButton = ({ children, className = '', onClick, type = 'button', disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

export default OutlineButton;
