import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initialLanguage, loadLanguage } from './i18n'

// Start in the visitor's language straight away (English is built in; other
// languages are a small download).
loadLanguage(initialLanguage()).finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

// Installable app: register the service worker on the real site only. Lovable's
// editor preview runs inside an iframe on its own hosts, where caching would
// only get in the way.
const inPreview = window.self !== window.top || /lovableproject\.com$|^id-preview--/.test(window.location.hostname);
if (import.meta.env.PROD && "serviceWorker" in navigator && !inPreview) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The site works fine without it.
    });
  });
}
