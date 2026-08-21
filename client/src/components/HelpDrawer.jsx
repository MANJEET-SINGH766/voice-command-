import React from "react";
import { X, HelpCircle, Mic, Trash2, Search, RefreshCw } from "lucide-react";

function HelpDrawer({ isOpen, onClose }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      height: "100vh",
      width: "100%",
      maxWidth: "360px",
      background: "var(--bg-secondary)",
      borderLeft: "1px solid var(--border-glass)",
      boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.08)",
      zIndex: 1000,
      transform: isOpen ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header section */}
      <div style={{
        padding: "20px",
        borderBottom: "1px solid var(--border-glass)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HelpCircle size={18} style={{ color: "var(--color-accent)" }} />
          <span style={{ fontWeight: "700", fontSize: "1rem" }}>Voice Command Guide</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "4px"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
        >
          <X size={20} />
        </button>
      </div>

      {/* Commands scroll area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
          Speak clearly into your microphone using these phrases. The system parses your intent automatically.
        </p>

        {/* Category: Add items */}
        <div>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--color-success)", fontWeight: "700", marginBottom: "8px" }}>
            <Mic size={14} /> Add Items (जोड़ें)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", border: "1px solid var(--border-glass)" }}>
            <div>• <em>"Add milk"</em></div>
            <div>• <em>"Add 3 bottles of water"</em></div>
            <div>• <em>"Buy 5 bananas"</em></div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingOff: "4px", marginTop: "4px" }}>
              <strong>Hindi/Hinglish:</strong>
              <div>• <em>"दूध जोड़ो" (doodh jodo)</em></div>
              <div>• <em>"दो सेब जोड़ो" (do seb jodo)</em></div>
            </div>
          </div>
        </div>

        {/* Category: Remove items */}
        <div>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--color-error)", fontWeight: "700", marginBottom: "8px" }}>
            <Trash2 size={14} /> Remove Items (हटाएं)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", border: "1px solid var(--border-glass)" }}>
            <div>• <em>"Remove milk"</em></div>
            <div>• <em>"Delete apples"</em></div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingOff: "4px", marginTop: "4px" }}>
              <strong>Hindi/Hinglish:</strong>
              <div>• <em>"दूध हटाओ" (doodh hatao)</em></div>
              <div>• <em>"doodh delete karo"</em></div>
            </div>
          </div>
        </div>

        {/* Category: Search */}
        <div>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: "700", marginBottom: "8px" }}>
            <Search size={14} /> Search & Filters (ढूंढें)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", border: "1px solid var(--border-glass)" }}>
            <div>• <em>"Find toothpaste under $5"</em></div>
            <div>• <em>"Find organic apples"</em></div>
            <div>• <em>"Find Colgate under 10 dollars"</em></div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingOff: "4px", marginTop: "4px" }}>
              <strong>Hindi/Hinglish:</strong>
              <div>• <em>"pasta ढूंढो" (pasta dhundho)</em></div>
            </div>
          </div>
        </div>

        {/* Category: Clear list */}
        <div>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--color-warning)", fontWeight: "700", marginBottom: "8px" }}>
            <RefreshCw size={14} /> Clear Entire List (साफ करें)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.02)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", border: "1px solid var(--border-glass)" }}>
            <div>• <em>"Clear all items"</em></div>
            <div>• <em>"Empty shopping list"</em></div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingOff: "4px", marginTop: "4px" }}>
              <strong>Hindi/Hinglish:</strong>
              <div>• <em>"list साफ करो" (list saaf karo)</em></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer branding */}
      <div style={{
        padding: "15px 20px",
        borderTop: "1px solid var(--border-glass)",
        background: "rgba(0, 0, 0, 0.15)",
        textAlign: "center",
        fontSize: "0.75rem",
        color: "var(--text-muted)"
      }}>
        Voice Command Shopping Assistant v1.0
      </div>
    </div>
  );
}

export default HelpDrawer;
