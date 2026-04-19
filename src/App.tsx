import { AppRouter } from './router/AppRouter';
import { AppTheme } from './theme/AppTheme';
import { NotiAlert } from './shared/components/NotiAlert';
import CacheProvider from './shared/hooks/useCache';
import { useBootstrapMe } from './shared/interfaces/hooks/useBootstrapMe';

function App() {
  useBootstrapMe();

  return (
    <AppTheme>
      <NotiAlert>
        <CacheProvider>
          <AppRouter />
        </CacheProvider>
      </NotiAlert>
    </AppTheme>
  );
}
export default App
