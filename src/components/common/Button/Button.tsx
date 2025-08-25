import React from 'react';
import type { ButtonVariant, SizeVariant } from '@/types/common.types';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: SizeVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'btn';
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const fullWidthClasses = fullWidth ? 'btn--full-width' : '';
  const loadingClasses = loading ? 'btn--loading' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    fullWidthClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn__spinner">⟳</span>}
      <span className={loading ? 'btn__content--hidden' : ''}>{children}</span>
    </button>
  );
};