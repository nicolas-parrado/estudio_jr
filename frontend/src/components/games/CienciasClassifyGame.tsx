import React from "react";
import { ScienceClassifyQuestion, Difficulty } from "../../types";
import { playSound } from "../../utils/audio";

interface CienciasClassifyGameProps {
  question: ScienceClassifyQuestion;
  difficulty: Difficulty;
  onAnswer: (isCorrect: boolean, selectedOption: string) => void;
}

export const CienciasClassifyGame: React.FC<CienciasClassifyGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const handleCategoryClick = (opt: string) => {
    const isCorrect = opt === question.correctCategory;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect, opt);
  };

  return (
    <>
      <div className="question-subtitle">{question.instruction}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "5rem", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.25))", marginBottom: "10px" }}>
            {question.emoji}
          </span>
        )}
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "2.6rem", color: "var(--color-cyan)", margin: "10px 0" }}>
          {question.concept.toUpperCase()}
        </h2>
      </div>
      
      <div style={{ margin: "10px 0" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "15px" }}>Clasifica en la categoría correcta:</p>
        <div className="options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", maxWidth: "600px", margin: "0 auto" }}>
          {question.options.map((opt: string) => (
            <button 
              key={opt}
              className="option-card"
              onClick={() => handleCategoryClick(opt)}
              style={{ fontSize: "1.1rem", padding: "18px 15px", borderRadius: "15px", minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
