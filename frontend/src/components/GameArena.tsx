import React, { useState, useEffect } from "react";
import { GameQuestion, Planet, MemoriceQuestion, DragDropQuestion } from "../types";
import { playSound } from "../utils/audio";
import { speakEnglish, speakSpanish } from "../utils/speech";

// Importar minijuegos de inglés
import { TriviaGame } from "./games/TriviaGame";
import { AudioGame } from "./games/AudioGame";
import { TrueFalseGame } from "./games/TrueFalseGame";
import { FillVowelsGame } from "./games/FillVowelsGame";
import { WritingGame } from "./games/WritingGame";
import { DragDropGame } from "./games/DragDropGame";
import { PrepositionGame } from "./games/PrepositionGame";
import { MemoriceGame } from "./games/MemoriceGame";

// Importar minijuegos de ciencias
import { CienciasTriviaGame } from "./games/CienciasTriviaGame";
import { CienciasTrueFalseGame } from "./games/CienciasTrueFalseGame";
import { CienciasSequenceGame } from "./games/CienciasSequenceGame";
import { CienciasClassifyGame } from "./games/CienciasClassifyGame";
import { CienciasFillVowelsGame } from "./games/CienciasFillVowelsGame";
import { CienciasWritingGame } from "./games/CienciasWritingGame";

interface GameArenaProps {
  questions: GameQuestion[];
  planet: Planet;
  difficulty: "normal" | "hard";
  subjectId: string;
  onFinish: (
    correctCount: number,
    maxStreak: number,
    audioStreak: number,
    writeStreak: number,
    perfectRun: boolean
  ) => void;
  onAbort: () => void;
}

export const GameArena: React.FC<GameArenaProps> = ({
  questions,
  planet,
  difficulty,
  subjectId,
  onFinish,
  onAbort
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [perfectRunFlag, setPerfectRunFlag] = useState<boolean>(true);

  // Rachas de audio y escritura
  const [audioStreak, setAudioStreak] = useState<number>(0);
  const [currentAudioStreak, setCurrentAudioStreak] = useState<number>(0);
  const [writeStreak, setWriteStreak] = useState<number>(0);
  const [currentWriteStreak, setCurrentWriteStreak] = useState<number>(0);

  // Cosmo frases de felicitación
  const cosmoQuotes = {
    correct: [
      "¡Excelente trabajo, comandante!",
      "¡Rumbo perfecto! Estás brillando.",
      "¡Guau! Tu pronunciación y vocabulario son estelares.",
      "¡Directo al centro del planeta!",
      "¡Órbita asegurada!"
    ],
    incorrect: [
      "¡No pasa nada! Ajustemos la trayectoria.",
      "El espacio es difícil, ¡sigue intentándolo!",
      "Un pequeño desvío, ¡tú puedes corregirlo!",
      "Houston, ¡reiniciemos motores para el siguiente intento!",
      "¡Recuerda esta palabra para la próxima!"
    ]
  };

  const [cosmoText, setCosmoText] = useState<string>("¡Misión en marcha!");
  const [cosmoSpeechActive, setCosmoSpeechActive] = useState<boolean>(false);

  const triggerCosmoSpeech = (text: string) => {
    setCosmoText(text);
    setCosmoSpeechActive(true);
    setTimeout(() => {
      setCosmoSpeechActive(false);
    }, 3000);
  };

  // Feedback Overlay
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; text: string }>({
    show: false,
    correct: false,
    text: ""
  });

  // Al completar todas las preguntas, finalizar
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      onFinish(correctCount, maxStreak, audioStreak, writeStreak, perfectRunFlag);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions.length]);

  const handleCheckAnswer = (isCorrect: boolean, spokenWord?: string) => {
    const q = questions[currentQuestionIndex];
    
    if (isCorrect) {
      playSound("correct");
      setFeedback({ show: true, correct: true, text: "¡CORRECTO! 🚀" });
      setScore(prev => prev + 100 + (streak * 10));
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      setCorrectCount(prev => prev + 1);

      // Evaluar racha de audio
      if (q && q.type === "audio") {
        const nextAudioStreak = currentAudioStreak + 1;
        setCurrentAudioStreak(nextAudioStreak);
        if (nextAudioStreak > audioStreak) setAudioStreak(nextAudioStreak);
      }

      // Evaluar racha de escritura
      if (q && q.type === "writing") {
        const nextWriteStreak = currentWriteStreak + 1;
        setCurrentWriteStreak(nextWriteStreak);
        if (nextWriteStreak > writeStreak) setWriteStreak(nextWriteStreak);
      }

      const quotes = cosmoQuotes.correct;
      triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
      
      if (spokenWord) {
        if (subjectId === "ingles") {
          speakEnglish(spokenWord);
        } else {
          speakSpanish(spokenWord);
        }
      }
    } else {
      playSound("incorrect");
      
      let feedbackText = "¡UPS! 🛸";
      if (q) {
        if (q.type === "science-trivia") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.correctAnswer.toUpperCase()} ${q.emoji}`;
        } else if (q.type === "science-tf") {
          feedbackText = `¡UPS! 🛸 Es ${q.correctAnswer.toUpperCase()}. ${q.explanation || ""}`;
        } else if (q.type === "science-sequence") {
          feedbackText = `¡UPS! 🛸 El orden correcto es: ${q.sequence.join(" -> ")} ${q.emoji}`;
        } else if (q.type === "science-classify") {
          feedbackText = `¡UPS! 🛸 Pertenece a: ${q.correctCategory.toUpperCase()} ${q.emoji}`;
        } else if (q.type === "science-vowels") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.word.toUpperCase()} ${q.emoji}`;
        } else if (q.type === "science-writing") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.word.toUpperCase()} ${q.emoji}`;
        } else if (q.type === "trivia") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.word.toUpperCase()} (${q.translation}) ${q.emoji}`;
        } else if (q.type === "audio") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.translation.toUpperCase()} (${q.word}) ${q.emoji}`;
        } else if (q.type === "preposition") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.preposition.toUpperCase()} (${q.translation}) 🪐`;
        } else if (q.type === "true-false") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.word.toUpperCase()} = ${q.translation} ${q.emoji}`;
        } else if (q.type === "fill-vowels") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.word.toUpperCase()} (${q.translation}) ${q.emoji}`;
        } else if (q.type === "writing") {
          feedbackText = `¡UPS! 🛸 La respuesta correcta es: ${q.word.toUpperCase()} (${q.translation}) ${q.emoji}`;
        }
      }
      
      setFeedback({ show: true, correct: false, text: feedbackText });
      setStreak(0);
      setPerfectRunFlag(false);

      if (q && q.type === "audio") {
        setCurrentAudioStreak(0);
      }
      if (q && q.type === "writing") {
        setCurrentWriteStreak(0);
      }

      const quotes = cosmoQuotes.incorrect;
      triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    const delay = isCorrect ? 1500 : 4000;
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
      setCurrentQuestionIndex(prev => prev + 1);
    }, delay);
  };

  const handleAbort = () => {
    if (confirm("¿Seguro que quieres salir? Perderás el progreso.")) {
      onAbort();
    }
  };

  // Renderizar minijuego específico
  const renderActiveGame = () => {
    const q = questions[currentQuestionIndex];
    if (!q) return null;

    switch (q.type) {
      case "science-trivia":
        return (
          <CienciasTriviaGame 
            question={q as any} 
            difficulty={difficulty} 
            onAnswer={(isCorrect) => handleCheckAnswer(isCorrect, isCorrect ? (q as any).correctAnswer : undefined)} 
          />
        );
      case "science-tf":
        return (
          <CienciasTrueFalseGame 
            question={q as any} 
            difficulty={difficulty} 
            onAnswer={(isCorrect) => handleCheckAnswer(isCorrect)} 
          />
        );
      case "science-sequence":
        return (
          <CienciasSequenceGame 
            question={q as any} 
            onAnswer={(isCorrect) => handleCheckAnswer(isCorrect, isCorrect ? (q as any).animal : undefined)} 
          />
        );
      case "science-classify":
        return (
          <CienciasClassifyGame 
            question={q as any} 
            difficulty={difficulty} 
            onAnswer={(isCorrect) => handleCheckAnswer(isCorrect, isCorrect ? (q as any).concept : undefined)} 
          />
        );
      case "science-vowels":
        return (
          <CienciasFillVowelsGame 
            question={q as any} 
            difficulty={difficulty} 
            onAnswer={(isCorrect) => handleCheckAnswer(isCorrect, isCorrect ? (q as any).word : undefined)} 
          />
        );
      case "science-writing":
        return (
          <CienciasWritingGame 
            question={q as any} 
            difficulty={difficulty} 
            onAnswer={(isCorrect) => handleCheckAnswer(isCorrect, isCorrect ? (q as any).word : undefined)} 
          />
        );
      case "trivia":
        return (
          <TriviaGame 
            question={q} 
            difficulty={difficulty} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "audio":
        return (
          <AudioGame 
            question={q} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "true-false":
        return (
          <TrueFalseGame 
            question={q} 
            difficulty={difficulty} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "fill-vowels":
        return (
          <FillVowelsGame 
            question={q} 
            difficulty={difficulty} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "writing":
        return (
          <WritingGame 
            question={q} 
            difficulty={difficulty} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "drag-drop":
        return (
          <DragDropGame 
            question={q as DragDropQuestion} 
            difficulty={difficulty} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "preposition":
        return (
          <PrepositionGame 
            question={q} 
            onAnswer={handleCheckAnswer} 
          />
        );
      case "memorice":
        return (
          <MemoriceGame 
            question={q as MemoriceQuestion} 
            difficulty={difficulty} 
            onAnswer={handleCheckAnswer} 
            onWrongMatch={() => {
              setStreak(0);
              setCurrentAudioStreak(0);
              setCurrentWriteStreak(0);
              setPerfectRunFlag(false);
              const quotes = cosmoQuotes.incorrect;
              triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
            }}
          />
        );
      default:
        return <div>Tipo de juego desconocido</div>;
    }
  };

  const progressPercentage = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

  return (
    <section className="view active" id="game-view">
      <div className="game-header">
        <button className="btn btn-secondary" onClick={handleAbort}>
          🛸 Abortar Misión
        </button>
        
        {/* Barra de Progreso de la Misión */}
        <div className="game-progress-bar" style={{ flex: 1, margin: "0 15px" }}>
          <div className="game-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        {/* Planeta Info */}
        <div style={{ marginRight: "15px", fontFamily: "var(--font-title)", fontSize: "0.95rem", opacity: 0.85, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <span>{planet.emoji}</span> <span>{planet.name}</span>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {/* Racha con Animación de Fuego */}
          {streak >= 3 && (
            <span 
              className="streak-badge active"
              style={{
                fontFamily: "var(--font-title)",
                fontSize: "1.1rem",
                color: "#ff7675",
                textShadow: "0 0 10px rgba(255, 118, 117, 0.4)",
                fontWeight: "bold",
                animation: "pulse 1.5s infinite"
              }}
            >
              🔥 {streak} Racha!
            </span>
          )}
          <div className="game-score-display">
            ✨ Puntos: <strong>{score}</strong>
          </div>
        </div>
      </div>

      <div className="game-arena">
        {/* Feedback Overlay animado */}
        <div className={`feedback-overlay ${feedback.show ? (feedback.correct ? "correct" : "incorrect") : ""}`}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            {feedback.text}
          </div>
        </div>

        {currentQuestionIndex < questions.length && renderActiveGame()}

        {/* Mascota Cosmo */}
        <div className="cosmo-pet" onClick={() => triggerCosmoSpeech("¡Sigue adelante, astronauta!")} style={{ cursor: "pointer" }}>
          <div className={`cosmo-bubble ${cosmoSpeechActive ? "active" : ""}`}>{cosmoText}</div>
          <span className="cosmo-avatar">👽</span>
        </div>
      </div>
    </section>
  );
};
