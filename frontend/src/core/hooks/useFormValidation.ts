import { useState } from 'react';
import { z } from 'zod';

type ValidationSchema<T> = z.ZodType<T>;

interface UseFormValidationOptions<T extends Record<string, unknown>> {
  schema: ValidationSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormValidationReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: unknown) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: T): Partial<Record<keyof T, string>> => {
    try {
      schema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        for (const issue of error.issues) {
          const field = issue.path[0] as keyof T;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        return fieldErrors;
      }
      return {};
    }
  };

  const handleChange = (field: keyof T, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      const fieldErrors = validate(next);
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        if (fieldErrors[field]) {
          nextErrors[field] = fieldErrors[field]!;
        } else {
          delete nextErrors[field];
        }
        return nextErrors;
      });
      return next;
    });
  };

  const handleBlur = (field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(values);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldErrors[field]) {
        next[field] = fieldErrors[field]!;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    const fieldErrors = validate(values);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset };
}
