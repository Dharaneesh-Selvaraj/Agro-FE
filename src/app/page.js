"use client";

import ShopGallery from "@/components/ShopGallery";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import AwarenessSection from "@/components/AwarenessSection";
import EffectsStory from "@/components/EffectsStory";

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
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden rounded-b-[4rem] mx-auto max-w-[98%] shadow-2xl mb-16 bg-green-950">
        <div 
          className="absolute inset-0 bg-[url('/coconut-hero-3.jpg')] bg-cover bg-center bg-no-repeat z-0 animate-ken-burns"
        ></div>
        
        {/* Subtle dark overlay for readability in both modes, removing the washed-out white filter */}
        <div className="absolute inset-0 bg-black/40 z-10 transition-colors duration-500"></div>
        
        <div className="relative z-20 px-8 w-full max-w-7xl mx-auto flex flex-col items-center text-center justify-center gap-12 mt-16">
          
          <div className="flex-1 animate-in slide-in-from-bottom duration-1000">
            <div className="inline-flex items-center justify-center gap-2 glass-modern px-5 py-2 rounded-full mb-8 text-white font-semibold text-sm mx-auto shadow-lg backdrop-blur-md bg-black/20 border border-white/10 transition-colors duration-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Open Today • {today}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-light text-white mb-6 tracking-wide drop-shadow-2xl transition-colors duration-500">
              The Core of <br/><span className="font-bold">Coconut Care.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg transition-colors duration-500">
              We specialize in absolute perfection for Coconut Palms. Premium, organically formulated nutrients designed to guarantee maximum yield, stronger trunks, and vibrant fronds.
            </p>

            {!user && (
              <div className="flex gap-6 justify-center">
                <Link 
                  href="/products" 
                  className="bg-green-500 hover:bg-green-400 text-green-950 text-lg font-extrabold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105"
                >
                  Explore Catalog
                </Link>
                <button className="glass-modern text-white hover:bg-white/20 text-lg font-bold py-4 px-10 rounded-full transition-all">
                  Our Method
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section: Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="glass-modern p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">🥥</div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-50 mb-4">Coconut First</h3>
            <p className="text-green-800 dark:text-green-300 font-medium">Every formulation is engineered from the ground up to serve the unique biochemistry of coconut trees.</p>
          </div>
          <div className="glass-modern p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">🌴</div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-50 mb-4">Tropical Climate Ready</h3>
            <p className="text-green-800 dark:text-green-300 font-medium">Our nutrients resist heavy rainfall washout and perform flawlessly in high humidity environments.</p>
          </div>
          <div className="glass-modern p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">📈</div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-50 mb-4">Unprecedented Yield</h3>
            <p className="text-green-800 dark:text-green-300 font-medium">Experience up to 40% more nut production in your very first harvest season.</p>
          </div>
        </div>
      </section>

      {/* Awareness Section (Interactive Flip Cards) */}
      <AwarenessSection />

      {/* Cinematic GSAP Storytelling Gallery */}
      <EffectsStory />

      {/* Content Section: Mission */}
      <section className="bg-green-100 dark:bg-green-950 py-24 my-10 relative overflow-hidden rounded-[4rem] mx-4 md:mx-auto max-w-[95%] transition-colors duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-green-950 dark:text-green-50 mb-6 transition-colors duration-500">Our Coconut Mission</h2>
          <p className="text-xl text-green-800 dark:text-green-200 leading-relaxed font-light transition-colors duration-500">
            Coconuts are the tree of life. We are dedicated entirely to their preservation and propagation. By supplying farmers with highly specialized, laboratory-tested nutrients, we ensure that every coconut palm reaches its absolute genetic potential.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-200 dark:bg-green-950 text-green-800 dark:text-green-50/50 py-12 text-center mt-auto rounded-t-[4rem] transition-colors duration-500">
        <h2 className="text-2xl font-bold text-green-950 dark:text-green-50 mb-4 tracking-tighter transition-colors duration-500">Sri Venkateswara Traders</h2>
        <p className="text-sm">© {new Date().getFullYear()} All rights reserved. The Core of Coconut.</p>
      </footer>
    </div>
  );
}
