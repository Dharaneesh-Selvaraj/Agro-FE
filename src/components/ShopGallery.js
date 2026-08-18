"use client";

import React from "react";
import shopImages from "@/data/shopImages.json";

export default function ShopGallery() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-green-950 dark:text-green-50 mb-4 tracking-tight">
          Take a Tour of Our Shop
        </h2>
        <p className="text-lg text-green-800 dark:text-green-300 font-medium max-w-2xl mx-auto">
          Explore our physical locations and see where the magic happens. We maintain the highest standards of quality and cleanliness.
        </p>
      </div>

      {/* Masonry or Grid Layout for Images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
        {shopImages.map((src, index) => {
          // Make some images span 2 rows or columns for a masonry feel
          const isLarge = index % 5 === 0;
          return (
            <div 
              key={index} 
              className={`relative rounded-3xl overflow-hidden group glass-modern border border-white/20 shadow-lg 
                ${isLarge ? "row-span-2 col-span-2 md:col-span-2" : "row-span-1 col-span-1"}`}
            >
              <img 
                src={src} 
                alt={`Shop View ${index + 1}`} 
                loading="lazy"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-bold text-sm bg-green-500/80 px-3 py-1 rounded-full backdrop-blur-md">
                  Shop Area {index + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
