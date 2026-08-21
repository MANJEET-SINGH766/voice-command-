import React, { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState({ historyRecommendations: [], seasonalOffers: [], substitutes: [] });

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

  // 1. Fetch Shopping List on boot
  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/list`);
      const data = await res.json();
      if (res.ok) {
        setShoppingList(data.data);
      } else {
        throw new Error(data.message || "Failed to load shopping list.");
      }
    } catch (err) {
      console.error(err);
      setError("Database is offline. Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/suggestions/dashboard`);
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Sync suggestions when shopping list changes
  useEffect(() => {
    fetchSuggestions();
  }, [shoppingList]);

  // 2. Add Item manually
  const addItem = async (name, quantity = 1, unit = null, category = "Other") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/list/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, unit, category })
      });
      const data = await res.json();
      if (res.ok) {
        setShoppingList(data.data);
      } else {
        throw new Error(data.message || "Failed to add item.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Toggle Complete / Update Qty
  const toggleItemCompleted = async (id, isCompleted) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/list/item/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted })
      });
      const data = await res.json();
      if (res.ok) {
        setShoppingList(data.data);
      } else {
        throw new Error(data.message || "Failed to update item.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. Delete Item
  const deleteItem = async (id) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/list/item/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setShoppingList(data.data);
      } else {
        throw new Error(data.message || "Failed to delete item.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 5. Clear List
  const clearList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/list/clear`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setShoppingList(data.data);
      } else {
        throw new Error(data.message || "Failed to clear list.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Process Spoken Voice Command
  const processVoiceCommand = async (text) => {
    setLoading(true);
    setError(null);
    setVoiceResult(null);
    try {
      const res = await fetch(`${API_BASE}/voice/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: selectedLanguage })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Command could not be understood.");
      }

      // Voice commands modify the database and return the new list array
      setShoppingList(data.list);
      setVoiceResult(data.data);
      if (data.searchResults) {
        setSearchResults(data.searchResults);
      }
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        shoppingList,
        selectedLanguage,
        setSelectedLanguage,
        loading,
        error,
        voiceResult,
        setVoiceResult,
        searchResults,
        setSearchResults,
        suggestions,
        addItem,
        toggleItemCompleted,
        deleteItem,
        clearList,
        processVoiceCommand,
        fetchList,
        setError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
