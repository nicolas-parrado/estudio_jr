import React, { useState, useEffect } from "react";
import { GameQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface WritingGameProps {
  question: GameQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
}

export const WritingGame: React.FC<WritingGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const q = question as any;
  const [userWritingInput, setUserWritingInput] = useState<string>("");
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);

  const normalizeText = (text: string): string => {
    if (!text) return "";
    return text.toUpperCase().trim().replace(/\s+/g, " ");
  };

  useEffect(() => {
    setUserWritingInput("");
    // Generar letras mezcladas de ayuda para este minijuego
    const letters = q.word.toLowerCase().replace(/\s+/g, "").split("");
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    // Agregamos 3 letras aleatorias
    for (let i = 0; i < 3; i++) {
      letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    setScrambledLetters(letters.sort(() => Math.random() - 0.5));
  }, [q.word]);

  const handleValidate = () => {
    const isCorrect = normalizeText(userWritingInput) === normalizeText(q.word);
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
      <div className="question-subtitle">Escribe la palabra en inglés usando el teclado o las letras de pista</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "15px 0" }}>
        {difficulty !== "hard" && (
          <span style={{ fontSize: "4.5rem", marginBottom: "10px" }}>
            {q.emoji}
          </span>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "15px" }}>
          Traducción: <strong>{q.translation.toUpperCase()}</strong>
        </p>
        
        {/* Campo de Escritura */}
        <input 
          type="text"
          value={userWritingInput}
          onChange={(e) => setUserWritingInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe aquí..."
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
            maxWidth: "350px",
            fontFamily: "var(--font-title)",
            letterSpacing: "1px",
            outline: "none",
            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.3)"
          }}
        />
      </div>

      {/* Letras desordenadas de ayuda */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "450px", margin: "15px auto" }}>
        {scrambledLetters.map((letter, lIdx) => (
          <button
            key={lIdx}
            className="btn btn-secondary"
            onClick={() => {
              playSound("click");
              setUserWritingInput(prev => prev + letter);
            }}
            style={{
              fontSize: "1.1rem",
              padding: "8px 15px",
              borderRadius: "10px",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "15px" }}>
        <button 
          className="btn btn-danger" 
          onClick={() => {
            playSound("click");
            setUserWritingInput("");
          }}
        >
          🧼 Limpiar
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleValidate}
        >
          🚀 Validar
        </button>
      </div>
    </>
  );
};
