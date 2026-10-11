"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/customers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! You can now log in.");
        router.push("/login");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative py-12">
      <div className="absolute inset-0 bg-green-50 dark:bg-green-950 -z-20"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="glass-modern z-10 w-full max-w-md p-10 rounded-[2.5rem] animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden border border-white/40">
        
        {/* Shiny top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

        <h2 className="text-4xl font-extrabold text-center text-green-950 dark:text-white mb-2 tracking-tight">
          Create Account
        </h2>
        <p className="text-center text-green-700 dark:text-green-300 mb-8 text-sm font-medium">
          Join us to get the latest product updates!
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1 ml-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1 ml-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1 ml-1">
              Phone (WhatsApp Number)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 919876543210"
              className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-green-950 text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(34,197,94,0.6)] transition-all transform hover:-translate-y-1 mt-4 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-green-800 dark:text-green-300 text-sm font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 dark:text-green-400 hover:underline font-bold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
