import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-2.5 border-1.5 rounded-md text-sm outline-none
          transition-colors duration-150
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50' : 'border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
