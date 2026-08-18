import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgroSystem - Premium Fertilizer",
  description: "Your modern destination for premium agricultural solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased font-sans bg-green-50 dark:bg-green-950`}
      >
        <AppProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
