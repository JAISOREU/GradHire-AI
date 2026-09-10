import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type FormFieldProps = {
  label: string;
  id: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  children?: React.ReactNode;
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  iconRight?: React.ReactNode;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
};

export const FormField = ({ label, id, error, success, hint, required, children }: FormFieldProps) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text" htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm text-danger" role="alert">{error}</p>}
      {success && !error && <p id={`${id}-success`} className="text-sm text-success" role="status">{success}</p>}
      {hint && !error && !success && <p id={`${id}-hint`} className="text-sm text-text-tertiary">{hint}</p>}
    </div>
  );
};

export const FormInput = forwardRef<HTMLInputElement, InputProps>(({ label, id, error, success, hint, required, className = '', iconRight, ...rest }, ref) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FormField label={label} id={inputId} error={error} success={success} hint={hint} required={required}>
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            iconRight && 'pr-10',
            error && 'border-danger focus-visible:ring-danger',
            success && 'border-success focus-visible:ring-success',
            className
          )}
          required={required}
          aria-invalid={!!error}
          ref={ref}
          {...rest}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {iconRight}
          </div>
        )}
      </div>
    </FormField>
  );
});

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, id, error, success, hint, required, className = '', ...rest }, ref) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FormField label={label} id={inputId} error={error} success={success} hint={hint} required={required}>
      <textarea
        id={inputId}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm transition-colors placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus-visible:ring-danger',
          success && 'border-success focus-visible:ring-success',
          className
        )}
        required={required}
        aria-invalid={!!error}
        ref={ref}
        {...rest}
      />
    </FormField>
  );
});

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(({ label, id, error, success, hint, required, options, className = '', ...rest }, ref) => {
  const selectId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FormField label={label} id={selectId} error={error} success={success} hint={hint} required={required}>
      <select
        id={selectId}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus-visible:ring-danger',
          success && 'border-success focus-visible:ring-success',
          className
        )}
        required={required}
        aria-invalid={!!error}
        ref={ref}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
});
