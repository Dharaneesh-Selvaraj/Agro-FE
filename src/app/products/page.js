"use client";

import { useAppContext } from "@/context/AppContext";
import FertilizerCard from "@/components/FertilizerCard";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function ProductsPage() {
  const { fertilizers } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("All");

  // Dynamically get unique categories from the inventory
  const categories = useMemo(() => {
    const cats = new Set(fertilizers.map(f => f.category));
    return ["All", ...Array.from(cats)];
  }, [fertilizers]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return fertilizers;
    return fertilizers.filter(f => f.category === activeCategory);
  }, [fertilizers, activeCategory]);

  return (
    <div className="min-h-[85vh] flex flex-col container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-green-200 dark:border-green-800 pb-6">
        <div>
          <h1 className="text-5xl font-extrabold text-green-950 dark:text-green-50 mb-4 tracking-tight">
            Products Catalog
          </h1>
          <p className="text-lg text-green-800 dark:text-green-300 font-medium max-w-2xl">
            Explore our comprehensive inventory of premium agricultural products. From advanced fertilisers to potent pest control, we stock the industry's best solutions.
          </p>
        </div>
        <Link 
          href="/"
          className="text-green-600 hover:text-green-500 font-bold underline underline-offset-4 mb-2"
        >
          &larr; Back to Home
        </Link>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-md ${
              activeCategory === cat 
                ? "bg-green-600 text-white border-transparent" 
                : "bg-white dark:bg-green-900/40 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((fert) => (
          <FertilizerCard 
            key={fert.id} 
            fertilizer={fert} 
            isAdmin={false}
            onDelete={() => {}}
          />
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center glass-modern rounded-3xl border border-green-200">
            <span className="text-6xl mb-6">🌱</span>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">Inventory Empty</p>
            <p className="text-green-700 dark:text-green-300 mt-2">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
