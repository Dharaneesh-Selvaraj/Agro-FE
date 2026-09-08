const fs = require('fs');
const path = require('path');

const effectsDir = path.join(__dirname, 'public', 'AppImages', 'Effects');
const targetFile = path.join(__dirname, 'src', 'components', 'EffectsStory.js');

const storyPhases = [
  { category: "1. The Foundation", title: "Healthy Soil", description: "The bedrock of a thriving coconut palm. Rich, untampered earth provides the precise balance of moisture and micronutrients required for life." },
  { category: "1. The Foundation", title: "Microbiome Balance", description: "Beneath the surface, millions of microorganisms work in harmony to break down organic matter and feed the aggressive root network." },
  { category: "1. The Foundation", title: "The Ecosystem", description: "A perfect agricultural ecosystem is delicate. Everything from the ground cover to the humidity plays a crucial role in palm health." },

  { category: "2. The Growth", title: "Vibrant Fronds", description: "When nutrition is optimal, the canopy explodes with deep green, highly photosynthetic leaves that drive immense energy production." },
  { category: "2. The Growth", title: "Trunk Integrity", description: "A well-fed palm develops a thick, impenetrable trunk, capable of withstanding hurricane-force winds and supporting heavy yields." },
  { category: "2. The Growth", title: "Bountiful Yield", description: "The ultimate reward of proper care: heavy, nutrient-dense coconuts emerging in rapid, healthy succession." },

  { category: "3. The Decline", title: "Nutrient Depletion", description: "Decades of intensive monoculture farming slowly strip the soil of its life-giving properties, beginning a silent decline." },
  { category: "3. The Decline", title: "Environmental Stress", description: "Shifting weather patterns, prolonged droughts, and sudden floods shock the palm's delicate root system." },
  { category: "3. The Decline", title: "Compacted Earth", description: "As the soil loses its structure, it becomes hard and impermeable, suffocating the roots and preventing water absorption." },

  { category: "4. The Impact", title: "Potassium Starvation", description: "The first visible sign of failure. Older fronds turn a sickly yellow and orange as the tree frantically cannibalizes itself." },
  { category: "4. The Impact", title: "Pest Vulnerability", description: "A malnourished tree loses its chemical defenses, inviting devastating borers like the Rhinoceros Beetle." },
  { category: "4. The Impact", title: "Pathogen Invasion", description: "Weakened cellular walls allow deadly fungal infections to take hold, rotting the core of the palm from the inside out." },

  { category: "5. The Awareness", title: "Recognizing the Signs", description: "Early detection is the difference between a minor setback and the catastrophic loss of an entire plantation." },
  { category: "5. The Awareness", title: "Understanding the Chemistry", description: "Yellowing leaves aren't just 'getting old'—they are a desperate cry for precise, scientific intervention." },
  { category: "5. The Awareness", title: "The Cost of Inaction", description: "Ignoring the early warning signs inevitably leads to total crop failure and the death of decades-old trees." },

  { category: "6. The Intervention", title: "Targeted Nutrition", description: "We don't just dump fertilizer. We deploy highly specialized, laboratory-tested bio-stimulants engineered exclusively for coconuts." },
  { category: "6. The Intervention", title: "Root Rehabilitation", description: "Our formulas focus heavily on the rhizosphere, instantly lowering soil salinity and unlocking trapped macronutrients." },
  { category: "6. The Intervention", title: "Immunity Boosting", description: "By rapidly replenishing trace minerals like Boron and Zinc, the palm's natural defenses against disease are instantly reactivated." },

  { category: "7. The Recovery", title: "Cellular Healing", description: "Within weeks, the necrotic decline halts. New, vibrant green growth emerges from the crown." },
  { category: "7. The Recovery", title: "Restored Vigor", description: "The canopy thickens, the trunk solidifies, and the tree returns to its peak photosynthetic capacity." },
  { category: "7. The Recovery", title: "Ecosystem Rebirth", description: "The soil microbiome recovers, creating a self-sustaining cycle of health and extreme resilience." },

  { category: "8. The Future", title: "Unprecedented Yield", description: "A fully recovered, perfectly nourished palm will produce up to 40% more nuts in a single harvest season." },
  { category: "8. The Future", title: "Climate Resilience", description: "Treated trees are highly resistant to extreme heat, prolonged drought, and heavy flooding." },
  { category: "8. The Future", title: "Sustainable Agriculture", description: "This is the core of coconut care. A scientific, sustainable approach that guarantees the tree of life thrives for generations." }
];

try {
  const files = fs.readdirSync(effectsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  
  const mappedImages = files.map((file, idx) => {
    const phase = storyPhases[idx % storyPhases.length];
    return {
      src: `/AppImages/Effects/${file}`,
      category: phase.category,
      title: phase.title,
      description: phase.description
    };
  });

  const imageArrayStr = JSON.stringify(mappedImages, null, 2);

  const componentCode = `"use client";
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

  const storyData = ${imageArrayStr};

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
    <section ref={containerRef} className="w-full h-screen bg-[#d3cec4] dark:bg-[#0a0f0a] overflow-hidden border-y border-green-900 relative">
      
      {/* The massive flex container that slides horizontally */}
      <div ref={sliderRef} className="flex h-full will-change-transform" style={{ width: \`\${storyData.length * 100}vw\` }}> 
        {storyData.map((data, idx) => (
          <div key={\`slide-\${idx}\`} className="w-screen h-screen flex-shrink-0 relative flex flex-col items-center justify-start pt-12 md:pt-16 px-4 md:px-12">
            
            {/* Top Text Layer */}
            <div 
              ref={el => textRefs.current[idx] = el}
              className="text-center max-w-4xl z-20 mb-8 bg-black/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl"
            >
              <span className="text-green-400 font-extrabold tracking-[0.25em] uppercase text-xs md:text-sm mb-2 block drop-shadow-md">
                {data.category}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-lg">
                {data.title}
              </h2>
              <p className="text-base md:text-xl text-white/90 font-medium drop-shadow-lg">
                {data.description}
              </p>
            </div>

            {/* Infographic Image Layer (object-contain guarantees 100% visibility, no cropping) */}
            <div className="flex-1 w-full flex items-center justify-center pb-12 overflow-hidden">
              <img 
                src={data.src} 
                alt={data.title} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-black/5 dark:border-white/5" 
                loading={idx < 3 ? "eager" : "lazy"} 
              />
            </div>
            
          </div>
        ))}
      </div>
      
    </section>
  );
}
`;

  fs.writeFileSync(targetFile, componentCode);
  console.log('Successfully generated Horizontal EffectsStory.js with GSAP ScrollTrigger.');
} catch(e) {
  console.error('Error:', e);
}
