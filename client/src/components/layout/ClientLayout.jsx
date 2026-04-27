import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#E8E8E8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
