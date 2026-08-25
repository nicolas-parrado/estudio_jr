import React, { useState } from "react";
import { MathCalcQuestion, MathMissingQuestion, MathBalanceQuestion } from "../../../types";
import { playSound } from "../../../utils/audio";
import { MathKeypad } from "./MathKeypad";

interface MathCalcGameProps {
  question: MathCalcQuestion | MathMissingQuestion | MathBalanceQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const MathCalcGame: React.FC<MathCalcGameProps> = ({
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
    <div className="math-game-container">
      <div className="question-subtitle">
        {q.instruction || "Calcula y resuelve la operación cósmica:"}
      </div>

      {/* Tipo 1: Balanza Cósmica */}
      {q.type === "math-balance" && (
        <div className="math-balance-visual">
          <div className="balance-tray left-tray">
            <span className="tray-label">Lado Izquierdo</span>
            <div className="tray-content">{(q as MathBalanceQuestion).leftSide}</div>
          </div>
          <div className="balance-center">
            <span className="balance-equal">=</span>
            <span className="balance-icon">⚖️</span>
          </div>
          <div className="balance-tray right-tray">
            <span className="tray-label">Lado Derecho</span>
            <div className="tray-content">{(q as MathBalanceQuestion).rightSide}</div>
          </div>
        </div>
      )}

      {/* Tipo 2: Operación o Incógnita Estándar */}
      {q.type !== "math-balance" && (
        <div className="math-expression-card">
          <span className="math-emoji-badge">{q.emoji || "🚀"}</span>
          <h2 className="math-big-expression">
            {(q as MathCalcQuestion | MathMissingQuestion).expression}
          </h2>
        </div>
      )}

      {/* Modo de Respuesta: Opciones o Teclado */}
      {difficulty === "hard" || !q.options ? (
        <div style={{ marginTop: "20px" }}>
          <MathKeypad 
            value={inputValue} 
            onChange={setInputValue} 
            onSubmit={handleKeypadSubmit} 
          />
        </div>
      ) : (
        <div className="options-grid" style={{ marginTop: "25px" }}>
          {q.options.map((opt) => (
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
