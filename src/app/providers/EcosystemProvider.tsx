import React from 'react';
import { EcosystemProvider } from '@zedux/react';
import { ecosystem } from '@/ecosystem/ecosystem';

export const AppEcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <EcosystemProvider ecosystem={ecosystem}>
      {children}
    </EcosystemProvider>
  );
};