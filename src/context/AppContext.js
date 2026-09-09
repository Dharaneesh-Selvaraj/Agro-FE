"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import seedProducts from "@/data/seed.json";

const AppContext = createContext();

const LOCAL_STORAGE_KEY = "agro_products_v3";
const THEME_STORAGE_KEY = "agro_theme";

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);
  const [theme, setTheme] = useState("dark"); // default dark

  useEffect(() => {
    const savedUser = localStorage.getItem("agro_user");
    const savedFertilizers = localStorage.getItem(LOCAL_STORAGE_KEY);
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
    if (savedFertilizers) {
      const parsed = JSON.parse(savedFertilizers);
      if (parsed && parsed.length > 0) {
        setFertilizers(parsed);
      } else {
        setFertilizers(seedProducts);
      }
    } else {
      setFertilizers(seedProducts);
    }
  }, []);

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

  useEffect(() => {
    if (fertilizers.length > 0) {
      localStorage.setItem("agro_fertilizers_v4", JSON.stringify(fertilizers));
    }
  }, [fertilizers]);

  const login = (role, username) => {
    setUser({ role, username });
  };

  const logout = () => {
    setUser(null);
  };

  const addFertilizer = (fertilizer) => {
    setFertilizers((prev) => [
      { id: Date.now(), dateAdded: new Date().toISOString(), ...fertilizer },
      ...prev,
    ]);
  };

  const deleteFertilizer = (id) => {
    setFertilizers((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <AppContext.Provider value={{ user, fertilizers, theme, toggleTheme, login, logout, addFertilizer, deleteFertilizer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
