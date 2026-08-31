"use client";

import { useState, useEffect } from "react";

export default function Splash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide the splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-green-50 dark:bg-green-950 transition-opacity duration-500 animate-out fade-out fill-mode-forwards delay-[2000ms]">
      <div className="relative animate-bounce">
        <div className="text-9xl drop-shadow-2xl">🥥</div>
        {/* Glow effect behind the coconut */}
        <div className="absolute inset-0 bg-green-400 blur-[60px] opacity-40 -z-10 rounded-full animate-pulse"></div>
      </div>
      
      <h1 className="mt-8 text-5xl font-extrabold text-green-900 dark:text-green-50 tracking-tighter animate-in slide-in-from-bottom-8 duration-700">
        Agro<span className="text-green-500">System</span>
      </h1>
      
      <p className="mt-4 text-green-700 dark:text-green-300 font-medium tracking-widest uppercase text-sm animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
        The Core of Coconut
      </p>
    </div>
  );
}
