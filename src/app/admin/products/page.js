"use client";

import { useAppContext } from "@/context/AppContext";
import FertilizerCard from "@/components/FertilizerCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminProductsPage() {
  const { user, fertilizers, deleteFertilizer } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const handleEditClick = (fertilizer) => {
    router.push(`/admin?edit=${fertilizer.id}`);
  };

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-green-600 hover:text-green-800 font-bold bg-green-50 hover:bg-green-100 p-3 rounded-full transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-green-950 dark:text-white tracking-tight">Manage Products</h1>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/customers" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm flex items-center gap-2"
          >
            <span>👥 Customers</span>
          </Link>
          <Link 
            href="/admin/whatsapp" 
            style={{ backgroundColor: '#25D366' }}
            className="hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm flex items-center gap-2"
          >
            <span>📱 WhatsApp</span>
          </Link>
        </div>
      </div>

      <div className="glass-modern p-10 rounded-[2.5rem] shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <p className="text-green-800 dark:text-green-300 font-medium text-lg">
            Inventory List ({fertilizers.length} items)
          </p>
          <Link 
            href="/admin" 
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-md transition-all"
          >
            + Add New Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {fertilizers.map((fert) => (
            <FertilizerCard
              key={fert.id}
              fertilizer={fert}
              isAdmin={true}
              onEdit={handleEditClick}
              onDelete={deleteFertilizer}
            />
          ))}
          {fertilizers.length === 0 && (
            <div className="col-span-full py-12 text-center text-green-700">
              No products found in inventory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
