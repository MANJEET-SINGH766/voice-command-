import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, Loader, HelpCircle } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import VoiceController from "./components/VoiceController";
import SearchResults from "./components/SearchResults";
import Recommendations from "./components/Recommendations";
import ShoppingList from "./components/ShoppingList";
import HelpDrawer from "./components/HelpDrawer";

function AppContent() {
  const { error } = useApp();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      minHeight: "100vh",
      padding: "40px 20px",
      flexDirection: "column",
      gap: "20px",
      position: "relative"
    }}>
      {/* Header glass card */}
      <div className="glass-panel" style={{
        maxWidth: "500px",
        width: "100%",
        padding: "30px",
        textAlign: "center",
        position: "relative"
      }}>
        {/* Help guide toggle button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          title="Open Voice Command Guide"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "var(--transition-smooth)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
        >
          <HelpCircle size={20} />
        </button>

        <h1 style={{ marginBottom: "10px", fontSize: "1.8rem", fontWeight: "700", letterSpacing: "-0.5px" }}>
          Voice Shopping Assistant
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "0.9rem" }}>
          Voice Command List Manager & Smart Recommendations
        </p>

        {/* Connection status banner */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "var(--radius-sm)",
          background: error && error.includes("Database is offline")
            ? "rgba(239, 68, 68, 0.1)" 
            : "rgba(16, 185, 129, 0.1)",
          border: `1px solid ${
            error && error.includes("Database is offline")
              ? "rgba(239, 68, 68, 0.25)" 
              : "rgba(16, 185, 129, 0.25)"
          }`,
          color: error && error.includes("Database is offline")
            ? "var(--color-error)" 
            : "var(--color-success)",
          fontSize: "0.85rem"
        }}>
          {error && error.includes("Database is offline") ? (
            <>
              <WifiOff size={14} />
              <span>Backend API Server is Offline (Port 5000)</span>
            </>
          ) : (
            <>
              <Wifi size={14} />
              <span>Connected to MongoDB Backend!</span>
            </>
          )}
        </div>
      </div>

      {/* Main voice command interface panel */}
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <VoiceController />
      </div>

      {/* Product search overlay matches */}
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <SearchResults />
      </div>

      {/* Smart Recommendations Dashboard */}
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <Recommendations />
      </div>

      {/* Main shopping list displays grouped by category */}
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <ShoppingList />
      </div>

      {/* Collapsible Slide-out Help Drawer Guide */}
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
