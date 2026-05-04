import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-nayamo-bg-primary">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

