import React, { useState, useEffect } from "react";
import { MathWordProblemQuestion } from "../../../types";
import { playSound } from "../../../utils/audio";
import { speakSpanish } from "../../../utils/speech";
import { MathKeypad } from "./MathKeypad";

interface MathWordProblemGameProps {
  question: MathWordProblemQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const MathWordProblemGame: React.FC<MathWordProblemGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const q = question;
  const [step, setStep] = useState<"choose-op" | "calculate">("choose-op");
  const [inputValue, setInputValue] = useState<string>("");
  const [opError, setOpError] = useState<boolean>(false);

  useEffect(() => {
    // Resetear estados al cambiar de pregunta
    setStep(difficulty === "hard" ? "calculate" : "choose-op");
    setInputValue("");
    setOpError(false);

    // Cancelar cualquier audio previo al cambiar de pregunta
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [q, difficulty]);

  const handleReadAloud = () => {
    playSound("click");
    speakSpanish(`${q.story} ${q.questionPrompt}`);
  };

  const handleChooseOperation = (op: "+" | "-") => {
    if (op === q.operationType) {
      playSound("correct");
      setOpError(false);
      setTimeout(() => {
        setStep("calculate");
      }, 400);
    } else {
      playSound("incorrect");
      setOpError(true);
    }
  };

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

  // Función para formatear el texto de la historia resaltando números con badges
  const renderStoryFormatted = () => {
    const parts = q.story.split(/(\d+)/g);
    return parts.map((part, idx) => {
      if (/^\d+$/.test(part)) {
        return (
          <span key={idx} className="story-number-badge">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="math-word-problem-container">
      <div className="question-subtitle">
        Desafío de Lógica: Lee la historia espacial y resuelve
      </div>

      {/* Tarjeta de la Historia */}
      <div className="story-card">
        <div className="story-header">
          <span className="story-avatar">{q.emoji || "🚀"}</span>
          <button 
            type="button"
            className="btn btn-secondary speech-btn"
            onClick={handleReadAloud}
            title="Escuchar historia en voz alta"
          >
            🔊 Escuchar
          </button>
        </div>
        
        <p className="story-text">{renderStoryFormatted()}</p>
        <div className="story-question-prompt">{q.questionPrompt}</div>
      </div>

      {/* Paso 1: Seleccionar Operación (en modo Normal) */}
      {step === "choose-op" && (
        <div className="op-selection-section">
          <h3 className="op-selection-title">¿Qué debemos hacer para resolverlo?</h3>
          {opError && (
            <p style={{ color: "var(--color-danger)", fontSize: "0.9rem", marginBottom: "10px" }}>
              ¡Piénsalo bien! ¿Tenemos que juntar/agregar o quitar/gastar?
            </p>
          )}
          <div className="op-buttons-grid">
            <button
              type="button"
              className="option-card op-btn"
              onClick={() => handleChooseOperation("+")}
              style={{ borderColor: "var(--color-success)", background: "rgba(0,184,148,0.1)" }}
            >
              <span style={{ fontSize: "1.8rem" }}>➕</span> Juntar / Sumar (+)
            </button>
            <button
              type="button"
              className="option-card op-btn"
              onClick={() => handleChooseOperation("-")}
              style={{ borderColor: "var(--color-danger)", background: "rgba(255,118,117,0.1)" }}
            >
              <span style={{ fontSize: "1.8rem" }}>➖</span> Quitar / Restar (-)
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Calcular el resultado final */}
      {step === "calculate" && (
        <div className="calculate-section">
          <div className="equation-preview">
            <span>{q.num1}</span>
            <span style={{ color: "var(--color-cyan)", margin: "0 8px" }}>{q.operationType}</span>
            <span>{q.num2}</span>
            <span style={{ margin: "0 8px" }}>=</span>
            <span style={{ color: "var(--star-yellow)" }}>?</span>
          </div>

          {difficulty === "hard" || !q.options ? (
            <MathKeypad 
              value={inputValue} 
              onChange={setInputValue} 
              onSubmit={handleKeypadSubmit} 
            />
          ) : (
            <div className="options-grid" style={{ marginTop: "20px" }}>
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
      )}
    </div>
  );
};
