import { useState, useEffect } from "react";
import { 
  PlayersProgress, 
  Planet, 
  GameQuestion, 
  Subject,
  Sticker
} from "./types.ts";

// Importar Utilidades
import { playSound } from "./utils/audio";

// Importar Componentes Modulares
import { WelcomeView } from "./components/WelcomeView";
import { SubjectsView } from "./components/SubjectsView";
import { MapView } from "./components/MapView";
import { AlbumView } from "./components/AlbumView";
import { LeaderboardView } from "./components/LeaderboardView";
import { GameArena } from "./components/GameArena";

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Navegación de la SPA
  const [activeView, setActiveView] = useState<"welcome" | "subjects" | "map" | "album" | "leaderboard" | "game">("welcome");
  const [currentPlayer, setCurrentPlayer] = useState<"Sofia" | "Luciano" | null>(null);

  // Datos dinámicos cargados de las materias
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  // Progreso de todos los estudiantes mapeado por subjectId
  const [progressBySubject, setProgressBySubject] = useState<Record<string, PlayersProgress>>({});

  // Derivar playersProgress a partir de progressBySubject y la materia actual
  const playersProgress = currentSubject && progressBySubject[currentSubject.id] ? progressBySubject[currentSubject.id] : {
    Sofia: { stars: {}, unlockedPlanets: currentSubject?.planets && currentSubject.planets.length > 0 ? [currentSubject.planets[0].id] : ["planet-1"], stickers: [] },
    Luciano: { stars: {}, unlockedPlanets: currentSubject?.planets && currentSubject.planets.length > 0 ? [currentSubject.planets[0].id] : ["planet-1"], stickers: [] }
  };

  // Estado para la notificación tipo toast
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Estado del juego activo
  const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");
  const [currentPlanet, setCurrentPlanet] = useState<Planet | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);

  // Modal de Resultados de Misión
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [resultsData, setResultsData] = useState<{
    stars: number;
    correct: string;
    points: number;
    stickersUnlocked: { emoji: string; name: string }[];
  } | null>(null);

  // URLs de API (Backend)
  const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8080";

  // --- EFECTOS INICIALES ---
  useEffect(() => {
    // Generar estrellas de fondo
    generateStars();
    
    // Cargar datos del backend
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CONSULTAS AL BACKEND (API) ---
  // --- CONSULTAS AL BACKEND (API) ---
  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/subjects`);
      if (!res.ok) throw new Error("No se pudo cargar la lista de materias");
      const data: Subject[] = await res.json();
      setSubjects(data);

      // Cargar progreso de todas las materias al inicio de manera consolidada
      const progressMap: Record<string, PlayersProgress> = {};
      for (const sub of data) {
        try {
          const resProgress = await fetch(`${API_URL}/api/players?subjectId=${sub.id}`);
          if (resProgress.ok) {
            progressMap[sub.id] = await resProgress.json();
          }
        } catch (err) {
          console.error(`Error cargando progreso de la materia ${sub.id}:`, err);
        }
      }
      setProgressBySubject(progressMap);

      if (data.length > 0) {
        if (!currentSubject) {
          setCurrentSubject(data[0]);
          setPlanets(data[0].planets || []);
          setStickers(data[0].stickers || []);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersProgress = async (subjectId = "ingles") => {
    try {
      const res = await fetch(`${API_URL}/api/players?subjectId=${subjectId}`);
      if (!res.ok) throw new Error("No se pudo cargar el progreso de los jugadores");
      const data = await res.json();
      setProgressBySubject(prev => ({
        ...prev,
        [subjectId]: data
      }));
    } catch (e: any) {
      console.error("Error cargando jugadores:", e);
    }
  };

  // --- ACCIÓN SELECCIÓN MATERIA (CENTRO DE MANDO) ---
  const selectSubject = async (subject: Subject) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/subjects/${subject.id}/planets`);
      if (!res.ok) throw new Error("Fallo al descargar planetas de la materia");
      const planetsData = await res.json();
      
      const resStickers = await fetch(`${API_URL}/api/subjects/${subject.id}/stickers`);
      if (!resStickers.ok) throw new Error("Fallo al descargar stickers de la materia");
      const stickersData = await resStickers.json();

      setCurrentSubject(subject);
      setPlanets(planetsData);
      setStickers(stickersData);

      // Cargar progreso del estudiante para esta materia
      await fetchPlayersProgress(subject.id);

      setActiveView("map");
    } catch (e: any) {
      console.error(e);
      alert("Error al cargar la materia: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN Y RUTEO ---
  const handleLogin = (name: "Sofia" | "Luciano") => {
    playSound("click");
    setCurrentPlayer(name);
    setCurrentSubject(null);
    setActiveView("subjects");
  };

  const handleLogout = () => {
    playSound("click");
    setCurrentPlayer(null);
    setCurrentSubject(null);
    setActiveView("welcome");
  };

  const handleNavigate = (view: "welcome" | "subjects" | "map" | "album" | "leaderboard") => {
    playSound("click");
    if ((view === "map" || view === "album") && !currentSubject) {
      playSound("incorrect");
      showToast("¡Debes seleccionar una materia primero! 🎒");
      return;
    }
    setActiveView(view);
  };

  // --- MISION DEL PLANETA ---
  const startPlanetMission = async (planetMeta: Planet) => {
    setLoading(true);
    try {
      // Descargar dinámicamente la información completa del planeta (con vocabulario y preguntas)
      const res = await fetch(`${API_URL}/api/subjects/${currentSubject?.id}/planets/${planetMeta.id}/data`);
      if (!res.ok) throw new Error("No se pudo descargar la configuración del planeta");
      const fullPlanet: Planet = await res.json();

      setCurrentPlanet(fullPlanet);
      
      // Generar ronda aleatoria de preguntas
      const generated = generateRandomQuestions(fullPlanet);
      setQuestions(generated);

      setActiveView("game");
    } catch (e: any) {
      alert("¡Ups! Ocurrió un problema al viajar al planeta: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomQuestions = (planet: Planet): GameQuestion[] => {
    const vocab = [...(planet.vocabulary || [])];
    if (vocab.length === 0) {
      return [];
    }
    vocab.sort(() => Math.random() - 0.5);

    // Cantidad de preguntas dinámicas desde el JSON
    const targetLength = difficulty === "hard" ? (planet.questionsCountHard || 15) : (planet.questionsCountNormal || 10);

    // Lógica para Ciencias Naturales
    if (currentSubject?.id === "ciencias_naturales") {
      const scienceQuestions: GameQuestion[] = [];

      // 1. Añadir todas las preguntas especiales del JSON si existen
      if (planet.specialQuestions && planet.specialQuestions.length > 0) {
        planet.specialQuestions.forEach((sq: any, idx: number) => {
          if (sq.type === "science-sequence") {
            scienceQuestions.push({
              id: `q-sci-seq-${idx}`,
              type: "science-sequence",
              animal: sq.animal,
              sequence: sq.sequence,
              emoji: sq.emoji,
              instruction: sq.instruction || "Ordena el ciclo de vida:"
            });
          } else if (sq.type === "science-classify") {
            scienceQuestions.push({
              id: `q-sci-class-${idx}`,
              type: "science-classify",
              concept: sq.concept,
              correctCategory: sq.correctCategory,
              options: [...sq.options].sort(() => Math.random() - 0.5),
              emoji: sq.emoji,
              instruction: sq.instruction || "Clasifica el concepto:"
            });
          } else if (sq.type === "science-trivia") {
            scienceQuestions.push({
              id: `q-sci-triv-${idx}`,
              type: "science-trivia",
              question: sq.question,
              correctAnswer: sq.correctAnswer,
              options: [...sq.options].sort(() => Math.random() - 0.5),
              emoji: sq.emoji
            });
          } else if (sq.type === "science-tf") {
            scienceQuestions.push({
              id: `q-sci-tf-${idx}`,
              type: "science-tf",
              question: sq.question,
              correctAnswer: sq.correctAnswer,
              emoji: sq.emoji,
              explanation: sq.explanation
            });
          }
        });
      }

      // Mezclar las preguntas de Ciencias Especiales
      scienceQuestions.sort(() => Math.random() - 0.5);

      // 2. Si faltan preguntas para llegar a targetLength, generamos de vocabulario (vowels/writing)
      let vocabIdx = 0;
      while (scienceQuestions.length < targetLength && vocab.length > 0) {
        const item = vocab[vocabIdx % vocab.length];
        vocabIdx++;

        const type = difficulty === "hard" ? "science-writing" : "science-vowels";

        if (type === "science-vowels") {
          const vowels = ["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú"];
          const correctVowels = item.word.split("")
            .filter(char => vowels.includes(char.toLowerCase()))
            .map(char => char.toLowerCase());
          
          scienceQuestions.push({
            id: `q-sci-vow-${vocabIdx}`,
            type: "science-vowels",
            word: item.word,
            translation: item.translation,
            emoji: item.emoji,
            correctVowels
          });
        } else {
          scienceQuestions.push({
            id: `q-sci-write-${vocabIdx}`,
            type: "science-writing",
            word: item.word,
            translation: item.translation,
            emoji: item.emoji
          });
        }
      }

      return scienceQuestions.sort(() => Math.random() - 0.5).slice(0, targetLength);
    }
    
    // Si el vocabulario tiene menos elementos de los requeridos, los repetimos para llenar la ronda (Inglés)
    const list: GameQuestion[] = [];
    let pool = [...vocab];
    while (pool.length < targetLength) {
      pool = [...pool, ...vocab.sort(() => Math.random() - 0.5)];
    }
    const selectedVocab = pool.slice(0, targetLength);

    // Tipos de juego disponibles
    const gameTypes = ["trivia", "audio", "true-false", "fill-vowels"];
    if (difficulty === "hard") {
      gameTypes.push("writing");
    }
    if (planet.id === "planet-1" || planet.id === "planet-7" || planet.id === "planet-8") {
      gameTypes.push("drag-drop");
    }

    selectedVocab.forEach((item, idx) => {
      let type = gameTypes[Math.floor(Math.random() * gameTypes.length)];
      if (planet.specialQuestions && planet.specialQuestions.length > 0 && Math.random() < 0.3) {
        type = "preposition";
      }

      if (type === "preposition" && planet.specialQuestions && planet.specialQuestions.length > 0) {
        const sq = planet.specialQuestions[Math.floor(Math.random() * planet.specialQuestions.length)];
        list.push({
          id: `q-prep-${idx}`,
          type: "preposition",
          phrase: sq.phrase,
          preposition: sq.preposition || (sq as any).correctAnswer || "",
          translation: sq.translation,
          options: sq.options ? [...sq.options].sort(() => Math.random() - 0.5) : [],
          visual: sq.visual
        });
      } else if (type === "trivia") {
        const distractors = vocab.filter(v => v.word !== item.word).map(v => v.word);
        const options = [item.word, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
        list.push({
          id: `q-trivia-${idx}`,
          type: "trivia",
          translation: item.translation,
          correctAnswer: item.word,
          options,
          emoji: item.emoji,
          word: item.word
        });
      } else if (type === "audio") {
        const distractors = vocab.filter(v => v.word !== item.word).map(v => v.translation);
        const options = [item.translation, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
        list.push({
          id: `q-audio-${idx}`,
          type: "audio",
          word: item.word,
          translation: item.translation,
          correctAnswer: item.translation,
          options,
          emoji: item.emoji
        });
      } else if (type === "true-false") {
        const isCorrectMatch = Math.random() > 0.5;
        const shownTranslation = isCorrectMatch 
          ? item.translation 
          : (vocab.find(v => v.word !== item.word)?.translation || item.translation);
        
        list.push({
          id: `q-tf-${idx}`,
          type: "true-false",
          word: item.word,
          translation: item.translation,
          shownTranslation,
          isCorrectMatch,
          emoji: item.emoji
        });
      } else if (type === "fill-vowels") {
        const vowels = ["a", "e", "i", "o", "u"];
        const correctVowels = item.word.split("").filter(char => vowels.includes(char.toLowerCase())).map(char => char.toLowerCase());
        list.push({
          id: `q-vowels-${idx}`,
          type: "fill-vowels",
          word: item.word,
          translation: item.translation,
          correctVowels,
          emoji: item.emoji
        });
      } else if (type === "writing") {
        list.push({
          id: `q-writing-${idx}`,
          type: "writing",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji
        });
      } else if (type === "drag-drop") {
        const count = Math.min(3, vocab.length);
        const currentGroup = [item, ...vocab.filter(v => v.word !== item.word).slice(0, count - 1)].sort(() => Math.random() - 0.5);
        list.push({
          id: `q-dd-${idx}`,
          type: "drag-drop",
          isSpanishLeft: Math.random() > 0.5,
          items: currentGroup
        });
      }
    });

    // Añadir Memorice al final en dificultades del planeta 6, 7 y 8
    if (planet.id === "planet-6" || planet.id === "planet-7" || planet.id === "planet-8") {
      const selectedList = vocab.slice(0, 4);
      const cards: any[] = [];
      selectedList.forEach(it => {
        cards.push({ id: it.word, word: it.word.toUpperCase(), emoji: it.emoji, isSpanish: false });
        cards.push({ id: it.word, word: it.translation.toUpperCase(), emoji: it.emoji, isSpanish: true });
      });
      list.push({
        id: `q-memorice-${planet.id}`,
        type: "memorice",
        pairs: cards.sort(() => Math.random() - 0.5)
      });
    }

    return list;
  };

  // --- MISION COMPLETADA / LLAMADA API POST ---
  const finishPlanetMission = async (
    correctCount: number,
    maxStreak: number,
    audioStreak: number,
    writeStreak: number,
    perfectRun: boolean
  ) => {
    if (!currentPlayer || !currentPlanet) return;
    playSound("victory");

    const ratio = correctCount / questions.length;
    let earnedStars = 0;
    if (ratio === 1) earnedStars = 3;
    else if (ratio >= 0.7) earnedStars = 2;
    else if (ratio >= 0.5) earnedStars = 1;

    const oldStickers = playersProgress[currentPlayer]?.stickers || [];
    const newlyUnlockedStickers: { emoji: string; name: string }[] = [];

    try {
      const res = await fetch(`${API_URL}/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: currentPlayer,
          subjectId: currentSubject?.id || "ingles",
          planetId: difficulty === "hard" ? `${currentPlanet.id}-hard` : currentPlanet.id,
          stars: earnedStars,
          maxStreak,
          audioStreak,
          perfectRun,
          writeStreak
        })
      });

      if (!res.ok) throw new Error("No se pudo guardar el progreso");
      const updatedProgress = await res.json();
      setProgressBySubject(prev => ({
        ...prev,
        [currentSubject?.id || "ingles"]: updatedProgress
      }));

      const newStickers = updatedProgress[currentPlayer]?.stickers || [];
      const unlockedIDs = newStickers.filter((s: string) => !oldStickers.includes(s));

      if (stickers) {
        unlockedIDs.forEach((id: string) => {
          const sData = stickers.find(s => s.id === id);
          if (sData) {
            newlyUnlockedStickers.push({ emoji: sData.emoji, name: sData.name });
          }
        });
      }
    } catch (e) {
      console.error("Error al guardar progreso:", e);
    }

    setResultsData({
      stars: earnedStars,
      correct: `${correctCount}/${questions.length}`,
      points: correctCount * 100 + maxStreak * 10,
      stickersUnlocked: newlyUnlockedStickers
    });
    
    setShowResultsModal(true);
  };

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
        const clearedProgress: Record<string, PlayersProgress> = {};
        for (const sub of subjects) {
          clearedProgress[sub.id] = {
            Sofia: { stars: {}, unlockedPlanets: sub.planets && sub.planets.length > 0 ? [sub.planets[0].id] : ["planet-1"], stickers: [] },
            Luciano: { stars: {}, unlockedPlanets: sub.planets && sub.planets.length > 0 ? [sub.planets[0].id] : ["planet-1"], stickers: [] }
          };
        }
        setProgressBySubject(clearedProgress);
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

  // --- GENERACIÓN DE ESTRELLAS CÓSMICAS DE FONDO ---
  const generateStars = () => {
    const container = document.getElementById("stars-container");
    if (!container) return;
    container.innerHTML = "";
    const totalStars = 80;
    for (let i = 0; i < totalStars; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.width = `${Math.random() * 2 + 1}px`;
      star.style.height = star.style.width;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
    }
  };

  const getTotalPlayerStars = (playerName: "Sofia" | "Luciano" | null): number => {
    if (!playerName) return 0;
    let total = 0;
    Object.values(progressBySubject).forEach(subProgress => {
      const starsMap = subProgress[playerName]?.stars || {};
      total += Object.values(starsMap).reduce((a, b) => a + b, 0);
    });
    return total;
  };

  const playerStats = currentPlayer ? playersProgress[currentPlayer] : null;

  return (
    <>
      <div className="stars-container" id="stars-container" aria-hidden="true"></div>

      <main>
        {/* Cabecera / Navbar */}
        {currentPlayer && activeView !== "welcome" && !loading && !error && (
          <header>
            <div className="logo" onClick={() => handleNavigate("subjects")} style={{ cursor: "pointer" }}>
              <span>🚀</span> Space Academy
            </div>
            <div className="nav-buttons">
              <button className="btn btn-secondary">
                <span>{currentPlayer === "Sofia" ? "👧" : "👦"}</span> {currentPlayer}
                <span style={{ color: "var(--color-warning)", marginLeft: "5px" }}>
                  ⭐ {getTotalPlayerStars(currentPlayer)}
                </span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("subjects")}>
                📚 Materias
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("map")}>
                🪐 Mapa
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("album")}>
                🖼️ Álbum
              </button>
              <button className="btn btn-secondary" onClick={() => handleNavigate("leaderboard")}>
                🏆 Honor
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                🚪 Salir
              </button>
            </div>
          </header>
        )}

        {/* Carga e indicadores */}
        {loading && (
          <section className="view active" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--color-cyan)", borderRadius: "50%", width: "50px", height: "50px", animation: "spin 1s linear infinite", margin: "0 auto 20px auto" }}></div>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-title)" }}>Viajando a través del hiperespacio...</p>
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
              <button className="btn btn-primary" onClick={fetchSubjects}>
                🔄 Reintentar Conexión
              </button>
            </div>
          </section>
        )}

        {/* Renders de Vistas Modulares */}
        {!loading && !error && (
          <>
            {activeView === "welcome" && (
              <WelcomeView 
                progressBySubject={progressBySubject} 
                onLogin={handleLogin} 
              />
            )}

            {activeView === "subjects" && (
              <SubjectsView 
                currentPlayer={currentPlayer} 
                subjects={subjects} 
                progressBySubject={progressBySubject} 
                onSelectSubject={selectSubject} 
                onBack={handleLogout} 
              />
            )}

            {activeView === "map" && currentSubject && playerStats && (
              <MapView 
                currentSubject={currentSubject}
                planets={planets}
                playerStats={playerStats}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                onPlanetSelect={startPlanetMission}
                onBackToSubjects={() => handleNavigate("subjects")}
              />
            )}

            {activeView === "album" && currentSubject && playerStats && (
              <AlbumView 
                currentSubject={currentSubject}
                stickers={stickers}
                playerStats={playerStats}
                onBack={() => handleNavigate("map")}
              />
            )}

            {activeView === "leaderboard" && (
              <LeaderboardView 
                progressBySubject={progressBySubject} 
                onResetData={handleResetData} 
              />
            )}

            {activeView === "game" && currentPlanet && questions.length > 0 && (
              <GameArena 
                questions={questions}
                planet={currentPlanet}
                difficulty={difficulty}
                subjectId={currentSubject?.id || "ingles"}
                onFinish={finishPlanetMission}
                onAbort={() => handleNavigate("map")}
              />
            )}
          </>
        )}

        {/* Modal de Resultados de la Misión */}
        {showResultsModal && resultsData && (
          <div className="modal-backdrop" style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
            animation: "fadeIn 0.3s ease-out forwards"
          }}>
            <div className="welcome-box" style={{ maxWidth: "450px", textAlign: "center", border: "2px solid var(--color-success)", boxShadow: "0 0 30px rgba(0, 184, 148, 0.3)" }}>
              <h1 style={{ color: "var(--color-success)", fontSize: "2.4rem", marginBottom: "15px" }}>🎉 ¡Misión Completada! 🎉</h1>
              <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>¡Has regresado a la base a salvo!</p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "2.2rem", margin: "20px 0", color: "var(--star-yellow)" }}>
                {"⭐".repeat(resultsData.stars) + "☆".repeat(3 - resultsData.stars)}
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "15px", padding: "15px", margin: "20px 0", textAlign: "left", fontSize: "1rem" }}>
                <p>🎯 Aciertos: <strong>{resultsData.correct}</strong></p>
                <p>✨ Puntos de la ronda: <strong>{resultsData.points}</strong></p>
              </div>

              {resultsData.stickersUnlocked.length > 0 && (
                <div style={{ margin: "20px 0" }}>
                  <h3 style={{ fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: "10px" }}>🎁 ¡Nuevos Stickers Desbloqueados!</h3>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    {resultsData.stickersUnlocked.map((s, idx) => (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "10px", minWidth: "80px", textAlign: "center" }}>
                        <span style={{ fontSize: "2.2rem", display: "block" }}>{s.emoji}</span>
                        <span style={{ fontSize: "0.75rem", display: "block", marginTop: "5px", color: "white", fontWeight: "bold" }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={() => {
                playSound("click");
                setShowResultsModal(false);
                setResultsData(null);
                handleNavigate("map");
              }} style={{ marginTop: "20px", padding: "12px 30px", fontSize: "1.1rem" }}>
                🚀 Continuar Viaje
              </button>
            </div>
          </div>
        )}
        {toast.show && (
          <div style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(225, 112, 85, 0.95)",
            backdropFilter: "blur(8px)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "15px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 9999,
            fontFamily: "var(--font-title)",
            fontSize: "1.05rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            animation: "slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
          }}>
            <span>⚠️</span> {toast.message}
          </div>
        )}
      </main>
    </>
  );
}
