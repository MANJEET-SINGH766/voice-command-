import React from "react";
import { Sparkles, Calendar, RotateCcw, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

function Recommendations() {
  const { suggestions, shoppingList, addItem, deleteItem } = useApp();
  const { historyRecommendations, seasonalOffers, substitutes } = suggestions;

  const hasHistory = historyRecommendations && historyRecommendations.length > 0;
  const hasSubstitutes = substitutes && substitutes.length > 0;
  const hasSeasons = seasonalOffers && seasonalOffers.length > 0;

  // If no suggestions are available at all, hide component
  if (!hasHistory && !hasSubstitutes && !hasSeasons) return null;

  const handleSwap = async (originalName, substitute) => {
    // Find active item ID to remove
    const activeMatch = shoppingList.find(
      i => i.name.toLowerCase() === originalName.toLowerCase() && !i.isCompleted
    );
    
    if (activeMatch) {
      await deleteItem(activeMatch._id);
    }
    
    // Add substitute item
    await addItem(substitute.name, 1, null, substitute.category);
  };

  const handleQuickAdd = async (item) => {
    const sizeClean = item.size || null;
    await addItem(item.name, 1, sizeClean, item.category);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px", width: "100%" }}>
      {/* 1. Substitutes / Healthy Alternatives Panel */}
      {hasSubstitutes && (
        <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid var(--color-warning)" }}>
          <h4 style={{ 
            fontSize: "0.9rem", 
            fontWeight: "700", 
            color: "var(--color-warning)",
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            marginBottom: "12px" 
          }}>
            <Sparkles size={16} /> Alternative Suggestions
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {substitutes.map((sub, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: "rgba(245, 158, 11, 0.04)", 
                  border: "1px solid rgba(245, 158, 11, 0.12)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  fontSize: "0.85rem"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, paddingRight: "10px" }}>
                  <span>
                    Replace <strong style={{ color: "var(--text-primary)" }}>{sub.originalItem}</strong> with:
                  </span>
                  <strong style={{ color: "var(--color-warning)", fontSize: "0.9rem" }}>{sub.name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Reason: {sub.reason}
                  </span>
                </div>
                <button
                  onClick={() => handleSwap(sub.originalItem, sub)}
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    color: "var(--color-warning)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap"
                  }}
                >
                  Swap Item
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. History-based recommendations (Frequently Bought) */}
      {hasHistory && (
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h4 style={{ 
            fontSize: "0.9rem", 
            fontWeight: "700", 
            color: "var(--text-primary)",
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            marginBottom: "12px" 
          }}>
            <RotateCcw size={16} style={{ color: "var(--color-purple)" }} /> Frequently Bought
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {historyRecommendations.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: "rgba(0, 0, 0, 0.02)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => handleQuickAdd(item)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    color: "var(--text-primary)",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--color-accent)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-glass)"}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Seasonal Catalog Recommendations */}
      {hasSeasons && (
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h4 style={{ 
            fontSize: "0.9rem", 
            fontWeight: "700", 
            color: "var(--text-primary)",
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            marginBottom: "12px" 
          }}>
            <Calendar size={16} style={{ color: "var(--color-accent)" }} /> Seasonal Picks
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {seasonalOffers.map((product, idx) => (
              <div 
                key={idx}
                style={{
                  background: "rgba(0, 0, 0, 0.15)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                    {product.name}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {product.brand && `${product.brand} • `}{product.size}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)" }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    style={{
                      background: "rgba(0, 242, 254, 0.1)",
                      border: "1px solid rgba(0, 242, 254, 0.25)",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      color: "var(--color-accent)",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-accent-gradient)";
                      e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0, 242, 254, 0.1)";
                      e.currentTarget.style.color = "var(--color-accent)";
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
