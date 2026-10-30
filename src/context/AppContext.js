"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// We don't strictly need seedProducts if the backend handles it, but we'll leave it in case we want a fallback or reference
import seedProducts from "@/data/seed.json";

const AppContext = createContext();

const THEME_STORAGE_KEY = "agro_theme";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "https://agro-fe-production.up.railway.app"}/api`;

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);
  const [theme, setTheme] = useState("dark"); // default dark

  // Initial Load (Theme & User)
  useEffect(() => {
    const savedUser = localStorage.getItem("agro_user");
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark"); // default
    }

    if (savedUser) setUser(JSON.parse(savedUser));
    
    // Fetch products from backend
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFertilizers(data);
        }
      } else {
        console.error("Failed to fetch products from backend");
      }
    } catch (error) {
      console.error("Error connecting to backend API:", error);
    }
  };

  const truncateFertilizers = async () => {
    try {
      const res = await fetch(`${API_URL}/products/truncate`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFertilizers([]);
        return data;
      } else {
        throw new Error(data.error || "Failed to truncate products");
      }
    } catch (error) {
      console.error("Error truncating products:", error);
      throw error;
    }
  };

  const seedFertilizers = async () => {
    try {
      const res = await fetch(`${API_URL}/products/seed`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchProducts();
        return data;
      } else {
        throw new Error(data.error || "Failed to seed products");
      }
    } catch (error) {
      console.error("Error seeding products:", error);
      throw error;
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("agro_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newTheme;
    });
  };

  // Save to localStorage whenever they change
  useEffect(() => {
    if (user !== null) {
      localStorage.setItem("agro_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("agro_user");
    }
  }, [user]);

  const login = (role, username) => {
    setUser({ role, username });
  };

  const logout = () => {
    setUser(null);
  };

  const addFertilizer = async (fertilizer) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fertilizer),
      });

      if (res.ok) {
        const { product } = await res.json();
        // Update local state immediately for snappy UI
        setFertilizers((prev) => [product, ...prev]);
      } else {
        alert("Failed to add product to database");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error connecting to backend");
    }
  };

  const editFertilizer = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const { product } = await res.json();
        setFertilizers((prev) =>
          prev.map((f) => (f.id === id ? product : f))
        );
      } else {
        alert("Failed to update product in database");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error connecting to backend");
    }
  };

  const deleteFertilizer = async (id) => {
    // Delete locally first for instant UI response
    const previous = [...fertilizers];
    setFertilizers((prev) => prev.filter((f) => f.id !== id));

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Revert if failed
        setFertilizers(previous);
        alert("Failed to delete product from database");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setFertilizers(previous);
      alert("Error connecting to backend");
    }
  };

  return (
    <AppContext.Provider value={{ user, fertilizers, theme, toggleTheme, login, logout, addFertilizer, editFertilizer, deleteFertilizer, fetchProducts, truncateFertilizers, seedFertilizers }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
