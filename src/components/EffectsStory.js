"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function EffectsStory() {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const textRefs = useRef([]);

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
    "title": "Trunk Integrity",
    "description": "A well-fed palm develops a thick, impenetrable trunk, capable of withstanding hurricane-force winds and supporting heavy yields."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.47 PM.jpeg",
    "category": "2. The Growth",
    "title": "Bountiful Yield",
    "description": "The ultimate reward of proper care: heavy, nutrient-dense coconuts emerging in rapid, healthy succession."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.48 PM (1).jpeg",
    "category": "3. The Decline",
    "title": "Nutrient Depletion",
    "description": "Decades of intensive monoculture farming slowly strip the soil of its life-giving properties, beginning a silent decline."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.48 PM.jpeg",
    "category": "3. The Decline",
    "title": "Environmental Stress",
    "description": "Shifting weather patterns, prolonged droughts, and sudden floods shock the palm's delicate root system."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.49 PM (1).jpeg",
    "category": "3. The Decline",
    "title": "Compacted Earth",
    "description": "As the soil loses its structure, it becomes hard and impermeable, suffocating the roots and preventing water absorption."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.49 PM (2).jpeg",
    "category": "4. The Impact",
    "title": "Potassium Starvation",
    "description": "The first visible sign of failure. Older fronds turn a sickly yellow and orange as the tree frantically cannibalizes itself."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.49 PM.jpeg",
    "category": "4. The Impact",
    "title": "Pest Vulnerability",
    "description": "A malnourished tree loses its chemical defenses, inviting devastating borers like the Rhinoceros Beetle."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.50 PM (1).jpeg",
    "category": "4. The Impact",
    "title": "Pathogen Invasion",
    "description": "Weakened cellular walls allow deadly fungal infections to take hold, rotting the core of the palm from the inside out."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.50 PM.jpeg",
    "category": "5. The Awareness",
    "title": "Recognizing the Signs",
    "description": "Early detection is the difference between a minor setback and the catastrophic loss of an entire plantation."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.51 PM (1).jpeg",
    "category": "5. The Awareness",
    "title": "Understanding the Chemistry",
    "description": "Yellowing leaves aren't just 'getting old'—they are a desperate cry for precise, scientific intervention."
  },
  {
    "src": "/AppImages/Effects/WhatsApp Image 2026-09-05 at 9.49.51 PM.jpeg",
    "category": "5. The Awareness",
    "title": "The Cost of Inaction",
    "description": "Ignoring the early warning signs inevitably leads to total crop failure and the death of decades-old trees."
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

  useGSAP(() => {
    const slider = sliderRef.current;
    
    // Create the horizontal scrolling timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => "+=" + slider.scrollWidth, // Scroll distance equals total width of the 24 images
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    // Slide the massive flex row horizontally
    tl.to(slider, {
      x: () => -(slider.scrollWidth - window.innerWidth),
      ease: "none"
    });

    // Animate text upwards smoothly as each slide enters the screen
    textRefs.current.forEach((textEl) => {
      if (!textEl) return;
      gsap.from(textEl, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: textEl,
          containerAnimation: tl, // Nested within the horizontal timeline
          start: "left 80%", // Triggers when the text container reaches 80% of the screen width
          toggleActions: "play none none reverse"
        }
      });
    });

  }, { scope: containerRef });

  return (
    <div className="block shrink-0 w-full relative">
      {/* GSAP will pin THIS div, leaving the outer React div alone */}
      <div ref={containerRef}>
        <section className="w-full h-screen bg-[#d3cec4] dark:bg-[#0a0f0a] overflow-hidden border-y border-green-900 relative">
          
          {/* The massive flex container that slides horizontally */}
          <div ref={sliderRef} className="flex h-full w-max will-change-transform"> 
            {storyData.map((data, idx) => (
              <div key={`slide-${idx}`} className="w-screen h-screen flex-shrink-0 relative flex flex-col md:flex-row items-center justify-between pt-24 pb-8 px-8 md:px-20 mr-[30vw] md:mr-[50vw]">
                
                {/* Infographic Image Side (Left on Desktop) */}
                <div className="w-full md:w-[50%] h-[50vh] md:h-full flex items-center justify-center overflow-hidden order-2 md:order-1">
                  <img 
                    src={data.src} 
                    alt={data.title} 
                    className="w-full h-full object-contain rounded-xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                    loading={idx < 3 ? "eager" : "lazy"} 
                  />
                </div>

                {/* Text Side (Right on Desktop) */}
                <div 
                  ref={el => textRefs.current[idx] = el}
                  className="w-full md:w-[35%] flex flex-col justify-center items-center md:items-start text-center md:text-left z-20 bg-black/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-3xl order-1 md:order-2"
                >
                  <span className="text-green-400 font-black tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block drop-shadow-md">
                    {data.category}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg leading-tight break-words">
                    {data.title}
                  </h2>
                  <p className="text-base md:text-lg text-white/90 font-medium drop-shadow-lg max-w-xl leading-relaxed">
                    {data.description}
                  </p>
                </div>
                
              </div>
            ))}
          </div>
          
        </section>
      </div>
    </div>
  );
}
