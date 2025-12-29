import React from 'react';

// Responsive Container Component
export const ResponsiveContainer = ({ children, className = '', maxWidth = 'full' }) => {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  return (
    <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto px-3 sm:px-4 lg:px-6 ${className}`}>
      {children}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4 }, 
  gap = 'md',
  className = '' 
}) => {
  const gapClasses = {
    'xs': 'gap-2',
    'sm': 'gap-3',
    'md': 'gap-4',
    'lg': 'gap-6',
    'xl': 'gap-8'
  };

  const colClasses = `grid grid-cols-${cols.xs} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`;

  return (
    <div className={`${colClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Card Component
export const ResponsiveCard = ({ 
  children, 
  padding = 'md', 
  shadow = 'sm', 
  rounded = 'lg',
  className = '' 
}) => {
  const paddingClasses = {
    'xs': 'p-2 sm:p-3',
    'sm': 'p-3 sm:p-4',
    'md': 'p-4 sm:p-6',
    'lg': 'p-6 sm:p-8',
    'xl': 'p-8 sm:p-10'
  };

  const shadowClasses = {
    'none': 'shadow-none',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl'
  };

  const roundedClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg sm:rounded-xl',
    'xl': 'rounded-xl sm:rounded-2xl',
    '2xl': 'rounded-2xl sm:rounded-3xl'
  };

  return (
    <div className={`bg-white border border-gray-100 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Button Component
export const ResponsiveButton = ({ 
  children, 
  size = 'md', 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    'xs': 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
    'sm': 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base',
    'md': 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
    'lg': 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg',
    'xl': 'px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl'
  };

  const variantClasses = {
    'primary': 'bg-blue-500 hover:bg-blue-600 text-white',
    'secondary': 'bg-gray-500 hover:bg-gray-600 text-white',
    'success': 'bg-green-500 hover:bg-green-600 text-white',
    'danger': 'bg-red-500 hover:bg-red-600 text-white',
    'warning': 'bg-yellow-500 hover:bg-yellow-600 text-white',
    'outline': 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button 
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Responsive Input Component
export const ResponsiveInput = ({ 
  label, 
  error, 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    'sm': 'px-3 py-2 text-sm',
    'md': 'px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base',
    'lg': 'px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg'
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input 
        className={`w-full ${sizeClasses[size]} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Responsive Flex Component
export const ResponsiveFlex = ({ 
  children, 
  direction = { xs: 'col', sm: 'row' }, 
  align = 'start', 
  justify = 'start',
  gap = 'md',
  wrap = true,
  className = '' 
}) => {
  const gapClasses = {
    'xs': 'gap-1 sm:gap-2',
    'sm': 'gap-2 sm:gap-3',
    'md': 'gap-3 sm:gap-4',
    'lg': 'gap-4 sm:gap-6',
    'xl': 'gap-6 sm:gap-8'
  };

  const directionClass = `flex-${direction.xs} sm:flex-${direction.sm}`;
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';

  return (
    <div className={`flex ${directionClass} ${alignClass} ${justifyClass} ${wrapClass} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Text Component
export const ResponsiveText = ({ 
  children, 
  size = 'base', 
  weight = 'normal', 
  color = 'gray-900',
  className = '' 
}) => {
  const sizeClasses = {
    'xs': 'text-xs sm:text-sm',
    'sm': 'text-sm sm:text-base',
    'base': 'text-base sm:text-lg',
    'lg': 'text-lg sm:text-xl',
    'xl': 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl'
  };

  const weightClasses = {
    'light': 'font-light',
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold'
  };

  return (
    <span className={`${sizeClasses[size]} ${weightClasses[weight]} text-${color} ${className}`}>
      {children}
    </span>
  );
};

// Responsive Heading Component
export const ResponsiveHeading = ({ 
  children, 
  level = 1, 
  size = 'auto', 
  weight = 'bold',
  color = 'gray-900',
  className = '' 
}) => {
  const autoSizeClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl',
    2: 'text-xl sm:text-2xl lg:text-3xl',
    3: 'text-lg sm:text-xl lg:text-2xl',
    4: 'text-base sm:text-lg lg:text-xl',
    5: 'text-sm sm:text-base lg:text-lg',
    6: 'text-xs sm:text-sm lg:text-base'
  };

  const manualSizeClasses = {
    'xs': 'text-xs sm:text-sm',
    'sm': 'text-sm sm:text-base',
    'base': 'text-base sm:text-lg',
    'lg': 'text-lg sm:text-xl',
    'xl': 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl'
  };

  const weightClasses = {
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
    'extrabold': 'font-extrabold'
  };

  const sizeClass = size === 'auto' ? autoSizeClasses[level] : manualSizeClasses[size];
  const Tag = `h${level}`;

  return (
    <Tag className={`${sizeClass} ${weightClasses[weight]} text-${color} ${className}`}>
      {children}
    </Tag>
  );
};

// Responsive Modal Component
export const ResponsiveModal = ({ 
  children, 
  isOpen, 
  onClose, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md sm:max-w-lg',
    'lg': 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    'xl': 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
    'full': 'max-w-full sm:max-w-[95vw] lg:max-w-[90vw]'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        <div className={`inline-block w-full ${sizeClasses[size]} p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg sm:rounded-2xl ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveInput,
  ResponsiveFlex,
  ResponsiveText,
  ResponsiveHeading,
  ResponsiveModal
};