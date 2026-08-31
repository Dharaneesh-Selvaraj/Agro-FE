"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import FertilizerCard from "@/components/FertilizerCard";

export default function AdminPage() {
  const { user, fertilizers, addFertilizer, deleteFertilizer } = useAppContext();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setIsUploading(true);
    let uploadedImageUrl = "";

    try {
      if (imageFile) {
        const data = new FormData();
        data.append('file', imageFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: data,
        });

        const json = await res.json();
        if (json.success) {
          uploadedImageUrl = json.imageUrl;
        } else {
          alert('Upload failed: ' + json.error);
        }
      }

      addFertilizer({ 
        ...formData, 
        image: uploadedImageUrl 
      });
      
      setFormData({ name: "", description: "" });
      setImageFile(null);
      
      // Reset the file input element manually
      const fileInput = document.getElementById('imageUpload');
      if(fileInput) fileInput.value = "";
      
    } catch (err) {
      console.error(err);
      alert('An error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Modern Form */}
        <div className="w-full lg:w-1/3">
          <div className="glass-modern p-10 rounded-[2.5rem] sticky top-32">
            <h2 className="text-3xl font-extrabold text-green-950 dark:text-white mb-2 tracking-tight">
              New Product
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-8 font-medium text-sm">Add a new fertilizer to the inventory.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition font-medium text-green-950 dark:text-white resize-none"
                  required
                ></textarea>
              </div>
              
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-2 ml-1">Upload Image</label>
                <div className="w-full relative border-2 border-dashed border-green-400 dark:border-green-600 rounded-2xl bg-green-50/50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors p-6 text-center cursor-pointer overflow-hidden">
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imageFile ? (
                    <div className="text-green-800 dark:text-green-200 font-semibold truncate">
                      {imageFile.name}
                    </div>
                  ) : (
                    <div className="text-green-700 dark:text-green-400 text-sm font-medium">
                      Drag & Drop or Click to Select File
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-green-500 hover:bg-green-400 text-green-950 text-lg font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(34,197,94,0.6)] transition-all transform hover:-translate-y-1 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Add Product"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="w-full lg:w-2/3 pt-6">
          <h2 className="text-4xl font-extrabold text-green-950 dark:text-white mb-8 tracking-tight">Inventory</h2>
          {fertilizers.length === 0 ? (
            <div className="glass-modern rounded-3xl p-12 text-center text-green-700 font-medium">
              No products found. Add your first fertilizer!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fertilizers.map((fert) => (
                <FertilizerCard
                  key={fert.id}
                  fertilizer={fert}
                  isAdmin={true}
                  onDelete={deleteFertilizer}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
