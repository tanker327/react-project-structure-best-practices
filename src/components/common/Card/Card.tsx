import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
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