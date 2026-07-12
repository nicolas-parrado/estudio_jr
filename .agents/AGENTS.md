# Guía de Desarrollo para Inteligencia Artificial (IA)

Este archivo sirve como índice y guía de arquitectura rápida para que agentes de IA puedan comprender, extender y depurar este repositorio sin tener que leer todo el código de antemano.

---

## 🌌 Contexto del Proyecto

**Space Academy** es una aplicación SPA educativa para niños (Sofía y Luciano) diseñada para aprender asignaturas (inicialmente inglés) jugando misiones espaciales.
* **Backend**: Go + Gin + SQLite (para guardar el progreso) + JSON estáticos (para la configuración de ramos).
* **Frontend**: React + TypeScript + Vite.

---

## 🗂️ Índice Rápido del Código

### 🔌 Backend (Go) - Directorio `/backend`
* **`main.go`**: Inicialización de SQLite, Router Gin, CORS y cargador dinámico de materias.
* **`types.go`**: Contratos de datos (Structs) para base de datos y respuestas JSON.
* **`handlers.go`**: Endpoints de la REST API (progreso, reinicio, materias, planetas y stickers).
* **`medals.go`**: Lógica de cálculo matemático para desbloquear stickers automáticos al final de una misión.
* **`data/subjects/`**: JSONs de configuración de asignaturas (ej: `ingles.json`). **La base de datos del contenido (vocabulario, planetas, stickers) está aquí.**

### ⚛️ Frontend (React + TS) - Directorio `/frontend/src`
* **`App.tsx`**: Enrutador principal de vistas globales y modal de fin de misión.
* **`types.ts`**: Interfaces de TypeScript que modelan el frontend y los tipos de preguntas estructuradas.
* **`utils/audio.ts`**: Sintetizador de efectos de sonido Web Audio API (`playSound`).
* **`utils/speech.ts`**: Sintetizador de voz por hardware de inglés (`speakEnglish`).
* **`components/`**: Vistas modulares de la interfaz:
  * `WelcomeView.tsx`: Login de pilotos.
  * `SubjectsView.tsx`: Centro de Mando (selección de materia).
  * `MapView.tsx`: Mapa de planetas, toggle de dificultad, y cohete animado localmente.
  * `AlbumView.tsx`: Álbum de stickers coleccionables.
  * `LeaderboardView.tsx`: Racha de honor galáctica y botón de reseteo parental.
  * `GameArena.tsx`: Orquestador de la ronda de juego y feedback overlays.
* **`components/games/`**: Minijuegos encapsulados de forma independiente:
  * `TriviaGame.tsx`, `AudioGame.tsx`, `TrueFalseGame.tsx`, `FillVowelsGame.tsx`, `WritingGame.tsx`, `DragDropGame.tsx`, `PrepositionGame.tsx`, `MemoriceGame.tsx`.

---

## 🛠️ Flujos y Ajustes Comunes

### 1. Añadir o Editar Vocabulario / Planetas
No modifiques el código del backend ni el frontend. Edita directamente el JSON de la asignatura en:
`backend/data/subjects/<subject_id>.json`
* **Campos clave**: `questionsCountNormal` y `questionsCountHard` definen el pool aleatorio de preguntas de la ronda.
* Si el planeta requiere preguntas especiales (como preposiciones), colócalas dentro del arreglo `specialQuestions`.

### 2. Añadir un Nuevo Minijuego (Mecánica de Juego)
1. Crea el nuevo componente interactivo en `frontend/src/components/games/<Nombre>Game.tsx`.
2. Define su interfaz de pregunta en `frontend/src/types.ts` y regístralo en la unión `GameQuestion`.
3. Agrégalo al switch-case `renderActiveGame` en `frontend/src/components/GameArena.tsx`.
4. Inclúyelo en la selección aleatoria de tipos de juego en `frontend/src/App.tsx#generateRandomQuestions`.

### 3. Lógica de Desbloqueo y Dificultad
* **Desbloqueo de Hard**: En `MapView.tsx`, el modo Hard requiere que el piloto tenga al menos 2 estrellas en el modo Normal de ese mismo planeta (`stars[planet.id] >= 2`).
* **Glows de Stickers**: En `AlbumView.tsx`, se renderiza un glow plateado, dorado o morado/cosmic según el tipo de logro obtenido (fácil, medio, difícil, legendario).

---

## 📝 Reglas de Commits y Entorno

* **Mensajes de Commit**: Deben generarse en **español** siguiendo el formato de **Conventional Commits** (ej: `feat: agregar nuevo minijuego de verbos`, `refactor: modularizar...`).
* **Compilación**: 
  * Siempre ejecuta `go build` en `/backend` y `npm run build` en `/frontend` para asegurar que las modificaciones no rompan los compiladores de Go o TypeScript antes de hacer commits.
