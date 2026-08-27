import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "leaflet/dist/leaflet.css";

import { initWebXRPolyfill } from './utils/webxr-polyfill.js'

// Initialize WebXR support
initWebXRPolyfill();

// Get Clerk Publishable Key from environment. Fall back to a valid-format
// placeholder so the app still renders (without auth) when no key is set —
// e.g. fresh clones and demo environments.
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn(
    "VITE_CLERK_PUBLISHABLE_KEY is not set — running without authentication."
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

// ❌ REMOVED: Old SW registration that was causing blank page
// ✅ ADDED: Kill any stale service workers
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log("🗑️ Stale Service Worker removed:", registration);
    });
  });

  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.delete(cacheName);
      console.log("🗑️ Cache cleared:", cacheName);
    });
  });
}

// Render React App with Clerk Provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
