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
  const baseClasses = 'rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-900',
    outline: 'border border-black text-black hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    md: 'min-h-[44px] px-6 py-2.5 text-base',
    lg: 'min-h-[48px] px-8 py-3 text-lg',
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
