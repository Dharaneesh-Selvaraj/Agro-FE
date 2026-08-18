"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function LoginPage() {
  const [isLoginAdmin, setIsLoginAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAppContext();
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLoginAdmin && password === "admin123") {
      login("admin", username || "Admin");
      router.push("/admin");
    } else if (!isLoginAdmin) {
      login("user", username || "User");
      router.push("/");
    } else {
      alert("Invalid admin password. Try 'admin123'");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative">
      <div className="absolute inset-0 bg-green-50 dark:bg-green-950 -z-20"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="glass-modern z-10 w-full max-w-md p-10 rounded-[2.5rem] animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden border border-white/40">
        
        {/* Shiny top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

        <div className="flex justify-center mb-10 bg-black/5 dark:bg-white/5 p-1.5 rounded-full w-max mx-auto shadow-inner border border-white/20">
          <button
            onClick={() => setIsLoginAdmin(false)}
            className={`px-8 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${
              !isLoginAdmin ? "bg-white dark:bg-green-900 text-green-950 dark:text-white shadow-md scale-105" : "text-green-800 dark:text-green-300 hover:text-green-950"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsLoginAdmin(true)}
            className={`px-8 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${
              isLoginAdmin ? "bg-white dark:bg-green-900 text-green-950 dark:text-white shadow-md scale-105" : "text-green-800 dark:text-green-300 hover:text-green-950"
            }`}
          >
            Admin
          </button>
        </div>

        <h2 className="text-4xl font-extrabold text-center text-green-950 dark:text-white mb-2 tracking-tight">
          {isLoginAdmin ? "Admin Portal" : "Welcome Back"}
        </h2>
        <p className="text-center text-green-700 dark:text-green-300 mb-8 text-sm font-medium">
          {isLoginAdmin ? "Enter your credentials to manage inventory." : "Sign in to view our premium catalog."}
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40"
              placeholder="Enter your username"
              required
            />
          </div>

          {isLoginAdmin && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40"
                placeholder="Hint: admin123"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-green-950 text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(34,197,94,0.6)] transition-all transform hover:-translate-y-1 mt-4"
          >
            {isLoginAdmin ? "Authenticate" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
