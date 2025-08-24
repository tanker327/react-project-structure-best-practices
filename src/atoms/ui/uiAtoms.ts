import { atom, injectStore } from '@zedux/react';

export const themeAtom = atom('theme', () => {
  const store = injectStore<'light' | 'dark' | 'auto'>('light');
  return store;
});

export const notificationAtom = atom('notification', () => {
  const store = injectStore<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    store.setState({
      message,
      type,
      isVisible: true,
    });

    setTimeout(() => {
      store.setState(null);
    }, 5000);
  };

  const hideNotification = () => {
    store.setState(null);
  };

  return { store, showNotification, hideNotification };
});

export const sidebarAtom = atom('sidebar', () => {
  const store = injectStore({
    isOpen: false,
    content: null as React.ReactNode | null,
  });

  const openSidebar = (content?: React.ReactNode) => {
    store.setState({
      isOpen: true,
      content: content || null,
    });
  };

  const closeSidebar = () => {
    store.setState({
      isOpen: false,
      content: null,
    });
  };

  return { store, openSidebar, closeSidebar };
});