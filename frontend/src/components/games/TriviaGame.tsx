import React from "react";
import { GameQuestion } from "../../types";
import { playSound } from "../../utils/audio";

interface TriviaGameProps {
  question: GameQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean, selectedOption: string) => void;
}

export const TriviaGame: React.FC<TriviaGameProps> = ({
  question,
  difficulty,
  onAnswer
}) => {
  const q = question as any;

  const handleOptionClick = (opt: string) => {
    const isCorrect = opt === q.correctAnswer;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect, opt);
  };

  return (
    <>
      <div className="question-subtitle">¿Cómo se dice en inglés?</div>
      <div className="question-text">
        {q.translation.toUpperCase()} {difficulty !== "hard" && q.emoji}
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
