import React from 'react';

const Button = ({ 
  children, 
  className = '', 
  onClick, 
  type = 'button', 
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
