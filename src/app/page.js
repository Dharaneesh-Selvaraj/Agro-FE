"use client";

import ShopGallery from "@/components/ShopGallery";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { user } = useAppContext();
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ultra-Modern Hero Section */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden rounded-b-[4rem] mx-auto max-w-[98%] shadow-2xl mb-16">
        <div 
          className="absolute inset-0 bg-[url('/coconut-hero.jpg')] bg-cover bg-center bg-no-repeat bg-fixed z-0 scale-105"
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-900/60 to-transparent z-10 animate-gradient"></div>
        
        <div className="relative z-20 px-8 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 text-left animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 glass-modern px-5 py-2 rounded-full mb-8 text-green-50 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Open Today • {today}
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-100 mb-6 tracking-tight drop-shadow-xl text-glow">
              Grow <br/> Beyond Limits.
            </h1>
            
            <p className="text-xl lg:text-2xl text-green-100 mb-10 max-w-xl font-medium leading-relaxed">
              Premium, organically formulated fertilizers. Designed for maximum yield and sustainable farming.
            </p>

            {!user && (
              <div className="flex gap-6">
                <Link 
                  href="/store" 
                  className="bg-green-500 hover:bg-green-400 text-green-950 text-lg font-extrabold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105"
                >
                  Enter Store
                </Link>
                <button className="glass-modern text-white hover:bg-white/20 text-lg font-bold py-4 px-10 rounded-full transition-all">
                  Learn More
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 hidden lg:flex justify-center items-center relative animate-float">
            <div className="glass-modern p-6 rounded-[3rem] border border-white/20 w-80 h-96 relative overflow-hidden flex flex-col justify-end shadow-2xl backdrop-blur-2xl bg-white/10">
               <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-green-500/20 blur-xl"></div>
               <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-green-300/20 blur-2xl"></div>
               <div className="relative z-10 text-white font-bold text-2xl mb-2">Featured Formula</div>
               <div className="relative z-10 text-green-200 text-sm">Boost your coconut tree yield by 40% in the first season.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section: Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="glass-modern p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">🌱</div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-50 mb-4">100% Organic</h3>
            <p className="text-green-800 dark:text-green-300 font-medium">Safe for your soil, safe for the planet. We use naturally derived ingredients.</p>
          </div>
          <div className="glass-modern p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">🌴</div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-50 mb-4">Specialized Mix</h3>
            <p className="text-green-800 dark:text-green-300 font-medium">Perfected formulations specifically targeted for coconut palms and tropical plants.</p>
          </div>
          <div className="glass-modern p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">📈</div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-50 mb-4">Maximum Yield</h3>
            <p className="text-green-800 dark:text-green-300 font-medium">Guaranteed to boost your crop output by enriching roots dynamically.</p>
          </div>
        </div>
      </section>

      {/* Content Section: Mission */}
      <section className="bg-green-900 dark:bg-green-950 py-24 my-10 relative overflow-hidden rounded-[4rem] mx-4 md:mx-auto max-w-[95%]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-green-50 mb-6">Our Mission</h2>
          <p className="text-xl text-green-200 leading-relaxed font-light">
            Founded with a passion for sustainable agriculture, we bridge the gap between high-yield farming and environmental responsibility. We supply local farmers with the highest grade, laboratory-tested fertilizers designed to rejuvenate soil health and produce the strongest crops possible.
          </p>
        </div>
      </section>
      
      {/* Shop Gallery */}
      <ShopGallery />
      
      {/* Footer */}
      <footer className="bg-green-950 text-green-50/50 py-12 text-center mt-auto rounded-t-[4rem]">
        <h2 className="text-2xl font-bold text-green-50 mb-4 tracking-tighter">AgroSystem</h2>
        <p className="text-sm">© {new Date().getFullYear()} All rights reserved. Premium Agriculture.</p>
      </footer>
    </div>
  );
}
