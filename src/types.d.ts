interface Window {
  Telegram?: {
    WebApp?: {
      HapticFeedback?: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
      };
      shareMessage: (message: string) => void;
      // Add other WebApp methods as needed
    };
  };
}
