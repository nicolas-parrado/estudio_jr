# Space Academy Frontend (React + TypeScript)

Este es el cliente frontend de **Space Academy**, una SPA (Single Page Application) interactiva de aprendizaje construida con **React**, **TypeScript** y **Vite**.

Diseñada con una estética cósmica premium, utiliza animaciones fluidas, gradients modernos, efectos de sonido y voz sintética para que los niños aprendan divirtiéndose.

---

## 📁 Estructura del Proyecto y Responsabilidades

### 🛠️ Carpeta [src/utils/](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/utils/)
Módulos dedicados a la interacción multimedia y de hardware del navegador:
* 🔊 **[audio.ts](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/utils/audio.ts)**: Configura la Web Audio API para sintetizar y reproducir sonidos en tiempo real (efectos de clic, respuestas correctas, errores y fanfarria de victoria) sin requerir descargas de archivos mp3 pesados.
* 🗣️ **[speech.ts](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/utils/speech.ts)**: Encapsula la API HTML5 Speech Synthesis para reproducir pronunciaciones en inglés (TTS) de manera interactiva. Autodetecta el dialecto inglés (`en-US` o `en-GB`) de manera asíncrona.

### 🖼️ Carpeta [src/components/](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/)
Contiene las vistas estructuradas de la aplicación:
* 👽 **[CosmoPet.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/CosmoPet.tsx)**: El asistente extraterrestre animado de ayuda. Cuenta con globos de diálogo dinámicos y frases motivacionales al hacerle clic.
* 👦 **[WelcomeView.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/WelcomeView.tsx)**: Pantalla inicial para seleccionar el perfil del piloto (Sofía o Luciano) mostrando la racha acumulada de estrellas de cada uno.
* 🛰️ **[SubjectsView.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/SubjectsView.tsx)**: Centro de Mando Galáctico para seleccionar la asignatura dinámica (ej: Inglés).
* 🪐 **[MapView.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/MapView.tsx)**: Mapa estelar con la cuadrícula de planetas. Permite conmutar dificultad Normal vs. Hard, bloquea planetas bloqueados y gestiona de forma autónoma la posición y animación del cohete 🚀.
* 🖼️ **[AlbumView.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/AlbumView.tsx)**: Álbum de stickers coleccionables. Clasifica logros globales e hitos de ramo. Otorga brillos premium (plata, oro y cosmic-purple con chispas animadas) según dificultad.
* 🏆 **[LeaderboardView.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/LeaderboardView.tsx)**: Tabla de honor galáctica que rankea a los pilotos de La Tropa y contiene el control parental de reset.
* 🎯 **[GameArena.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/GameArena.tsx)**: Orquestador del juego activo. Controla el temporizador de feedbacks, barra de progreso superior, animaciones de racha de fuego (`🔥`) y Cosmo quotes.

### 🎮 Carpeta [src/components/games/](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/components/games/)
Cada minijuego se encuentra aislado en su propio archivo, simplificando la incorporación de nuevas mecánicas de juego en el futuro:
* 📝 **TriviaGame.tsx**: Selección de una opción correcta en base a su traducción en español.
* 🔊 **AudioGame.tsx**: Dictado auditivo donde se reproduce el audio y el alumno selecciona la palabra correspondiente.
* ❓ **TrueFalseGame.tsx**: Confirmación rápida de traducción (Yes/No).
* 🔤 **FillVowelsGame.tsx**: Completar las vocales faltantes de la palabra en inglés mediante burbujas interactivas.
* ⌨️ **WritingGame.tsx**: Escritura del vocabulario mediante teclado físico o ayuda visual de letras desordenadas.
* 🧲 **DragDropGame.tsx**: Acoplamiento de columnas conectando la palabra en inglés con su traducción al español.
* 🗺️ **PrepositionGame.tsx**: Ubicación de objetos espaciales (on, under, in, behind, next to) con ayudas visuales ASCII.
* 🃏 **MemoriceGame.tsx**: Juego clásico de emparejar 4 palabras y sus traducciones volteando cartas.

### 🛰️ Orquestador [src/App.tsx](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/frontend/src/App.tsx)
* **Responsabilidad**: Enrutador global de vistas de la SPA.
* **Función**:
  * Realiza los fetch a la API del backend para descargar materias y el progreso inicial del estudiante.
  * Administra el Navbar persistente y controla la barra de navegación superior.
  * Genera el pool de preguntas aleatorio para la ronda activa del planeta.
  * Muestra el modal de resultados de finalización de misión (estrellas y stickers obtenidos) y realiza el POST para actualizar la base de datos.
  * Genera las estrellas del espacio de fondo de la aplicación.

---

## 🛠️ Ejecución y Compilación

Para ejecutar en modo de desarrollo local:
```bash
# Entrar a la carpeta frontend
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Levantar servidor de desarrollo de Vite
npm run dev
```

Para validar tipos y empaquetar para producción:
```bash
npm run build
```

El build optimizado se creará en el directorio `dist/`.
