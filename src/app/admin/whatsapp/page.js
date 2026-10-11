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
  const [targetPhone, setTargetPhone] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  
  const [isSending, setIsSending] = useState(false);
  const [isRestartingWa, setIsRestartingWa] = useState(false);
  const [waStatus, setWaStatus] = useState("INITIALIZING");
  const [waQr, setWaQr] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/whatsapp/status`);
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data.status);
        setWaQr(data.qr);
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRestartWhatsApp = async () => {
    setIsRestartingWa(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/whatsapp/restart`, {
        method: "POST"
      });
      setWaStatus("INITIALIZING");
      setWaQr(null);
      setTimeout(fetchStatus, 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to restart WhatsApp client.");
    } finally {
      setIsRestartingWa(false);
    }
  };

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
      // 1. Upload image to backend if provided, or use direct URL
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
          alert('Failed to upload promotional image: ' + (json.error || 'Server error'));
          setIsSending(false);
          return;
        }
      } else if (imageUrlInput && imageUrlInput.trim()) {
        uploadedImageUrl = imageUrlInput.trim();
      }

      // 2. Send the message payload to the backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api/customers/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: promoMessage,
          link: promoLink,
          imageUrl: uploadedImageUrl,
          targetPhone: targetPhone ? targetPhone.trim() : undefined
        }),
      });

      const data = await res.json();
      if (res.ok) {
        let msg = `Successfully sent message to ${data.success} recipient(s).`;
        if (data.failed > 0) {
          msg += ` Failed: ${data.failed}.`;
          if (data.errors && data.errors.length > 0) {
            msg += ` Details: ${data.errors.map(e => `${e.phone}: ${e.error}`).join(", ")}`;
          }
        }
        alert(msg);
        setPromoMessage("");
        setPromoLink("");
        setTargetPhone("");
        setImageFile(null);
        setImageUrlInput("");
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
          
          {/* WhatsApp Connection Status Panel */}
          <div className="mb-8 p-6 rounded-2xl bg-white/50 dark:bg-black/30 border border-blue-200 dark:border-blue-800 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                📱 WhatsApp Connection Status
              </h3>
              <button
                type="button"
                onClick={handleRestartWhatsApp}
                disabled={isRestartingWa}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 transition-colors"
                title="Restart WhatsApp engine and get fresh QR code"
              >
                {isRestartingWa ? "Restarting..." : "🔄 Refresh / Restart QR"}
              </button>
            </div>
            
            {waQr && waStatus !== "READY" && waStatus !== "SYNCING" && waStatus !== "AUTHENTICATED" ? (
              <div className="flex flex-col items-center text-center">
                <p className="text-red-500 font-bold mb-4">Device not linked! Scan this QR code with your phone:</p>
                <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                  <img src={waQr} alt="WhatsApp Login QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-gray-500 mt-3">Open WhatsApp {">"} Linked Devices {">"} Link a Device</p>
              </div>
            ) : waStatus === "READY" ? (
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400 font-bold text-lg">
                <span className="text-3xl">✅</span> Connected & Ready to Send!
              </div>
            ) : (waStatus === "SYNCING" || waStatus === "AUTHENTICATED") ? (
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold">
                <span className="animate-spin text-2xl">🔄</span> Authenticated! Syncing chats with phone... Please wait a few seconds before sending.
              </div>
            ) : waStatus === "DISCONNECTED" ? (
              <div className="flex items-center gap-3 text-red-600 font-bold">
                <span className="text-3xl">❌</span> Disconnected. Click Refresh above.
              </div>
            ) : (
              <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400 font-semibold">
                <span className="animate-spin text-2xl">⏳</span> Starting up WhatsApp engine...
              </div>
            )}
          </div>

          <p className="text-blue-800 dark:text-blue-300 mb-8 font-medium text-lg border-b border-blue-200/50 pb-4">
            Design a promotional message to send instantly to customers.
          </p>
          
          <form onSubmit={handleSendWhatsApp} className="space-y-6">
            
            {/* Target Phone Number (Optional) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-blue-900 dark:text-blue-200 ml-1">
                  Recipient Phone (Optional)
                </label>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Leave empty to blast ALL customers
                </span>
              </div>
              <input
                type="tel"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="e.g. 9790642068 (or leave empty for all)"
                className="w-full px-5 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition font-medium text-blue-950 dark:text-white"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-2 ml-1">Promotional Image (Optional)</label>
              <div className="w-full relative border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors p-6 text-center cursor-pointer overflow-hidden">
                <input
                  id="promoImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {imageFile ? (
                  <div className="text-blue-800 dark:text-blue-200 font-semibold truncate text-base">
                    🖼️ {imageFile.name}
                  </div>
                ) : (
                  <div className="text-blue-700 dark:text-blue-400 font-medium text-sm">
                    Drag & Drop or Click to Upload Image File
                  </div>
                )}
              </div>

              {/* Or paste direct URL */}
              <div className="mt-3">
                <div className="text-xs font-semibold text-gray-500 mb-1 ml-1">— OR PASTE AN IMAGE LINK DIRECTLY —</div>
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800 text-sm focus:border-blue-500 outline-none transition text-blue-950 dark:text-white"
                />
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
              disabled={isSending || !promoMessage || waStatus !== "READY"}
              style={{ backgroundColor: isSending || !promoMessage || waStatus !== "READY" ? '#a3e6b5' : '#25D366' }}
              className="w-full hover:opacity-90 text-white text-xl font-extrabold py-5 rounded-2xl shadow-[0_10px_20px_-10px_rgba(37,211,102,0.6)] transition-all transform hover:-translate-y-1 mt-6 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isSending ? (
                <>
                  <span className="animate-spin text-2xl">⏳</span> Sending Message...
                </>
              ) : waStatus !== "READY" ? (
                <>
                  <span className="text-2xl">🔒</span> Waiting for WhatsApp Connection...
                </>
              ) : targetPhone ? (
                <>
                  <span className="text-2xl">📲</span> Send Automated Message to {targetPhone}
                </>
              ) : (
                <>
                  <span className="text-2xl">🚀</span> Blast to All Customers
                </>
              )}
            </button>

            {/* Quick 1-Click WhatsApp Direct Link Option */}
            {targetPhone && promoMessage && (
              <a
                href={`https://wa.me/${targetPhone.replace(/\D/g, '').length === 10 ? '91' + targetPhone.replace(/\D/g, '') : targetPhone.replace(/\D/g, '')}?text=${encodeURIComponent(promoMessage + (promoLink ? '\n\n' + promoLink : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-center block mt-3"
              >
                <span>💬</span> Or Send Directly via WhatsApp Web / App (1-Click)
              </a>
            )}
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
                  
                  {(imageFile || imageUrlInput) && (
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-2 overflow-hidden flex items-center justify-center text-gray-500 font-medium">
                      {imageUrlInput ? (
                        <img src={imageUrlInput} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>🖼️ {imageFile?.name}</span>
                      )}
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
