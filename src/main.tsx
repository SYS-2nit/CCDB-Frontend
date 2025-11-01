import "./styles/_global.scss";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/styles/_themes.scss";
import App from "./App.tsx";
import { ToastProvider } from "./components/Scenario/ToastProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
