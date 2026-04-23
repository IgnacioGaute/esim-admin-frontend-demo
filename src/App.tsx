import { useState, useEffect } from 'react';
import { AppRouter } from './router/AppRouter';
import { AppTheme } from './theme/AppTheme';
import { NotiAlert } from './shared/components/NotiAlert';
import CacheProvider from './shared/hooks/useCache';
import { useBootstrapMe } from './shared/interfaces/hooks/useBootstrapMe';
import { TunnelLoader } from './shared/components/tron';

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);
  
  useBootstrapMe();

  useEffect(() => {
    // Check if this is a fresh page load (not a navigation)
    const isFirstLoad = !sessionStorage.getItem('app-loaded');
    
    if (isFirstLoad) {
      sessionStorage.setItem('app-loaded', 'true');
      // Simulate initial loading time for assets
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      // Skip tunnel animation for subsequent navigations
      setIsInitialLoading(false);
      setShowApp(true);
    }
  }, []);

  const handleLoadComplete = () => {
    setShowApp(true);
  };

  return (
    <AppTheme>
      <TunnelLoader 
        isLoading={isInitialLoading} 
        onComplete={handleLoadComplete}
        minDuration={2500}
      />
      {showApp && (
        <NotiAlert>
          <CacheProvider>
            <AppRouter />
          </CacheProvider>
        </NotiAlert>
      )}
    </AppTheme>
  );
}
export default App
