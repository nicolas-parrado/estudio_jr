import React, { useState, useEffect } from "react";
import { ScienceWritingQuestion, Difficulty } from "../../types";
import { playSound } from "../../utils/audio";

interface CienciasWritingGameProps {
  question: ScienceWritingQuestion;
  difficulty: Difficulty;
  onAnswer: (isCorrect: boolean) => void;
}

export const CienciasWritingGame: React.FC<CienciasWritingGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const [userWritingInput, setUserWritingInput] = useState<string>("");
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);

  const normalizeText = (text: string): string => {
    if (!text) return "";
    return text.toUpperCase().trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  };

  useEffect(() => {
    setUserWritingInput("");
    const baseWord = normalizeText(question.word);
    const letters = baseWord.toLowerCase().replace(/\s+/g, "").split("");
    const alphabet = "abcdefghijklmnopqrstuvwxyzñ";
    for (let i = 0; i < 3; i++) {
      letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    setScrambledLetters(letters.sort(() => Math.random() - 0.5));
  }, [question.word]);

  const handleValidate = () => {
    const isCorrect = normalizeText(userWritingInput) === normalizeText(question.word);
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleValidate();
    }
  };

  return (
    <>
      <div className="question-subtitle">Escribe el concepto de ciencias correcto usando el teclado o las letras de pista:</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "15px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "4.5rem", marginBottom: "10px" }}>
            {question.emoji}
          </span>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "15px", textAlign: "center", padding: "0 10px" }}>
          Definición: <strong>{question.translation.toUpperCase()}</strong>
        </p>
        
        <input 
          type="text"
          value={userWritingInput}
          onChange={(e) => setUserWritingInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe el concepto..."
          autoFocus
          style={{
            background: "rgba(0,0,0,0.2)",
            border: "2px solid var(--glass-border)",
            borderRadius: "15px",
            padding: "15px 25px",
            fontSize: "1.6rem",
            color: "white",
            textAlign: "center",
            width: "100%",
            maxWidth: "380px",
            fontFamily: "var(--font-title)",
            letterSpacing: "1px",
            outline: "none",
            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.3)"
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "450px", margin: "15px auto" }}>
        {scrambledLetters.map((letter, lIdx) => (
          <button
            key={lIdx}
            className="btn btn-secondary"
            onClick={() => {
              playSound("click");
              setUserWritingInput(prev => prev + letter);
            }}
            style={{ fontSize: "1.2rem", width: "45px", height: "45px", borderRadius: "10px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
          >
            {letter.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
        <button 
          className="btn btn-danger" 
          onClick={() => {
            playSound("click");
            setUserWritingInput("");
          }}
          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
        >
          🧼 Borrar Todo
        </button>

        <button 
          className="btn btn-primary" 
          onClick={handleValidate}
          style={{ padding: "8px 24px", fontSize: "0.95rem" }}
        >
          🚀 Verificar
        </button>
      </div>
    </>
  );
};
