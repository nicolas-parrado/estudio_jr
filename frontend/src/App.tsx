import { useState, useEffect, useRef } from "react";
import { 
  GameData, 
  PlayersProgress, 
  PlayerState, 
  Planet, 
  GameQuestion, 
  VocabularyItem, 
  SpecialQuestion,
  MemoryCard
} from "./types.ts";

export default function App() {
  // --- ESTADOS DE LA API ---
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playersProgress, setPlayersProgress] = useState<PlayersProgress>({
    Sofia: { stars: {}, unlockedPlanets: ["planet-1"], stickers: [] },
    Luciano: { stars: {}, unlockedPlanets: ["planet-1"], stickers: [] }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADOS DE JUEGO (SPA) ---
  const [activeView, setActiveView] = useState<"welcome" | "map" | "game" | "album" | "leaderboard">("welcome");
  const [currentPlayer, setCurrentPlayer] = useState<"Sofia" | "Luciano" | null>(null);
  
  // Misión activa
  const [currentPlanet, setCurrentPlanet] = useState<Planet | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  
  // Feedback visual
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; text: string }>({
    show: false,
    correct: true,
    text: ""
  });

  // Memorice local
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // Índices volteados
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]); // IDs emparejados
  const [isCheckingMemory, setIsCheckingMemory] = useState<boolean>(false);

  // Drag & Drop virtual (Clic en origen, Clic en destino)
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [placedWords, setPlacedWords] = useState<Record<string, string>>({}); // { wordExpected: wordPlaced }

  // Mascota Cosmo
  const [cosmoText, setCosmoText] = useState<string>("¡Hola! Listo para despegar.");
  const [cosmoSpeechActive, setCosmoSpeechActive] = useState<boolean>(true);

  // Nuevos estados para juego y logros
  const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");
  const [perfectRunFlag, setPerfectRunFlag] = useState<boolean>(true);
  const [userVowels, setUserVowels] = useState<string[]>([]);
  const [userWritingInput, setUserWritingInput] = useState<string>("");
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [audioStreak, setAudioStreak] = useState<number>(0);
  const [writeStreak, setWriteStreak] = useState<number>(0);
  const [currentWriteStreak, setCurrentWriteStreak] = useState<number>(0);
  const [currentAudioStreak, setCurrentAudioStreak] = useState<number>(0);
  const [leftColumnCards, setLeftColumnCards] = useState<string[]>([]);
  const [rightColumnCards, setRightColumnCards] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);

  // Modal de Resultados
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [resultsData, setResultsData] = useState<{
    stars: number;
    correct: string;
    points: number;
    stickersUnlocked: { emoji: string; name: string }[];
  } | null>(null);

  // Posición física del cohete animado en el mapa
  const [rocketPosition, setRocketPosition] = useState<{ left: string; top: string }>({ left: "0px", top: "0px" });

  // URLs de API (Backend)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // --- REFERENCIAS DE AUDIO ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthesisVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // --- EFECTOS INICIALES ---
  useEffect(() => {
    // Generar estrellas de fondo
    generateStars();
    
    // Cargar datos del backend
    fetchGameData();
    fetchPlayersProgress();
    
    // Inicializar voces del sintetizador
    initSpeechVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = initSpeechVoices;
    }
  }, []);

  // --- CARGA DE DATOS ---
  const fetchGameData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary`);
      if (!res.ok) throw new Error("No se pudo cargar el vocabulario del servidor");
      const data = await res.json();
      setGameData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersProgress = async () => {
    try {
      const res = await fetch(`${API_URL}/api/players`);
      if (!res.ok) throw new Error("No se pudo cargar el progreso de los jugadores");
      const data = await res.json();
      setPlayersProgress(data);
    } catch (e: any) {
      console.error("Error cargando jugadores:", e);
    }
  };

  // --- GENERACIÓN DE ESTRELLAS CÓSMICAS ---
  const generateStars = () => {
    const container = document.getElementById("stars-container");
    if (!container) return;
    container.innerHTML = "";
    const totalStars = 80;
    for (let i = 0; i < totalStars; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
    }
  };

  // --- AUDIO Y VOZ SINTÉTICA ---
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSound = (type: "click" | "correct" | "incorrect" | "victory") => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "correct") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "incorrect") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.linearRampToValueAtTime(110, now + 0.3); // A2
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "victory") {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          
          noteOsc.type = "sine";
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.075);
          
          noteGain.gain.setValueAtTime(0.1, now + idx * 0.075);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.075 + 0.2);
          
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          noteOsc.start(now + idx * 0.075);
          noteOsc.stop(now + idx * 0.075 + 0.2);
        });
      }
    } catch (e) {
      console.warn("Sonido no soportado:", e);
    }
  };

  const initSpeechVoices = () => {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    synthesisVoiceRef.current = voices.find(v => v.lang.includes("en-US")) || 
                                voices.find(v => v.lang.includes("en-GB")) || 
                                voices.find(v => v.lang.startsWith("en")) || 
                                voices[0] || null;
  };

  const speakEnglish = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    if (synthesisVoiceRef.current) {
      utterance.voice = synthesisVoiceRef.current;
    }
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    
    window.speechSynthesis.speak(utterance);
  };

  // --- MASCOTA VIRTUAL FRASES ---
  const cosmoQuotes = {
    start: ["¡Despegamos!", "¡Aventura en el espacio!", "Let's learn English!", "¡Mucho éxito!"],
    correct: ["¡Amazing! 🌟", "¡You rock! 🚀", "¡Fabuloso!", "¡To the stars!", "¡Good job!"],
    incorrect: ["¡Casi! Intenta otra vez.", "¡Keep trying! 💪", "¡You can do it!", "¡Ánimo!"],
    victory: ["¡Misión cumplida! 🎉", "¡Eres una super estrella!", "¡Increíble!", "¡Wow! ¡Buen viaje!"]
  };

  const triggerCosmoSpeech = (phrase: string) => {
    setCosmoText(phrase);
    setCosmoSpeechActive(true);
    setTimeout(() => {
      setCosmoSpeechActive(false);
    }, 3000);
  };

  const triggerCosmoGreeting = () => {
    const quotes = cosmoQuotes.start;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    triggerCosmoSpeech(randomQuote);
  };

  // --- ENRUTAMIENTO SPA ---
  const handleNavigate = (view: "welcome" | "map" | "album" | "leaderboard") => {
    playSound("click");
    setActiveView(view);
    
    // Refrescar datos del backend al navegar para evitar estados obsoletos
    if (view === "welcome") {
      setCurrentPlayer(null);
      fetchPlayersProgress();
    } else if (view === "album" || view === "map" || view === "leaderboard") {
      fetchPlayersProgress();
      fetchGameData();
    }
  };

  // --- LOGIN ---
  const handleLogin = (player: "Sofia" | "Luciano") => {
    playSound("click");
    try {
      getAudioContext();
      speakEnglish("");
    } catch(e) {}
    
    setCurrentPlayer(player);
    setActiveView("map");
    triggerCosmoSpeech(`¡Bienvenido/a a bordo, ${player}!`);
  };

  // --- LOGOUT / SALIR ---
  const handleLogout = () => {
    handleNavigate("welcome");
  };

  // --- LANZAMIENTO COHETE MAPA ---
  const handlePlanetSelect = (event: React.MouseEvent<HTMLDivElement>, planet: Planet) => {
    playSound("click");
    
    const container = document.getElementById("map-container");
    const node = event.currentTarget;
    if (!container || !node) return;

    const mapRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    const targetX = nodeRect.left - mapRect.left + (nodeRect.width / 2) - 15;
    const targetY = nodeRect.top - mapRect.top - 40;

    setRocketPosition({ left: `${targetX}px`, top: `${targetY}px` });

    setTimeout(() => {
      startPlanetMission(planet);
    }, 1200);
  };

  // --- MISION DEL PLANETA ---
  const startPlanetMission = (planet: Planet) => {
    console.log("startPlanetMission iniciada para:", planet.id, planet.name, "Dificultad:", difficulty);
    setCurrentPlanet(planet);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setCurrentQuestionIndex(0);
    
    // Inicializar estados de racha y logros personales
    setPerfectRunFlag(true);
    setUserVowels([]);
    setUserWritingInput("");
    setMaxStreak(0);
    setAudioStreak(0);
    setWriteStreak(0);
    setCurrentWriteStreak(0);
    setCurrentAudioStreak(0);

    const qList = generateRandomQuestions(planet);
    console.log("Preguntas calculadas:", qList);
    setQuestions(qList);
    
    setActiveView("game");
    console.log("Cambiado activeView a 'game'");
    triggerCosmoGreeting();
  };

  const generateRandomQuestions = (planet: Planet): GameQuestion[] => {
    console.log("generateRandomQuestions ejecutándose para:", planet.id, "Vocabulario:", planet.vocabulary, "Dificultad:", difficulty);
    const list: GameQuestion[] = [];
    const vocab = [...(planet.vocabulary || [])];
    if (vocab.length === 0) {
      console.error("ERROR: El vocabulario del planeta está vacío o es nulo.");
      return [];
    }
    vocab.sort(() => Math.random() - 0.5);

    // Cantidad de preguntas
    const targetLength = difficulty === "hard" ? 15 : 10;
    
    // Si el vocabulario tiene menos elementos de los requeridos, los repetimos para llenar la ronda
    let pool = [...vocab];
    while (pool.length < targetLength) {
      pool = [...pool, ...vocab.sort(() => Math.random() - 0.5)];
    }
    const selectedVocab = pool.slice(0, targetLength);

    // Tipos de juego disponibles
    const gameTypes = ["trivia", "visual", "audio", "true-false", "fill-vowels"];
    if (difficulty === "hard") {
      gameTypes.push("writing");
    }
    if (planet.id === "planet-1") {
      gameTypes.push("drag-drop");
    }

    selectedVocab.forEach((item, idx) => {
      let type = gameTypes[idx % gameTypes.length];
      
      // Excepción planet-6 preposiciones
      if (planet.id === "planet-6" && planet.specialQuestions && idx >= targetLength - 3) {
        const specIndex = (idx - (targetLength - 3)) % planet.specialQuestions.length;
        const spec = planet.specialQuestions[specIndex];
        if (spec) {
          list.push({
            type: "preposition",
            phrase: spec.phrase,
            preposition: spec.preposition,
            translation: spec.translation,
            options: [...spec.options],
            visual: spec.visual
          });
          return;
        }
      }

      // Memorice en planetas 2 y 5 (como última pregunta de la ronda)
      if (idx === targetLength - 1 && (planet.id === "planet-2" || planet.id === "planet-5")) {
        type = "memorice";
      }

      if (type === "trivia") {
        const distractors = vocab
          .filter(v => v.word !== item.word)
          .map(v => v.word)
          .slice(0, 3);
        while (distractors.length < 3) distractors.push("hello", "goodbye", "star");
        const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);

        list.push({
          type: "trivia",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          options,
          correctAnswer: item.word
        });
      } else if (type === "visual") {
        const distractors = vocab
          .filter(v => v.word !== item.word)
          .map(v => v.word)
          .slice(0, 3);
        while (distractors.length < 3) distractors.push("hello", "goodbye", "star");
        const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);

        list.push({
          type: "visual",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          options,
          correctAnswer: item.word
        });
      } else if (type === "audio") {
        const distractors = vocab
          .filter(v => v.word !== item.word)
          .map(v => v.translation)
          .slice(0, 3);
        while (distractors.length < 3) distractors.push("hola", "adiós", "estrella");
        const options = [item.translation, ...distractors].sort(() => Math.random() - 0.5);

        list.push({
          type: "audio",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          options,
          correctAnswer: item.translation
        });
      } else if (type === "drag-drop") {
        // Unión de 4 elementos
        const partners = vocab.filter(v => v.word !== item.word).slice(0, 3);
        const allItems = [item, ...partners].sort(() => Math.random() - 0.5);
        const isSpanishLeft = Math.random() > 0.5;

        list.push({
          type: "drag-drop",
          items: allItems.map(v => ({ word: v.word, emoji: v.emoji, translation: v.translation })),
          isSpanishLeft
        });
      } else if (type === "memorice") {
        const partner = vocab.find(v => v.word !== item.word) || vocab[0];
        list.push({
          type: "memorice",
          pairs: [
            { word: item.word, emoji: item.emoji, id: 1 },
            { word: item.translation, emoji: item.emoji, id: 1 },
            { word: partner.word, emoji: partner.emoji, id: 2 },
            { word: partner.translation, emoji: partner.emoji, id: 2 }
          ].sort(() => Math.random() - 0.5)
        });
      } else if (type === "true-false") {
        const isCorrectMatch = Math.random() > 0.5;
        let shownTranslation = item.translation;
        if (!isCorrectMatch) {
          const alternatives = vocab.filter(v => v.word !== item.word);
          if (alternatives.length > 0) {
            shownTranslation = alternatives[Math.floor(Math.random() * alternatives.length)].translation;
          }
        }

        list.push({
          type: "true-false",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          isCorrectMatch,
          shownTranslation
        });
      } else if (type === "fill-vowels") {
        const vowels = ["a", "e", "i", "o", "u"];
        const chars = item.word.split("");
        const correctVowels: string[] = [];
        
        const maskedWord = chars.map(char => {
          const lower = char.toLowerCase();
          if (vowels.includes(lower)) {
            correctVowels.push(lower);
            return "_";
          }
          return char;
        }).join(" ");

        list.push({
          type: "fill-vowels",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          maskedWord,
          correctVowels
        });
      } else if (type === "writing") {
        list.push({
          type: "writing",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji
        });
      }
    });

    return list;
  };

  // --- AUTOMATIC AUDIO TRIGGER AND STATE INITIALIZATION FOR QUESTIONS ---
  useEffect(() => {
    if (activeView !== "game" || questions.length === 0) return;
    const q = questions[currentQuestionIndex];
    if (!q) return;

    if (q.type === "audio") {
      setTimeout(() => {
        speakEnglish(q.word);
      }, 500);
    }
    
    // Inicializar estados de pregunta específica
    setFlippedCards([]);
    setMatchedPairs([]);
    setSelectedWord(null);
    setPlacedWords({});
    setUserVowels([]);
    setUserWritingInput("");

    if (q.type === "drag-drop") {
      const leftItems = q.items.map(item => q.isSpanishLeft ? item.translation : item.word);
      // Mezclar la derecha
      const rightItems = q.items.map(item => q.isSpanishLeft ? item.word : item.translation).sort(() => Math.random() - 0.5);
      setLeftColumnCards(leftItems);
      setRightColumnCards(rightItems);
    }

    if (q.type === "writing") {
      // Separar letras, barajarlas y guardarlas
      const letters = q.word.toLowerCase().split("").sort(() => Math.random() - 0.5);
      setScrambledLetters(letters);
    }
  }, [currentQuestionIndex, activeView, questions]);

  // --- EVALUACION DE RESPUESTAS ---
  const handleCheckAnswer = (isCorrect: boolean, spokenWord?: string) => {
    if (isCorrect) {
      playSound("correct");
      setFeedback({ show: true, correct: true, text: "¡CORRECTO! 🚀" });
      setScore(prev => prev + 100 + (streak * 10));
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      setCorrectCount(prev => prev + 1);

      // Evaluar racha de audio si la pregunta actual es de tipo audio
      const q = questions[currentQuestionIndex];
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
      
      if (spokenWord) speakEnglish(spokenWord);
    } else {
      playSound("incorrect");
      setFeedback({ show: true, correct: false, text: "¡UPS! 🛸" });
      setStreak(0);
      setPerfectRunFlag(false);

      const q = questions[currentQuestionIndex];
      if (q && q.type === "audio") {
        setCurrentAudioStreak(0);
      }
      if (q && q.type === "writing") {
        setCurrentWriteStreak(0);
      }

      const quotes = cosmoQuotes.incorrect;
      triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
      setCurrentQuestionIndex(prev => prev + 1);
    }, 1500);
  };

  // --- INTERACCIONES DE JUEGO ---

  // Drag & Drop
  const handleDragItemSelect = (word: string) => {
    playSound("click");
    setSelectedWord(word);
  };

  const handleDropTargetSelect = (expectedWord: string, itemsLength: number) => {
    if (!selectedWord) return;
    
    // Obtener la pregunta actual
    const q = questions[currentQuestionIndex] as DragDropQuestion;
    let isCorrectMatch = false;

    if (q.isSpanishLeft) {
      // selectedWord es español (translation), expectedWord es inglés (word)
      const pair = q.items.find(item => item.translation === selectedWord);
      if (pair && pair.word === expectedWord) {
        isCorrectMatch = true;
      }
    } else {
      // selectedWord es inglés (word), expectedWord es español (translation)
      const pair = q.items.find(item => item.word === selectedWord);
      if (pair && pair.translation === expectedWord) {
        isCorrectMatch = true;
      }
    }

    if (isCorrectMatch) {
      playSound("click");
      const updated = { ...placedWords, [selectedWord]: expectedWord };
      setPlacedWords(updated);
      setSelectedWord(null);

      if (Object.keys(updated).length === itemsLength) {
        setTimeout(() => {
          handleCheckAnswer(true);
        }, 600);
      }
    } else {
      playSound("incorrect");
      setSelectedWord(null);
      setPerfectRunFlag(false);
      
      // Feedback visual temporal para error sin abortar la pregunta
      setFeedback({ show: true, correct: false, text: "¡Inténtalo otra vez! 💫" });
      setTimeout(() => {
        setFeedback(prev => ({ ...prev, show: false }));
      }, 1000);
    }
  };

  // Memorice
  const handleMemoryCardClick = (cardIdx: number, cardData: MemoryCard) => {
    if (isCheckingMemory || flippedCards.includes(cardIdx) || matchedPairs.includes(cardData.id)) return;
    
    playSound("click");
    const updatedFlipped = [...flippedCards, cardIdx];
    setFlippedCards(updatedFlipped);

    if (updatedFlipped.length === 2) {
      setIsCheckingMemory(true);
      const firstCardIdx = updatedFlipped[0];
      const q = questions[currentQuestionIndex] as MemoriceQuestion;
      const firstCard = q.pairs[firstCardIdx];
      const secondCard = cardData;

      if (firstCard.id === secondCard.id) {
        setTimeout(() => {
          playSound("correct");
          setMatchedPairs(prev => [...prev, firstCard.id]);
          setFlippedCards([]);
          setIsCheckingMemory(false);
          
          if (matchedPairs.length + 1 === q.pairs.length / 2) {
            setTimeout(() => {
              handleCheckAnswer(true);
            }, 800);
          }
        }, 500);
      } else {
        setTimeout(() => {
          playSound("incorrect");
          setFlippedCards([]);
          setIsCheckingMemory(false);
          setStreak(0);
        }, 1200);
      }
    }
  };

  // --- MISION COMPLETADA / LLAMADA API POST ---
  const finishPlanetMission = async () => {
    if (!currentPlayer || !currentPlanet) return;
    playSound("victory");

    const ratio = correctCount / questions.length;
    let earnedStars = 0;
    if (ratio === 1) earnedStars = 3;
    else if (ratio >= 0.7) earnedStars = 2;
    else if (ratio >= 0.5) earnedStars = 1;

    // Guardar stickers antiguos antes de actualizar
    const oldStickers = playersProgress[currentPlayer]?.stickers || [];
    let newlyUnlockedStickers: { emoji: string; name: string }[] = [];

    try {
      const res = await fetch(`${API_URL}/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: currentPlayer,
          planetId: difficulty === "hard" ? `${currentPlanet.id}-hard` : currentPlanet.id,
          stars: earnedStars,
          maxStreak,
          audioStreak,
          perfectRun: perfectRunFlag,
          writeStreak
        })
      });

      if (!res.ok) throw new Error("No se pudo guardar el progreso");
      const updatedProgress = await res.json();
      setPlayersProgress(updatedProgress);

      // Comparamos stickers viejos y nuevos para ver qué logros se consiguieron
      const newStickers = updatedProgress[currentPlayer]?.stickers || [];
      const unlockedIDs = newStickers.filter((s: string) => !oldStickers.includes(s));

      if (gameData && gameData.stickers) {
        unlockedIDs.forEach((id: string) => {
          const sData = gameData.stickers.find(s => s.id === id);
          if (sData) {
            newlyUnlockedStickers.push({ emoji: sData.emoji, name: sData.name });
          }
        });
      }
    } catch(e) {
      console.error("Error al guardar progreso:", e);
    }

    setResultsData({
      stars: earnedStars,
      correct: `${correctCount}/${questions.length}`,
      points: score,
      stickersUnlocked: newlyUnlockedStickers
    });
    
    const quotes = cosmoQuotes.victory;
    triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    setShowResultsModal(true);
  };

  // Chequeo de término de preguntas
  useEffect(() => {
    if (activeView === "game" && questions.length > 0 && currentQuestionIndex >= questions.length) {
      finishPlanetMission();
    }
  }, [currentQuestionIndex]);

  // --- RESET DE DATOS API ---
  const handleResetData = async () => {
    const confirmation = prompt("ATENCIÓN PAPÁ: Para confirmar el reinicio completo de estrellas y stickers de Sofía y Luciano, escribe la palabra clave 'papa':");
    if (confirmation && confirmation.toLowerCase().trim() === "papa") {
      try {
        const res = await fetch(`${API_URL}/api/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: "papa" })
        });
        if (!res.ok) throw new Error("Fallo al resetear datos");
        const updatedProgress = await res.json();
        setPlayersProgress(updatedProgress);
        playSound("incorrect");
        setActiveView("welcome");
        setCurrentPlayer(null);
        alert("¡Datos galácticos reiniciados con éxito!");
      } catch(e) {
        alert("Hubo un error al intentar resetear los datos del servidor.");
      }
    } else if (confirmation !== null) {
      alert("Palabra clave incorrecta. Misión de reinicio abortada.");
    }
  };

  // --- RENDERS DE COMPONENTES ---
  const playerStats = currentPlayer ? playersProgress[currentPlayer] : null;

  // --- LOG DE RENDERIZADO ---
  console.log("Renderizando App. activeView:", activeView, "currentPlayer:", currentPlayer, "questionsLength:", questions.length, "currentPlanet:", currentPlanet ? currentPlanet.id : null, "loading:", loading, "error:", error);

  return (
    <>
      <div className="stars-container" id="stars-container" aria-hidden="true"></div>

      <main>
        {/* Cabecera / Navbar */}
        {currentPlayer && activeView !== "welcome" && !loading && !error && (
          <header>
            <div className="logo" onClick={() => handleNavigate("map")} style={{ cursor: "pointer" }}>
              <span>🚀</span> Space English
            </div>
            <div className="nav-buttons">
              <button className="btn btn-secondary">
                <span>{currentPlayer === "Sofia" ? "👧" : "👦"}</span> {currentPlayer}
                <span style={{ color: "var(--color-warning)", marginLeft: "5px" }}>
                  ⭐ {Object.values(playerStats?.stars || {}).reduce((a, b) => a + b, 0)}
                </span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("map")}>
                🪐 Mapa
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("album")}>
                🖼️ Álbum
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("leaderboard")}>
                🏆 Tabla de Honor
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                🚪 Salir
              </button>
            </div>
          </header>
        )}

        {/* Vista de Carga */}
        {loading && (
          <section className="view active" id="loading-view" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="welcome-box">
              <h1 style={{ fontSize: "2rem", marginBottom: "15px" }}>🚀 Iniciando Motores...</h1>
              <p>Conectando con el centro de control galáctico para cargar el vocabulario de Sofía y Luciano...</p>
              <div className="loader-container" style={{ margin: "30px auto", width: "80px", height: "80px", position: "relative" }}>
                <div style={{
                  position: "absolute", width: "100%", height: "100%",
                  border: "4px solid rgba(255, 255, 255, 0.1)",
                  borderTopColor: "var(--color-cyan)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              </div>
            </div>
          </section>
        )}

        {/* Vista de Error de Conexión */}
        {error && !loading && (
          <section className="view active" id="error-view" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="welcome-box" style={{ borderColor: "var(--color-danger)" }}>
              <h1 style={{ color: "var(--color-danger)", fontSize: "2rem", marginBottom: "15px" }}>🛸 ¡Houston, tenemos un problema!</h1>
              <p>No se pudo conectar al servidor de base de datos:</p>
              <div style={{
                background: "rgba(255, 118, 117, 0.1)",
                color: "#ff7675",
                padding: "15px",
                borderRadius: "8px",
                fontFamily: "monospace",
                margin: "15px 0",
                fontSize: "0.9rem",
                wordBreak: "break-all"
              }}>{error}</div>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "25px" }}>
                Asegúrate de que el backend Docker esté arriba y accesible en <code>{API_URL}</code>.
              </p>
              <button className="btn btn-primary" onClick={() => {
                setError(null);
                setLoading(true);
                fetchGameData();
                fetchPlayersProgress();
              }}>
                🔄 Reintentar Conexión
              </button>
            </div>
          </section>
        )}

        {/* 1. Vista de Bienvenida */}
        {!loading && !error && activeView === "welcome" && (
          <section className="view active" id="welcome-view">
            <div className="welcome-box">
              <h1>🌌 Space English</h1>
              <p>¡Prepárate para una aventura de inglés en el espacio exterior!</p>
              
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "1.4rem", marginBottom: "20px" }}>
                ¿Quién va a pilotar la nave hoy?
              </h2>
              
              <div className="profile-select">
                {["Sofia", "Luciano"].map(p => {
                  const starsCount = Object.values(playersProgress[p]?.stars || {}).reduce((a, b) => a + b, 0);
                  return (
                    <div 
                      key={p} 
                      className="profile-card" 
                      onClick={() => handleLogin(p as any)}
                    >
                      <span className="profile-avatar">{p === "Sofia" ? "👧" : "👦"}</span>
                      <span className="profile-name">{p}</span>
                      <div className="profile-stars">⭐ {starsCount}</div>
                    </div>
                  );
                })}
              </div>
              
              <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>¡Elige tu perfil para continuar tu viaje estelar!</p>
            </div>
          </section>
        )}

        {/* 2. Vista de Mapa Estelar */}
        {!loading && !error && activeView === "map" && gameData && playerStats && (
          <section className="view active" id="map-view">
            <div className="map-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem" }}>Mapa Estelar de Aprendizaje</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Selecciona un planeta para viajar y jugar</p>
              </div>

              {/* Selector de Dificultad Galáctica */}
              <div className="difficulty-toggle-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.9rem", color: difficulty === "normal" ? "var(--color-cyan)" : "var(--text-muted)", fontWeight: "bold" }}>🌌 Modo Normal</span>
                <label className="difficulty-switch" style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
                  <input 
                    type="checkbox" 
                    checked={difficulty === "hard"}
                    onChange={(e) => {
                      playSound("click");
                      setDifficulty(e.target.checked ? "hard" : "normal");
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="difficulty-slider" style={{
                    position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    border: "2px solid var(--glass-border)",
                    transition: "0.4s", borderRadius: "34px",
                    boxShadow: difficulty === "hard" ? "0 0 15px rgba(255, 118, 117, 0.4)" : ""
                  }}>
                    <span style={{
                      position: "absolute", content: '""', height: "24px", width: "24px", left: "3px", bottom: "3px",
                      backgroundColor: difficulty === "hard" ? "#ff7675" : "var(--color-cyan)",
                      transition: "0.4s", borderRadius: "50%",
                      transform: difficulty === "hard" ? "translateX(26px)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
                    }}>
                      {difficulty === "hard" ? "🔥" : "✨"}
                    </span>
                  </span>
                </label>
                <span style={{ fontSize: "0.9rem", color: difficulty === "hard" ? "#ff7675" : "var(--text-muted)", fontWeight: "bold" }}>🔥 Modo Hard</span>
              </div>
            </div>
            
            <div className={`map-container ${difficulty === "hard" ? "hard-nebula" : ""}`} id="map-container">
              <div className="nebula"></div>
              <div 
                className="player-rocket" 
                style={{ left: rocketPosition.left, top: rocketPosition.top }}
                aria-hidden="true"
              >
                🚀
              </div>
              
              <div className="planets-grid">
                {gameData.planets.map(planet => {
                  // Bloqueo: En Hard requiere al menos 2 estrellas en el Normal de ese mismo planeta
                  const isLocked = difficulty === "hard" 
                    ? (playerStats.stars[planet.id] || 0) < 2 
                    : !playerStats.unlockedPlanets.includes(planet.id);

                  // Estrellas obtenidas según el modo seleccionado
                  const targetID = difficulty === "hard" ? `${planet.id}-hard` : planet.id;
                  const stars = playerStats.stars[targetID] || 0;
                  const starsStr = "⭐".repeat(stars) + "☆".repeat(3 - stars);

                  return (
                    <div 
                      key={planet.id}
                      className={`planet-node ${isLocked ? 'locked' : ''} ${difficulty === "hard" && !isLocked ? 'hard-aura' : ''}`}
                      style={{ ["--planet-color" as any]: difficulty === "hard" ? "#ff7675" : planet.color }}
                      onClick={(e) => !isLocked && handlePlanetSelect(e, planet)}
                    >
                      <span className="planet-sphere" style={{ filter: `drop-shadow(0 0 10px ${difficulty === "hard" ? "#ff7675" : planet.color})` }}>
                        {isLocked ? "🪐" : planet.emoji}
                      </span>
                      <div className="planet-name">{planet.name} {difficulty === "hard" && "🔥"}</div>
                      <div className="planet-subtitle">{planet.subtitle}</div>
                      <div className="planet-stars-earned">
                        {!isLocked && starsStr}
                      </div>
                      {isLocked && (
                        <div className="lock-icon" style={{ color: difficulty === "hard" ? "#ff7675" : "" }}>
                          {difficulty === "hard" ? "🔒 Requiere 2⭐ en Normal" : "🔒 Bloqueado"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 3. Vista de Juego (Play Arena) */}
        {!loading && !error && activeView === "game" && currentPlanet && questions.length > 0 && currentQuestionIndex < questions.length && (
          <section className="view active" id="game-view">
            <div className="game-header">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  if (confirm("¿Seguro que quieres salir? Perderás el progreso.")) handleNavigate("map");
                }}
              >
                🛸 Abortar Misión
              </button>
              <div className="game-progress-bar">
                <div 
                  className="game-progress-fill" 
                  style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="game-score-display">
                <span>Racha: <strong style={{ color: "var(--color-cyan)" }}>{streak}</strong> 🔥</span>
                <span>Puntos: <strong style={{ color: "var(--color-warning)" }}>{score}</strong></span>
              </div>
            </div>

            <div className="game-arena">
              {/* Feedback Overlay */}
              {feedback.show && (
                <div className={`feedback-overlay ${feedback.correct ? 'correct' : 'incorrect'}`}>
                  <div>{feedback.text}</div>
                </div>
              )}
              
              {/* Contenedor de preguntas según tipo */}
              <div className="question-container">
                {questions[currentQuestionIndex].type === "trivia" && (
                  <>
                    <div className="question-subtitle">¿Cómo se dice en inglés?</div>
                    <div className="question-text">
                      {(questions[currentQuestionIndex] as any).translation.toUpperCase()} {(questions[currentQuestionIndex] as any).emoji}
                    </div>
                    <div className="options-grid">
                      {(questions[currentQuestionIndex] as any).options.map((opt: string) => (
                        <button 
                          key={opt}
                          className="option-card"
                          onClick={() => handleCheckAnswer(opt === (questions[currentQuestionIndex] as any).correctAnswer, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "visual" && (
                  <>
                    <div className="question-subtitle">¿Qué es esto?</div>
                    <div className="question-helper">{(questions[currentQuestionIndex] as any).emoji}</div>
                    <div className="options-grid">
                      {(questions[currentQuestionIndex] as any).options.map((opt: string) => (
                        <button 
                          key={opt}
                          className="option-card"
                          onClick={() => handleCheckAnswer(opt === (questions[currentQuestionIndex] as any).correctAnswer, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "audio" && (
                  <>
                    <div className="question-subtitle">Escucha con atención y selecciona la respuesta correcta</div>
                    <button 
                      className="audio-pronounce-btn"
                      onClick={() => speakEnglish((questions[currentQuestionIndex] as any).word)}
                      title="Escuchar"
                    >
                      🔊
                    </button>
                    <div className="options-grid">
                      {(questions[currentQuestionIndex] as any).options.map((opt: string) => (
                        <button 
                          key={opt}
                          className="option-card"
                          onClick={() => handleCheckAnswer(opt === (questions[currentQuestionIndex] as any).correctAnswer)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "drag-drop" && (
                  <>
                    <div className="question-subtitle" style={{ marginBottom: "15px", fontWeight: "bold", fontSize: "1.1rem" }}>
                      Instrucciones: Une la palabra de la izquierda con su pareja correcta de la derecha haciendo clic en ambas.
                    </div>
                    <div className="drag-drop-columns-container" style={{ display: "flex", gap: "30px", width: "100%", justifyContent: "center", marginTop: "20px" }}>
                      
                      {/* Columna Izquierda (Origen) */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "45%" }}>
                        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>
                          {(questions[currentQuestionIndex] as any).isSpanishLeft ? "Español 🇨🇱" : "Inglés 🇺🇸"}
                        </div>
                        {leftColumnCards.map((card) => {
                          const isMatched = placedWords[card] !== undefined;
                          const isSelected = selectedWord === card;
                          const itemData = (questions[currentQuestionIndex] as any).items.find((it: any) => it.translation === card || it.word === card);
                          const emoji = itemData?.emoji || "";
                          
                          return (
                            <button
                              key={card}
                              className={`option-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                              onClick={() => !isMatched && handleDragItemSelect(card)}
                              disabled={isMatched}
                              style={{
                                borderColor: isMatched ? "var(--color-success)" : isSelected ? "var(--color-cyan)" : "",
                                background: isMatched ? "rgba(0,184,148,0.15)" : isSelected ? "rgba(0,206,201,0.1)" : "",
                                color: isMatched ? "var(--color-success)" : "",
                                cursor: isMatched ? "default" : "pointer"
                              }}
                            >
                              <span>{emoji}</span> {card} {isMatched && " ✓"}
                            </button>
                          );
                        })}
                      </div>

                      {/* Columna Derecha (Destino) */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "45%" }}>
                        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>
                          {(questions[currentQuestionIndex] as any).isSpanishLeft ? "Inglés 🇺🇸" : "Español 🇨🇱"}
                        </div>
                        {rightColumnCards.map((card) => {
                          const isMatched = Object.values(placedWords).includes(card);
                          const itemData = (questions[currentQuestionIndex] as any).items.find((it: any) => it.translation === card || it.word === card);
                          const emoji = itemData?.emoji || "";
                          
                          return (
                            <button
                              key={card}
                              className={`option-card ${isMatched ? 'matched' : ''}`}
                              onClick={() => !isMatched && handleDropTargetSelect(card, (questions[currentQuestionIndex] as any).items.length)}
                              disabled={isMatched}
                              style={{
                                borderColor: isMatched ? "var(--color-success)" : "",
                                background: isMatched ? "rgba(0,184,148,0.15)" : "",
                                color: isMatched ? "var(--color-success)" : "",
                                cursor: isMatched ? "default" : "pointer"
                              }}
                            >
                              <span>{emoji}</span> {card} {isMatched && " ✓"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "memorice" && (
                  <>
                    <div className="question-subtitle">Juego de Memoria: Empareja la palabra en inglés con su traducción</div>
                    <div className="memory-grid">
                      {(questions[currentQuestionIndex] as any).pairs.map((card: any, idx: number) => {
                        const isFlipped = flippedCards.includes(idx);
                        const isMatched = matchedPairs.includes(card.id);

                        return (
                          <div 
                            key={idx}
                            className={`memory-card ${isFlipped || isMatched ? 'flipped' : ''}`}
                            onClick={() => handleMemoryCardClick(idx, card)}
                          >
                            <div className="memory-card-inner">
                              <div className="memory-card-front">❓</div>
                              <div className={`memory-card-back ${isMatched ? 'matched' : ''}`}>
                                <div>{card.emoji}</div>
                                <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>{card.word}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "preposition" && (
                  <>
                    <div className="question-subtitle">Completa la frase espacial con la preposición correcta</div>
                    <div className="prep-visual-box">{(questions[currentQuestionIndex] as any).visual}</div>
                    <div className="prep-phrase-display">
                      {(questions[currentQuestionIndex] as any).phrase.replace("___", "?")}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px" }}>
                      Traducción: "{(questions[currentQuestionIndex] as any).translation}"
                    </div>
                    <div className="options-grid">
                      {(questions[currentQuestionIndex] as any).options.map((opt: string) => (
                        <button 
                          key={opt}
                          className="option-card"
                          onClick={() => handleCheckAnswer(opt === (questions[currentQuestionIndex] as any).preposition)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "true-false" && (
                  <>
                    <div className="question-subtitle">¿Coinciden la palabra y el emoji?</div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
                      <span style={{ fontSize: "5rem", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>
                        {(questions[currentQuestionIndex] as any).emoji}
                      </span>
                      <h2 style={{ fontFamily: "var(--font-title)", fontSize: "2.5rem", color: "var(--color-cyan)", margin: "15px 0 5px 0" }}>
                        {(questions[currentQuestionIndex] as any).word.toUpperCase()}
                      </h2>
                      <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                        Traducción mostrada: <strong>{(questions[currentQuestionIndex] as any).shownTranslation}</strong>
                      </p>
                    </div>
                    <div className="options-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", maxWidth: "500px", margin: "20px auto 0 auto" }}>
                      <button 
                        className="option-card" 
                        onClick={() => handleCheckAnswer((questions[currentQuestionIndex] as any).isCorrectMatch)}
                        style={{ borderColor: "var(--color-success)", background: "rgba(0, 184, 148, 0.05)" }}
                      >
                        👍 SÍ (Yes)
                      </button>
                      <button 
                        className="option-card" 
                        onClick={() => handleCheckAnswer(!(questions[currentQuestionIndex] as any).isCorrectMatch)}
                        style={{ borderColor: "var(--color-danger)", background: "rgba(214, 48, 49, 0.05)" }}
                      >
                        👎 NO (No)
                      </button>
                    </div>
                  </>
                )}

                {questions[currentQuestionIndex].type === "fill-vowels" && (
                  <>
                    <div className="question-subtitle">Instrucciones: Completa las vocales que le faltan a la palabra en inglés</div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
                      <span style={{ fontSize: "4rem", marginBottom: "10px" }}>
                        {(questions[currentQuestionIndex] as any).emoji}
                      </span>
                      <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "15px" }}>
                        Traducción: "{(questions[currentQuestionIndex] as any).translation}"
                      </p>
                      
                      {/* Mostrar palabra enmascarada rellenada con vocales de usuario */}
                      <h2 style={{ fontFamily: "monospace", fontSize: "3rem", color: "white", letterSpacing: "6px", background: "rgba(255,255,255,0.05)", padding: "10px 30px", borderRadius: "15px", border: "1px solid var(--glass-border)" }}>
                        {(() => {
                          const q = questions[currentQuestionIndex] as any;
                          const vowels = ["a", "e", "i", "o", "u"];
                          let vowelIndex = 0;
                          return q.word.split("").map((char: string) => {
                            const isVowel = vowels.includes(char.toLowerCase());
                            if (isVowel) {
                              const userChar = userVowels[vowelIndex];
                              vowelIndex++;
                              return userChar ? userChar.toUpperCase() : "_";
                            }
                            return char.toUpperCase();
                          }).join(" ");
                        })()}
                      </h2>
                    </div>

                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
                      {["a", "e", "i", "o", "u"].map(v => (
                        <button 
                          key={v}
                          className="btn btn-secondary"
                          onClick={() => {
                            playSound("click");
                            const q = questions[currentQuestionIndex] as any;
                            const nextVowels = [...userVowels, v];
                            setUserVowels(nextVowels);
                            
                            if (nextVowels.length === q.correctVowels.length) {
                              const isCorrect = nextVowels.every((val, index) => val === q.correctVowels[index]);
                              setTimeout(() => {
                                handleCheckAnswer(isCorrect);
                              }, 400);
                            }
                          }}
                          style={{ fontSize: "1.4rem", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                          disabled={userVowels.length >= (questions[currentQuestionIndex] as any).correctVowels.length}
                        >
                          {v.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {userVowels.length > 0 && (
                      <button 
                        className="btn btn-danger" 
                        onClick={() => {
                          playSound("click");
                          setUserVowels([]);
                        }}
                        style={{ display: "block", margin: "20px auto 0 auto", padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        🧼 Borrar Vocales
                      </button>
                    )}
                  </>
                )}

                {questions[currentQuestionIndex].type === "writing" && (
                  <>
                    <div className="question-subtitle">Escribe la palabra en inglés usando el teclado o las letras de pista</div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "15px 0" }}>
                      <span style={{ fontSize: "4.5rem", marginBottom: "10px" }}>
                        {(questions[currentQuestionIndex] as any).emoji}
                      </span>
                      <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "15px" }}>
                        Traducción: <strong>{(questions[currentQuestionIndex] as any).translation.toUpperCase()}</strong>
                      </p>
                      
                      {/* Campo de Escritura */}
                      <input 
                        type="text"
                        value={userWritingInput}
                        onChange={(e) => setUserWritingInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            playSound("click");
                            const isCorrect = userWritingInput.toLowerCase().trim() === (questions[currentQuestionIndex] as any).word.toLowerCase().trim();
                            handleCheckAnswer(isCorrect);
                          }
                        }}
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
                        onClick={() => {
                          playSound("click");
                          const isCorrect = userWritingInput.toLowerCase().trim() === (questions[currentQuestionIndex] as any).word.toLowerCase().trim();
                          handleCheckAnswer(isCorrect);
                        }}
                      >
                        🚀 Validar
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Mascota Cosmo */}
              <div className="cosmo-pet" onClick={() => triggerCosmoSpeech("¡Sigue adelante, astronauta!")}>
                <div className={`cosmo-bubble ${cosmoSpeechActive ? 'active' : ''}`}>{cosmoText}</div>
                <span className="cosmo-avatar">👽</span>
              </div>
            </div>
          </section>
        )}

        {/* 4. Vista de Álbum de Stickers */}
        {!loading && !error && activeView === "album" && gameData && playerStats && (
          <section className="view active" id="album-view">
            <div className="map-header">
              <div>
                <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem" }}>Álbum de Stickers Coleccionables</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Consigue 3 estrellas (puntuación perfecta) en los planetas para ganarlos todos
                </p>
              </div>
            </div>
            
            <div className="stickers-grid">
              {gameData.stickers.map(sticker => {
                const isLocked = !playerStats.stickers.includes(sticker.id);
                return (
                  <div key={sticker.id} className={`sticker-card ${isLocked ? 'locked' : ''}`}>
                    <span className="sticker-emoji">{isLocked ? "❓" : sticker.emoji}</span>
                    <div className="sticker-name">{isLocked ? "Desconocido" : sticker.name}</div>
                    <div className="sticker-desc">{isLocked ? sticker.desc : "¡Coleccionado! 🚀"}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. Vista de Tabla de Honor (Leaderboard) */}
        {!loading && !error && activeView === "leaderboard" && (
          <section className="view active" id="leaderboard-view">
            <div className="map-header" style={{ justifyContent: "center", textAlign: "center", marginBottom: "30px" }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2.2rem" }}>🏆 Tabla de Honor Galáctica</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>¿Quién tiene más estrellas en La Tropa?</p>
              </div>
            </div>
            
            <div className="leaderboard-container">
              <div>
                {["Sofia", "Luciano"]
                  .map(p => {
                    const starsCount = Object.values(playersProgress[p]?.stars || {}).reduce((a, b) => a + b, 0);
                    return {
                      name: p,
                      avatar: p === "Sofia" ? "👧" : "👦",
                      stars: starsCount,
                      stickersCount: playersProgress[p]?.stickers.length || 0
                    };
                  })
                  .sort((a, b) => b.stars - a.stars)
                  .map((player, idx) => (
                    <div key={player.name} className={`leaderboard-row ${idx === 0 ? 'podium-1' : ''}`}>
                      <div className="leaderboard-player">
                        <span className="leaderboard-rank">#{idx + 1}</span>
                        <span className="leaderboard-avatar">{player.avatar}</span>
                        <span className="leaderboard-name">{player.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--color-accent)" }}>
                          Stickers: 🖼️ {player.stickersCount}
                        </span>
                        <span className="leaderboard-score">⭐ {player.stars}</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Panel Admin */}
              <div className="admin-panel">
                <div>
                  <h3>Panel de Control de Papá</h3>
                  <p>Reiniciar las estrellas y stickers guardados en el servidor.</p>
                </div>
                <button className="btn btn-danger" onClick={handleResetData}>
                  🔄 Reiniciar Datos
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modal de Resultados */}
      {showResultsModal && resultsData && (
        <div className="modal-overlay" style={{ display: "flex" }}>
          <div className="modal-content">
            <h2 className="modal-title">{resultsData.stars > 0 ? "¡Misión Completada!" : "¡Misión Fallida!"}</h2>
            <p style={{ color: "var(--text-muted)" }}>
              {resultsData.stars > 0 
                ? "Has regresado a salvo a la base espacial con nueva materia aprendida."
                : "Tu nave se quedó sin combustible. ¡Inténtalo de nuevo para repasar!"}
            </p>
            
            <div className="modal-stars">
              {"⭐".repeat(resultsData.stars) + "☆".repeat(3 - resultsData.stars)}
            </div>
            
            <div className="modal-stat">Preguntas correctas: <strong>{resultsData.correct}</strong></div>
            <div className="modal-stat">Puntos ganados: <strong style={{ color: "var(--color-warning)" }}>{resultsData.points}</strong></div>
            
            {resultsData.stickersUnlocked && resultsData.stickersUnlocked.length > 0 && (
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-cyan)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                  ¡NUEVOS LOGROS DESBLOQUEADOS! 🏆
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                  {resultsData.stickersUnlocked.map((stk, sIdx) => (
                    <div key={sIdx} className="sticker-awarded-box" style={{ margin: "5px", padding: "10px 15px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "120px" }}>
                      <span className="sticker-awarded-emoji" style={{ fontSize: "2rem" }}>{stk.emoji}</span>
                      <span className="sticker-awarded-name" style={{ fontSize: "0.85rem", fontWeight: "bold", textAlign: "center" }}>{stk.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowResultsModal(false);
                  if (currentPlanet) startPlanetMission(currentPlanet);
                }}
              >
                🔄 Reintentar Planeta
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowResultsModal(false);
                  handleNavigate("map");
                }}
              >
                🪐 Volver al Mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
