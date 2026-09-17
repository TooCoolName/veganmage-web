import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import "./i18n";
import App from "./App.tsx";

const preloadErrorKey = "vite:preload-error";

window.addEventListener("vite:preloadError", (event) => {
  if (sessionStorage.getItem(preloadErrorKey)) {
    return;
  }

  sessionStorage.setItem(preloadErrorKey, "1");
  event.preventDefault();
  window.location.reload();
});

sessionStorage.removeItem(preloadErrorKey);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
