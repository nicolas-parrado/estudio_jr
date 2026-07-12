let activeVoice: SpeechSynthesisVoice | null = null;
let activeSpanishVoice: SpeechSynthesisVoice | null = null;

const getEnglishVoice = (): SpeechSynthesisVoice | null => {
  if (!window.speechSynthesis) return null;
  if (activeVoice) return activeVoice;
  
  const voices = window.speechSynthesis.getVoices();
  activeVoice = voices.find(v => v.lang.includes("en-US")) || 
                voices.find(v => v.lang.includes("en-GB")) || 
                voices.find(v => v.lang.startsWith("en")) || 
                voices[0] || null;
  return activeVoice;
};

const getSpanishVoice = (): SpeechSynthesisVoice | null => {
  if (!window.speechSynthesis) return null;
  if (activeSpanishVoice) return activeSpanishVoice;
  
  const voices = window.speechSynthesis.getVoices();
  activeSpanishVoice = voices.find(v => v.lang.includes("es-CL")) || 
                       voices.find(v => v.lang.includes("es-ES")) || 
                       voices.find(v => v.lang.includes("es-MX")) || 
                       voices.find(v => v.lang.startsWith("es")) || 
                       voices[0] || null;
  return activeSpanishVoice;
};

// Suscribirse a la carga asíncrona de voces en Chrome/Safari
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    activeVoice = null; // Reset para forzar la recarga
    activeSpanishVoice = null;
    getEnglishVoice();
    getSpanishVoice();
  };
}

/**
 * Utiliza el sintetizador nativo del navegador para pronunciar texto en inglés.
 */
export const speakEnglish = (text: string) => {
  if (!window.speechSynthesis) return;
  
  // Detener cualquier reproducción en curso
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  
  const voice = getEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  
  window.speechSynthesis.speak(utterance);
};

/**
 * Utiliza el sintetizador nativo del navegador para pronunciar texto en español.
 */
export const speakSpanish = (text: string) => {
  if (!window.speechSynthesis) return;
  
  // Detener cualquier reproducción en curso
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-CL";
  
  const voice = getSpanishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  
  window.speechSynthesis.speak(utterance);
};
