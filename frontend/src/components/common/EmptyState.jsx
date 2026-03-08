import React from 'react';

const EmptyState = ({ title, description, icon, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mx-auto mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;
