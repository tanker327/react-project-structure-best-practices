import { atom, injectStore, api } from '@zedux/react';
import type { ThemeVariant, NotificationType } from '@/types/common.types';

export const themeAtom = atom('theme', () => {
  const store = injectStore<ThemeVariant>('light');
  return store;
});

export const notificationAtom = atom('notification', () => {
  const store = injectStore<{
    message: string;
    type: NotificationType;
    isVisible: boolean;
  } | null>(null);

  const showNotification = (message: string, type: NotificationType = 'info') => {
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

  return api(store).setExports({
    showNotification,
    hideNotification,
  });
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

  return api(store).setExports({
    openSidebar,
    closeSidebar,
  });
});