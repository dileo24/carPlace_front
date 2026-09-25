import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/CRM/Sidebar/Sidebar";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="crm-layout">
      <Sidebar />
      <main className="crm-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
