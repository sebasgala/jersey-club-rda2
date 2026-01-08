import React from 'react';

const Button = ({ children, size = 'md', className = '', ...props }) => {
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`rounded ${sizes[size]} ${className} transform transition-transform duration-300 hover:scale-105`}
      style={{ backgroundColor: '#BF1919', color: 'white' }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;