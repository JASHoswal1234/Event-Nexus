import React from 'react';

const Card = ({ title, description, children, actions, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
        </div>
      )}
      
      {children && (
        <div className="mb-4">
          {children}
        </div>
      )}
      
      {actions && (
        <div className="flex justify-end space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;
