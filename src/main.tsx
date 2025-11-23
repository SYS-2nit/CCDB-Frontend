import "./styles/_global.scss";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/styles/_themes.scss";
import App from "./App.tsx";

// 초기 로드 시 테마 적용 (깜빡임 방지)
const applyInitialTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
  } else if (saved === "light") {
    document.body.classList.remove("dark");
  } else {
    // 저장된 테마가 없으면 시스템 설정 확인
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.body.classList.add("dark");
    }
  }
};

applyInitialTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
