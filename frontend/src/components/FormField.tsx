import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

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

export const FormField = ({ label, id, error, hint, required, children }: FormFieldProps) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </label>
    {children}
    {error && <div className="form-error" role="alert">{error}</div>}
    {hint && !error && <div className="form-hint">{hint}</div>}
  </div>
);

export const FormInput = ({ label, id, error, hint, required, className = '', ...rest }: InputProps) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FormField label={label} id={inputId} error={error} hint={hint} required={required}>
      <input
        id={inputId}
        className={`input ${error ? 'is-error' : ''} ${className}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
    </FormField>
  );
};

export const FormTextarea = ({ label, id, error, hint, required, className = '', ...rest }: TextareaProps) => {
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FormField label={label} id={inputId} error={error} hint={hint} required={required}>
      <textarea
        id={inputId}
        className={`textarea ${error ? 'is-error' : ''} ${className}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
    </FormField>
  );
};

export const FormSelect = ({ label, id, error, hint, required, options, className = '', ...rest }: SelectProps) => {
  const selectId = id || rest.name || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <FormField label={label} id={selectId} error={error} hint={hint} required={required}>
      <select
        id={selectId}
        className={`select ${error ? 'is-error' : ''} ${className}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
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
};
