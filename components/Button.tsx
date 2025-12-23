import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'action';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "px-6 py-2 rounded-lg font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
  
  const variants = {
    // Darker shade of #143628 (Forest Green) for hover
    primary: "bg-library-navy text-white hover:bg-[#0C2219] shadow-library-navy/20",
    secondary: "bg-white border border-gray-300 text-library-navy hover:bg-gray-50",
    ghost: "bg-transparent text-library-navy hover:bg-black/5 shadow-none",
    // Darker shade of #C27803 (Gold) for hover
    action: "bg-library-orange text-white hover:bg-[#9A5F02] shadow-library-orange/30 font-semibold"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : null}
      {children}
    </button>
  );
};