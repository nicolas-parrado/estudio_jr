import React, { useState } from "react";
import { Subject, Sticker, PlayerState } from "../types";
import { playSound } from "../utils/audio";

interface AlbumViewProps {
  currentSubject: Subject;
  stickers: Sticker[];
  playerStats: PlayerState;
  onBack: () => void;
}

export const AlbumView: React.FC<AlbumViewProps> = ({
  currentSubject,
  stickers,
  playerStats,
  onBack
}) => {
  const [activeAlbumTab, setActiveAlbumTab] = useState<"global" | "subject">("global");

  return (
    <section className="view active" id="album-view">
      <div className="map-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button 
            className="btn btn-secondary" 
            onClick={onBack}
            style={{ fontSize: "1.4rem", padding: "8px 16px" }}
            title="Volver al mapa estelar"
          >
            🪐
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem" }}>Álbum de Stickers Coleccionables</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              ¡Completa las misiones y obtén logros para llenar tu álbum!
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas de Colección */}
      <div className="album-tabs" style={{ display: "flex", gap: "15px", margin: "25px 0", justifyContent: "center" }}>
        <button 
          className={`btn ${activeAlbumTab === "global" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { playSound("click"); setActiveAlbumTab("global"); }}
          style={{ padding: "12px 24px", fontSize: "1.05rem", borderRadius: "15px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          🌌 Logros de la Galaxia
        </button>
        <button 
          className={`btn ${activeAlbumTab === "subject" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { playSound("click"); setActiveAlbumTab("subject"); }}
          style={{ padding: "12px 24px", fontSize: "1.05rem", borderRadius: "15px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>{currentSubject.emoji}</span> {currentSubject.name}
        </button>
      </div>
      
      <div className="stickers-grid">
        {stickers
          .filter(sticker => {
            const isGlobal = ["st-explorer", "st-first-star", "st-streak-5", "st-streak-10", "st-perfect-run", "st-tropa"].includes(sticker.id);
            return activeAlbumTab === "global" ? isGlobal : !isGlobal;
          })
          .map(sticker => {
            const isLocked = !playerStats.stickers.includes(sticker.id);
            
            // Determinar clase de brillo en base a dificultad y si está desbloqueado
            let glowClass = "";
            if (!isLocked) {
              if (sticker.difficulty === "medium") glowClass = "glow-silver";
              else if (sticker.difficulty === "hard") glowClass = "glow-gold";
              else if (sticker.difficulty === "legendary") glowClass = "glow-cosmic";
            }

            return (
              <div 
                key={sticker.id} 
                className={`sticker-card ${isLocked ? "locked" : ""} ${glowClass}`}
                style={{
                  position: "relative",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <span className="sticker-emoji" style={{ filter: isLocked ? "grayscale(100%) opacity(40%)" : "none" }}>
                  {isLocked ? "❓" : sticker.emoji}
                </span>
                <div className="sticker-name" style={{ fontWeight: "bold", marginTop: "10px" }}>
                  {isLocked ? "Bloqueado" : sticker.name}
                </div>
                <div className="sticker-desc" style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "5px" }}>
                  {sticker.desc}
                </div>
                {!isLocked && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "var(--color-success)",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
                  }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
};
