import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoadingOverlay from "../common/LoadingOverlay";
import { subscribeLoading } from "../../services/loadingService";

export default function ClientLayout() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLoading((count) => {
      setIsLoading(count > 0);
    });
    return unsubscribe;
  }, []);

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] text-[#E8E8E8]">
        <Navbar />
        <main className="flex-1 relative pt-2">
          <Outlet />
        </main>
        <Footer />
        <LoadingOverlay visible={isLoading} />
      </div>
  );
}
