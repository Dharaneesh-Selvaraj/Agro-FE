"use client";

import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAppContext();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="glass-modern backdrop-blur-xl bg-white/50 dark:bg-green-950/50 sticky top-4 mx-4 lg:mx-12 z-50 px-8 py-4 rounded-full flex items-center justify-between mb-8 mt-4 transition-all duration-300 shadow-sm border border-green-200/30 dark:border-green-800/30">
      <Link href="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform bg-white">
          <img src="/logo.jpg" alt="AgroSystem Logo" className="w-full h-full object-cover mix-blend-multiply" />
        </div>
        <span className="text-xl md:text-2xl font-extrabold text-green-900 dark:text-green-50 tracking-tighter">
          SRI VENKATESWARA <span className="text-green-500">TRADERS</span>
        </span>
      </Link>

      <div className="flex items-center space-x-8">
        <button 
          onClick={toggleTheme}
          className="text-2xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900"
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <Link href="/products" className="text-sm font-semibold text-green-900 dark:text-green-50 hover:text-green-500 transition-colors uppercase tracking-widest">
          Products
        </Link>
        {user ? (
          <>
            {user.role === "admin" && (
              <Link href="/admin" className="text-sm font-semibold text-green-900 dark:text-green-50 hover:text-green-500 transition-colors uppercase tracking-widest">
                Dashboard
              </Link>
            )}
            <div className="flex items-center gap-4 border-l border-green-300 dark:border-green-700 pl-6">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Hi, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-green-100 hover:bg-green-200 text-green-900 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-50 px-5 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-400 text-white dark:text-green-950 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
