"use client";
import React, { useState, useEffect } from 'react';

export default function EffectsStory() {
  const storyData = [
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.44 PM.jpeg",
    "category": "1. The Foundation",
    "title": "Healthy Soil",
    "description": "The bedrock of a thriving coconut palm. Rich, untampered earth provides the precise balance of moisture and micronutrients required for life."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.45 PM.jpeg",
    "category": "1. The Foundation",
    "title": "Microbiome Balance",
    "description": "Beneath the surface, millions of microorganisms work in harmony to break down organic matter and feed the aggressive root network."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.46 PM (1).jpeg",
    "category": "1. The Foundation",
    "title": "The Ecosystem",
    "description": "A perfect agricultural ecosystem is delicate. Everything from the ground cover to the humidity plays a crucial role in palm health."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.46 PM.jpeg",
    "category": "2. The Growth",
    "title": "Vibrant Fronds",
    "description": "When nutrition is optimal, the canopy explodes with deep green, highly photosynthetic leaves that drive immense energy production."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.47 PM (1).jpeg",
    "category": "2. The Growth",
    "title": "Trunk Expansion",
    "description": "A healthy palm rapidly expands its trunk girth, allowing for massive water and nutrient transport up to the crown."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.47 PM.jpeg",
    "category": "3. The Yield",
    "title": "Flowering Stages",
    "description": "With abundant micronutrients like Boron and Zinc, the palm produces significantly more female flowers, directly increasing potential yield."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.48 PM (1).jpeg",
    "category": "3. The Yield",
    "title": "Nut Development",
    "description": "The rapid expansion of the coconut relies entirely on potassium. Proper feeding ensures large, heavy, and water-rich nuts."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.48 PM.jpeg",
    "category": "3. The Yield",
    "title": "Harvest Density",
    "description": "A perfectly maintained plantation will yield dense clusters of coconuts year-round without seasonal fatigue."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.49 PM (1).jpeg",
    "category": "4. The Decline",
    "title": "Nutrient Starvation",
    "description": "When soil is depleted, the palm immediately sacrifices its lower fronds, turning them yellow and brittle to save energy."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.49 PM.jpeg",
    "category": "4. The Decline",
    "title": "Button Drop",
    "description": "Unable to sustain the energy required, the palm aborts its young coconuts. Premature button drop is the first sign of severe distress."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.50 PM (1).jpeg",
    "category": "4. The Decline",
    "title": "Canopy Collapse",
    "description": "As starvation continues, the entire canopy shrinks. The tree stops producing new leaves and focuses entirely on basic survival."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.50 PM.jpeg",
    "category": "5. The Disease",
    "title": "Fungal Invasion",
    "description": "A weakened palm is highly susceptible to fungal attacks like Bud Rot, which rots the growing point of the tree."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.51 PM (1).jpeg",
    "category": "5. The Disease",
    "title": "Pest Infestation",
    "description": "Rhinoceros beetles and red palm weevils detect stressed trees and burrow into the soft tissue, causing catastrophic internal damage."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.51 PM.jpeg",
    "category": "5. The Disease",
    "title": "Necrosis",
    "description": "Without intervention, the vascular system collapses. The palm slowly dies, turning into a hollow, lifeless trunk."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.52 PM (1).jpeg",
    "category": "6. The Intervention",
    "title": "Targeted Nutrition",
    "description": "We don't just dump fertilizer. We deploy highly specialized, laboratory-tested bio-stimulants engineered exclusively for coconuts."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.52 PM.jpeg",
    "category": "6. The Intervention",
    "title": "Root Rehabilitation",
    "description": "Our formulas focus heavily on the rhizosphere, instantly lowering soil salinity and unlocking trapped macronutrients."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.53 PM (1).jpeg",
    "category": "6. The Intervention",
    "title": "Immunity Boosting",
    "description": "By rapidly replenishing trace minerals like Boron and Zinc, the palm's natural defenses against disease are instantly reactivated."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.53 PM.jpeg",
    "category": "7. The Recovery",
    "title": "Cellular Healing",
    "description": "Within weeks, the necrotic decline halts. New, vibrant green growth emerges from the crown."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.54 PM (1).jpeg",
    "category": "7. The Recovery",
    "title": "Restored Vigor",
    "description": "The canopy thickens, the trunk solidifies, and the tree returns to its peak photosynthetic capacity."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.54 PM.jpeg",
    "category": "7. The Recovery",
    "title": "Ecosystem Rebirth",
    "description": "The soil microbiome recovers, creating a self-sustaining cycle of health and extreme resilience."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.55 PM (1).jpeg",
    "category": "8. The Future",
    "title": "Unprecedented Yield",
    "description": "A fully recovered, perfectly nourished palm will produce up to 40% more nuts in a single harvest season."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.55 PM (2).jpeg",
    "category": "8. The Future",
    "title": "Climate Resilience",
    "description": "Treated trees are highly resistant to extreme heat, prolonged drought, and heavy flooding."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.55 PM.jpeg",
    "category": "8. The Future",
    "title": "Sustainable Agriculture",
    "description": "This is the core of coconut care. A scientific, sustainable approach that guarantees the tree of life thrives for generations."
  }
];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === storyData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? storyData.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-[#d3cec4] dark:bg-[#0a0f0a] border-y border-green-900 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-green-950 dark:text-white tracking-tight mb-4">The Lifecycle Journey</h2>
        <p className="text-lg text-green-800 dark:text-green-300 font-medium">Explore the stages of coconut palm care.</p>
      </div>
      
      {/* Premium Carousel UI */}
      <div className="relative max-w-6xl mx-auto px-4 md:px-12 flex items-center justify-center">
        
        {/* Navigation Buttons */}
        <button onClick={prevSlide} className="absolute left-2 md:left-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 text-green-950 dark:text-white hover:bg-white/40 transition-all hover:scale-110 shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button onClick={nextSlide} className="absolute right-2 md:right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 text-green-950 dark:text-white hover:bg-white/40 transition-all hover:scale-110 shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Carousel Window */}
        <div className="overflow-hidden w-full rounded-[2rem] shadow-2xl glass-modern">
          <div 
            className="flex transition-transform duration-700 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {storyData.map((data, idx) => (
              <div key={`slide-${idx}`} className="w-full flex-shrink-0 flex flex-col md:flex-row h-[70vh] md:h-[60vh]">
                
                {/* Image Side */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-black/10 flex items-center justify-center p-4">
                  <img 
                    src={data.src} 
                    alt={data.title} 
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/40 pointer-events-none"></div>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40 dark:bg-black/40">
                  <span className="text-green-700 dark:text-green-400 font-black tracking-widest uppercase text-xs md:text-sm mb-4 block drop-shadow-sm">
                    {data.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-green-950 dark:text-white mb-6 tracking-tight drop-shadow-md">
                    {data.title}
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl text-green-900 dark:text-green-50/90 font-medium leading-relaxed">
                    {data.description}
                  </p>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-8 flex-wrap max-w-xl mx-auto px-4">
        {storyData.map((_, idx) => (
          <button 
            key={`dot-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 h-2.5 bg-green-600 dark:bg-green-400' : 'w-2.5 h-2.5 bg-green-900/30 dark:bg-green-100/30 hover:bg-green-500'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
