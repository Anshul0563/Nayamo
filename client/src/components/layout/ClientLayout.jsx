import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout() {
  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] text-[#E8E8E8]">
        <Navbar />
        <main className="flex-1 relative pt-2">
          <Outlet />
        </main>
        <Footer />
      </div>
  );
}
