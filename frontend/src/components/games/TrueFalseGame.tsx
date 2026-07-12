import React from "react";
import { GameQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface TrueFalseGameProps {
  question: GameQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const q = question as any;

  const handleSelection = (isYes: boolean) => {
    const isCorrect = isYes ? q.isCorrectMatch : !q.isCorrectMatch;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  return (
    <>
      <div className="question-subtitle" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        ¿Significa "{q.shownTranslation.toUpperCase()}" la palabra en inglés?
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "5.5rem", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))", marginBottom: "10px" }}>
            {q.emoji}
          </span>
        )}
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "3rem", color: "var(--color-cyan)", margin: "10px 0" }}>
          {q.word.toUpperCase()}
        </h2>
      </div>
      <div className="options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", maxWidth: "500px", margin: "20px auto 0 auto" }}>
        <button 
          className="option-card" 
          onClick={() => handleSelection(true)}
          style={{ borderColor: "var(--color-success)", background: "rgba(0, 184, 148, 0.05)" }}
        >
          👍 SÍ (Yes)
        </button>
        <button 
          className="option-card" 
          onClick={() => handleSelection(false)}
          style={{ borderColor: "var(--color-danger)", background: "rgba(214, 48, 49, 0.05)" }}
        >
          👎 NO (No)
        </button>
      </div>
    </>
  );
};
