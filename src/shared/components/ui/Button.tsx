import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  outline: 'bg-white text-primary-600 border-1.5 border-primary-600 hover:bg-primary-50',
  danger: 'bg-white text-red-600 border-1.5 border-red-600 hover:bg-red-50',
  ghost: 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100',
};

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-md px-4 py-2 text-sm
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
