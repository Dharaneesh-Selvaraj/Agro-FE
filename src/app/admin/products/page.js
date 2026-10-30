"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import FertilizerCard from "@/components/FertilizerCard";
import Link from "next/link";
import * as XLSX from "xlsx";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app";

export default function AdminProductsPage() {
  const { user, fertilizers, deleteFertilizer, fetchProducts, truncateFertilizers, seedFertilizers } = useAppContext();
  const router = useRouter();

  // Search and Filter State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTab, setBulkTab] = useState("file"); // 'file' or 'paste'
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [isTruncating, setIsTruncating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  // Extract unique categories for filter pills
  const categories = useMemo(() => {
    const set = new Set();
    fertilizers.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [fertilizers]);

  // Filtered inventory
  const filteredProducts = useMemo(() => {
    return fertilizers.filter((f) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        (f.category && f.category.toLowerCase() === selectedCategory.toLowerCase());

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.subCategory && f.subCategory.toLowerCase().includes(q)) ||
        (f.description && f.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [fertilizers, selectedCategory, search]);

  const handleEditClick = (fertilizer) => {
    router.push(`/admin?edit=${fertilizer.id}`);
  };

  // Parse Excel 2D rows into product catalog objects
  const parseExcelProductRows = (rawRows) => {
    if (!rawRows || rawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    // Filter out completely empty rows
    const rows = rawRows.filter(
      (r) => Array.isArray(r) && r.some((c) => c !== undefined && c !== null && String(c).trim() !== "")
    );

    if (rows.length === 0) {
      setParsedRows([]);
      return;
    }

    // Check if first row is a header
    const headerRow = rows[0].map((c) => String(c || "").trim().toLowerCase());
    const hasHeader = headerRow.some((c) =>
      c.includes("name") ||
      c.includes("product") ||
      c.includes("title") ||
      c.includes("price") ||
      c.includes("image")
    );

    let nameCol = -1;
    let catCol = -1;
    let subCatCol = -1;
    let priceCol = -1;
    let descCol = -1;
    let imageCol = -1;
    let tagsCol = -1;

    if (hasHeader) {
      headerRow.forEach((h, idx) => {
        if (nameCol === -1 && (h.includes("product") || h.includes("name") || h.includes("title"))) {
          nameCol = idx;
        } else if (subCatCol === -1 && (h.includes("sub") || h.includes("type"))) {
          subCatCol = idx;
        } else if (catCol === -1 && h.includes("cat")) {
          catCol = idx;
        } else if (
          priceCol === -1 &&
          (h.includes("price") || h.includes("cost") || h.includes("rate") || h.includes("mrp"))
        ) {
          priceCol = idx;
        } else if (descCol === -1 && (h.includes("desc") || h.includes("detail") || h.includes("about"))) {
          descCol = idx;
        } else if (
          imageCol === -1 &&
          (h.includes("image") ||
            h.includes("img") ||
            h.includes("photo") ||
            h.includes("pic") ||
            h.includes("url") ||
            h.includes("link"))
        ) {
          imageCol = idx;
        } else if (tagsCol === -1 && h.includes("tag")) {
          tagsCol = idx;
        }
      });
    }

    // Default column fallback positions: [Name, Category, SubCategory, Price, Description, Image URL, Tags]
    if (nameCol === -1) nameCol = 0;
    if (catCol === -1) catCol = 1;
    if (subCatCol === -1) subCatCol = 2;
    if (priceCol === -1) priceCol = 3;
    if (descCol === -1) descCol = 4;
    if (imageCol === -1) imageCol = 5;
    if (tagsCol === -1) tagsCol = 6;

    const dataRows = hasHeader ? rows.slice(1) : rows;

    const parsed = dataRows.map((row, idx) => {
      const name = String(row[nameCol] !== undefined && row[nameCol] !== null ? row[nameCol] : "").trim();
      const category =
        String(row[catCol] !== undefined && row[catCol] !== null ? row[catCol] : "General").trim() ||
        "General";
      const subCategory =
        String(row[subCatCol] !== undefined && row[subCatCol] !== null ? row[subCatCol] : "General").trim() ||
        "General";

      let rawPrice = String(row[priceCol] !== undefined && row[priceCol] !== null ? row[priceCol] : "").replace(
        /[^\d.]/g,
        ""
      );
      const price = isNaN(parseFloat(rawPrice)) ? 0 : parseFloat(rawPrice);

      const description = String(
        row[descCol] !== undefined && row[descCol] !== null ? row[descCol] : ""
      ).trim();

      const image =
        String(row[imageCol] !== undefined && row[imageCol] !== null ? row[imageCol] : "").trim() ||
        `https://placehold.co/400x600/e2e8f0/1e293b.png?text=${encodeURIComponent(
          name.slice(0, 20) || "Product"
        )}`;

      const tagsRaw = String(
        row[tagsCol] !== undefined && row[tagsCol] !== null ? row[tagsCol] : ""
      ).trim();

      const isValid = name.length > 0;

      return {
        id: idx + 1,
        name,
        category,
        subCategory,
        price,
        description,
        image,
        tags: tagsRaw,
        isValid,
        reason: isValid ? "Valid product" : "Product name is required",
      };
    });

    setParsedRows(parsed);
  };

  // Handle Excel file upload (.xlsx, .xls)
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStats(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          alert("The Excel file has no worksheets.");
          return;
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        parseExcelProductRows(rawRows);
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("Could not read this Excel file. Please ensure it is a valid .xlsx or .xls file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Paste data parsing
  const handlePasteChange = (e) => {
    const text = e.target.value;
    setPastedText(text);
    setUploadStats(null);

    if (!text || !text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Convert lines into 2D array splitting by tab or comma
    const rawRows = lines.map((line) => line.split(/[,\t]/).map((p) => p.trim()));
    parseExcelProductRows(rawRows);
  };

  // Execute Bulk Upload to Backend
  const handleConfirmBulkUpload = async () => {
    const validCandidates = parsedRows.filter((r) => r.isValid);
    if (validCandidates.length === 0) {
      alert("No valid products found to upload. Please ensure each row has a product name.");
      return;
    }

    setIsUploading(true);
    setUploadStats(null);

    try {
      const payload = validCandidates.map((r) => ({
        name: r.name,
        category: r.category,
        subCategory: r.subCategory,
        price: r.price,
        description: r.description,
        image: r.image,
        tags: r.tags,
      }));

      const res = await fetch(`${API_BASE}/api/products/bulk-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStats(data.stats);
        if (typeof fetchProducts === "function") {
          fetchProducts();
        }
      } else {
        alert(data.error || "Failed to process bulk upload.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while uploading products. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Download Sample Excel Template (.xlsx) with 3 mock data rows including image links
  const downloadSampleExcel = () => {
    const templateData = [
      ["Name", "Category", "SubCategory", "Price", "Description", "Image URL", "Tags"],
      [
        "NPK 19-19-19 Water Soluble Fertilizer",
        "FERTILIZERS",
        "Water Soluble",
        1250,
        "100% water-soluble balanced NPK fertilizer specially formulated for coconut palm vigor, foliar spray, and drip irrigation.",
        "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop",
        "Fertilizer, NPK, Soluble, Coconut",
      ],
      [
        "Neem Cake Organic Manure",
        "ORGANIC",
        "Bio-Fertilizer",
        680,
        "High-grade organic neem cake fertilizer rich in natural NPK and azadirachtin to protect coconut root zone against soil pests.",
        "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&auto=format&fit=crop",
        "Organic, Neem, Root Health, Manure",
      ],
      [
        "Boron 20% Disodium Octaborate",
        "MICRONUTRIENTS",
        "Micronutrient",
        420,
        "Essential high-absorption micronutrient preventing coconut button shedding and crown choking while enhancing kernel yield.",
        "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?w=600&auto=format&fit=crop",
        "Micronutrient, Boron, Coconut Setting",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws["!cols"] = [
      { wch: 38 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 60 },
      { wch: 55 },
      { wch: 35 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product_Template");
    XLSX.writeFile(wb, "products_bulk_upload_template.xlsx");
  };

  // Export All Products to Excel (.xlsx)
  const exportAllProductsExcel = () => {
    if (fertilizers.length === 0) {
      alert("No products in inventory to export.");
      return;
    }

    const exportData = fertilizers.map((p, idx) => ({
      "S.No": idx + 1,
      "Product Name": p.name || "",
      "Category": p.category || "General",
      "SubCategory": p.subCategory || "General",
      "Price (INR)": p.price || 0,
      "Description": p.description || "",
      "Image URL": p.image || "",
      "Tags": Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
      "Rating": p.rating || 4.5,
      "Reviews": p.reviews || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 32 },
      { wch: 20 },
      { wch: 20 },
      { wch: 14 },
      { wch: 45 },
      { wch: 45 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `products_catalog_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Truncate All Products in Database
  const handleTruncateAll = async () => {
    if (
      !confirm(
        `⚠️ DANGER: Are you sure you want to TRUNCATE and CLEAR all ${fertilizers.length} products from the database?\n\nThis will completely empty your product catalog so you can upload your custom Excel file cleanly.\n\nClick OK to proceed with clearing all products.`
      )
    ) {
      return;
    }

    setIsTruncating(true);
    try {
      if (typeof truncateFertilizers === "function") {
        await truncateFertilizers();
      } else {
        const res = await fetch(`${API_BASE}/api/products/truncate`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to truncate products");
        if (typeof fetchProducts === "function") await fetchProducts();
      }
      alert("✅ Product catalog truncated successfully! The catalog is now empty. Select your Excel file (.xlsx) to bulk upload your new products.");
      setParsedRows([]);
      setFileName("");
      setUploadStats(null);
      setShowBulkModal(true);
    } catch (err) {
      console.error("Truncate error:", err);
      alert("Failed to truncate products: " + (err.message || err));
    } finally {
      setIsTruncating(false);
    }
  };

  // Re-seed Default Products
  const handleSeedDefaults = async () => {
    if (
      !confirm(
        "Do you want to re-seed the default 147 agricultural products from seed.sql into your database?"
      )
    ) {
      return;
    }

    setIsSeeding(true);
    try {
      if (typeof seedFertilizers === "function") {
        await seedFertilizers();
      } else {
        const res = await fetch(`${API_BASE}/api/products/seed`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to seed products");
        if (typeof fetchProducts === "function") await fetchProducts();
      }
      alert("✅ Default 147 agricultural products seeded successfully into your catalog!");
    } catch (err) {
      console.error("Seed error:", err);
      alert("Failed to seed default products: " + (err.message || err));
    } finally {
      setIsSeeding(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen max-w-7xl">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-green-700 hover:text-green-900 font-bold bg-green-50 hover:bg-green-100 p-3 rounded-full transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold text-green-950 dark:text-white tracking-tight">
              Manage Products
            </h1>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Manage inventory, bulk upload Excel catalogs with image links, and update pricing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/customers"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>👥 Customers</span>
          </Link>
          <Link
            href="/admin/whatsapp"
            style={{ backgroundColor: "#25D366" }}
            className="hover:opacity-90 text-white font-extrabold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>📱 WhatsApp Promo</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards & Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-modern p-6 rounded-3xl border border-white/40 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 bg-green-500/20 text-green-600 rounded-2xl flex items-center justify-center text-3xl">
            📦
          </div>
          <div>
            <div className="text-3xl font-extrabold text-green-950 dark:text-white">
              {fertilizers.length}
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Products
            </div>
          </div>
        </div>

        <div className="glass-modern p-6 rounded-3xl border border-white/40 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-500/20 text-teal-600 rounded-2xl flex items-center justify-center text-3xl">
            🏷️
          </div>
          <div>
            <div className="text-3xl font-extrabold text-green-950 dark:text-white">
              {categories.length - 1}
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Active Categories
            </div>
          </div>
        </div>

        {/* Action 1: Bulk Upload Products */}
        <button
          onClick={() => {
            setShowBulkModal(true);
            setUploadStats(null);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-6 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 text-left"
        >
          <span className="text-3xl">📊</span>
          <div>
            <div className="font-extrabold text-lg">Bulk Upload</div>
            <div className="text-xs text-emerald-100 font-medium">Excel (.xlsx) with Images</div>
          </div>
        </button>

        {/* Action 2: Add Single Product */}
        <Link
          href="/admin"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white p-6 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 text-left"
        >
          <span className="text-3xl">➕</span>
          <div>
            <div className="font-extrabold text-lg">Add Single Product</div>
            <div className="text-xs text-green-100 font-medium">Form entry</div>
          </div>
        </Link>
      </div>

      {/* Main Catalog View Container */}
      <div className="glass-modern p-8 rounded-[2.5rem] shadow-2xl border border-white/40">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, category, or description..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/60 dark:bg-black/30 border border-green-200 dark:border-green-800 text-sm focus:border-green-500 outline-none transition text-green-950 dark:text-white"
            />
          </div>

          {/* Action buttons (Export & View Toggle) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-neutral-700 text-green-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  viewMode === "table"
                    ? "bg-white dark:bg-neutral-700 text-green-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Table
              </button>
            </div>

            <button
              onClick={exportAllProductsExcel}
              className="text-xs font-bold px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-2 border border-emerald-200 dark:border-emerald-800"
              title="Download entire product inventory as Excel workbook (.xlsx)"
            >
              <span>📊</span> Export to Excel (.xlsx)
            </button>

            <button
              onClick={handleTruncateAll}
              disabled={isTruncating || fertilizers.length === 0}
              className="text-xs font-bold px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-800 disabled:opacity-40"
              title="Clear all products from database"
            >
              <span>🗑️</span> {isTruncating ? "Truncating..." : "Truncate All Products"}
            </button>

            <button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="text-xs font-bold px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 disabled:opacity-40"
              title="Reset and re-seed default 147 products from seed.sql"
            >
              <span>🌱</span> {isSeeding ? "Seeding..." : "Re-Seed Defaults"}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none text-xs font-bold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-green-700 text-white shadow-md scale-105"
                  : "bg-green-50 dark:bg-neutral-800 text-green-900 dark:text-gray-300 hover:bg-green-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Content (Grid or Table) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">📦</div>
            <div className="font-extrabold text-xl text-green-950 dark:text-white">
              {fertilizers.length === 0
                ? "Product Catalog is Empty & Ready for Bulk Upload!"
                : search || selectedCategory !== "ALL"
                ? "No matching products found"
                : "No products in inventory yet"}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
              {fertilizers.length === 0
                ? "The database has been truncated. Click the Bulk Upload button below to import your custom Excel spreadsheet."
                : "Use the Bulk Upload button above to import your product catalog from an Excel file (.xlsx)."}
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(true);
                  setUploadStats(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 text-sm"
              >
                <span>📊</span> Bulk Upload Excel File
              </button>
              {fertilizers.length === 0 && (
                <button
                  onClick={handleSeedDefaults}
                  disabled={isSeeding}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-bold px-6 py-3 rounded-2xl transition text-sm flex items-center gap-2"
                >
                  <span>🌱</span> Restore 147 Default Products
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((fert) => (
              <FertilizerCard
                key={fert.id}
                fertilizer={fert}
                isAdmin={true}
                onEdit={handleEditClick}
                onDelete={deleteFertilizer}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-green-100 dark:border-green-900/40">
            <table className="w-full text-left text-sm text-green-950 dark:text-gray-200">
              <thead className="bg-green-100/70 dark:bg-green-900/40 text-xs font-bold uppercase tracking-wider text-green-900 dark:text-green-300">
                <tr>
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Product Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100/50 dark:divide-green-900/30">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <img
                        src={p.image || "https://placehold.co/80x80/e2e8f0/1e293b.png?text=Item"}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-green-200 dark:border-green-800 shadow-sm"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/80x80/e2e8f0/1e293b.png?text=Item";
                        }}
                      />
                    </td>
                    <td className="py-3 px-6 font-bold text-green-950 dark:text-white">
                      {p.name}
                      {p.subCategory && p.subCategory !== "General" && (
                        <div className="text-xs font-normal text-gray-500">{p.subCategory}</div>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {p.category || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-extrabold text-green-700 dark:text-green-300">
                      ₹{p.price}
                    </td>
                    <td className="py-3 px-6 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {p.description || "—"}
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteFertilizer(p.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 dark:bg-red-950/40 p-2 rounded-xl transition"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= BULK UPLOAD PRODUCTS MODAL ================= */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-white/20 p-8 my-8 relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-green-950 dark:text-white flex items-center gap-2">
                  <span>📊</span> Bulk Upload Products (Excel)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload an Excel workbook (.xlsx, .xls) containing product names, categories, pricing, descriptions, and image links.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Quick Truncate Banner inside Bulk Upload Modal */}
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-extrabold text-sm">Want a clean slate before uploading?</div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    You currently have <strong>{fertilizers.length}</strong> products in database. Truncating will clear all existing items so only your fresh Excel file is stored.
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isTruncating || fertilizers.length === 0}
                onClick={handleTruncateAll}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 whitespace-nowrap text-xs"
              >
                {isTruncating ? "Truncating..." : "🗑️ Truncate All Products First"}
              </button>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setBulkTab("file")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  bulkTab === "file"
                    ? "bg-white dark:bg-neutral-700 text-green-800 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                📊 Upload Excel File (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setBulkTab("paste")}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  bulkTab === "paste"
                    ? "bg-white dark:bg-neutral-700 text-green-800 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                📋 Copy & Paste List
              </button>
            </div>

            {/* Tab 1: Excel File Upload */}
            {bulkTab === "file" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-3xl p-8 text-center bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 transition-colors">
                  <input
                    type="file"
                    id="excelProductFileInput"
                    accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="excelProductFileInput"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-5xl">📊</span>
                    <span className="font-extrabold text-green-950 dark:text-white text-base">
                      {fileName ? fileName : "Click to select product Excel file (.xlsx, .xls), or drag and drop"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Columns: <strong>Name, Category, SubCategory, Price, Description, Image URL, Tags</strong>
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 pt-1 gap-2">
                  <span>Need an Excel template with mock data and image links?</span>
                  <button
                    type="button"
                    onClick={downloadSampleExcel}
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>📥</span> Download Excel Template (.xlsx)
                  </button>
                </div>
              </div>
            ) : (
              /* Tab 2: Paste List */
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Paste rows below (Tab or Comma separated: <code>Name, Category, SubCategory, Price, Description, Image URL</code>):
                </label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={handlePasteChange}
                  placeholder={`NPK 19-19-19, FERTILIZERS, Soluble, 1250, Balanced NPK fertilizer, https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop\nNeem Cake Organic, ORGANIC, Bio-Fertilizer, 680, Pure neem organic manure, https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&auto=format&fit=crop`}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-sm font-mono focus:border-green-500 outline-none text-green-950 dark:text-white"
                ></textarea>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="mt-6 border-t border-gray-100 dark:border-neutral-800 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-sm text-green-950 dark:text-white">
                    Preview: {parsedRows.length} products found in file
                  </div>
                  <div className="flex gap-2 text-xs font-bold">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      ✓ {parsedRows.filter((r) => r.isValid).length} Valid
                    </span>
                    {parsedRows.filter((r) => !r.isValid).length > 0 && (
                      <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
                        ✕ {parsedRows.filter((r) => !r.isValid).length} Invalid
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-neutral-800 rounded-2xl text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5 pl-4">#</th>
                        <th className="p-2.5">Image</th>
                        <th className="p-2.5">Product Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                      {parsedRows.slice(0, 50).map((r, i) => (
                        <tr key={r.id} className={r.isValid ? "" : "bg-red-50/50 dark:bg-red-950/20"}>
                          <td className="p-2.5 pl-4 text-gray-400 font-mono">{i + 1}</td>
                          <td className="p-2.5">
                            <img
                              src={r.image}
                              alt={r.name}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-neutral-700"
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/60x60/e2e8f0/1e293b.png?text=Photo";
                              }}
                            />
                          </td>
                          <td className="p-2.5 font-semibold text-green-950 dark:text-white">
                            {r.name || "(Missing Name)"}
                          </td>
                          <td className="p-2.5">
                            <span className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium">
                              {r.category}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                            ₹{r.price}
                          </td>
                          <td className="p-2.5 text-gray-500 max-w-xs truncate">
                            {r.description || "—"}
                          </td>
                          <td className="p-2.5">
                            {r.isValid ? (
                              <span className="text-emerald-600 font-bold">✓ Ready</span>
                            ) : (
                              <span className="text-red-500 font-bold">{r.reason}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 50 && (
                    <div className="p-2 text-center text-gray-400 text-xs bg-gray-50 dark:bg-neutral-800/50">
                      ...and {parsedRows.length - 50} more products
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Banner */}
            {uploadStats && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-sm">
                <div className="font-extrabold flex items-center gap-2 mb-1">
                  <span>🎉</span> Bulk Upload Successful!
                </div>
                <div className="text-xs font-medium space-y-0.5">
                  <div>
                    • <strong>{uploadStats.inserted}</strong> new products added to catalog.
                  </div>
                  <div>
                    • <strong>{uploadStats.updated}</strong> existing products updated.
                  </div>
                  {uploadStats.skipped > 0 && (
                    <div>
                      • <strong>{uploadStats.skipped}</strong> invalid items skipped.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-neutral-800 pt-4">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 rounded-2xl text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isUploading || parsedRows.filter((r) => r.isValid).length === 0}
                onClick={handleConfirmBulkUpload}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-extrabold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin">⏳</span> Processing Products...
                  </>
                ) : (
                  <>
                    <span>💾</span> Save {parsedRows.filter((r) => r.isValid).length} Products to Catalog
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
