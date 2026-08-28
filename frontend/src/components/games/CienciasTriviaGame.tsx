import React from "react";
import { ScienceTriviaQuestion, Difficulty } from "../../types";
import { playSound } from "../../utils/audio";

interface CienciasTriviaGameProps {
  question: ScienceTriviaQuestion;
  difficulty: Difficulty;
  onAnswer: (isCorrect: boolean, selectedOption: string) => void;
}

export const CienciasTriviaGame: React.FC<CienciasTriviaGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const handleOptionClick = (opt: string) => {
    const isCorrect = opt === question.correctAnswer;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect, opt);
  };

  return (
    <>
      <div className="question-subtitle">Responde la pregunta espacial de Ciencias:</div>
      <div className="question-text" style={{ fontSize: "1.8rem", lineHeight: "1.4", margin: "20px 0" }}>
        {question.question} {difficulty !== "hard" && (
          <span style={{ marginLeft: "10px", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}>
            {question.emoji}
          </span>
        )}
      </div>
      <div className="options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", maxWidth: "600px", margin: "20px auto" }}>
        {question.options.map((opt: string) => (
          <button 
            key={opt}
            className="option-card"
            onClick={() => handleOptionClick(opt)}
            style={{ fontSize: "1.1rem", padding: "18px 15px", borderRadius: "15px", minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
};
