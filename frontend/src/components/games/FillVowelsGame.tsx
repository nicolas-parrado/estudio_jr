import React, { useState } from "react";
import { GameQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface FillVowelsGameProps {
  question: GameQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const FillVowelsGame: React.FC<FillVowelsGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const q = question as any;
  const [userVowels, setUserVowels] = useState<string[]>([]);

  const handleVowelClick = (v: string) => {
    playSound("click");
    const nextVowels = [...userVowels, v];
    setUserVowels(nextVowels);
    
    if (nextVowels.length === q.correctVowels.length) {
      const isCorrect = nextVowels.every((val, index) => val === q.correctVowels[index]);
      if (!isCorrect) {
        playSound("incorrect");
      }
      setTimeout(() => {
        onAnswer(isCorrect);
        setUserVowels([]); // Limpiar estado local después del submit
      }, 400);
    }
  };

  const handleClear = () => {
    playSound("click");
    setUserVowels([]);
  };

  // Construir palabra enmascarada rellenada con vocales de usuario
  const buildMaskedWord = () => {
    const vowels = ["a", "e", "i", "o", "u"];
    let vowelIndex = 0;
    return q.word.split("").map((char: string) => {
      const isVowel = vowels.includes(char.toLowerCase());
      if (isVowel) {
        const userChar = userVowels[vowelIndex];
        vowelIndex++;
        return userChar ? userChar.toUpperCase() : "_";
      }
      return char.toUpperCase();
    }).join(" ");
  };

  return (
    <>
      <div className="question-subtitle">Instrucciones: Completa las vocales que le faltan a la palabra en inglés</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "4rem", marginBottom: "10px" }}>
            {q.emoji}
          </span>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "15px" }}>
          Traducción: "{q.translation}"
        </p>
        
        {/* Mostrar palabra enmascarada */}
        <h2 style={{
          fontFamily: "monospace", fontSize: "3rem", color: "white", letterSpacing: "6px",
          background: "rgba(255,255,255,0.05)", padding: "10px 30px", borderRadius: "15px",
          border: "1px solid var(--glass-border)"
        }}>
          {buildMaskedWord()}
        </h2>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
        {["a", "e", "i", "o", "u"].map(v => (
          <button 
            key={v}
            className="btn btn-secondary"
            onClick={() => handleVowelClick(v)}
            style={{ fontSize: "1.4rem", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
            disabled={userVowels.length >= q.correctVowels.length}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {userVowels.length > 0 && (
        <button 
          className="btn btn-danger" 
          onClick={handleClear}
          style={{ display: "block", margin: "20px auto 0 auto", padding: "8px 16px", fontSize: "0.85rem" }}
        >
          🧼 Borrar Vocales
        </button>
      )}
    </>
  );
};
