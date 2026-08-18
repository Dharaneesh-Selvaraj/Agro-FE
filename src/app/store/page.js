"use client";

import { useAppContext } from "@/context/AppContext";
import FertilizerCard from "@/components/FertilizerCard";
import Link from "next/link";

export default function StorePage() {
  const { fertilizers } = useAppContext();

  return (
    <div className="min-h-[85vh] flex flex-col container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-green-200 dark:border-green-800 pb-6">
        <div>
          <h1 className="text-5xl font-extrabold text-green-950 dark:text-green-50 mb-4 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-lg text-green-800 dark:text-green-300 font-medium max-w-2xl">
            Explore our full catalog of premium agricultural products. Whether you're growing coconuts or managing a large farm, we have the right nutrients for your soil.
          </p>
        </div>
        <Link 
          href="/"
          className="text-green-600 hover:text-green-500 font-bold underline underline-offset-4 mb-2"
        >
          &larr; Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {fertilizers.map((fert) => (
          <FertilizerCard 
            key={fert.id} 
            fertilizer={fert} 
            isAdmin={false}
            onDelete={() => {}}
          />
        ))}
        
        {fertilizers.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center glass-modern rounded-3xl border border-green-200">
            <span className="text-6xl mb-6">🌱</span>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">Inventory Empty</p>
            <p className="text-green-700 dark:text-green-300 mt-2">New fertilizers will be stocked soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
