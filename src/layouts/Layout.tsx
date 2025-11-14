import React from "react";
import "./Layout.scss";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ToastProvider } from "@/components/Scenario/ToastProvider";
import { DashboardProvider } from "@/state/DashboardContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <DashboardProvider>
          <Header />
          <main className="layout__content">
            <ToastProvider>{children}</ToastProvider>
          </main>
        </DashboardProvider>
      </div>
    </div>
  );
};

export default Layout;
