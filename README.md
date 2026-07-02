# Space English Adventure (Dockerized Edition) 🚀🌌

Videojuego interactivo de inglés diseñado para **Sofía** y **Luciano** (2º Básico, Chile). Incorpora contenidos actuales de 2º Básico y temas de repaso de 1º Básico.

El stack tecnológico está compuesto por:
- **Frontend**: React + TypeScript + Vite (Puerto `3000`).
- **Backend**: Golang con el framework **Gin** (Puerto `8080`).
- **Base de Datos**: SQLite (`./data/game.db`) para persistencia local de estrellas y stickers.
- **Orquestación**: Docker Compose.

---

## 🛠️ Cómo Iniciar la Aplicación

Para construir y levantar todo el entorno de desarrollo con un solo comando, ejecuta en tu terminal:

```bash
docker compose up --build
```

Una vez que Docker termine de levantar los contenedores:
- Accede al juego en tu navegador: [http://localhost:3000](http://localhost:3000)
- La API del backend de Go estará disponible en: [http://localhost:8081/api/players](http://localhost:8081/api/players)

Para apagar los contenedores y mantener los datos a salvo:
```bash
docker compose down
```

---

## 📂 Estructura del Proyecto

- `frontend/`: Aplicación de cliente React con soporte para síntesis de voz (Web Speech API) y sonidos sintéticos arcade (Web Audio API).
- `backend/`: API escrita en Golang que maneja las solicitudes, responde con el vocabulario y gestiona los progresos individuales guardados en la DB SQLite.
- `data/`: Directorio local creado automáticamente en tu workspace que aloja el archivo de la base de datos `game.db`. (Ignorado en Git por seguridad).

---

## 🔐 Restablecimiento de Datos (Para Papá)

El progreso se puede reiniciar desde el panel de Tabla de Honor en la interfaz, el cual requiere escribir la palabra clave **`papa`** para ejecutar el borrado en el servidor.
