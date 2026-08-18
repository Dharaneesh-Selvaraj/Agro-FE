"use client";

import React from "react";

export default function FertilizerCard({ fertilizer, isAdmin, onDelete }) {
  return (
    <div className="glass-modern rounded-3xl overflow-hidden group hover:-translate-y-3 transition-all duration-500 flex flex-col h-full border border-green-200/50 dark:border-green-800/50 hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.3)]">
      <div className="relative w-full h-56 bg-green-100 dark:bg-green-900 overflow-hidden">
        {fertilizer.image ? (
          <img
            src={fertilizer.image}
            alt={fertilizer.name}
            className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-green-700 dark:text-green-300">
            <span className="text-4xl mb-2 opacity-50">🌱</span>
            <span className="text-sm font-medium opacity-70">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow bg-white/40 dark:bg-black/20">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-green-950 dark:text-green-50 leading-tight">
            {fertilizer.name}
          </h3>
          <span className="bg-green-500 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-md">
            ₹{parseFloat(fertilizer.price).toFixed(2)}
          </span>
        </div>
        <p className="text-green-800/80 dark:text-green-200/80 flex-grow mb-6 font-medium leading-relaxed">
          {fertilizer.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-200 dark:border-green-800">
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
            Added {new Date(fertilizer.dateAdded).toLocaleDateString()}
          </span>
          {isAdmin && (
            <button
              onClick={() => onDelete(fertilizer.id)}
              className="text-red-500 hover:text-red-100 font-bold text-xs uppercase tracking-wider px-4 py-2 hover:bg-red-500 rounded-full transition-all"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
