import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppEcosystemProvider } from './providers/EcosystemProvider';
import { AppRoutes } from '@/routes';
import { Layout } from '@/components/layout';
import './App.css';

export const App: React.FC = () => {
  return (
    <AppEcosystemProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </AppEcosystemProvider>
  );
};