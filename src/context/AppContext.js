"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import seedProducts from "@/data/seed.json";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("agro_user");
    const savedFertilizers = localStorage.getItem("agro_fertilizers");

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
      localStorage.setItem("agro_fertilizers", JSON.stringify(fertilizers));
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
    <AppContext.Provider value={{ user, fertilizers, login, logout, addFertilizer, deleteFertilizer }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
