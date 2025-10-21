import "./styles/_global.scss";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/styles/_themes.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
