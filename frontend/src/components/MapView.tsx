import React, { useState } from "react";
import { Subject, Planet, PlayerState } from "../types";
import { playSound } from "../utils/audio";

interface MapViewProps {
  currentSubject: Subject;
  planets: Planet[];
  playerStats: PlayerState;
  difficulty: "normal" | "hard";
  setDifficulty: (diff: "normal" | "hard") => void;
  onPlanetSelect: (planet: Planet) => void;
  onBackToSubjects: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  currentSubject,
  planets,
  playerStats,
  difficulty,
  setDifficulty,
  onPlanetSelect,
  onBackToSubjects
}) => {
  const [rocketPosition, setRocketPosition] = useState<{ left: string; top: string }>({
    left: "50%",
    top: "85%"
  });

  const handlePlanetClick = (event: React.MouseEvent<HTMLDivElement>, planet: Planet) => {
    playSound("click");
    
    const container = document.getElementById("map-container");
    const node = event.currentTarget;
    if (!container || !node) return;

    const mapRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    const targetX = nodeRect.left - mapRect.left + (nodeRect.width / 2) - 15;
    const targetY = nodeRect.top - mapRect.top - 40;

    setRocketPosition({ left: `${targetX}px`, top: `${targetY}px` });

    setTimeout(() => {
      onPlanetSelect(planet);
    }, 1200);
  };

  return (
    <section className="view active" id="map-view">
      <div className="map-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button 
            className="btn btn-secondary" 
            onClick={onBackToSubjects}
            style={{ fontSize: "1.4rem", padding: "8px 16px" }}
            title="Volver a la selección de ramos"
          >
            🛰️
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem" }}>Mapa Estelar: {currentSubject.name}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Selecciona un planeta para viajar y jugar</p>
          </div>
        </div>

        {/* Selector de Dificultad Galáctica */}
        <div className="difficulty-toggle-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.9rem", color: difficulty === "normal" ? "var(--color-cyan)" : "var(--text-muted)", fontWeight: "bold" }}>🌌 Modo Normal</span>
          <label className="difficulty-switch" style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
            <input 
              type="checkbox" 
              checked={difficulty === "hard"}
              onChange={(e) => {
                playSound("click");
                setDifficulty(e.target.checked ? "hard" : "normal");
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span className="difficulty-slider" style={{
              position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "2px solid var(--glass-border)",
              transition: "0.4s", borderRadius: "34px",
              boxShadow: difficulty === "hard" ? "0 0 15px rgba(255, 118, 117, 0.4)" : ""
            }}>
              <span style={{
                position: "absolute", content: '""', height: "24px", width: "24px", left: "3px", bottom: "3px",
                backgroundColor: difficulty === "hard" ? "#ff7675" : "var(--color-cyan)",
                transition: "0.4s", borderRadius: "50%",
                transform: difficulty === "hard" ? "translateX(26px)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
              }}>
                {difficulty === "hard" ? "🔥" : "✨"}
              </span>
            </span>
          </label>
          <span style={{ fontSize: "0.9rem", color: difficulty === "hard" ? "#ff7675" : "var(--text-muted)", fontWeight: "bold" }}>🔥 Modo Hard</span>
        </div>
      </div>
      
      <div className={`map-container ${difficulty === "hard" ? "hard-nebula" : ""}`} id="map-container">
        <div className="nebula"></div>
        <div 
          className="player-rocket" 
          style={{ left: rocketPosition.left, top: rocketPosition.top }}
          aria-hidden="true"
        >
          🚀
        </div>
        
        <div className="planets-grid">
          {planets.map(planet => {
            // Bloqueo: En Hard requiere al menos 2 estrellas en el Normal de ese mismo planeta
            const isLocked = difficulty === "hard" 
              ? (playerStats.stars[planet.id] || 0) < 2 
              : !playerStats.unlockedPlanets.includes(planet.id);

            // Estrellas obtenidas según el modo seleccionado
            const targetID = difficulty === "hard" ? `${planet.id}-hard` : planet.id;
            const stars = playerStats.stars[targetID] || 0;
            const starsStr = "⭐".repeat(stars) + "☆".repeat(3 - stars);

            // Estrellas de ambas dificultades para brillo
            const starsNormal = playerStats.stars[planet.id] || 0;
            const starsHard = playerStats.stars[`${planet.id}-hard`] || 0;

            // Definir brillo premium del planeta según logros
            let glowClass = "";
            if (starsHard === 3) {
              glowClass = "planet-glow-cosmic";
            } else if (starsHard > 0) {
              glowClass = "planet-glow-silver";
            } else if (starsNormal > 0) {
              glowClass = "planet-glow-bronze";
            }

            return (
              <div 
                key={planet.id}
                className={`planet-node ${isLocked ? "locked" : ""} ${difficulty === "hard" && !isLocked ? "hard-aura" : ""} ${glowClass}`}
                style={{ ["--planet-color" as any]: difficulty === "hard" ? "#ff7675" : planet.color }}
                onClick={(e) => !isLocked && handlePlanetClick(e, planet)}
              >
                <span className="planet-sphere" style={{ filter: `drop-shadow(0 0 10px ${difficulty === "hard" ? "#ff7675" : planet.color})` }}>
                  {isLocked ? "🪐" : planet.emoji}
                </span>
                <div className="planet-name">{planet.name} {difficulty === "hard" && "🔥"}</div>
                <div className="planet-subtitle">{planet.subtitle}</div>
                <div className="planet-stars-earned">
                  {!isLocked && starsStr}
                </div>
                {isLocked && (
                  <div className="lock-icon" style={{ color: difficulty === "hard" ? "#ff7675" : "" }}>
                    {difficulty === "hard" ? "🔒 Requiere 2⭐ en Normal" : "🔒 Bloqueado"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
