import { PlayerName, PlayersProgress } from "../types";

interface WelcomeViewProps {
  progressBySubject: Record<string, PlayersProgress>;
  onLogin: (playerName: PlayerName) => void;
}

const PLAYERS: { name: PlayerName; avatar: string }[] = [
  { name: "Sofia", avatar: "👧" },
  { name: "Luciano", avatar: "👦" },
  { name: "Amanda", avatar: "👧" }
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({ progressBySubject, onLogin }) => {
  const getPlayerTotalStars = (p: PlayerName) => {
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
          {PLAYERS.map(p => {
            const starsCount = getPlayerTotalStars(p.name);
            return (
              <div 
                key={p.name} 
                className="profile-card" 
                onClick={() => onLogin(p.name)}
              >
                <span className="profile-avatar">{p.avatar}</span>
                <span className="profile-name">{p.name}</span>
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

