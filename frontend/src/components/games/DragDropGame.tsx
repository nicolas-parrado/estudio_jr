import React, { useState, useEffect } from "react";
import { DragDropQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface DragDropGameProps {
  question: DragDropQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const DragDropGame: React.FC<DragDropGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const q = question;
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [placedWords, setPlacedWords] = useState<Record<string, string>>({}); // { wordExpected: wordPlaced }
  const [leftColumnCards, setLeftColumnCards] = useState<string[]>([]);
  const [rightColumnCards, setRightColumnCards] = useState<string[]>([]);

  useEffect(() => {
    // Inicializar y barajar columnas
    const left = q.isSpanishLeft ? q.items.map(it => it.translation) : q.items.map(it => it.word);
    const right = q.isSpanishLeft ? q.items.map(it => it.word) : q.items.map(it => it.translation);
    setLeftColumnCards([...left].sort(() => Math.random() - 0.5));
    setRightColumnCards([...right].sort(() => Math.random() - 0.5));
    setPlacedWords({});
    setSelectedWord(null);
  }, [q]);

  const handleDragItemSelect = (word: string) => {
    playSound("click");
    setSelectedWord(word);
  };

  const handleDropTargetSelect = (expectedWord: string) => {
    if (!selectedWord) return;
    
    let isCorrectMatch = false;

    if (q.isSpanishLeft) {
      // selectedWord es español (translation), expectedWord es inglés (word)
      const pair = q.items.find(item => item.translation === selectedWord);
      if (pair && pair.word === expectedWord) {
        isCorrectMatch = true;
      }
    } else {
      // selectedWord es inglés (word), expectedWord es español (translation)
      const pair = q.items.find(item => item.word === selectedWord);
      if (pair && pair.translation === expectedWord) {
        isCorrectMatch = true;
      }
    }

    if (isCorrectMatch) {
      playSound("click");
      const updated = { ...placedWords, [selectedWord]: expectedWord };
      setPlacedWords(updated);
      setSelectedWord(null);

      if (Object.keys(updated).length === q.items.length) {
        setTimeout(() => {
          onAnswer(true);
        }, 600);
      }
    } else {
      playSound("incorrect");
      setSelectedWord(null);
    }
  };

  return (
    <>
      <div className="question-subtitle" style={{ marginBottom: "15px", fontWeight: "bold", fontSize: "1.1rem" }}>
        Instrucciones: Une la palabra de la izquierda con su pareja correcta de la derecha haciendo clic en ambas.
      </div>
      <div className="drag-drop-columns-container" style={{ display: "flex", gap: "30px", width: "100%", justifyContent: "center", marginTop: "20px" }}>
        
        {/* Columna Izquierda (Origen) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "45%" }}>
          <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>
            {q.isSpanishLeft ? "Español 🇨🇱" : "Inglés 🇺🇸"}
          </div>
          {leftColumnCards.map((card) => {
            const isMatched = placedWords[card] !== undefined;
            const isSelected = selectedWord === card;
            const itemData = q.items.find(it => it.translation === card || it.word === card);
            const emoji = difficulty !== "hard" ? (itemData?.emoji || "") : "";
            
            return (
              <button
                key={card}
                className={`option-card ${isSelected ? "selected" : ""} ${isMatched ? "matched" : ""}`}
                onClick={() => !isMatched && handleDragItemSelect(card)}
                disabled={isMatched}
                style={{
                  borderColor: isMatched ? "var(--color-success)" : isSelected ? "var(--color-cyan)" : "",
                  background: isMatched ? "rgba(0,184,148,0.15)" : isSelected ? "rgba(0,206,201,0.1)" : "",
                  color: isMatched ? "var(--color-success)" : "",
                  cursor: isMatched ? "default" : "pointer"
                }}
              >
                <span>{emoji}</span> {card} {isMatched && " ✓"}
              </button>
            );
          })}
        </div>

        {/* Columna Derecha (Destino) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "45%" }}>
          <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>
            {q.isSpanishLeft ? "Inglés 🇺🇸" : "Español 🇨🇱"}
          </div>
          {rightColumnCards.map((card) => {
            const isMatched = Object.values(placedWords).includes(card);
            const itemData = q.items.find(it => it.translation === card || it.word === card);
            const emoji = difficulty !== "hard" ? (itemData?.emoji || "") : "";
            
            return (
              <button
                key={card}
                className={`option-card ${isMatched ? "matched" : ""}`}
                onClick={() => !isMatched && handleDropTargetSelect(card)}
                disabled={isMatched}
                style={{
                  borderColor: isMatched ? "var(--color-success)" : "",
                  background: isMatched ? "rgba(0,184,148,0.15)" : "",
                  color: isMatched ? "var(--color-success)" : "",
                  cursor: isMatched ? "default" : "pointer"
                }}
              >
                <span>{emoji}</span> {card} {isMatched && " ✓"}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
