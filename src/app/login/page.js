"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState("whatsapp"); // 'whatsapp' or 'admin'
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  
  // WhatsApp OTP fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Admin fields
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { login } = useAppContext();
  const router = useRouter();

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Step 1: Send WhatsApp OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/customers/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("otp");
        setResendTimer(30);
        setSuccessMsg(`Verification code sent to your WhatsApp number (+${data.phone})!`);
      } else {
        setError(data.error || "Failed to send WhatsApp verification code. Please make sure the number is active on WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify WhatsApp OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code received on WhatsApp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/customers/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otp.trim(), name }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user.role, data.user.username);
        setSuccessMsg("WhatsApp verified successfully! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setError(data.error || "Incorrect OTP. Please check the 6-digit code on WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error during verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Admin Login with Email & Password
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user.role, data.user.username);
        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Admin login failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative py-8 px-4">
      <div className="absolute inset-0 bg-green-50 dark:bg-green-950 -z-20"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="glass-modern z-10 w-full max-w-md p-8 md:p-10 rounded-[2.5rem] animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden border border-white/40">
        
        {/* Shiny top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

        {mode === "whatsapp" ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
                💬
              </div>
              <h2 className="text-3xl font-extrabold text-green-950 dark:text-white tracking-tight">
                {step === "phone" ? "WhatsApp Sign-In" : "Verify WhatsApp"}
              </h2>
              <p className="text-green-700 dark:text-green-300 mt-1 text-sm font-medium">
                {step === "phone" 
                  ? "Instant sign-in with your WhatsApp number. No password needed!"
                  : `Enter the 6-digit code sent to your WhatsApp.`
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-4 animate-in fade-in" role="alert">
                <span className="block">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="bg-green-50 border border-green-400 text-green-800 px-4 py-3 rounded-2xl text-sm font-semibold mb-4 animate-in fade-in" role="alert">
                <span className="block">{successMsg}</span>
              </div>
            )}

            {step === "phone" ? (
              /* Phone Input Step */
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40 text-base"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-20 pr-4 py-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-bold placeholder:font-normal placeholder:text-green-900/40 text-base tracking-wider"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                  <p className="text-xs text-green-800/80 dark:text-green-300/80 mt-1.5 ml-1">
                    We will send a 6-digit verification code to confirm this number has WhatsApp.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,211,102,0.6)] transition-all transform hover:-translate-y-1 mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin text-xl">⏳</span> Verifying WhatsApp...
                    </>
                  ) : (
                    <>
                      <span>📲</span> Send WhatsApp OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center py-4 rounded-2xl bg-white/70 dark:bg-black/40 border-2 border-green-400 dark:border-green-600 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-extrabold text-3xl tracking-[0.5em] placeholder:tracking-normal placeholder:text-gray-400 placeholder:text-lg"
                    placeholder="••••••"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-green-500 hover:bg-green-400 text-green-950 text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(34,197,94,0.6)] transition-all transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin text-xl">⏳</span> Verifying...
                    </>
                  ) : (
                    <>
                      <span>✅</span> Verify & Sign In
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs font-semibold pt-2 text-green-900 dark:text-green-200">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                    className="hover:underline text-gray-600 dark:text-gray-400"
                  >
                    ← Change Phone Number
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendOtp}
                    className="text-[#25D366] hover:underline disabled:text-gray-400 disabled:no-underline font-bold"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend WhatsApp OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* Admin Switcher */}
            <div className="mt-8 pt-6 border-t border-green-200/50 dark:border-green-800/50 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("admin");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-xs font-bold text-gray-500 hover:text-green-700 dark:text-gray-400 dark:hover:text-green-300 transition-colors"
              >
                🔐 Store Administrator? Sign in here
              </button>
            </div>
          </>
        ) : (
          /* Admin Login Mode */
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/40 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
                🛡️
              </div>
              <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white tracking-tight">
                Admin Portal
              </h2>
              <p className="text-blue-700 dark:text-blue-300 mt-1 text-sm font-medium">
                Enter your administrative credentials.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-4" role="alert">
                <span className="block">{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 ml-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-blue-950 dark:text-white shadow-inner font-medium text-base placeholder:text-blue-900/40"
                  placeholder="admin@agro.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 ml-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-blue-950 dark:text-white shadow-inner font-medium text-base placeholder:text-blue-900/40"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-1 mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Sign In to Admin Dashboard"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-blue-200/50 dark:border-blue-800/50 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("whatsapp");
                  setError("");
                }}
                className="text-xs font-bold text-green-700 hover:text-green-800 dark:text-green-400 transition-colors"
              >
                ← Back to Customer WhatsApp Sign-In
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
