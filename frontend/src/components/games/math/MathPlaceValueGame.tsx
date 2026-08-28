import React from "react";
import { MathPlaceValueQuestion, Difficulty } from "../../../types";
import { playSound } from "../../../utils/audio";

interface MathPlaceValueGameProps {
  question: MathPlaceValueQuestion;
  difficulty: Difficulty;
  onAnswer: (isCorrect: boolean) => void;
}

export const MathPlaceValueGame: React.FC<MathPlaceValueGameProps> = ({
  question,
  onAnswer
}) => {
  const q = question;

  const handleOptionSelect = (opt: string) => {
    const isCorrect = opt === q.correctAnswer;
    if (isCorrect) {
      playSound("click");
    } else {
      playSound("incorrect");
    }
    onAnswer(isCorrect);
  };

  // Renderizador visual de bloques multibase (Decenas = barras rojas de 10, Unidades = cubos azules)
  const renderBase10Blocks = () => {
    const tensCount = q.tens || 0;
    const unitsCount = q.units || 0;

    if (tensCount === 0 && unitsCount === 0) return null;

    return (
      <div className="base10-container">
        {/* Bloques de Decenas (Barras) */}
        {tensCount > 0 && (
          <div className="base10-group tens-group">
            <div className="base10-group-label">
              Decenas (D): <strong>{tensCount}</strong>
            </div>
            <div className="base10-items-wrap">
              {Array.from({ length: tensCount }).map((_, idx) => (
                <div key={idx} className="base10-bar" title="1 Decena = 10 unidades">
                  {Array.from({ length: 10 }).map((_, cIdx) => (
                    <span key={cIdx} className="base10-cube-segment" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bloques de Unidades (Cubos individuales) */}
        {unitsCount > 0 && (
          <div className="base10-group units-group">
            <div className="base10-group-label">
              Unidades (U): <strong>{unitsCount}</strong>
            </div>
            <div className="base10-items-wrap units-wrap">
              {Array.from({ length: unitsCount }).map((_, idx) => (
                <div key={idx} className="base10-single-cube" title="1 Unidad" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="math-place-value-container">
      <div className="question-subtitle">
        {q.instruction || "Valor Posicional: Decenas y Unidades"}
      </div>

      {/* Renderizado de Bloques Multibase si aplica */}
      {(q.tens !== undefined || q.units !== undefined) && renderBase10Blocks()}

      {/* Tarjeta de Pregunta */}
      <div className="place-value-card">
        {q.number !== undefined && (
          <div className="place-value-number-display">
            <span className="big-number">{q.number}</span>
          </div>
        )}
        <h3 className="place-value-question-text">{q.question}</h3>
      </div>

      {/* Opciones de Selección */}
      <div className="options-grid" style={{ marginTop: "25px" }}>
        {q.options.map((opt) => (
          <button
            key={opt}
            className="option-card math-option-btn"
            onClick={() => handleOptionSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
