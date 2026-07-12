import React from "react";
import { ScienceTrueFalseQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface CienciasTrueFalseGameProps {
  question: ScienceTrueFalseQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const CienciasTrueFalseGame: React.FC<CienciasTrueFalseGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const handleSelection = (isTrue: boolean) => {
    const isCorrect = isTrue 
      ? question.correctAnswer === "verdadero" 
      : question.correctAnswer === "falso";
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  return (
    <>
      <div className="question-subtitle">¿Esta afirmación es verdadera o falsa?</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "5.5rem", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))", marginBottom: "15px" }}>
            {question.emoji}
          </span>
        )}
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", color: "white", margin: "15px 0", padding: "0 20px", textAlign: "center", lineHeight: "1.5" }}>
          "{question.question}"
        </h2>
      </div>
      <div className="options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", maxWidth: "500px", margin: "20px auto 0 auto" }}>
        <button 
          className="option-card" 
          onClick={() => handleSelection(true)}
          style={{ borderColor: "var(--color-success)", background: "rgba(0, 184, 148, 0.05)", fontSize: "1.2rem", padding: "20px", borderRadius: "15px" }}
        >
          👍 VERDADERO
        </button>
        <button 
          className="option-card" 
          onClick={() => handleSelection(false)}
          style={{ borderColor: "var(--color-danger)", background: "rgba(214, 48, 49, 0.05)", fontSize: "1.2rem", padding: "20px", borderRadius: "15px" }}
        >
          👎 FALSO
        </button>
      </div>
    </>
  );
};
