import React, { useEffect } from "react";
import { GameQuestion } from "../../types";
import { speakEnglish } from "../../utils/speech";
import { playSound } from "../../utils/audio";

interface AudioGameProps {
  question: GameQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const AudioGame: React.FC<AudioGameProps> = ({
  question,
  onAnswer
}) => {
  const q = question as any;

  useEffect(() => {
    // Pronunciar automáticamente al cargar el juego de audio
    speakEnglish(q.word);
  }, [q.word]);

  const handleOptionClick = (opt: string) => {
    const isCorrect = opt === q.correctAnswer;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  return (
    <>
      <div className="question-subtitle">Escucha con atención y selecciona la respuesta correcta</div>
      <button 
        className="audio-pronounce-btn"
        onClick={() => speakEnglish(q.word)}
        title="Escuchar"
        style={{ margin: "20px auto", display: "flex" }}
      >
        🔊
      </button>
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
