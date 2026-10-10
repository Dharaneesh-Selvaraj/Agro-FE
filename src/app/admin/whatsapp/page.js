"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

export default function WhatsAppPromoPage() {
  const { user } = useAppContext();
  const router = useRouter();

  const [promoMessage, setPromoMessage] = useState("");
  const [promoLink, setPromoLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    if (!promoMessage) return;

    setIsSending(true);
    let uploadedImageUrl = "";

    try {
      // 1. Upload image to ImgBB if provided
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
          alert('Failed to upload promotional image: ' + json.error);
          setIsSending(false);
          return;
        }
      }

      // 2. Send the message payload to the backend
      const res = await fetch("http://localhost:5000/api/customers/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: promoMessage,
          link: promoLink,
          imageUrl: uploadedImageUrl
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Successfully sent messages to ${data.success} customers. Failed: ${data.failed}`);
        setPromoMessage("");
        setPromoLink("");
        setImageFile(null);
        const fileInput = document.getElementById('promoImage');
        if(fileInput) fileInput.value = "";
      } else {
        alert(data.error || "Failed to send messages.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend API to send WhatsApp messages.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 p-3 rounded-full transition-colors">
          ← Back
        </Link>
        <h1 className="text-4xl font-extrabold text-blue-950 dark:text-blue-100 tracking-tight">WhatsApp Promo Studio</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 justify-center items-start">
        
        {/* Form Container */}
        <div className="w-full lg:w-1/2 glass-modern p-10 rounded-[2.5rem] shadow-2xl relative">
          <p className="text-blue-800 dark:text-blue-300 mb-8 font-medium text-lg border-b border-blue-200/50 pb-4">
            Design a promotional message to send instantly to all registered customers.
          </p>
          
          <form onSubmit={handleSendWhatsApp} className="space-y-6">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2 ml-1">Promotional Image (Optional)</label>
              <div className="w-full relative border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors p-8 text-center cursor-pointer overflow-hidden">
                <input
                  id="promoImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {imageFile ? (
                  <div className="text-blue-800 dark:text-blue-200 font-semibold truncate text-lg">
                    🖼️ {imageFile.name}
                  </div>
                ) : (
                  <div className="text-blue-700 dark:text-blue-400 font-medium">
                    Drag & Drop or Click to Upload Image
                  </div>
                )}
              </div>
            </div>

            {/* Text Message */}
            <div>
              <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2 ml-1">Message Body *</label>
              <textarea
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                rows="5"
                placeholder="Write your exciting news here..."
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition font-medium text-blue-950 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2 ml-1">Webpage Link (Optional)</label>
              <input
                type="url"
                value={promoLink}
                onChange={(e) => setPromoLink(e.target.value)}
                placeholder="https://yourstore.com/products/new-item"
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition font-medium text-blue-950 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !promoMessage}
              style={{ backgroundColor: isSending || !promoMessage ? '#a3e6b5' : '#25D366' }}
              className="w-full hover:opacity-90 text-white text-xl font-extrabold py-5 rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,211,102,0.6)] transition-all transform hover:-translate-y-1 mt-6 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isSending ? (
                <>
                  <span className="animate-spin text-2xl">⏳</span> Sending to Database...
                </>
              ) : (
                <>
                  <span className="text-2xl">🚀</span> Blast to All Customers
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Pane */}
        <div className="w-full lg:w-1/3 mt-10 lg:mt-0">
          <div className="sticky top-10">
            <h3 className="text-lg font-bold text-gray-500 mb-4 ml-2">Phone Preview</h3>
            
            <div className="bg-[#EFEAE2] border-8 border-gray-800 rounded-[2.5rem] p-4 shadow-2xl h-[600px] flex flex-col relative overflow-hidden">
              <div className="bg-[#075E54] -mx-4 -mt-4 p-4 text-white font-bold flex items-center gap-3 rounded-t-[2rem]">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🏢</div>
                <div>Your Store</div>
              </div>
              
              <div className="mt-4 flex-grow flex flex-col justify-end space-y-4 overflow-y-auto">
                <div className="bg-white rounded-xl rounded-tl-none p-2 shadow-sm max-w-[85%] relative self-start">
                  
                  {imageFile && (
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-2 overflow-hidden flex items-center justify-center text-gray-400 font-medium">
                      [Image Attached]
                    </div>
                  )}

                  <div className="text-[#111B21] text-[15px] whitespace-pre-wrap leading-relaxed">
                    <span className="font-semibold block mb-2">Hello [Customer Name],</span>
                    {promoMessage || <span className="text-gray-400 italic">Your message will appear here...</span>}
                    
                    {promoLink && (
                      <div className="mt-2 text-blue-500 hover:underline">
                        Link: {promoLink}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-[11px] text-gray-400 mt-1">12:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
