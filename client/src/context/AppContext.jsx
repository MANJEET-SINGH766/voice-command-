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
  const [dietaryPreferences, setDietaryPreferences] = useState({ vegan: false, glutenFree: false, organic: false });

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

  const toggleDietaryPreference = (pref) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [pref]: !prev[pref]
    }));
  };

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
      const activePrefs = Object.entries(dietaryPreferences)
        .filter(([_, value]) => value)
        .map(([key]) => (key === "glutenFree" ? "gluten-free" : key))
        .join(",");
      const query = activePrefs ? `?dietary=${activePrefs}` : "";

      const res = await fetch(`${API_BASE}/suggestions/dashboard${query}`);
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

  // Sync suggestions when shopping list or dietary preferences change
  useEffect(() => {
    fetchSuggestions();
  }, [shoppingList, dietaryPreferences]);

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

  // Helper to vocalize confirmations
  const speakText = (text, lang = "en-US") => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Text-to-speech failed:", e);
    }
  };

  const triggerVoiceFeedback = (command, lang, searchCount = 0) => {
    const { intent, item, quantity, unit } = command;
    let message = "";

    if (lang === "hi-IN") {
      switch (intent) {
        case "ADD_ITEM":
          message = `${quantity} ${item} सूची में जोड़ दिया गया है।`;
          break;
        case "REMOVE_ITEM":
          message = `${item} सूची से हटा दिया गया है।`;
          break;
        case "UPDATE_QTY":
          message = `${item} की मात्रा ${quantity} कर दी गई है।`;
          break;
        case "CLEAR_LIST":
          message = "आपकी सूची पूरी तरह से साफ कर दी गई है।";
          break;
        case "SEARCH_PRODUCT":
          message = `कैटलॉग में ${searchCount} उत्पाद मिले।`;
          break;
        default:
          message = "काम पूरा हो गया है।";
      }
    } else {
      const qtyStr = quantity > 1 ? `${quantity} ` : "";
      const unitStr = unit ? `${unit} of ` : "";
      switch (intent) {
        case "ADD_ITEM":
          message = `Added ${qtyStr}${unitStr}${item} to your list.`;
          break;
        case "REMOVE_ITEM":
          message = `Removed ${item} from your list.`;
          break;
        case "UPDATE_QTY":
          message = `Updated ${item} quantity to ${quantity}.`;
          break;
        case "CLEAR_LIST":
          message = "Cleared all items from your shopping list.";
          break;
        case "SEARCH_PRODUCT":
          message = `Found ${searchCount} matches in the catalog.`;
          break;
        default:
          message = "Command executed successfully.";
      }
    }

    speakText(message, lang);
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

      // Trigger text-to-speech voice feedback
      triggerVoiceFeedback(data.data, selectedLanguage, data.searchResults ? data.searchResults.length : 0);

      return data.data;
    } catch (err) {
      setError(err.message);
      // Speak error feedback
      const errorMsg = selectedLanguage === "hi-IN"
        ? "माफ़ कीजिये, वह आदेश समझ नहीं आया।"
        : "Sorry, I could not understand that command.";
      speakText(errorMsg, selectedLanguage);
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
        dietaryPreferences,
        toggleDietaryPreference,
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
