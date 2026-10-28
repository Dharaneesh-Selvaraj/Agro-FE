"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

const CATEGORIES = ["Organic", "Chemical", "Liquid", "Granular", "General"];

function AdminForm() {
  const { user, fertilizers, addFertilizer, editFertilizer } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    subCategory: "General",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (editId && fertilizers.length > 0) {
      const fert = fertilizers.find(f => f.id.toString() === editId);
      if (fert) {
        setFormData({
          name: fert.name,
          category: fert.category || "General",
          subCategory: fert.subCategory || "General",
          price: fert.price || "",
          description: fert.description,
        });
        setImageFile(null);
      }
    } else {
      setFormData({ name: "", category: "General", subCategory: "General", price: "", description: "" });
      setImageFile(null);
    }
  }, [editId, fertilizers]);

  if (!user || user.role !== "admin") return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCancelEdit = () => {
    router.push("/admin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setIsUploading(true);
    let uploadedImageUrl = "";

    try {
      if (imageFile) {
        const data = new FormData();
        data.append('file', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) uploadedImageUrl = json.imageUrl;
        else alert('Upload failed: ' + json.error);
      }

      const payload = { ...formData, price: Number(formData.price) || 0 };
      if (uploadedImageUrl) payload.image = uploadedImageUrl;

      if (editId) {
        await editFertilizer(editId, payload);
        alert("Product updated successfully!");
        router.push("/admin/products"); // Go back to products list after editing
      } else {
        await addFertilizer(payload);
        alert("Product added successfully!");
        setFormData({ name: "", category: "General", subCategory: "General", price: "", description: "" });
        setImageFile(null);
        const fileInput = document.getElementById('imageUpload');
        if(fileInput) fileInput.value = "";
      }
      
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-green-950 dark:text-white tracking-tight">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/admin/customers"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>👥 Customers & Bulk Upload</span>
          </Link>
          <Link 
            href="/admin/products"
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>📦 Manage Products</span>
          </Link>
          <Link 
            href="/admin/whatsapp"
            style={{ backgroundColor: '#25D366' }}
            className="hover:opacity-90 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <span>📱 WhatsApp Campaigns</span>
          </Link>
        </div>
      </div>

      <div className="glass-modern p-10 rounded-[2.5rem] relative w-full shadow-2xl border-4 border-green-50 dark:border-green-900/30">
        <h2 className="text-3xl font-extrabold text-green-950 dark:text-white mb-2 tracking-tight">
          {editId ? "Edit Product" : "Add New Product"}
        </h2>
        <p className="text-green-700 dark:text-green-300 mb-8 font-medium text-sm border-b border-green-200/50 pb-4">
          {editId ? "Update existing fertilizer details." : "Fill out the form below to add a new product to the inventory."}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white appearance-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Sub-Category</label>
              <input
                type="text"
                name="subCategory"
                placeholder="e.g. Nitrogen-rich"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white resize-none"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Upload Product Image</label>
            <div className="w-full relative border-2 border-dashed border-green-400 dark:border-green-600 rounded-2xl bg-green-50/50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors p-8 text-center cursor-pointer overflow-hidden">
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imageFile ? (
                <div className="text-green-800 dark:text-green-200 font-semibold truncate text-lg">📁 {imageFile.name}</div>
              ) : (
                <div className="text-green-700 dark:text-green-400 font-medium">
                  {editId ? "Drop new image here (leave blank to keep current image)" : "Drag & Drop or Click to Select File"}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-green-500 hover:bg-green-400 text-green-950 text-xl font-extrabold py-5 rounded-2xl shadow-[0_10px_20px_-10px_rgba(34,197,94,0.6)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? "Saving..." : (editId ? "Update Product Details" : "Add Product to Inventory")}
            </button>
            
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 text-lg font-extrabold py-5 px-8 rounded-2xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AdminForm />
    </Suspense>
  );
}
