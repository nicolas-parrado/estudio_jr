import React, { useState } from "react";
import { Subject, Planet, PlayerState } from "../types";
import { playSound } from "../utils/audio";

interface MapViewProps {
  currentSubject: Subject;
  planets: Planet[];
  playerStats: PlayerState;
  difficulty: "normal" | "hard" | "insane";
  setDifficulty: (diff: "normal" | "hard" | "insane") => void;
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

        {/* Selector de Dificultad Galáctica (Control Segmentado) */}
        <div className="difficulty-segmented-control" style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "4px",
          borderRadius: "30px",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          gap: "4px"
        }}>
          <button
            type="button"
            className={`btn-diff-pill ${difficulty === "normal" ? "active" : ""}`}
            onClick={() => { playSound("click"); setDifficulty("normal"); }}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              background: difficulty === "normal" ? "linear-gradient(135deg, #00cec9, #0984e3)" : "transparent",
              color: difficulty === "normal" ? "#fff" : "var(--text-muted)",
              boxShadow: difficulty === "normal" ? "0 0 12px rgba(0, 206, 201, 0.5)" : "none"
            }}
          >
            🌌 Normal
          </button>
          <button
            type="button"
            className={`btn-diff-pill ${difficulty === "hard" ? "active" : ""}`}
            onClick={() => { playSound("click"); setDifficulty("hard"); }}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              background: difficulty === "hard" ? "linear-gradient(135deg, #ff7675, #d63031)" : "transparent",
              color: difficulty === "hard" ? "#fff" : "var(--text-muted)",
              boxShadow: difficulty === "hard" ? "0 0 12px rgba(255, 118, 117, 0.5)" : "none"
            }}
          >
            🔥 Hard
          </button>
          <button
            type="button"
            className={`btn-diff-pill ${difficulty === "insane" ? "active" : ""}`}
            onClick={() => { playSound("click"); setDifficulty("insane"); }}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              background: difficulty === "insane" ? "linear-gradient(135deg, #a29bfe, #6c5ce7)" : "transparent",
              color: difficulty === "insane" ? "#fff" : "var(--text-muted)",
              boxShadow: difficulty === "insane" ? "0 0 15px rgba(108, 92, 231, 0.7)" : "none"
            }}
          >
            ⚡ Insane
          </button>
        </div>
      </div>
      
      <div className={`map-container ${difficulty === "hard" ? "hard-nebula" : difficulty === "insane" ? "insane-nebula" : ""}`} id="map-container">
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
            // Lógica de Bloqueo
            let isLocked = false;
            let lockMsg = "";

            if (difficulty === "normal") {
              isLocked = !playerStats.unlockedPlanets.includes(planet.id);
              lockMsg = "🔒 Bloqueado";
            } else if (difficulty === "hard") {
              isLocked = (playerStats.stars[planet.id] || 0) < 2;
              lockMsg = "🔒 Requiere 2⭐ en Normal";
            } else if (difficulty === "insane") {
              isLocked = (playerStats.stars[`${planet.id}-hard`] || 0) < 2;
              lockMsg = "🔒 Requiere 2⭐ en Hard";
            }

            // Estrellas obtenidas según el modo seleccionado
            const targetID = difficulty === "insane" ? `${planet.id}-insane` : difficulty === "hard" ? `${planet.id}-hard` : planet.id;
            const stars = playerStats.stars[targetID] || 0;
            const starsStr = "⭐".repeat(stars) + "☆".repeat(3 - stars);

            // Estrellas de todas las dificultades para brillo cósmico
            const starsNormal = playerStats.stars[planet.id] || 0;
            const starsHard = playerStats.stars[`${planet.id}-hard`] || 0;
            const starsInsane = playerStats.stars[`${planet.id}-insane`] || 0;

            // Definir brillo premium del planeta según logros
            let glowClass = "";
            if (starsInsane === 3) {
              glowClass = "planet-glow-cosmic";
            } else if (starsInsane > 0 || starsHard === 3) {
              glowClass = "planet-glow-silver";
            } else if (starsHard > 0 || starsNormal > 0) {
              glowClass = "planet-glow-bronze";
            }

            const currentDiffColor = difficulty === "insane" ? "#a29bfe" : difficulty === "hard" ? "#ff7675" : planet.color;

            return (
              <div 
                key={planet.id}
                className={`planet-node ${isLocked ? "locked" : ""} ${difficulty === "hard" && !isLocked ? "hard-aura" : ""} ${difficulty === "insane" && !isLocked ? "insane-aura" : ""} ${glowClass}`}
                style={{ ["--planet-color" as any]: currentDiffColor }}
                onClick={(e) => !isLocked && handlePlanetClick(e, planet)}
              >
                <span className="planet-sphere" style={{ filter: `drop-shadow(0 0 10px ${currentDiffColor})` }}>
                  {isLocked ? "🪐" : planet.emoji}
                </span>
                <div className="planet-name">
                  {planet.name} {difficulty === "hard" && "🔥"} {difficulty === "insane" && "⚡"}
                </div>
                <div className="planet-subtitle">{planet.subtitle}</div>
                <div className="planet-stars-earned">
                  {!isLocked && starsStr}
                </div>
                {isLocked && (
                  <div className="lock-icon" style={{ color: difficulty === "insane" ? "#a29bfe" : difficulty === "hard" ? "#ff7675" : "" }}>
                    {lockMsg}
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
