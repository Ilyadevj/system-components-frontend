import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import { store } from "./store";
import App from "./App.tsx";
import "./MobileApp.css";

// Регистрация Service Worker для Progressive Web App (PWA)
if ("serviceWorker" in navigator) {
  registerSW({
    onNeedRefresh() {
      console.log("PWA: New content available, auto-updating...");
    },
    onOfflineReady() {
      console.log("PWA: App ready to work offline");
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
