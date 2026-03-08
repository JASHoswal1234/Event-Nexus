import React from 'react';

const Select = ({ options = [], value = '', onChange, className = '', placeholder = 'Select an option', ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
