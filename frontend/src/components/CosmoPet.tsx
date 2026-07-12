import React, { useState, useEffect } from "react";
import { playSound } from "../utils/audio";

interface CosmoPetProps {
  initialGreeting?: boolean;
}

export const CosmoPet: React.FC<CosmoPetProps> = ({ initialGreeting = false }) => {
  const [cosmoText, setCosmoText] = useState<string>("¡Hola! Listo para despegar.");
  const [cosmoSpeechActive, setCosmoSpeechActive] = useState<boolean>(false);

  const cosmoQuotes = {
    start: [
      "¡Hola! Listos para aprender.",
      "¡Qué gran día para explorar!",
      "¿Listos para despegar hacia las estrellas?",
      "¡Hola piloto! Hoy conquistaremos el cosmos.",
      "¡Astronautas, reportándose al puente!"
    ],
    idle: [
      "¡Sigue adelante, astronauta! 🚀",
      "¡El universo está lleno de sorpresas! 🌌",
      "¡Tú puedes lograrlo! ✨",
      "¡Cada respuesta te acerca más a las estrellas! 🪐",
      "¡Luces, cámaras... despegue! 🛸",
      "¡Houston, todo marcha de maravilla! 👨‍🚀"
    ]
  };

  const triggerCosmoSpeech = (text: string) => {
    setCosmoText(text);
    setCosmoSpeechActive(true);
  };

  useEffect(() => {
    if (cosmoSpeechActive) {
      const timer = setTimeout(() => {
        setCosmoSpeechActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cosmoSpeechActive]);

  useEffect(() => {
    if (initialGreeting) {
      const quotes = cosmoQuotes.start;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      triggerCosmoSpeech(randomQuote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGreeting]);

  const handleCosmoClick = () => {
    playSound("click");
    const quotes = cosmoQuotes.idle;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    triggerCosmoSpeech(randomQuote);
  };

  return (
    <div className="cosmo-pet" onClick={handleCosmoClick} style={{ cursor: "pointer" }}>
      <div className={`cosmo-bubble ${cosmoSpeechActive ? "active" : ""}`}>
        {cosmoText}
      </div>
      <span className="cosmo-avatar">👽</span>
    </div>
  );
};
