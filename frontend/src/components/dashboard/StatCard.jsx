import React from 'react';
import Card from '../common/Card';

const StatCard = ({ 
  value, 
  label, 
  color = 'blue', 
  icon = null,
  trend = null,
  className = '' 
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
    indigo: 'bg-indigo-100',
  };

  return (
    <Card className={`text-center hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="py-4">
        {icon && (
          <div className={`w-12 h-12 ${bgColorClasses[color]} rounded-lg flex items-center justify-center mx-auto mb-3`}>
            <div className={colorClasses[color]}>
              {icon}
            </div>
          </div>
        )}
        
        <div className={`text-3xl font-bold ${colorClasses[color]} mb-2`}>
          {value !== null && value !== undefined ? value : 0}
        </div>
        
        <div className="text-gray-600 text-sm font-medium">
          {label}
        </div>

        {trend && (
          <div className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
