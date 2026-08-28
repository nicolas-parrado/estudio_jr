# Guía de Desarrollo para Inteligencia Artificial (IA)

Este archivo sirve como índice, estándar de diseño y guía de arquitectura para que agentes de IA puedan comprender, extender y depurar este repositorio sin tener que leer todo el código de antemano.

---

## 🌌 Contexto del Proyecto

**Space Academy** es una aplicación SPA educativa para niños (Sofía y Luciano, 1º y 2º Básico) diseñada para aprender asignaturas (Inglés, Matemáticas, Ciencias Naturales) jugando misiones espaciales interactivas.
* **Backend**: Go + Gin + SQLite (para guardar progreso y stickers) + JSON estáticos modulares (para asignaturas y planetas).
* **Frontend**: React + TypeScript + Vite (Vanilla CSS estilizado con temática cósmica/espacial).

---

## 🗂️ Índice Rápido del Código

### 🔌 Backend (Go) - Directorio `/backend`
* **`main.go`**: Inicialización de SQLite, Router Gin, CORS y cargador dinámico de materias (`loadSubjects()`).
* **`types.go`**: Contratos de datos (Structs) para base de datos y respuestas JSON (`Planet`, `Subject`, `Sticker`, `SpecialQuestion`, `VocabularyItem`).
* **`handlers.go`**: Endpoints de la REST API (progreso, reinicio, materias, planetas y stickers). Maneja sufijos `-hard` e `-insane`.
* **`medals.go`**: Lógica de cálculo matemático para desbloquear stickers automáticos al final de una misión (rachas, misiones perfectas y completitud Normal, Hard e Insane).
* **`data/subjects/`**: JSONs de configuración de asignaturas (ej: `ingles.json`, `matematicas.json`, `ciencias_naturales.json`) y carpetas modulares por planeta (`ingles/planet-1.json`, etc.). **Todo el contenido educativo reside aquí.**

### ⚛️ Frontend (React + TS) - Directorio `/frontend/src`
* **`App.tsx`**: Enrutador principal de vistas globales, generador de preguntas aleatorias (`generateRandomQuestions`) con filtrado progresivo por dificultad, y finalización de misión (`finishPlanetMission`).
* **`types.ts`**: Interfaces de TypeScript que modelan el frontend, dificultades (`"normal" | "hard" | "insane"`) y los tipos de preguntas estructuradas.
* **`utils/audio.ts`**: Sintetizador de efectos de sonido Web Audio API (`playSound`).
* **`utils/speech.ts`**: Sintetizador de voz por hardware (`speakEnglish`, `speakSpanish`).
* **`components/`**: Vistas modulares de la interfaz:
  * `WelcomeView.tsx`: Login de pilotos (Sofía / Luciano).
  * `SubjectsView.tsx`: Centro de Mando (selección de materia).
  * `MapView.tsx`: Mapa estelar interactivo, selector segmentado de 3 dificultades (🌌 Normal, 🔥 Hard, ⚡ Insane) y cohete animado.
  * `AlbumView.tsx`: Álbum de stickers y medallas coleccionables.
  * `LeaderboardView.tsx`: Racha de honor galáctica y botón de reseteo parental.
  * `GameArena.tsx`: Orquestador de la ronda de juego y feedback overlays.
* **`components/games/`**: Minijuegos encapsulados de forma independiente:
  * **Inglés**: `TriviaGame.tsx`, `AudioGame.tsx`, `TrueFalseGame.tsx`, `FillVowelsGame.tsx`, `WritingGame.tsx`, `DragDropGame.tsx`, `PrepositionGame.tsx`, `MemoriceGame.tsx`.
  * **Ciencias**: `CienciasTriviaGame.tsx`, `CienciasTrueFalseGame.tsx`, `CienciasSequenceGame.tsx`, `CienciasClassifyGame.tsx`, `CienciasFillVowelsGame.tsx`, `CienciasWritingGame.tsx`.
  * **Matemáticas**: `MathCalcGame.tsx`, `MathWordProblemGame.tsx`, `MathPlaceValueGame.tsx`, `MathSequenceGame.tsx`.

---

## 🪐 Estándar Obligatorio para la Creación de Nuevos Planetas

Cada vez que se añada un nuevo planeta a cualquier asignatura, **SE DEBEN CUMPLIR OBLIGATORIAMENTE** los siguientes requisitos mínimos:

### 1. Tamaño Mínimo del Banco de Preguntas / Vocabulario
* **Mínimo 30 a 45 ítems únicos** por planeta (vocabulario con traducción, emoji, categoría y dificultad, o preguntas estructuradas en `specialQuestions`).
* Esto garantiza que los alumnos puedan repetir pruebas múltiples veces con combinaciones de preguntas frescas sin repeticiones inmediatas.

### 2. Contrato de Dificultades y Cantidad de Preguntas por Ronda
Todo planeta debe definir explícitamente en su JSON los 3 niveles:
```json
{
  "questionsCountNormal": 10,
  "questionsCountHard": 15,
  "questionsCountInsane": 20
}
```
* **🌌 Modo Normal (10 preguntas)**: Nivel introductorio / reconocimiento (Trivia con opciones, Audio, Verdadero/Falso, Emojis de apoyo).
* **🔥 Modo Hard (15 preguntas)**: Nivel intermedio (Completar vocales, Drag & Drop, Escritura asistida, desafíos sin pistas visuales directas).
* **⚡ Modo Insane (20 preguntas)**: Nivel experto (Prioridad estricta a escritura/traducción directa, operaciones inversas, problemas combinados, mayor velocidad y nula tolerancia a errores).

### 3. Reglas de Desbloqueo y Progresión
* **Normal**: Desbloqueo secuencial (requiere al menos 1⭐ en el planeta inmediatamente anterior de esa materia). El primer planeta siempre está desbloqueado.
* **Hard**: Requiere que el alumno tenga al menos **2 estrellas en el modo Normal** de ese mismo planeta (`stars[planet.id] >= 2`).
* **Insane**: Requiere que el alumno tenga al menos **2 estrellas en el modo Hard** de ese mismo planeta (`stars[planet.id + "-hard"] >= 2`).

### 4. Stickers y Recompensas por Planeta
Todo planeta debe definir 3 identificadores de stickers en su JSON:
```json
{
  "stickerNormal": "st-<nombre-planeta>",
  "stickerHard": "st-<nombre-planeta>-hard",
  "stickerInsane": "st-<nombre-planeta>-insane"
}
```
Y estos 3 stickers deben estar registrados en el array `stickers` del archivo principal de la materia (`<subject_id>.json`) con su respectiva dificultad:
* `stickerNormal`: Dificultad `"medium"`.
* `stickerHard`: Dificultad `"hard"`.
* `stickerInsane`: Dificultad `"legendary"`.

---

## 🎓 Directrices Pedagógicas y Límites Curriculares (1º y 2º Básico)

Al redactar o agregar contenido para cada materia, la IA debe seguir estrictamente estas pautas para no frustrar ni desorientar a los alumnos:

### 📐 1. Matemáticas
* ✅ **Contenidos Permitidos**:
  * Sumas y restas hasta 100 (con y sin canje/reagrupación).
  * Cálculo mental y estrategias de conteo (hacia adelante y regresivo).
  * Valor posicional: Decenas (D) y Unidades (U), equivalencias aditivas y bloques multibase base 10.
  * Patrones y secuencias numéricas (de 2 en 2, 3 en 3, 5 en 5, 10 en 10).
  * Comparaciones (`>`, `<`, `=`) y problemas cotidianos contextualizados.
* 🚫 **RESTRICCIÓN ESTRICTA (NO INCLUIR)**:
  * **NO usar divisiones (`/`) ni fracciones.**
  * **NO usar los conceptos de *"la mitad de..."* ni *"el doble de..."*** (aún no se han enseñado formalmente en su nivel escolar).
  * En su lugar, si se quieren sumar dos números idénticos, redactar como *"Suma de números iguales"* (ej: `8 + 8`, `15 + 15`, `24 + 24`).

### 🇬🇧 2. Inglés
* ✅ **Vocabulario Progresivo por Dificultad**:
  * Cada palabra en `vocabulary` debe incluir `"difficulty": "normal" | "hard" | "insane"`.
  * **`normal`**: Palabras de uso cotidiano, alta frecuencia y reconocimiento directo (ej: `red, blue, bed, table, dog, sunny, one...ten`).
  * **`hard`**: Vocabulario intermedio y descriptores (ej: `golden, silver, living room, roof, elephant, scissors, eleven...twenty`).
  * **`insane`**: Vocabulario avanzado, términos compuestos y específicos (ej: `light blue, balcony, wardrobe, calculator, stapler, thirty...one hundred, niece, nephew`).
* ✅ **Adaptación al Español de Chile y Claridad de Tipeo**:
  * Usar términos naturales familiares para niños chilenos (ej: `golden` para "dorado", `backpack` para "mochila", `scotch`, `colafría`, `chinita`, `zancudo`, `living`, `torta`, `cabritas`).
  * **Regla de Evaluación**: El alumno siempre produce o tipea la palabra en **inglés (`word`)**. La `translation` en español solo sirve de consigna visual o tarjeta de referencia.

### 🌱 3. Ciencias Naturales
* ✅ **Contenidos Clave**:
  * Fauna nativa y endémica de Chile (Huemul, Pudú, Ranita de Darwin, Monito del Monte, Pingüino de Humboldt, Cóndor, etc.).
  * Ciclos de vida (metamorfosis de mariposa/rana, ciclos de aves, peces y mamíferos).
  * Componentes del hábitat (agua, luz, aire, alimento, refugio) y medidas de protección vs amenazas (incendios, tala, basura, caza ilegal).

---

## 🛠️ Flujos y Ajustes Comunes

### 1. Añadir o Editar Vocabulario / Planetas
Edita directamente el JSON de la asignatura en:
`backend/data/subjects/<subject_id>/<planet_id>.json` y sincroniza sus metadatos en `backend/data/subjects/<subject_id>.json`.
* Respeta siempre la estructura de `vocabulary` (`word`, `translation`, `emoji`, `category`, `difficulty`) o `specialQuestions`.

### 2. Añadir un Nuevo Minijuego (Mecánica de Juego)
1. Crea el nuevo componente interactivo en `frontend/src/components/games/<Nombre>Game.tsx`.
2. Define su interfaz de pregunta en `frontend/src/types.ts` y regístralo en la unión `GameQuestion`.
3. Agrégalo al switch-case `renderActiveGame` en `frontend/src/components/GameArena.tsx`.
4. Inclúyelo en la selección aleatoria de tipos de juego en `frontend/src/App.tsx#generateRandomQuestions`.

---

## 📝 Reglas de Commits y Entorno

* **Mensajes de Commit**: Deben generarse en **español** siguiendo el formato de **Conventional Commits** (ej: `feat: agregar nuevo minijuego de verbos`, `refactor: modularizar...`).
* **Compilación**: 
  * Siempre ejecuta `go build -v ./...` en `/backend` y `npm run build` en `/frontend` para asegurar que las modificaciones no rompan los compiladores de Go o TypeScript antes de hacer commits.
