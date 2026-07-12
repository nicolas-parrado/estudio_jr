import React, { useState, useEffect } from "react";
import { ScienceSequenceQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface CienciasSequenceGameProps {
  question: ScienceSequenceQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const CienciasSequenceGame: React.FC<CienciasSequenceGameProps> = ({
  question,
  onAnswer
}) => {
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const items = [...question.sequence];
    let tries = 0;
    let isSame = true;
    let shuffledItems = [...items];
    while (isSame && tries < 10) {
      shuffledItems = [...items].sort(() => Math.random() - 0.5);
      isSame = shuffledItems.every((val, i) => val === items[i]);
      tries++;
    }
    setShuffled(shuffledItems);
    setSelected([]);
  }, [question.sequence]);

  const handleSelect = (item: string) => {
    playSound("click");
    setSelected(prev => [...prev, item]);
    setShuffled(prev => prev.filter(x => x !== item));
  };

  const handleDeselect = (item: string) => {
    playSound("click");
    setShuffled(prev => [...prev, item]);
    setSelected(prev => prev.filter(x => x !== item));
  };

  const handleVerify = () => {
    const isCorrect = selected.every((val, i) => val === question.sequence[i]);
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  return (
    <>
      <div className="question-subtitle">{question.instruction}</div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "15px 0" }}>
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "2.2rem", color: "var(--color-cyan)", margin: "5px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "3rem" }}>{question.emoji}</span> <span>{question.animal}</span>
        </h2>
      </div>

      {/* Huecos de la Secuencia Elegida */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        justifyContent: "center", 
        margin: "20px auto", 
        flexWrap: "wrap",
        minHeight: "85px",
        padding: "15px",
        background: "rgba(0,0,0,0.2)",
        borderRadius: "15px",
        border: "1px solid var(--glass-border)",
        maxWidth: "650px",
        width: "95%"
      }}>
        {question.sequence.map((_, idx) => {
          const item = selected[idx];
          return (
            <div 
              key={idx}
              onClick={() => item && handleDeselect(item)}
              style={{
                width: "130px",
                height: "60px",
                borderRadius: "12px",
                border: "2px dashed var(--glass-border)",
                background: item ? "rgba(9, 132, 227, 0.15)" : "transparent",
                borderColor: item ? "var(--color-cyan)" : "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                color: "white",
                cursor: item ? "pointer" : "default",
                fontWeight: "bold",
                textAlign: "center",
                padding: "5px",
                transition: "all 0.2s ease"
              }}
            >
              {item ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-cyan)", marginBottom: "2px" }}>Etapa {idx + 1}</span>
                  {item}
                </div>
              ) : (
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{idx + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bloques Disponibles para Seleccionar */}
      <div style={{ margin: "10px 0" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "12px" }}>Toca las etapas para ordenarlas:</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", maxWidth: "600px", margin: "0 auto" }}>
          {shuffled.map((item) => (
            <button
              key={item}
              className="btn btn-secondary"
              onClick={() => handleSelect(item)}
              style={{ 
                padding: "12px 18px", 
                fontSize: "0.95rem", 
                borderRadius: "12px", 
                fontWeight: "bold",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid var(--glass-border)"
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Botón de Confirmación */}
      <button
        className="btn btn-primary"
        onClick={handleVerify}
        disabled={selected.length < question.sequence.length}
        style={{
          display: "block",
          margin: "25px auto 0 auto",
          padding: "12px 35px",
          fontSize: "1.1rem",
          borderRadius: "15px",
          opacity: selected.length < question.sequence.length ? 0.5 : 1,
          cursor: selected.length < question.sequence.length ? "not-allowed" : "pointer"
        }}
      >
        🚀 ¡Verificar Secuencia!
      </button>
    </>
  );
};
