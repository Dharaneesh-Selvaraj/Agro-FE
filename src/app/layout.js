import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Splash from "@/components/Splash";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sri Venkateswara Traders - Premium Agricultural Products",
  description: "Your modern destination for premium agricultural solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased font-sans bg-green-50 dark:bg-green-950`}
      >
        <AppProvider>
          {/* Global Background Animated Blobs for Glassmorphism Effect */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-200/30 dark:bg-green-800/20 blur-[100px] animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-100/40 dark:bg-green-900/20 blur-[120px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-green-50/50 dark:bg-green-950/30 blur-[150px] animate-blob animation-delay-4000"></div>
          </div>
          
          <Splash />
          <Navbar />
          <main className="min-h-screen relative z-0">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
