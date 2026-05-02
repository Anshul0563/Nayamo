import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] text-[#E8E8E8] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <Navbar />
        <main className="flex-1 relative">
          <Outlet />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
}
