# Space Academy Backend (Go)

Este es el servidor del backend de **Space Academy**, un sistema de gestión de progreso de aprendizaje interactivo desarrollado en Go.

El backend se expone mediante una REST API usando el framework **Gin** y persiste el avance de estrellas y stickers en una base de datos **SQLite**.

---

## 📁 Estructura del Proyecto y Responsabilidades

El código fuente está modularizado en archivos separados por responsabilidad dentro de la carpeta `backend/`:

* ### 🚀 [main.go](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/backend/main.go)
  * **Responsabilidad**: Punto de entrada del servidor.
  * **Función**:
    * Inicializa la conexión con la base de datos SQLite y ejecuta las migraciones de esquemas.
    * Escanea el directorio `data/subjects/` para cargar dinámicamente todas las materias configuradas en archivos JSON.
    * Levanta el servidor HTTP de Gin, configura políticas de CORS y registra las rutas de la REST API.

* ### 🗃️ [types.go](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/backend/types.go)
  * **Responsabilidad**: Modelado de datos.
  * **Función**:
    * Define los structs compartidos del sistema (ej: `Subject`, `Planet`, `VocabularyItem`, `Sticker`).
    * Estructura los payloads de entrada de las solicitudes REST (`ProgressRequest`, `ResetRequest`) y el formato de respuesta del estado del piloto (`PlayerState`).

* ### 🔌 [handlers.go](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/backend/handlers.go)
  * **Responsabilidad**: Capa de Controladores HTTP (Endpoints).
  * **Función**:
    * `GetSubjectsHandler`: Devuelve la lista de materias disponibles.
    * `GetPlanetsHandler`: Obtiene la configuración de planetas asociados a una materia específica.
    * `GetStickersHandler`: Devuelve los stickers disponibles de una materia.
    * `GetPlanetDataHandler`: Carga dinámicamente el vocabulario y preguntas especiales de un planeta.
    * `GetPlayersProgressHandler`: Devuelve el avance actual de estrellas, planetas desbloqueados y stickers de los pilotos.
    * `SaveProgressHandler`: Registra la finalización de una misión, calcula estrellas ganadas, actualiza rachas y desbloquea el siguiente planeta. Llama a `checkCompletionMedals` para otorgar insignias automáticas.
    * `ResetProgressHandler`: Permite resetear a cero el avance de los pilotos (requiere contraseña del panel parental).

* ### 🏆 [medals.go](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/backend/medals.go)
  * **Responsabilidad**: Motor de Hitos y Recompensas (Stickers).
  * **Función**:
    * Evalúa las condiciones matemáticas necesarias para otorgar stickers.
    * Contiene la función `checkCompletionMedals` que valida logros tales como:
      * **Explorador estelar** (primer planeta completado).
      * **Primera estrella** (primera estrella obtenida).
      * **Racha estelar** (rachas de 5 o 10 respuestas correctas seguidas).
      * **Misión perfecta** (completar una ronda sin errores).
      * **Completitud del planeta** (3 estrellas en Normal o Hard).
      * **Hito de La Tropa** (Sofía y Luciano completan un planeta específico al mismo tiempo).

---

## 💾 Persistencia y Almacenamiento

1. **Materias Estáticas**: La configuración de asignaturas, planetas, vocabulario y stickers se almacena en archivos JSON en `backend/data/subjects/` (por ejemplo, `ingles.json`). Se cargan en memoria en el inicio del servidor.
2. **Base de Datos Dinámica**: El progreso del usuario (estrellas por planeta y stickers obtenidos) se almacena de forma persistente en SQLite en el archivo configurado mediante la variable de entorno `DB_PATH` (por defecto `./db/game.db`).

---

## 🛠️ Ejecución Local

Para levantar el servidor de desarrollo en Go de forma nativa:

```bash
# Entrar a la carpeta backend
cd backend

# Ejecutar el servidor
go run .
```

El backend se levantará escuchando en `http://localhost:8080`.
