const fs = require('fs');
const path = require('path');

const effectsDir = path.join(__dirname, 'public', 'AppImages', 'Effects');
const targetFile = path.join(__dirname, 'src', 'components', 'EffectsGallery.js');

const agriculturalImpacts = [
  { title: "Nitrogen Starvation", description: "Causes stunted growth and severe yellowing of older fronds." },
  { title: "Potassium Deficiency", description: "Leads to orange-yellow spots on leaves and dramatic yield reduction." },
  { title: "Magnesium Depletion", description: "Results in chlorosis where leaflets turn yellow but veins remain green." },
  { title: "Boron Shortage", description: "Causes crown choking, un-opened leaves, and malformed nuts." },
  { title: "Lethal Yellowing", description: "A devastating phytoplasma disease causing rapid palm death." },
  { title: "Rhinoceros Beetle", description: "Bores into the crown, destroying developing fronds and stunting growth." },
  { title: "Red Palm Weevil", description: "Larvae burrow through the trunk, hollow it out, and kill the tree." },
  { title: "Bud Rot Fungi", description: "Fungal infection that rots the apical meristem, stopping all growth." },
  { title: "Salinity Shock", description: "High soil salt levels cause scorched leaf margins and root damage." },
  { title: "Drought Stress", description: "Prolonged water lack causes drooping fronds and premature nut drop." },
  { title: "Waterlogging", description: "Saturated roots lack oxygen, leading to rapid yellowing and root rot." },
  { title: "Root Wilt Disease", description: "Causes flaccidity and ribbing of leaflets, severely lowering yield." },
  { title: "Coconut Mite Damage", description: "Attacks young nuts, causing scarring, stunting, and premature fall." },
  { title: "Leaf Blight", description: "Fungal spots merge to destroy large areas of photosynthetic tissue." },
  { title: "Stem Bleeding", description: "Reddish-brown liquid oozes from trunk cracks, indicating internal rot." },
  { title: "Iron Chlorosis", description: "Young leaves turn pale yellow or white while veins remain dark." },
  { title: "Calcium Deficiency", description: "New fronds emerge deformed, brittle, and highly susceptible to breakage." },
  { title: "Zinc Shortage", description: "Leaves become abnormally small, clustered, and rosette-like." },
  { title: "Copper Depletion", description: "Causes lack of trunk rigidity and excessive leaf drooping." },
  { title: "Manganese Deficiency", description: "Interveinal chlorosis spreads rapidly across all mature fronds." },
  { title: "Wind Damage", description: "High-velocity storms snap fronds and compromise trunk integrity." },
  { title: "Sun Scorch", description: "Extreme UV exposure causes burned, necrotic patches on sun-facing leaves." },
  { title: "Soil Compaction", description: "Hardened earth restricts root expansion and nutrient uptake." },
  { title: "Aluminium Toxicity", description: "Highly acidic soils release toxic ions that stunt root tips." }
];

try {
  const files = fs.readdirSync(effectsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  
  // Map files to the impacts
  const mappedImages = files.map((file, idx) => {
    const impact = agriculturalImpacts[idx % agriculturalImpacts.length];
    return {
      src: `/AppImages/Effects/${file}`,
      title: impact.title,
      description: impact.description
    };
  });

  const imageArrayStr = JSON.stringify(mappedImages, null, 2);

  const componentCode = `"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function EffectsGallery() {
  const containerRef = useRef(null);
  
  // Track scroll progress within the gallery container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smoother, slightly slower parallax translations for readability
  // Col 1 & 3 move UP
  const yUp = useTransform(scrollYProgress, [0, 1], [100, -300]);
  // Col 2 moves DOWN
  const yDown = useTransform(scrollYProgress, [0, 1], [-300, 100]);

  const images = ${imageArrayStr};

  // Split images into 3 columns (8 images each) for a larger, clearer full-screen layout
  const col1 = images.slice(0, 8);
  const col2 = images.slice(8, 16);
  const col3 = images.slice(16, 24);

  const renderColumn = (columnImages, yTransform, extraClass = "") => (
    <motion.div 
      style={{ y: yTransform }} 
      className={\`flex flex-col gap-8 w-full \${extraClass}\`}
    >
      {columnImages.map((img, idx) => (
        <div key={idx} className="relative group overflow-hidden rounded-[2rem] shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.5)] transition-all duration-700 cursor-pointer bg-green-100 dark:bg-green-900 border border-black/10 dark:border-white/10 aspect-[4/5] sm:aspect-square">
          <img 
            src={img.src} 
            alt={img.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-in-out" 
            loading="lazy"
          />
          {/* Permanent gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          {/* Text Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:-translate-y-2 transition-transform duration-500">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight drop-shadow-md">{img.title}</h3>
            <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity">{img.description}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );

  return (
    <section className="w-full bg-green-50 dark:bg-[#02140a] py-32 border-y border-green-200 dark:border-green-900 transition-colors duration-500 relative overflow-hidden">
      
      <div className="text-center mb-16 max-w-4xl mx-auto px-6 relative z-20">
        <span className="text-green-600 dark:text-green-400 font-extrabold tracking-widest uppercase text-sm mb-4 block">Real-World Impact</span>
        <h2 className="text-5xl md:text-7xl font-black text-green-950 dark:text-white mb-6 tracking-tighter transition-colors duration-500">Visualizing the Effects</h2>
        <p className="text-xl text-green-800 dark:text-green-200 font-medium leading-relaxed transition-colors duration-500 max-w-2xl mx-auto">
          Explore the exact visual indicators of the environmental factors, devastating diseases, and critical nutrient deficiencies directly impacting coconut palms in the field.
        </p>
      </div>

      {/* The Full-Screen Parallax Container */}
      <div ref={containerRef} className="w-full h-[1200px] overflow-hidden relative shadow-inner bg-green-100/50 dark:bg-black/40 border-y border-green-200 dark:border-green-900">
        
        {/* Extreme Fading Gradients to smooth out the top and bottom cuts */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-50 dark:from-[#02140a] via-green-50/80 dark:via-[#02140a]/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-green-50 dark:from-[#02140a] via-green-50/80 dark:via-[#02140a]/80 to-transparent z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 absolute left-8 right-8 lg:left-12 lg:right-12 top-0 bottom-0 pointer-events-auto">
          {renderColumn(col1, yUp)}
          {renderColumn(col2, yDown, "hidden md:flex mt-48")}
          {renderColumn(col3, yUp, "hidden lg:flex")}
        </div>

      </div>
    </section>
  );
}
`;

  fs.writeFileSync(targetFile, componentCode);
  console.log('Successfully generated Full-Screen EffectsGallery.js with ' + files.length + ' images.');
} catch(e) {
  console.error('Error:', e);
}
