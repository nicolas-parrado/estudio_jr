import React, { useEffect } from "react";
import { playSound } from "../../../utils/audio";

interface MathKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

export const MathKeypad: React.FC<MathKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength = 4,
  placeholder = "___",
  disabled = false
}) => {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= maxLength) return;
    playSound("click");
    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    playSound("click");
    onChange(value.slice(0, -1));
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key >= "0" && e.key <= "9") {
        if (value.length < maxLength) {
          playSound("click");
          onChange(value + e.key);
        }
      } else if (e.key === "Backspace") {
        if (value.length > 0) {
          playSound("click");
          onChange(value.slice(0, -1));
        }
      } else if (e.key === "Enter") {
        if (value.length > 0) {
          onSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, disabled, maxLength, onChange, onSubmit]);

  return (
    <div className="math-keypad-container">
      {/* Display del resultado */}
      <div className="math-keypad-display">
        <span className={value ? "display-filled" : "display-empty"}>
          {value || placeholder}
        </span>
      </div>

      {/* Grid del Teclado Numérico */}
      <div className="math-keypad-grid">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button
            key={digit}
            type="button"
            className="math-key-btn"
            onClick={() => handleDigit(digit)}
            disabled={disabled}
          >
            {digit}
          </button>
        ))}
        
        <button
          type="button"
          className="math-key-btn key-action"
          onClick={handleBackspace}
          disabled={disabled || value.length === 0}
          title="Borrar dígito"
        >
          ⌫
        </button>

        <button
          type="button"
          className="math-key-btn"
          onClick={() => handleDigit("0")}
          disabled={disabled}
        >
          0
        </button>

        <button
          type="button"
          className="math-key-btn key-submit"
          onClick={onSubmit}
          disabled={disabled || value.length === 0}
          title="Confirmar respuesta"
        >
          🚀
        </button>
      </div>
    </div>
  );
};
