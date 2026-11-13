import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker immediately for 100% offline mobile caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New Piku version available');
  },
  onOfflineReady() {
    console.log('Piku is offline ready and precached on device');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
