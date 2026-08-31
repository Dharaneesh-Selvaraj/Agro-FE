import React from 'react';

const ThreatCard = ({ image, title, frontDescription, backTitle, backDescription, solution }) => {
  return (
    <div className="group perspective-1000 w-full h-[400px] cursor-pointer">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180 rounded-3xl shadow-xl">
        
        {/* Front of Card */}
        <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden bg-green-950">
          <img src={image} alt={title} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
            <h3 className="text-3xl font-extrabold text-white mb-2">{title}</h3>
            <p className="text-white/80 font-medium">{frontDescription}</p>
            <div className="mt-4 flex items-center text-green-400 font-bold text-sm tracking-widest uppercase">
              <span>Hover to Reveal Impact</span>
              <span className="ml-2 animate-bounce">→</span>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden glass-modern bg-green-900/95 dark:bg-green-950 flex flex-col justify-center p-8 border border-green-500/30">
          <h3 className="text-2xl font-bold text-green-400 mb-4">{backTitle}</h3>
          <p className="text-green-50 mb-6 text-sm leading-relaxed">{backDescription}</p>
          <div className="p-4 bg-black/40 rounded-xl border border-green-500/20">
            <h4 className="text-green-400 font-bold text-xs uppercase tracking-wider mb-2">Our Solution</h4>
            <p className="text-green-100 text-sm">{solution}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function AwarenessSection() {
  const threats = [
    {
      image: "/AppImages/Threats/soil.jpg",
      title: "Soil Depletion",
      frontDescription: "Decades of intensive farming strip vital nutrients.",
      backTitle: "The Potassium Crisis",
      backDescription: "Without adequate potassium and magnesium, coconut palms develop yellowing fronds, weak trunks, and suffer a catastrophic drop in nut yield and quality. The soil becomes cracked and lifeless.",
      solution: "Our formulas are enriched with slow-release organic bio-stimulants that rebuild the soil microbiome and restore perfect potassium levels."
    },
    {
      image: "/AppImages/Threats/climate.jpg",
      title: "Climate Stress",
      frontDescription: "Extreme heat and erratic rainfall devastate crop cycles.",
      backTitle: "Drought & Heat Exhaustion",
      backDescription: "Shifting weather patterns subject coconut trees to extreme water stress. This leads to premature nut drop, withered canopies, and eventual tree death if left unmanaged during peak summer.",
      solution: "AgroSystem nutrients enhance water retention at the root level, making palms incredibly resilient to prolonged drought."
    },
    {
      image: "/AppImages/Threats/disease.jpg",
      title: "Pests & Disease",
      frontDescription: "Weakened immune systems invite devastating pathogens.",
      backTitle: "Lethal Pathogens",
      backDescription: "A malnourished palm is highly susceptible to Lethal Yellowing disease and Rhinoceros Beetles. Once infected, the vascular system collapses, spreading rapidly through entire plantations.",
      solution: "We provide targeted immuno-boosters that fortify the cellular walls of the palm, preventing pest boring and fungal infections."
    }
  ];

  return (
    <section className="w-full bg-green-50 dark:bg-green-950 py-24 border-y border-green-200 dark:border-green-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-green-600 dark:text-green-400 font-bold tracking-widest uppercase text-sm mb-4 block">The State of the Coconut</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-950 dark:text-white mb-6 tracking-tight">Understanding The Threats</h2>
          <p className="text-lg text-green-800 dark:text-green-200 font-medium leading-relaxed">
            Coconut palms are incredibly resilient, but they are facing unprecedented modern challenges. Understanding these threats is the first step to securing a high-yield, sustainable future.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {threats.map((threat, index) => (
            <ThreatCard key={index} {...threat} />
          ))}
        </div>

      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
}
