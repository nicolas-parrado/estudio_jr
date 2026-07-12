import React, { useState, useEffect } from "react";
import { MemoriceQuestion, MemoryCard } from "../../types";
import { playSound } from "../../utils/audio";

interface MemoriceGameProps {
  question: MemoriceQuestion;
  difficulty: "normal" | "hard";
  onAnswer: (isCorrect: boolean) => void;
  onWrongMatch: () => void;
}

export const MemoriceGame: React.FC<MemoriceGameProps> = ({
  question,
  difficulty,
  onAnswer,
  onWrongMatch
}) => {
  const q = question;
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Resetear estados locales al cambiar de pregunta
    setFlippedCards([]);
    setMatchedPairs([]);
    setIsChecking(false);
  }, [q]);

  const handleCardClick = (cardIdx: number, cardData: MemoryCard) => {
    if (isChecking || flippedCards.includes(cardIdx) || matchedPairs.includes(cardData.id)) return;
    
    playSound("click");
    const updatedFlipped = [...flippedCards, cardIdx];
    setFlippedCards(updatedFlipped);

    if (updatedFlipped.length === 2) {
      setIsChecking(true);
      const firstCardIdx = updatedFlipped[0];
      const firstCard = q.pairs[firstCardIdx];
      const secondCard = cardData;

      if (firstCard.id === secondCard.id) {
        setTimeout(() => {
          playSound("correct");
          const nextMatched = [...matchedPairs, firstCard.id];
          setMatchedPairs(nextMatched);
          setFlippedCards([]);
          setIsChecking(false);
          
          if (nextMatched.length === q.pairs.length / 2) {
            setTimeout(() => {
              onAnswer(true);
            }, 800);
          }
        }, 500);
      } else {
        setTimeout(() => {
          playSound("incorrect");
          setFlippedCards([]);
          setIsChecking(false);
          onWrongMatch(); // Notificar fallo a la arena para racha
        }, 1200);
      }
    }
  };

  return (
    <>
      <div className="question-subtitle">Juego de Memoria: Empareja la palabra en inglés con su traducción</div>
      <div className="memory-grid">
        {q.pairs.map((card: MemoryCard, idx: number) => {
          const isFlipped = flippedCards.includes(idx);
          const isMatched = matchedPairs.includes(card.id);

          return (
            <div 
              key={idx}
              className={`memory-card ${isFlipped || isMatched ? "flipped" : ""}`}
              onClick={() => handleCardClick(idx, card)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front">❓</div>
                <div className={`memory-card-back ${isMatched ? "matched" : ""}`}>
                  {difficulty !== "hard" && <div>{card.emoji}</div>}
                  <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>{card.word}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
