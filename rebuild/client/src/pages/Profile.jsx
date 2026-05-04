import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/common/Loader";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-nayamo-bg-primary flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-6">
            Profile
          </h1>
          <p className="text-nayamo-text-muted mb-8">
            Please log in to view your profile
          </p>
          <Link to="/login" className="nayamo-btn-primary px-8 py-4 text-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="nayamo-container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-4">
            Profile
          </h1>
          <p className="text-xl text-nayamo-text-secondary">Welcome back, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="nayamo-glass p-8 rounded-3xl text-center border">
              <div className="w-32 h-32 bg-gradient-to-br from-nayamo-gold to-nayamo-rose rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="text-2xl font-serif font-bold text-nayamo-text-primary mb-2">
                {user.name}
              </h3>
              <p className="text-nayamo-text-secondary mb-6">{user.email}</p>
              <p className={`px-4 py-2 rounded-full text-sm font-medium ${
                user.role === 'admin' 
                  ? 'bg-nayamo-gold/20 text-nayamo-gold border border-nayamo-gold/30' 
                  : 'bg-nayamo-rose/20 text-nayamo-rose'
              }`}>
                {user.role.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="nayamo-glass p-8 rounded-3xl border">
              <h2 className="text-2xl font-bold text-nayamo-text-primary mb-6">
                Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="text-nayamo-text-secondary block mb-2">Name</label>
                  <p className="font-semibold">{user.name}</p>
                </div>
                <div>
                  <label className="text-nayamo-text-secondary block mb-2">Email</label>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="nayamo-glass p-8 rounded-3xl border">
              <h2 className="text-2xl font-bold text-nayamo-text-primary mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/orders" className="block p-6 border rounded-2xl hover:border-nayamo-gold/50 transition-all text-center">
                  <div className="w-12 h-12 bg-nayamo-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-nayamo-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                      <path fillRule="evenodd" d="M18 9H2v8a2 2 0 002 2h12a2 2 0 002-2V9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-nayamo-text-primary mb-1">My Orders</h3>
                  <p className="text-nayamo-text-muted text-sm">Track your purchases</p>
                </Link>
                <Link to="/wishlist" className="block p-6 border rounded-2xl hover:border-nayamo-gold/50 transition-all text-center">
                  <div className="w-12 h-12 bg-nayamo-rose/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-nayamo-rose" />
                  </div>
                  <h3 className="font-semibold text-nayamo-text-primary mb-1">Wishlist</h3>
                  <p className="text-nayamo-text-muted text-sm">Saved items</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

