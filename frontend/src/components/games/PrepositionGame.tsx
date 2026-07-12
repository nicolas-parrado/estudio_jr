import React, { useEffect } from "react";
import { GameQuestion } from "../../types";
import { speakEnglish } from "../../utils/speech";
import { playSound } from "../../utils/audio";

interface PrepositionGameProps {
  question: GameQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const PrepositionGame: React.FC<PrepositionGameProps> = ({
  question,
  onAnswer
}) => {
  const q = question as any;

  useEffect(() => {
    // Pronunciar la frase espacial en inglés al cargar
    speakEnglish(q.phrase.replace("___", q.preposition));
  }, [q.phrase, q.preposition]);

  const handleOptionClick = (opt: string) => {
    const isCorrect = opt === q.preposition;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  return (
    <>
      <div className="question-subtitle">Completa la frase espacial con la preposición correcta</div>
      <div className="prep-visual-box">{q.visual}</div>
      <div className="prep-phrase-display">
        {q.phrase.replace("___", "?")}
      </div>
      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px" }}>
        Traducción: "{q.translation}"
      </div>
      <div className="options-grid">
        {q.options.map((opt: string) => (
          <button 
            key={opt}
            className="option-card"
            onClick={() => handleOptionClick(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
};
