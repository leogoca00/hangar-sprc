import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// INPUT
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-sprc-navy/60 border rounded-xl',
            'text-slate-100 placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            error
              ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
              : 'border-slate-700/50 focus:ring-sprc-orange/50 focus:border-sprc-orange/50',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// SELECT
// ============================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border rounded-xl',
            'text-slate-100 cursor-pointer appearance-none',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
            'bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]',
            error
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-slate-700/50 focus:ring-sprc-orange/50 focus:border-sprc-orange/50',
            className
          )}
          style={{ backgroundColor: '#0a1628' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled style={{ backgroundColor: '#0a1628', color: '#94a3b8' }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option 
              key={opt.value} 
              value={opt.value} 
              style={{ backgroundColor: '#0a1628', color: '#e2e8f0' }}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================
// TEXTAREA
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-sprc-navy/60 border rounded-xl',
            'text-slate-100 placeholder:text-slate-500 resize-none min-h-[100px]',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            error
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-slate-700/50 focus:ring-sprc-orange/50 focus:border-sprc-orange/50',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================
// CHECKBOX
// ============================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'w-5 h-5 rounded border-2 border-slate-600 bg-sprc-navy/60',
            'checked:bg-sprc-orange checked:border-sprc-orange',
            'focus:ring-2 focus:ring-sprc-orange/50 focus:ring-offset-0',
            'transition-colors cursor-pointer',
            className
          )}
          {...props}
        />
        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
          {label}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================
// RADIO GROUP
// ============================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
}

export function RadioGroup({ name, options, value, onChange, label, className }: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              value === option.value
                ? 'border-sprc-orange/50 bg-sprc-orange/10'
                : 'border-slate-700/50 hover:border-slate-600'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="mt-0.5 w-4 h-4 text-sprc-orange border-slate-600 bg-sprc-navy/60 focus:ring-sprc-orange/50"
            />
            <div>
              <span className="text-sm font-medium text-white">{option.label}</span>
              {option.description && (
                <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
