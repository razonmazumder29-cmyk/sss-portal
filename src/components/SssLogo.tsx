import React from 'react';

interface SssLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'rounded' | 'circle' | 'square';
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28'
};

const variantClasses = {
  rounded: 'rounded-2xl',
  circle: 'rounded-full',
  square: 'rounded-none'
};

export const SssLogo: React.FC<SssLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'rounded'
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center bg-white p-0.5 shadow-xs border border-emerald-500/25 overflow-hidden shrink-0 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}sss_logo.svg`}
        alt="SSS Logo"
        loading="eager"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    </div>
  );
};
