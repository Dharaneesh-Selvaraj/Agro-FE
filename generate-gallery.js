const fs = require('fs');
const path = require('path');

const effectsDir = path.join(__dirname, 'public', 'AppImages', 'Effects');
const targetFile = path.join(__dirname, 'src', 'components', 'EffectsGallery.js');

try {
  const files = fs.readdirSync(effectsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  
  const imageArrayStr = JSON.stringify(files.map(f => `/AppImages/Effects/${f}`), null, 2);

  const componentCode = `import React from 'react';

export default function EffectsGallery() {
  const images = ${imageArrayStr};

  return (
    <section className="w-full bg-white dark:bg-green-950 py-24 border-y border-green-100 dark:border-green-900 overflow-hidden relative transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-green-600 dark:text-green-400 font-bold tracking-widest uppercase text-sm mb-4 block">Real-World Impact</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-950 dark:text-white mb-6 tracking-tight transition-colors duration-500">Visualizing the Effects</h2>
          <p className="text-lg text-green-800 dark:text-green-200 font-medium leading-relaxed transition-colors duration-500">
            A visual showcase of the environmental factors, diseases, and nutrient deficiencies directly impacting coconut palms in the field.
          </p>
        </div>

        {/* Masonry Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img, index) => (
            <div key={index} className="break-inside-avoid relative group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer">
              <img 
                src={img} 
                alt={\`Impact factor \${index + 1}\`} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/20 transition-colors duration-300"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
`;

  fs.writeFileSync(targetFile, componentCode);
  console.log('Successfully generated EffectsGallery.js with ' + files.length + ' images.');
} catch(e) {
  console.error('Error:', e);
}
