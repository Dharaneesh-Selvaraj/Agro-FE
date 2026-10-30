"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 z-10 border-t border-green-200/50 dark:border-green-800/40 bg-gradient-to-b from-transparent via-green-100/60 to-green-200/80 dark:via-green-950/70 dark:to-neutral-950/90 backdrop-blur-xl transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Top Grid: Brand, Navigation, and Powered-by */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center justify-between">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform bg-white">
                <img src="/logo.jpg" alt="Sri Venkateswara Traders Logo" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <span className="text-xl font-extrabold text-green-950 dark:text-green-50 tracking-tighter">
                SRI VENKATESWARA <span className="text-green-500">TRADERS</span>
              </span>
            </Link>
            <p className="text-sm text-green-800/80 dark:text-green-300/80 max-w-sm font-medium leading-relaxed">
              Empowering farmers with premium agricultural nutrients, specialized coconut care, and modern farm-supply management.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-bold text-green-900/90 dark:text-green-200">
            <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Catalog
            </Link>
            <Link href="/login" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Login
            </Link>
            <Link href="/admin/products" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Admin
            </Link>
          </div>

          {/* Powered By Section */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end text-center md:text-right">
            <span className="text-xs uppercase tracking-widest font-extrabold text-green-800 dark:text-green-400 mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              Powered By
            </span>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
              {/* Peachcore Link */}
              <a
                href="https://peachcore.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 dark:bg-green-900/30 hover:bg-white dark:hover:bg-green-900/60 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-200"
                title="Visit Peachcore"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-400 to-rose-400 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                  P
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    Peachcore
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                    peachcore.in
                  </div>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Velora Nexa Link */}
              <a
                href="https://veloranexa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 dark:bg-green-900/30 hover:bg-white dark:hover:bg-green-900/60 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-200"
                title="Visit Velora Nexa"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                  V
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    Velora Nexa
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                    veloranexa.com
                  </div>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom divider and copyright */}
        <div className="mt-10 pt-6 border-t border-green-200/40 dark:border-green-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-green-800/70 dark:text-green-400/70">
          <p suppressHydrationWarning>
            © {currentYear} Sri Venkateswara Traders. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-center sm:text-right">
            This web application is proudly powered by{" "}
            <a
              href="https://peachcore.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            >
              Peachcore
            </a>{" "}
            &{" "}
            <a
              href="https://veloranexa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            >
              Velora Nexa
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
