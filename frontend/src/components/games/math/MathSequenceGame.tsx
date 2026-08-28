import React, { useState } from "react";
import { MathSequenceQuestion, MathCompareQuestion, Difficulty } from "../../../types";
import { playSound } from "../../../utils/audio";
import { MathKeypad } from "./MathKeypad";

interface MathSequenceGameProps {
  question: MathSequenceQuestion | MathCompareQuestion;
  difficulty: Difficulty;
  onAnswer: (isCorrect: boolean) => void;
}

export const MathSequenceGame: React.FC<MathSequenceGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const q = question;

  const handleOptionSelect = (opt: string) => {
    const isCorrect = opt === q.correctAnswer;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  const handleKeypadSubmit = () => {
    if (!inputValue.trim()) return;
    const isCorrect = inputValue.trim() === q.correctAnswer;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  return (
    <div className="math-sequence-container">
      <div className="question-subtitle">
        {q.instruction || "Patrones y Comparación Galáctica"}
      </div>

      {/* Tipo: Secuencia / Tren Numérico */}
      {q.type === "math-sequence" && (
        <div className="math-sequence-train">
          {(q as MathSequenceQuestion).sequence.map((item, idx) => {
            const isMissing = item === "___";
            return (
              <div key={idx} className="train-segment-wrapper">
                <div className={`train-wagon ${isMissing ? "wagon-missing" : ""}`}>
                  <span className="wagon-number">
                    {isMissing ? (inputValue || "?") : item}
                  </span>
                </div>
                {idx < (q as MathSequenceQuestion).sequence.length - 1 && (
                  <span className="train-connector">➔</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tipo: Comparación de Números */}
      {q.type === "math-compare" && (
        <div className="math-compare-visual">
          {(q as MathCompareQuestion).leftNumber !== undefined && (q as MathCompareQuestion).rightNumber !== undefined ? (
            <div className="compare-numbers-box">
              <div className="compare-number-card">{(q as MathCompareQuestion).leftNumber}</div>
              <div className="compare-badge-icon">⚖️</div>
              <div className="compare-number-card">{(q as MathCompareQuestion).rightNumber}</div>
            </div>
          ) : null}
          <h3 className="compare-question-text">{(q as MathCompareQuestion).question}</h3>
        </div>
      )}

      {/* Modo de respuesta: Teclado o Botones de Opciones */}
      {q.type === "math-sequence" && (difficulty === "hard" || !q.options) ? (
        <div style={{ marginTop: "20px" }}>
          <MathKeypad 
            value={inputValue} 
            onChange={setInputValue} 
            onSubmit={handleKeypadSubmit} 
          />
        </div>
      ) : (
        <div className="options-grid" style={{ marginTop: "25px" }}>
          {q.options?.map((opt) => (
            <button
              key={opt}
              className="option-card math-option-btn"
              onClick={() => handleOptionSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
