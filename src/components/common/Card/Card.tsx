import React from 'react';
import type { PaddingVariant, ShadowVariant } from '@/types/common.types';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: PaddingVariant;
  shadow?: ShadowVariant;
}

export const Card = ({
  children,
  className = '',
  padding = 'medium',
  shadow = 'small',
}: CardProps) => {
  const cardClasses = [
    'card',
    `card--padding-${padding}`,
    `card--shadow-${shadow}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};