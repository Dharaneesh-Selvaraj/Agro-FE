"use client";

import { useAppContext } from "@/context/AppContext";
import FertilizerCard from "@/components/FertilizerCard";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

export default function ProductsPage() {
  const { fertilizers } = useAppContext();
  
  // Filter States
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  // UI State
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Get unique main categories from inventory (excluding 'All')
  const mainCategories = useMemo(() => {
    return Array.from(new Set(fertilizers.map(f => f.category)));
  }, [fertilizers]);

  // Helper to get subcategories for a specific main category
  const getSubCategories = (category) => {
    return Array.from(
      new Set(
        fertilizers
          .filter(f => f.category === category)
          .map(f => f.subCategory)
          .filter(Boolean)
      )
    );
  };

  const handleCategoryClick = (cat) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null); // Collapse if already open
    } else {
      setExpandedCategory(cat);  // Expand
      setActiveCategory(cat);    // Select the category
      setActiveSubCategory("All"); // Reset subcategory
    }
  };

  const handleSubCategoryClick = (cat, subCat) => {
    setActiveCategory(cat);
    setActiveSubCategory(subCat);
  };

  const handleClearFilters = () => {
    setActiveCategory("All");
    setActiveSubCategory("All");
    setExpandedCategory(null);
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let results = fertilizers;
    
    if (activeCategory !== "All") {
      results = results.filter(f => f.category === activeCategory);
      if (activeSubCategory !== "All") {
        results = results.filter(f => f.subCategory === activeSubCategory);
      }
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(f => f.name.toLowerCase().includes(query));
    }
    
    if (minPrice !== "") {
      results = results.filter(f => f.price >= parseFloat(minPrice));
    }
    if (maxPrice !== "") {
      results = results.filter(f => f.price <= parseFloat(maxPrice));
    }
    
    return results;
  }, [fertilizers, activeCategory, activeSubCategory, searchQuery, minPrice, maxPrice]);

  return (
    <div className="min-h-[85vh] flex flex-col w-full px-4 lg:px-12 py-12 relative z-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-green-200 dark:border-green-800 pb-6">
        <div className="w-full md:w-auto">
          <h1 className="text-5xl font-extrabold text-green-950 dark:text-green-50 mb-4 tracking-tight">
            Products Catalog
          </h1>
          <p className="text-lg text-green-800 dark:text-green-300 font-medium max-w-2xl">
            Explore our comprehensive inventory of premium agricultural products.
          </p>
        </div>
        <Link 
          href="/"
          className="text-green-600 hover:text-green-500 font-bold underline underline-offset-4 mb-2 mt-4 md:mt-0 whitespace-nowrap"
        >
          &larr; Back to Home
        </Link>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 relative">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 flex flex-col gap-8 lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-800 scrollbar-track-transparent glass-modern p-6 rounded-3xl w-full">
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100">Filters</h2>
            <button 
              onClick={handleClearFilters}
              className="text-xs font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 underline"
            >
              Clear All
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-green-300 dark:border-green-700 bg-transparent text-green-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-3.5 top-3 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* Category Accordion */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold tracking-widest text-green-800/60 dark:text-green-400/60 uppercase mb-2">Categories</h3>
            
            <button
              onClick={() => { setActiveCategory("All"); setExpandedCategory(null); }}
              className={`text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeCategory === "All" 
                  ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-white" 
                  : "text-green-800 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/50"
              }`}
            >
              All Products
            </button>

            {mainCategories.map(cat => {
              const isExpanded = expandedCategory === cat;
              const isSelected = activeCategory === cat;
              const subCats = getSubCategories(cat);

              return (
                <div key={cat} className="flex flex-col">
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex justify-between items-center text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isSelected && activeCategory !== "All"
                        ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-white" 
                        : "text-green-800 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/50"
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    {subCats.length > 0 && (
                      <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </button>
                  
                  {/* Subcategories */}
                  {isExpanded && subCats.length > 0 && (
                    <div className="flex flex-col gap-1 pl-6 pr-2 mt-1 border-l-2 border-green-200 dark:border-green-800 ml-4">
                      <button
                        onClick={() => handleSubCategoryClick(cat, "All")}
                        className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          activeSubCategory === "All" 
                            ? "font-bold text-green-900 dark:text-white" 
                            : "text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40"
                        }`}
                      >
                        All {cat}
                      </button>
                      {subCats.map(sub => (
                        <button
                          key={sub}
                          onClick={() => handleSubCategoryClick(cat, sub)}
                          className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            activeSubCategory === sub 
                              ? "font-bold text-green-900 dark:text-white" 
                              : "text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-bold tracking-widest text-green-800/60 dark:text-green-400/60 uppercase mb-4">Price Range</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-green-200 dark:border-green-800 bg-transparent text-sm text-green-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="text-green-500 font-bold">-</span>
              <input 
                type="number" 
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-green-200 dark:border-green-800 bg-transparent text-sm text-green-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 flex flex-col gap-6 w-full">
          
          <div className="flex justify-between items-center text-green-800 dark:text-green-300 font-medium glass-modern px-6 py-3 rounded-2xl w-full">
            <p>Showing <span className="font-bold text-green-950 dark:text-white">{filteredProducts.length}</span> products</p>
            {activeCategory !== "All" && (
              <p className="text-sm hidden sm:block truncate ml-4">
                Filtered by: <span className="font-bold">{activeCategory}</span> 
                {activeSubCategory !== "All" && ` > ${activeSubCategory}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {filteredProducts.map((fert) => (
              <FertilizerCard 
                key={fert.id} 
                fertilizer={fert} 
                isAdmin={false}
                onDelete={() => {}}
              />
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center glass-modern rounded-3xl border border-green-200">
                <span className="text-6xl mb-6 text-green-500">🔍</span>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">No matches found</p>
                <p className="text-green-700 dark:text-green-300 mt-2">Try adjusting your filters or search query.</p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </main>
        
      </div>
    </div>
  );
}
