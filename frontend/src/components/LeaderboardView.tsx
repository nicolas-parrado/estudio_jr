import React from "react";
import { PlayersProgress } from "../types";

interface LeaderboardViewProps {
  playersProgress: PlayersProgress;
  onResetData: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  playersProgress,
  onResetData
}) => {
  return (
    <section className="view active" id="leaderboard-view">
      <div className="map-header" style={{ justifyContent: "center", textAlign: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2.2rem" }}>🏆 Tabla de Honor Galáctica</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>¿Quién tiene más estrellas en La Tropa?</p>
        </div>
      </div>
      
      <div className="leaderboard-container">
        <div>
          {(["Sofia", "Luciano"] as const)
            .map(p => {
              const starsCount = Object.values(playersProgress[p]?.stars || {}).reduce((a, b) => a + b, 0);
              return {
                name: p,
                avatar: p === "Sofia" ? "👧" : "👦",
                stars: starsCount,
                stickersCount: playersProgress[p]?.stickers.length || 0
              };
            })
            .sort((a, b) => b.stars - a.stars)
            .map((player, idx) => (
              <div key={player.name} className={`leaderboard-row ${idx === 0 ? "podium-1" : ""}`}>
                <div className="leaderboard-player">
                  <span className="leaderboard-rank">#{idx + 1}</span>
                  <span className="leaderboard-avatar">{player.avatar}</span>
                  <span className="leaderboard-name">{player.name}</span>
                </div>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--color-accent)" }}>
                    Stickers: 🖼️ {player.stickersCount}
                  </span>
                  <span className="leaderboard-score">⭐ {player.stars}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Panel Admin */}
        <div className="admin-panel">
          <div>
            <h3>Panel de Control de Papá</h3>
            <p>Reiniciar las estrellas y stickers guardados en el servidor.</p>
          </div>
          <button className="btn btn-danger" onClick={onResetData}>
            🔄 Reiniciar Datos
          </button>
        </div>
      </div>
    </section>
  );
};
