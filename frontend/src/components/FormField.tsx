import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type FormFieldProps = {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children?: React.ReactNode;
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
};

export const FormField = ({ label, id, error, hint, required, children }: FormFieldProps) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span className="required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <div id={errorId} className="form-error" role="alert">{error}</div>}
      {hint && !error && <div id={hintId} className="form-hint">{hint}</div>}
    </div>
  );
};

export const FormInput = forwardRef<HTMLInputElement, InputProps>(({ label, id, error, hint, required, className = '', ...rest }, ref) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describeId = [error ? errorId : undefined, hint && !error ? hintId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <FormField label={label} id={inputId} error={error} hint={hint} required={required}>
      <input
        id={inputId}
        className={`input ${error ? 'is-error' : ''} ${className}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describeId}
        ref={ref}
        {...rest}
      />
    </FormField>
  );
});

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, id, error, hint, required, className = '', ...rest }, ref) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describeId = [error ? errorId : undefined, hint && !error ? hintId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <FormField label={label} id={inputId} error={error} hint={hint} required={required}>
      <textarea
        id={inputId}
        className={`textarea ${error ? 'is-error' : ''} ${className}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describeId}
        ref={ref}
        {...rest}
      />
    </FormField>
  );
});

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(({ label, id, error, hint, required, options, className = '', ...rest }, ref) => {
  const selectId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;
  const describeId = [error ? errorId : undefined, hint && !error ? hintId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <FormField label={label} id={selectId} error={error} hint={hint} required={required}>
      <select
        id={selectId}
        className={`select ${error ? 'is-error' : ''} ${className}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describeId}
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
