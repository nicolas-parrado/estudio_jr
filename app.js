// Space English Adventure - Lógica del Juego

document.addEventListener("DOMContentLoaded", () => {
  // --- ESTADO DEL JUEGO ---
  let currentPlayer = null;
  let gameSaveData = {
    Sofia: {
      stars: {},          // planet-1: 3, planet-2: 2...
      unlockedPlanets: ["planet-1"],
      stickers: []        // st-rocket, st-alien...
    },
    Luciano: {
      stars: {},
      unlockedPlanets: ["planet-1"],
      stickers: []
    }
  };

  // --- VARIABLES DE SESIÓN DE JUEGO ---
  let currentPlanet = null;
  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let streak = 0;
  let correctAnswersCount = 0;
  
  // Para memorice
  let firstFlippedCard = null;
  let secondFlippedCard = null;
  let isCheckingMemoryMatch = false;
  let memoryMatchesFound = 0;

  // Para drag and drop alternativo táctil (seleccionar y colocar)
  let selectedDragItem = null;

  // --- AUDIO SINTÉTICO (Web Audio API) ---
  let audioCtx = null;
  
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
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
        // Sonido ascendente alegre
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5 (Do)
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5 (Mi)
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5 (Sol)
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6 (Do octava)
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "incorrect") {
        // Tono descendente triste
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.linearRampToValueAtTime(110, now + 0.3); // A2
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "victory") {
        // Melodía de victoria
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
      console.warn("No se pudo reproducir el sonido sintético:", e);
    }
  }

  // --- SÍNTESIS DE VOZ (Web Speech API) ---
  let synthesisVoice = null;
  
  // Buscar una voz nativa de inglés al cargar las voces
  function initSpeechVoices() {
    if (!window.speechSynthesis) return;
    
    const voices = window.speechSynthesis.getVoices();
    // Preferir voz en-US o en-GB
    synthesisVoice = voices.find(v => v.lang.includes("en-US")) || 
                     voices.find(v => v.lang.includes("en-GB")) || 
                     voices.find(v => v.lang.startsWith("en")) || 
                     voices[0];
  }
  
  if (window.speechSynthesis) {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = initSpeechVoices;
    }
    initSpeechVoices();
  }

  function speakEnglish(text) {
    if (!window.speechSynthesis) return;
    
    // Cancelar cualquier discurso previo para evitar colas de voz
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    if (synthesisVoice) {
      utterance.voice = synthesisVoice;
    }
    utterance.rate = 0.85; // Un poco más lento para que los niños comprendan
    utterance.pitch = 1.1; // Tono ligeramente infantil/alegre
    
    window.speechSynthesis.speak(utterance);
  }

  // --- PERSISTENCIA Y LOCALSTORAGE ---
  function loadGameData() {
    const saved = localStorage.getItem("space_english_adventure_save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.Sofia && parsed.Luciano) {
          gameSaveData = parsed;
        }
      } catch (e) {
        console.error("Error al decodificar partida guardada:", e);
      }
    }
  }

  function saveGameData() {
    localStorage.setItem("space_english_adventure_save", JSON.stringify(gameSaveData));
  }

  // --- ELEMENTOS DEL DOM ---
  const welcomeView = document.getElementById("welcome-view");
  const mapView = document.getElementById("map-view");
  const gameView = document.getElementById("game-view");
  const albumView = document.getElementById("album-view");
  const leaderboardView = document.getElementById("leaderboard-view");
  const mainHeader = document.getElementById("main-header");
  
  const starsSofiaEl = document.getElementById("stars-sofia");
  const starsLucianoEl = document.getElementById("stars-luciano");
  const playerAvatarHeader = document.getElementById("player-avatar-header");
  const playerNameHeader = document.getElementById("player-name-header");
  const playerStarsHeader = document.getElementById("player-stars-header");
  
  const planetsGrid = document.getElementById("planets-grid");
  const playerRocket = document.getElementById("player-rocket");
  const mapContainer = document.getElementById("map-container");
  
  const gameProgressFill = document.getElementById("game-progress-fill");
  const gameStreakEl = document.getElementById("game-streak");
  const gameScoreEl = document.getElementById("game-score");
  const questionContainer = document.getElementById("question-container");
  const feedbackOverlay = document.getElementById("feedback-overlay");
  
  const cosmoAvatar = document.getElementById("cosmo-avatar");
  const cosmoBubble = document.getElementById("cosmo-bubble");
  
  const resultsModal = document.getElementById("results-modal");
  const resultsTitle = document.getElementById("results-title");
  const resultsSubtitle = document.getElementById("results-subtitle");
  const resultsStars = document.getElementById("results-stars");
  const resultsCorrect = document.getElementById("results-correct");
  const resultsPoints = document.getElementById("results-points");
  const stickerAwardedBox = document.getElementById("sticker-awarded-box");
  const stickerAwardedEmoji = document.getElementById("sticker-awarded-emoji");
  const stickerAwardedName = document.getElementById("sticker-awarded-name");
  
  const stickersGrid = document.getElementById("stickers-grid");
  const leaderboardRowsContainer = document.getElementById("leaderboard-rows-container");

  // --- CREACIÓN DE ESTRELLAS DE FONDO ---
  function generateStars() {
    const container = document.getElementById("stars-container");
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
  }

  // --- RUTA Y NAVEGACIÓN DE VISTAS (SPA) ---
  function showView(viewId) {
    playSound("click");
    
    // Ocultar todas las vistas
    const views = [welcomeView, mapView, gameView, albumView, leaderboardView];
    views.forEach(v => v.classList.remove("active"));
    
    // Mostrar header excepto en la pantalla de bienvenida
    if (viewId === "welcome") {
      mainHeader.style.display = "none";
      welcomeView.classList.add("active");
      updateWelcomeStars();
    } else {
      mainHeader.style.display = "flex";
      if (viewId === "map") {
        mapView.classList.add("active");
        renderPlanets();
      } else if (viewId === "game") {
        gameView.classList.add("active");
      } else if (viewId === "album") {
        albumView.classList.add("active");
        renderStickers();
      } else if (viewId === "leaderboard") {
        leaderboardView.classList.add("active");
        renderLeaderboard();
      }
    }
  }

  // Actualizar estrellas de bienvenida en las tarjetas de perfil
  function updateWelcomeStars() {
    const getStarsCount = (player) => {
      let total = 0;
      Object.values(gameSaveData[player].stars).forEach(s => total += s);
      return total;
    };
    starsSofiaEl.textContent = getStarsCount("Sofia");
    starsLucianoEl.textContent = getStarsCount("Luciano");
  }

  // --- GESTIÓN DE PERFILES / INICIO DE SESIÓN ---
  function loginPlayer(player) {
    // Inicializar y desbloquear AudioContext y SpeechSynthesis con la interacción del usuario
    try {
      getAudioContext();
      speakEnglish("");
    } catch(e) {
      console.warn("No se pudo desbloquear la API de audio automáticamente:", e);
    }

    currentPlayer = player;
    playerAvatarHeader.textContent = player === "Sofia" ? "👧" : "👦";
    playerNameHeader.textContent = player;
    
    // Calcular estrellas
    let totalStars = 0;
    Object.values(gameSaveData[player].stars).forEach(s => totalStars += s);
    playerStarsHeader.textContent = totalStars;
    
    showView("map");
    triggerCosmoGreeting(`¡Bienvenido/a a bordo, ${player}!`);
  }

  // --- MASCOTA VIRTUAL: COSMO ---
  const cosmoQuotes = {
    start: ["¡Despegamos!", "¡Aventura en el espacio!", "Let's learn English!", "¡Mucho éxito!"],
    correct: ["¡Amazing! 🌟", "¡You rock! 🚀", "¡Fabuloso!", "¡To the stars!", "¡Good job!"],
    incorrect: ["¡Casi! Intenta otra vez.", "¡Keep trying! 💪", "¡You can do it!", "¡Ánimo!"],
    victory: ["¡Misión cumplida! 🎉", "¡Eres una super estrella!", "¡Increíble!", "¡Wow! ¡Buen viaje!"]
  };

  function triggerCosmoSpeech(phrase) {
    cosmoBubble.textContent = phrase;
    cosmoBubble.classList.add("active");
    
    // Cambiar avatar temporalmente si es feliz o normal
    cosmoAvatar.textContent = "👽";
    
    setTimeout(() => {
      cosmoBubble.classList.remove("active");
    }, 3000);
  }

  function triggerCosmoGreeting(customText) {
    if (customText) {
      triggerCosmoSpeech(customText);
      return;
    }
    const quotes = cosmoQuotes.start;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    triggerCosmoSpeech(randomQuote);
  }

  // --- RENDERIZADO DEL MAPA ESTELAR (PLANETAS) ---
  function renderPlanets() {
    planetsGrid.innerHTML = "";
    const pData = gameSaveData[currentPlayer];
    
    GAME_DATA.planets.forEach((planet, index) => {
      const isLocked = !pData.unlockedPlanets.includes(planet.id);
      const stars = pData.stars[planet.id] || 0;
      
      const node = document.createElement("div");
      node.className = `planet-node ${isLocked ? 'locked' : ''}`;
      node.style.setProperty("--planet-color", planet.color);
      
      // Estrellas HTML
      let starsHTML = "";
      for (let i = 0; i < 3; i++) {
        starsHTML += i < stars ? "★" : "☆";
      }
      
      node.innerHTML = `
        <span class="planet-sphere" style="filter: drop-shadow(0 0 10px ${planet.color});">
          ${isLocked ? '🪐' : planet.emoji}
        </span>
        <div class="planet-name">${planet.name}</div>
        <div class="planet-subtitle">${planet.subtitle}</div>
        <div class="planet-stars-earned">${isLocked ? '' : starsHTML}</div>
        ${isLocked ? '<div class="lock-icon">🔒 Bloqueado</div>' : ''}
      `;
      
      if (!isLocked) {
        node.addEventListener("click", () => {
          launchRocketToPlanet(node, planet);
        });
      }
      
      planetsGrid.appendChild(node);
    });
  }

  // Animación interactiva de la nave volando hacia el planeta seleccionado
  function launchRocketToPlanet(planetNode, planetData) {
    playSound("click");
    
    // Obtener posiciones del planeta y del contenedor
    const mapRect = mapContainer.getBoundingClientRect();
    const nodeRect = planetNode.getBoundingClientRect();
    
    const targetX = nodeRect.left - mapRect.left + (nodeRect.width / 2) - 15;
    const targetY = nodeRect.top - mapRect.top - 40;
    
    playerRocket.style.left = `${targetX}px`;
    playerRocket.style.top = `${targetY}px`;
    
    playSound("click"); // Sonido tipo motor/cohete despegando
    
    setTimeout(() => {
      startPlanetMission(planetData);
    }, 1200);
  }

  // --- MOTOR DE PREGUNTAS ---
  function startPlanetMission(planet) {
    currentPlanet = planet;
    score = 0;
    streak = 0;
    correctAnswersCount = 0;
    currentQuestionIndex = 0;
    
    gameScoreEl.textContent = "0";
    gameStreakEl.textContent = "0";
    gameProgressFill.style.width = "0%";
    
    // Generar preguntas aleatorias del planeta
    currentQuestions = generateRandomQuestionsForPlanet(planet);
    
    showView("game");
    triggerCosmoGreeting();
    loadNextQuestion();
  }

  // Generador de preguntas balanceadas
  function generateRandomQuestionsForPlanet(planet) {
    const list = [];
    const vocab = [...planet.vocabulary];
    
    // Mezclar vocabulario
    vocab.sort(() => Math.random() - 0.5);
    
    // Seleccionamos hasta 8 palabras
    const selectedVocab = vocab.slice(0, 8);
    
    // Tipos de juego disponibles
    let gameTypes = ["trivia", "visual", "audio"];
    if (planet.id === "planet-1") {
      gameTypes.push("drag-drop"); // Drag & Drop funciona genial para colores y casa
    }
    
    selectedVocab.forEach((item, idx) => {
      // Determinamos el tipo de juego de forma rotativa para dar variedad
      let type = gameTypes[idx % gameTypes.length];
      
      // Excepción: planet-6 tiene preguntas especiales de preposiciones
      if (planet.id === "planet-6" && planet.specialQuestions && idx >= 5) {
        // Inyectamos una pregunta especial de preposiciones
        const spec = planet.specialQuestions[idx - 5];
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
      
      // Si el planeta es 1º Básico (2) o 2º Básico (5) y queremos memorice,
      // creamos un minijuego memorice al final. Sin embargo, para mantener
      // la progresión pregunta por pregunta de forma simple, podemos mezclar Trivia, Visual, DragDrop y Audio.
      // Implementaremos un memorice como un desafío especial de tipo de pregunta "memorice"
      // que vale por la pregunta actual (por ejemplo, emparejar 4 cartas).
      if (idx === 7 && (planet.id === "planet-2" || planet.id === "planet-5")) {
        type = "memorice";
      }
      
      // Crear pregunta de tipo "trivia"
      if (type === "trivia") {
        // Encontrar 3 distractores
        const distractors = vocab
          .filter(v => v.word !== item.word)
          .map(v => v.word)
          .slice(0, 3);
        
        // Si no hay suficientes distractores, usar globales
        while (distractors.length < 3) {
          distractors.push("hello", "goodbye", "happy");
        }
        
        const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);
        
        list.push({
          type: "trivia",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          options: options,
          correctAnswer: item.word
        });
      }
      // Pregunta visual (emoji -> seleccionar palabra en inglés)
      else if (type === "visual") {
        const distractors = vocab
          .filter(v => v.word !== item.word)
          .map(v => v.word)
          .slice(0, 3);
        
        const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);
        
        list.push({
          type: "visual",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          options: options,
          correctAnswer: item.word
        });
      }
      // Pregunta de Audio (escuchar -> seleccionar emoji/palabra correcta)
      else if (type === "audio") {
        const distractors = vocab
          .filter(v => v.word !== item.word)
          .map(v => v.translation)
          .slice(0, 3);
        
        const options = [item.translation, ...distractors].sort(() => Math.random() - 0.5);
        
        list.push({
          type: "audio",
          word: item.word,
          translation: item.translation,
          emoji: item.emoji,
          options: options,
          correctAnswer: item.translation
        });
      }
      // Pregunta Drag & Drop
      else if (type === "drag-drop") {
        // Arrastrar palabra en inglés al emoji/traducción correcta
        // Vamos a emparejar 2 palabras a la vez en esta pregunta para hacerlo interactivo y rápido
        const partner = vocab.find(v => v.word !== item.word) || vocab[0];
        list.push({
          type: "drag-drop",
          items: [
            { word: item.word, emoji: item.emoji, translation: item.translation },
            { word: partner.word, emoji: partner.emoji, translation: partner.translation }
          ].sort(() => Math.random() - 0.5)
        });
      }
      // Memorice
      else if (type === "memorice") {
        // Emparejar 4 cartas (2 palabras)
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
      }
    });
    
    return list;
  }

  function loadNextQuestion() {
    // Verificar si terminamos el planeta
    if (currentQuestionIndex >= currentQuestions.length) {
      finishPlanetMission();
      return;
    }
    
    // Actualizar barra de progreso
    const progress = (currentQuestionIndex / currentQuestions.length) * 100;
    gameProgressFill.style.width = `${progress}%`;
    
    const q = currentQuestions[currentQuestionIndex];
    questionContainer.innerHTML = "";
    
    if (q.type === "trivia") {
      renderTriviaQuestion(q);
    } else if (q.type === "visual") {
      renderVisualQuestion(q);
    } else if (q.type === "audio") {
      renderAudioQuestion(q);
    } else if (q.type === "drag-drop") {
      renderDragDropQuestion(q);
    } else if (q.type === "memorice") {
      renderMemoriceQuestion(q);
    } else if (q.type === "preposition") {
      renderPrepositionQuestion(q);
    }
  }

  // --- PANTALLAS DE PREGUNTAS INDIVIDUALES ---

  // 1. Trivia: ¿Cómo se dice "traducción" en Inglés?
  function renderTriviaQuestion(q) {
    questionContainer.innerHTML = `
      <div class="question-subtitle">¿Cómo se dice en inglés?</div>
      <div class="question-text">${q.translation.toUpperCase()} ${q.emoji}</div>
      <div class="options-grid" id="options-grid"></div>
    `;
    
    const grid = document.getElementById("options-grid");
    q.options.forEach(opt => {
      const card = document.createElement("button");
      card.className = "option-card";
      card.textContent = opt;
      card.addEventListener("click", () => checkAnswer(opt === q.correctAnswer));
      grid.appendChild(card);
    });
  }

  // 2. Visual: Ver el emoji, elegir palabra correcta
  function renderVisualQuestion(q) {
    questionContainer.innerHTML = `
      <div class="question-subtitle">¿Qué es esto?</div>
      <div class="question-helper">${q.emoji}</div>
      <div class="options-grid" id="options-grid"></div>
    `;
    
    const grid = document.getElementById("options-grid");
    q.options.forEach(opt => {
      const card = document.createElement("button");
      card.className = "option-card";
      card.textContent = opt;
      card.addEventListener("click", () => checkAnswer(opt === q.correctAnswer));
      grid.appendChild(card);
    });
  }

  // 3. Audio: Escuchar palabra inglesa y elegir traducción
  function renderAudioQuestion(q) {
    questionContainer.innerHTML = `
      <div class="question-subtitle">Escucha con atención y selecciona la respuesta correcta</div>
      <button class="audio-pronounce-btn" id="listen-btn" title="Escuchar pronunciación">🔊</button>
      <div class="options-grid" id="options-grid"></div>
    `;
    
    const listenBtn = document.getElementById("listen-btn");
    listenBtn.addEventListener("click", () => {
      speakEnglish(q.word);
    });
    
    // Hablar automáticamente al cargar la pregunta
    setTimeout(() => {
      speakEnglish(q.word);
    }, 400);
    
    const grid = document.getElementById("options-grid");
    q.options.forEach(opt => {
      const card = document.createElement("button");
      card.className = "option-card";
      card.textContent = opt;
      card.addEventListener("click", () => checkAnswer(opt === q.correctAnswer));
      grid.appendChild(card);
    });
  }

  // 4. Drag & Drop: Clic en palabra y Clic en destino (Ultra compatible y responsivo)
  function renderDragDropQuestion(q) {
    questionContainer.innerHTML = `
      <div class="question-subtitle">Une la palabra en inglés con su traducción haciendo clic en ambas</div>
      <div class="drag-drop-container">
        <!-- Zonas de Destino -->
        <div class="drop-zones-wrapper" id="drop-zones-wrapper"></div>
        <!-- Elementos Arrastrables -->
        <div class="drag-items-wrapper" id="drag-items-wrapper"></div>
      </div>
    `;
    
    const zonesWrapper = document.getElementById("drop-zones-wrapper");
    const itemsWrapper = document.getElementById("drag-items-wrapper");
    
    selectedDragItem = null;
    let placedMatchesCount = 0;
    
    // Crear zonas de destino
    q.items.forEach(item => {
      const zone = document.createElement("div");
      zone.className = "drop-target";
      zone.dataset.matchWord = item.word;
      zone.innerHTML = `
        <span class="drop-target-emoji">${item.emoji}</span>
        <span class="drop-target-label">${item.translation}</span>
        <div class="placed-word" style="margin-top: 10px; font-weight: bold; color: var(--color-cyan);"></div>
      `;
      
      zone.addEventListener("click", () => {
        if (selectedDragItem) {
          const expectedWord = zone.dataset.matchWord;
          const selectedWord = selectedDragItem.dataset.word;
          
          if (expectedWord === selectedWord) {
            // Correcto
            playSound("click");
            zone.querySelector(".placed-word").textContent = selectedWord.toUpperCase();
            zone.style.borderColor = "var(--color-success)";
            zone.style.background = "rgba(0, 184, 148, 0.1)";
            
            selectedDragItem.style.visibility = "hidden";
            selectedDragItem = null;
            
            placedMatchesCount++;
            if (placedMatchesCount === q.items.length) {
              setTimeout(() => {
                checkAnswer(true);
              }, 600);
            }
          } else {
            // Incorrecto
            playSound("incorrect");
            selectedDragItem.style.transform = "shake";
            selectedDragItem.classList.add("shake-animation");
            setTimeout(() => {
              selectedDragItem.classList.remove("shake-animation");
            }, 500);
            // Quitar selección
            document.querySelectorAll(".drag-item").forEach(item => item.style.border = "none");
            selectedDragItem = null;
            
            // Falla la pregunta
            setTimeout(() => {
              checkAnswer(false);
            }, 600);
          }
        }
      });
      
      zonesWrapper.appendChild(zone);
    });
    
    // Crear elementos seleccionables
    // Los barajamos para que no estén ordenados
    const items = [...q.items].sort(() => Math.random() - 0.5);
    items.forEach(item => {
      const dragItem = document.createElement("div");
      dragItem.className = "drag-item";
      dragItem.textContent = item.word;
      dragItem.dataset.word = item.word;
      
      dragItem.addEventListener("click", () => {
        playSound("click");
        // Deseleccionar otros
        document.querySelectorAll(".drag-item").forEach(i => i.style.border = "none");
        
        selectedDragItem = dragItem;
        dragItem.style.border = "3px solid var(--color-cyan)";
      });
      
      itemsWrapper.appendChild(dragItem);
    });
  }

  // 5. Memorice: Emparejar 4 cartas (2 parejas)
  function renderMemoriceQuestion(q) {
    questionContainer.innerHTML = `
      <div class="question-subtitle">Juego de Memoria: Empareja la palabra en inglés con su traducción</div>
      <div class="memory-grid" id="memory-grid"></div>
    `;
    
    const grid = document.getElementById("memory-grid");
    firstFlippedCard = null;
    secondFlippedCard = null;
    isCheckingMemoryMatch = false;
    memoryMatchesFound = 0;
    
    // Duplicar cartas para las parejas (ya vienen barajadas en q.pairs)
    q.pairs.forEach((cardData, idx) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.dataset.matchId = cardData.id;
      card.dataset.word = cardData.word;
      
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">❓</div>
          <div class="memory-card-back">
            <div>${cardData.emoji}</div>
            <div style="font-size: 0.8rem; margin-top: 5px;">${cardData.word}</div>
          </div>
        </div>
      `;
      
      card.addEventListener("click", () => {
        if (isCheckingMemoryMatch) return;
        if (card.classList.contains("flipped")) return;
        
        playSound("click");
        card.classList.add("flipped");
        
        if (!firstFlippedCard) {
          firstFlippedCard = card;
        } else {
          secondFlippedCard = card;
          isCheckingMemoryMatch = true;
          
          // Chequear coincidencia
          const firstId = firstFlippedCard.dataset.matchId;
          const secondId = secondFlippedCard.dataset.matchId;
          
          if (firstId === secondId) {
            // Acierto de pareja
            setTimeout(() => {
              playSound("correct");
              firstFlippedCard.querySelector(".memory-card-back").classList.add("matched");
              secondFlippedCard.querySelector(".memory-card-back").classList.add("matched");
              
              firstFlippedCard = null;
              secondFlippedCard = null;
              isCheckingMemoryMatch = false;
              
              memoryMatchesFound++;
              if (memoryMatchesFound === 2) {
                // Completó el Memorice
                setTimeout(() => {
                  checkAnswer(true);
                }, 800);
              }
            }, 500);
          } else {
            // Fallo, voltear de nuevo
            setTimeout(() => {
              playSound("incorrect");
              firstFlippedCard.classList.remove("flipped");
              secondFlippedCard.classList.remove("flipped");
              
              firstFlippedCard = null;
              secondFlippedCard = null;
              isCheckingMemoryMatch = false;
              
              // Si falla el memorice no abortamos el juego, pero cuenta como fallo para la racha
              // Opcional: penalizar o no. En este caso para niños, los dejamos seguir intentando
              // pero perderán la racha de respuestas perfectas.
              streak = 0;
              gameStreakEl.textContent = "0";
            }, 1200);
          }
        }
      });
      
      grid.appendChild(card);
    });
  }

  // 6. Preposición (Planeta 6 Especial)
  function renderPrepositionQuestion(q) {
    questionContainer.innerHTML = `
      <div class="question-subtitle">Completa la frase espacial con la preposición correcta</div>
      <div class="prep-visual-box">${q.visual}</div>
      <div class="prep-phrase-display">${q.phrase.replace("___", '<span class="prep-blank">?</span>')}</div>
      <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">Traducción: "${q.translation}"</div>
      <div class="options-grid" id="options-grid"></div>
    `;
    
    const grid = document.getElementById("options-grid");
    q.options.forEach(opt => {
      const card = document.createElement("button");
      card.className = "option-card";
      card.textContent = opt;
      card.addEventListener("click", () => {
        // Mostrar la preposición en la frase
        document.querySelector(".prep-blank").textContent = opt;
        setTimeout(() => {
          checkAnswer(opt === q.preposition);
        }, 600);
      });
      grid.appendChild(card);
    });
  }

  // --- COMPROBACIÓN DE RESPUESTA ---
  function checkAnswer(isCorrect) {
    // Bloquear clics temporales mostrando feedback
    if (isCorrect) {
      playSound("correct");
      feedbackOverlay.className = "feedback-overlay correct";
      feedbackOverlay.innerHTML = "<div>¡CORRECTO! 🚀</div>";
      score += 100 + (streak * 10);
      streak++;
      correctAnswersCount++;
      
      // Cosmo felicita
      const quotes = cosmoQuotes.correct;
      triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    } else {
      playSound("incorrect");
      feedbackOverlay.className = "feedback-overlay incorrect";
      feedbackOverlay.innerHTML = "<div>¡UPS! 🛸</div>";
      streak = 0;
      
      // Cosmo alienta
      const quotes = cosmoQuotes.incorrect;
      triggerCosmoSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    }
    
    gameScoreEl.textContent = score;
    gameStreakEl.textContent = streak;
    feedbackOverlay.style.display = "flex";
    
    // Hablar la palabra en inglés si es correcta (ayuda al input auditivo)
    const currentQ = currentQuestions[currentQuestionIndex];
    if (currentQ && currentQ.word && isCorrect) {
      speakEnglish(currentQ.word);
    }
    
    setTimeout(() => {
      feedbackOverlay.style.display = "none";
      currentQuestionIndex++;
      loadNextQuestion();
    }, 1500);
  }

  // --- FINALIZACIÓN DE MISIÓN / RESULTADOS ---
  function finishPlanetMission() {
    playSound("victory");
    
    // Calcular estrellas
    const totalQ = currentQuestions.length;
    const ratio = correctAnswersCount / totalQ;
    let earnedStars = 0;
    
    if (ratio === 1) earnedStars = 3;
    else if (ratio >= 0.7) earnedStars = 2;
    else if (ratio >= 0.5) earnedStars = 1;
    
    // Guardar progreso en el estado del jugador
    const pData = gameSaveData[currentPlayer];
    const prevStars = pData.stars[currentPlanet.id] || 0;
    
    // Solo guardamos si mejoró la puntuación previa
    if (earnedStars > prevStars) {
      pData.stars[currentPlanet.id] = earnedStars;
    }
    
    // Desbloquear siguiente planeta si sacó al menos 1 estrella
    if (earnedStars >= 1) {
      const currentIndex = GAME_DATA.planets.findIndex(p => p.id === currentPlanet.id);
      const nextPlanet = GAME_DATA.planets[currentIndex + 1];
      if (nextPlanet && !pData.unlockedPlanets.includes(nextPlanet.id)) {
        pData.unlockedPlanets.push(nextPlanet.id);
      }
    }
    
    // Chequear si ganó sticker (3 estrellas por primera vez)
    let wonNewSticker = false;
    let stickerData = null;
    
    if (earnedStars === 3) {
      // Buscar sticker del planeta (nuestros planetas tienen id planet-1, y stickers tienen st-rocket...)
      // Hacemos el mapeo por índice
      const pIndex = GAME_DATA.planets.findIndex(p => p.id === currentPlanet.id);
      stickerData = GAME_DATA.stickers[pIndex];
      
      if (stickerData && !pData.stickers.includes(stickerData.id)) {
        pData.stickers.push(stickerData.id);
        wonNewSticker = true;
      }
    }
    
    // Persistir datos
    saveGameData();
    
    // Configurar contenido del modal
    resultsTitle.textContent = earnedStars > 0 ? "¡Misión Completada!" : "¡Misión Fallida!";
    resultsSubtitle.textContent = earnedStars > 0 
      ? "Has regresado a salvo a la base espacial con nueva materia aprendida."
      : "Tu nave se quedó sin combustible. ¡Inténtalo de nuevo para repasar!";
    
    // Estrellas visuales
    let starsStr = "";
    for (let i = 0; i < 3; i++) {
      starsStr += i < earnedStars ? "⭐" : "☆";
    }
    resultsStars.textContent = starsStr;
    resultsCorrect.textContent = `${correctAnswersCount}/${totalQ}`;
    resultsPoints.textContent = score;
    
    // Sticker ganado
    if (wonNewSticker && stickerData) {
      stickerAwardedEmoji.textContent = stickerData.emoji;
      stickerAwardedName.textContent = stickerData.name;
      stickerAwardedBox.style.display = "flex";
    } else {
      stickerAwardedBox.style.display = "none";
    }
    
    // Cosmo felicita en los resultados
    const victoryQuotes = cosmoQuotes.victory;
    triggerCosmoSpeech(victoryQuotes[Math.floor(Math.random() * victoryQuotes.length)]);
    
    // Mostrar modal
    resultsModal.style.display = "flex";
  }

  // --- RENDERIZADO DEL ÁLBUM DE STICKERS ---
  function renderStickers() {
    stickersGrid.innerHTML = "";
    const pData = gameSaveData[currentPlayer];
    
    GAME_DATA.stickers.forEach(sticker => {
      const isLocked = !pData.stickers.includes(sticker.id);
      
      const card = document.createElement("div");
      card.className = `sticker-card ${isLocked ? 'locked' : ''}`;
      
      card.innerHTML = `
        <span class="sticker-emoji">${isLocked ? '❓' : sticker.emoji}</span>
        <div class="sticker-name">${isLocked ? 'Desconocido' : sticker.name}</div>
        <div class="sticker-desc">${isLocked ? sticker.desc : '¡Coleccionado! 🚀'}</div>
      `;
      
      stickersGrid.appendChild(card);
    });
  }

  // --- RENDERIZADO DE LA TABLA DE HONOR (LEADERBOARD) ---
  function renderLeaderboard() {
    leaderboardRowsContainer.innerHTML = "";
    
    // Obtener puntajes consolidados
    const players = ["Sofia", "Luciano"].map(pName => {
      const data = gameSaveData[pName];
      let totalStars = 0;
      Object.values(data.stars).forEach(s => totalStars += s);
      return {
        name: pName,
        avatar: pName === "Sofia" ? "👧" : "👦",
        stars: totalStars,
        stickersCount: data.stickers.length
      };
    });
    
    // Ordenar de mayor a menor estrellas
    players.sort((a, b) => b.stars - a.stars);
    
    players.forEach((p, index) => {
      const row = document.createElement("div");
      row.className = `leaderboard-row ${index === 0 ? 'podium-1' : ''}`;
      
      row.innerHTML = `
        <div class="leaderboard-player">
          <span class="leaderboard-rank">#${index + 1}</span>
          <span class="leaderboard-avatar">${p.avatar}</span>
          <span class="leaderboard-name">${p.name}</span>
        </div>
        <div style="display: flex; gap: 15px; align-items: center;">
          <span style="font-size: 0.9rem; color: var(--color-accent);">Stickers: 🖼️ ${p.stickersCount}</span>
          <span class="leaderboard-score">⭐ ${p.stars}</span>
        </div>
      `;
      
      leaderboardRowsContainer.appendChild(row);
    });
  }

  // --- EVENT LISTENERS GENERALES ---
  
  // Selector de Perfiles
  document.getElementById("profile-sofia").addEventListener("click", () => loginPlayer("Sofia"));
  document.getElementById("profile-luciano").addEventListener("click", () => loginPlayer("Luciano"));
  
  // Botones de Navegación del Header
  document.getElementById("nav-map-btn").addEventListener("click", () => showView("map"));
  document.getElementById("nav-album-btn").addEventListener("click", () => showView("album"));
  document.getElementById("nav-leaderboard-btn").addEventListener("click", () => showView("leaderboard"));
  document.getElementById("nav-logout-btn").addEventListener("click", () => showView("welcome"));
  
  // Misión Abortada
  document.getElementById("game-back-btn").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres salir de la misión? Perderás el progreso de este planeta.")) {
      showView("map");
    }
  });
  
  // Modales
  document.getElementById("modal-map-btn").addEventListener("click", () => {
    resultsModal.style.display = "none";
    showView("map");
  });
  
  document.getElementById("modal-retry-btn").addEventListener("click", () => {
    resultsModal.style.display = "none";
    startPlanetMission(currentPlanet);
  });
  
  // Reset de Datos (Admin)
  document.getElementById("admin-reset-btn").addEventListener("click", () => {
    const confirmation = prompt("ATENCIÓN PAPÁ: Para confirmar el reinicio completo de estrellas y stickers de Sofía y Luciano, escribe la palabra clave 'papa':");
    if (confirmation && confirmation.toLowerCase().trim() === "papa") {
      gameSaveData = {
        Sofia: { stars: {}, unlockedPlanets: ["planet-1"], stickers: [] },
        Luciano: { stars: {}, unlockedPlanets: ["planet-1"], stickers: [] }
      };
      saveGameData();
      playSound("incorrect");
      showView("welcome");
      alert("¡Datos galácticos reiniciados con éxito!");
    } else if (confirmation !== null) {
      alert("Palabra clave incorrecta. Misión de reinicio abortada.");
    }
  });

  // Clic en la mascota para frases interactivas
  cosmoAvatar.addEventListener("click", () => {
    playSound("click");
    const activeQuotes = ["¡Toca una estrella!", "Are you ready?", "Let's explore!", "¡Me encantan las matemáticas y el inglés!", "¡Un saludo a La Tropa!"];
    triggerCosmoSpeech(activeQuotes[Math.floor(Math.random() * activeQuotes.length)]);
  });

  // --- INICIALIZACIÓN ---
  generateStars();
  loadGameData();
  showView("welcome");
});
