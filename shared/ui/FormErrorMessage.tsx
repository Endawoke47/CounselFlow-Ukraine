import React from 'react';
import { FieldError, FieldErrors } from 'react-hook-form';

interface FormErrorMessageProps {
  errors: FieldErrors;
  name: string;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  errors,
  name,
}) => {
  const error = errors[name] as FieldError | undefined;

  return error && <p className="text-red-500 text-sm">{error.message}</p>;
};
