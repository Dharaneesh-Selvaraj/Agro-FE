"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setError("Please enter a valid 10-digit WhatsApp number.");
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
        setSuccessMsg(`Verification code sent to your WhatsApp (+${data.phone})!`);
      } else {
        setError(data.error || "Failed to send WhatsApp verification code. Please make sure the number is registered on WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit code received on WhatsApp.");
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
        setSuccessMsg("Account created and WhatsApp verified! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1200);
      } else {
        setError(data.error || "Incorrect OTP. Please check the code on WhatsApp.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error during verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative py-12 px-4">
      <div className="absolute inset-0 bg-green-50 dark:bg-green-950 -z-20"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="glass-modern z-10 w-full max-w-md p-8 md:p-10 rounded-[2.5rem] animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden border border-white/40">
        
        {/* Shiny top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
            🌱
          </div>
          <h2 className="text-3xl font-extrabold text-green-950 dark:text-white tracking-tight">
            {step === "phone" ? "Join Sri Venkateswara" : "Verify WhatsApp OTP"}
          </h2>
          <p className="text-green-700 dark:text-green-300 mt-1 text-sm font-medium">
            {step === "phone" 
              ? "Verify your WhatsApp number to receive farming solutions & updates. No password needed!"
              : "Enter the 6-digit code received on WhatsApp."
            }
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-4 animate-in fade-in" role="alert">
            <span className="block">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-400 text-green-800 px-4 py-3 rounded-2xl text-sm font-semibold mb-4 animate-in fade-in" role="alert">
            <span className="block">{successMsg}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1 ml-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-medium placeholder:text-green-900/40 text-base"
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1 ml-1">
                WhatsApp Number *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-20 pr-4 py-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all text-green-950 dark:text-white shadow-inner font-bold placeholder:font-normal placeholder:text-green-900/40 text-base tracking-wider"
                  required
                />
              </div>
              <p className="text-xs text-green-800/80 dark:text-green-300/80 mt-1 ml-1">
                We will send an OTP code to verify this number is active on WhatsApp.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,211,102,0.6)] transition-all transform hover:-translate-y-1 mt-3 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-xl">⏳</span> Checking WhatsApp...
                </>
              ) : (
                <>
                  <span>📲</span> Verify via WhatsApp OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
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
              {loading ? "Verifying..." : "Complete Registration"}
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
                ← Change Number
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleSendOtp}
                className="text-[#25D366] hover:underline disabled:text-gray-400 disabled:no-underline font-bold"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-green-800 dark:text-green-300 text-sm font-medium">
          Already verified?{" "}
          <Link href="/login" className="text-green-600 dark:text-green-400 hover:underline font-bold">
            Sign In with WhatsApp
          </Link>
        </p>
      </div>
    </div>
  );
}
