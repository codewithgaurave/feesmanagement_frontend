import React from 'react';
import { smartPrint } from '../utils/printUtils';
import { HiPrinter } from 'react-icons/hi';

const PrintButton = ({ 
  pageType = 'general', 
  pageData = null, 
  text = 'Print', 
  className = '',
  variant = 'primary',
  size = 'md',
  icon = true,
  disabled = false,
  onClick = null
}) => {
  const handlePrint = () => {
    if (onClick) {
      onClick();
    } else {
      smartPrint(pageData, pageType);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 border-green-600';
      case 'outline':
        return 'bg-white text-blue-600 hover:bg-blue-50 border-blue-600 border';
      case 'ghost':
        return 'bg-transparent text-blue-600 hover:bg-blue-50 border-transparent';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = 'rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={handlePrint}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
      title={`Print ${text}`}
    >
      {icon && <HiPrinter className="w-4 h-4" />}
      <span>{text}</span>
    </button>
  );
};

// Specific print button variants for common use cases
export const PrintReceiptButton = ({ fee, student, ...props }) => (
  <PrintButton
    pageType="fee-receipt"
    pageData={{ fee, student }}
    text="Print Receipt"
    variant="success"
    {...props}
  />
);

export const PrintStudentListButton = ({ students, filters, ...props }) => {
  console.log('PrintStudentListButton data:', { students, filters });
  return (
    <PrintButton
      pageType="student-list"
      pageData={{ students, filters }}
      text="Print Student List"
      {...props}
      className='bg-blue-400 hover:bg-blue-400'
    />
  );
};

export const PrintFeeListButton = ({ fees, filters, ...props }) => (
  <PrintButton
    pageType="fee-list"
    pageData={{ fees, filters }}
    text="Print Fee Report"
    {...props}
  />
);

export const PrintStudentDetailsButton = ({ student, fees, ...props }) => {
  console.log('PrintStudentDetailsButton data:', { student, fees });
  return (
    <PrintButton
      pageType="student-details"
      pageData={{ student, fees }}
      text="Print Student Details"
      {...props}
    />
  );
};

export const PrintDueNoticeButton = ({ fee, student, ...props }) => (
  <PrintButton
    pageType="due-notice"
    pageData={{ fee, student }}
    text="Print Due Notice"
    variant="secondary"
    {...props}
  />
);

export const PrintPageButton = ({ pageTitle, ...props }) => (
  <PrintButton
    pageType="general"
    pageData={{ title: pageTitle }}
    text="Print Page"
    variant="outline"
    {...props}
  />
);

export default PrintButton;