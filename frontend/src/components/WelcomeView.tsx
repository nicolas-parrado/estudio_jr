import React from "react";
import { PlayersProgress } from "../types";

interface WelcomeViewProps {
  progressBySubject: Record<string, PlayersProgress>;
  onLogin: (playerName: "Sofia" | "Luciano") => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ progressBySubject, onLogin }) => {
  const getPlayerTotalStars = (p: "Sofia" | "Luciano") => {
    let total = 0;
    Object.values(progressBySubject).forEach(subProgress => {
      const starsMap = subProgress[p]?.stars || {};
      total += Object.values(starsMap).reduce((a, b) => a + b, 0);
    });
    return total;
  };

  return (
    <section className="view active" id="welcome-view">
      <div className="welcome-box">
        <h1>🌌 Space Academy</h1>
        <p>¡Prepárate para una aventura estelar de aprendizaje!</p>
        
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.4rem", marginBottom: "20px" }}>
          ¿Quién va a pilotar la nave hoy?
        </h2>
        
        <div className="profile-select">
          {(["Sofia", "Luciano"] as const).map(p => {
            const starsCount = getPlayerTotalStars(p);
            return (
              <div 
                key={p} 
                className="profile-card" 
                onClick={() => onLogin(p)}
              >
                <span className="profile-avatar">{p === "Sofia" ? "👧" : "👦"}</span>
                <span className="profile-name">{p}</span>
                <div className="profile-stars">⭐ {starsCount}</div>
              </div>
            );
          })}
        </div>
        
        <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>¡Elige tu perfil para continuar tu viaje estelar!</p>
      </div>
    </section>
  );
};

