import React from "react";
import { Subject, PlayersProgress } from "../types";

interface SubjectsViewProps {
  currentPlayer: "Sofia" | "Luciano" | null;
  subjects: Subject[];
  playersProgress: PlayersProgress;
  onSelectSubject: (subject: Subject) => void;
  onBack: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  currentPlayer,
  subjects,
  playersProgress,
  onSelectSubject,
  onBack
}) => {
  return (
    <section className="view active" id="subjects-view" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="welcome-box" style={{ maxWidth: "850px", width: "95%" }}>
        <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2.4rem", marginBottom: "10px", textShadow: "0 0 10px rgba(9, 132, 227, 0.4)" }}>Centro de Mando Galáctico</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "30px" }}>
          Piloto <strong>{currentPlayer}</strong>, selecciona el rumbo de tu misión de aprendizaje:
        </p>

        <div className="subjects-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          width: "100%",
          marginBottom: "30px"
        }}>
          {subjects.map(sub => {
            const subjectStars = Object.values(playersProgress[currentPlayer || ""]?.stars || {}).reduce((a, b) => a + b, 0);
            return (
              <div 
                key={sub.id} 
                className="subject-card"
                onClick={() => onSelectSubject(sub)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  border: `2px solid ${sub.themeColor || "var(--glass-border)"}`,
                  borderRadius: "24px",
                  padding: "30px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${sub.themeColor}4d`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "4.5rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>{sub.emoji}</span>
                <h3 style={{ fontSize: "1.6rem", fontFamily: "var(--font-title)", color: "white", margin: 0 }}>{sub.name}</h3>
                <div style={{
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontSize: "0.9rem",
                  color: "var(--star-yellow)",
                  fontWeight: "bold",
                  border: "1px solid rgba(255, 234, 167, 0.15)"
                }}>
                  ⭐ {subjectStars} Estrellas
                </div>
              </div>
            );
          })}
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{ padding: "10px 24px" }}
        >
          🛸 Cambiar de Piloto
        </button>
      </div>
    </section>
  );
};
