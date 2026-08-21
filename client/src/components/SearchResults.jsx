import React from "react";
import { Search, Plus, X, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";

function SearchResults() {
  const { searchResults, setSearchResults, addItem } = useApp();

  // If there are no results to show, do not render this component
  if (!searchResults || searchResults.length === 0) return null;

  const handleClose = () => {
    setSearchResults([]);
  };

  const handleQuickAdd = async (product) => {
    // Extract default properties from the catalog product
    const unitClean = product.size || null;
    await addItem(product.name, 1, unitClean, product.category);
    
    // Clear search results to close the panel and return to shopping list
    setSearchResults([]);
  };

  return (
    <div className="glass-panel" style={{
      padding: "25px",
      marginTop: "20px",
      width: "100%",
      borderColor: "var(--color-accent)",
      boxShadow: "var(--shadow-neon)"
    }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-accent)" }}>
          <Search size={18} />
          <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
            Catalog Matches ({searchResults.length})
          </span>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <X size={18} />
        </button>
      </div>

      {/* Results grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {searchResults.map((product) => (
          <div
            key={product._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.15)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px"
            }}
          >
            {/* Left side: Product Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  {product.name}
                </span>
                {product.dietary && product.dietary.includes("organic") && (
                  <span style={{
                    fontSize: "0.65rem",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "var(--color-success)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontWeight: "600"
                  }}>
                    organic
                  </span>
                )}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {product.brand && <span>Brand: {product.brand}</span>}
                {product.size && <span>• Size: {product.size}</span>}
              </div>
            </div>

            {/* Right side: Price & Action */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--text-primary)" }}>
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleQuickAdd(product)}
                style={{
                  background: "var(--color-accent-gradient)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 12px",
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "var(--transition-smooth)"
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;
