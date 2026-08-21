import React from "react";
import { Trash2, ShoppingBag, X } from "lucide-react";
import { useApp } from "../context/AppContext";

// Map categories to emojis for UI headers
const categoryEmojis = {
  "Produce": "🥦",
  "Dairy & Eggs": "🥛",
  "Bakery": "🍞",
  "Meat & Seafood": "🥩",
  "Pantry & Dry Goods": "🥫",
  "Beverages": "🥤",
  "Snacks & Sweets": "🍪",
  "Household & Cleaning": "🧼",
  "Other": "🛒"
};

function ShoppingList() {
  const { shoppingList, toggleItemCompleted, deleteItem, clearList, loading } = useApp();

  if (shoppingList.length === 0) {
    return (
      <div className="glass-panel" style={{
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--text-secondary)",
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px"
      }}>
        <ShoppingBag size={48} style={{ color: "var(--text-muted)", strokeWidth: "1.5" }} />
        <div>
          <p style={{ fontWeight: "600", fontSize: "1rem", color: "var(--text-primary)" }}>
            Your list is empty
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Say "Add milk" or "Add 3 apples" to build your list.
          </p>
        </div>
      </div>
    );
  }

  // Group items by category
  const groupedItems = shoppingList.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: "20px", width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 5px" }}>
        <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-secondary)" }}>
          Shopping List ({shoppingList.length} {shoppingList.length === 1 ? "item" : "items"})
        </span>
        <button
          onClick={clearList}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-error)",
            fontSize: "0.8rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <X size={14} /> Clear All
        </button>
      </div>

      {Object.entries(groupedItems).map(([category, items]) => (
        <div 
          key={category} 
          className="glass-panel" 
          style={{ 
            padding: "20px",
            borderColor: "var(--border-glass)"
          }}
        >
          {/* Category Header */}
          <h3 style={{ 
            fontSize: "0.95rem", 
            fontWeight: "700", 
            marginBottom: "15px", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "8px",
            color: "var(--text-primary)"
          }}>
            <span>{categoryEmojis[category] || "🛒"}</span>
            <span>{category}</span>
            <span style={{ 
              fontSize: "0.75rem", 
              background: "rgba(255, 255, 255, 0.05)", 
              padding: "2px 8px", 
              borderRadius: "10px",
              color: "var(--text-secondary)",
              marginLeft: "auto"
            }}>
              {items.length}
            </span>
          </h3>

          {/* List items under this category */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item) => (
              <div 
                key={item._id} 
                className="animate-slide-in"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "6px 0"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  {/* Custom Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={(e) => toggleItemCompleted(item._id, e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-glass)",
                      cursor: "pointer",
                      accentColor: "var(--color-success)"
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ 
                      fontSize: "0.95rem", 
                      fontWeight: "500",
                      color: item.isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: item.isCompleted ? "line-through" : "none",
                      transition: "var(--transition-smooth)"
                    }}>
                      {item.name}
                    </span>
                    {item.unit && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Unit: {item.unit}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  {/* Quantity Indicator */}
                  <span style={{ 
                    fontSize: "0.85rem", 
                    fontWeight: "600",
                    background: "rgba(0, 242, 254, 0.05)",
                    border: "1px solid rgba(0, 242, 254, 0.15)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    color: "var(--color-accent)"
                  }}>
                    Qty: {item.quantity}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteItem(item._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      transition: "var(--transition-smooth)",
                      display: "flex",
                      alignItems: "center"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-error)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShoppingList;
