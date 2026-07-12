import React, { useState } from "react";
import { ScienceFillVowelsQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface CienciasFillVowelsGameProps {
  question: ScienceFillVowelsQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const CienciasFillVowelsGame: React.FC<CienciasFillVowelsGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const [userVowels, setUserVowels] = useState<string[]>([]);

  const isVowelChar = (char: string): boolean => {
    const list = ["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú"];
    return list.includes(char.toLowerCase());
  };

  const getVowelBase = (char: string): string => {
    const normMap: Record<string, string> = {
      "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u"
    };
    const lower = char.toLowerCase();
    return normMap[lower] || lower;
  };

  const handleVowelClick = (v: string) => {
    playSound("click");
    const nextVowels = [...userVowels, v];
    setUserVowels(nextVowels);
    
    if (nextVowels.length === question.correctVowels.length) {
      const isCorrect = nextVowels.every((val, index) => {
        const expectedBase = getVowelBase(question.correctVowels[index]);
        return val === expectedBase;
      });
      
      if (!isCorrect) {
        playSound("incorrect");
      }
      setTimeout(() => {
        onAnswer(isCorrect);
        setUserVowels([]);
      }, 400);
    }
  };

  const handleClear = () => {
    playSound("click");
    setUserVowels([]);
  };

  const buildMaskedWord = () => {
    let vowelIndex = 0;
    return question.word.split("").map((char: string) => {
      const isV = isVowelChar(char);
      if (isV) {
        const userChar = userVowels[vowelIndex];
        vowelIndex++;
        return userChar ? userChar.toUpperCase() : "_";
      }
      return char.toUpperCase();
    }).join(" ");
  };

  return (
    <>
      <div className="question-subtitle">Completa las vocales que le faltan al concepto:</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "4rem", marginBottom: "10px" }}>
            {question.emoji}
          </span>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "15px", textAlign: "center", padding: "0 10px" }}>
          Pista: "{question.translation}"
        </p>
        
        <h2 style={{
          fontFamily: "monospace", fontSize: "2.8rem", color: "white", letterSpacing: "6px",
          background: "rgba(255,255,255,0.05)", padding: "10px 30px", borderRadius: "15px",
          border: "1px solid var(--glass-border)", textShadow: "0 0 10px rgba(255,255,255,0.1)"
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
            disabled={userVowels.length >= question.correctVowels.length}
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
