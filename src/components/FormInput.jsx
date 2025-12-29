import React, { useState } from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder = '', 
  options = [], 
  rows = 3,
  className = '',
  icon = null 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  const baseInputClasses = `
    w-full px-4 pt-6 pb-2 text-gray-900 bg-white border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
    transition-all duration-200 peer
    ${className}
  `;

  const labelClasses = `
    absolute left-4 transition-all duration-200 pointer-events-none
    ${isFocused || hasValue 
      ? 'top-2 text-xs text-blue-600 font-medium' 
      : 'top-4 text-gray-500'
    }
  `;

  if (type === 'select') {
    return (
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={baseInputClasses}
          required={required}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className={baseInputClasses}
          required={required}
          placeholder={placeholder}
        />
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    );
  }

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`${baseInputClasses} ${icon ? 'pl-10' : ''}`}
        required={required}
        placeholder={placeholder}
      />
      <label className={`${labelClasses} ${icon ? 'left-10' : ''}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default FormInput;