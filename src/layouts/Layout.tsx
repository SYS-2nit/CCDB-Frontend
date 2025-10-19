import React from "react";
import "./Layout.scss";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Header />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
