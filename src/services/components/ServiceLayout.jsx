import React from "react";
import { Outlet } from "react-router-dom";
import ServiceNav from "./ServiceNav";
import ServiceFooter from "./ServiceFooter";

export default function ServiceLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground antialiased">
      <ServiceNav />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <ServiceFooter />
    </div>
  );
}
