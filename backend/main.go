package main

import (
	"log"
	"net/http"
	"os"

	"ingles-backend/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// VocabularyItem representa una palabra con traducción, emoji y categoría.
type VocabularyItem struct {
	Word        string `json:"word"`
	Translation string `json:"translation"`
	Emoji       string `json:"emoji"`
	Category    string `json:"category"`
}

// SpecialQuestion representa una pregunta de lógica (como preposiciones)
type SpecialQuestion struct {
	Type        string   `json:"type"`
	Phrase      string   `json:"phrase"`
	Preposition string   `json:"preposition"`
	Translation string   `json:"translation"`
	Options     []string `json:"options"`
	Visual      string   `json:"visual"`
}

// Planet representa un planeta con sus detalles y vocabulario.
type Planet struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	Subtitle         string            `json:"subtitle"`
	Emoji            string            `json:"emoji"`
	Color            string            `json:"color"`
	Vocabulary       []VocabularyItem  `json:"vocabulary"`
	SpecialQuestions []SpecialQuestion `json:"specialQuestions,omitempty"`
}

// Sticker representa un sticker coleccionable.
type Sticker struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Emoji string `json:"emoji"`
	Desc string `json:"desc"`
}

// GameData consolidado
type GameData struct {
	Planets  []Planet  `json:"planets"`
	Stickers []Sticker `json:"stickers"`
}

var vocabularyData = GameData{
	Planets: []Planet{
		{
			ID:       "planet-1",
			Name:     "Planeta Arcoíris y Hogar",
			Subtitle: "Colors & House (1º Básico)",
			Emoji:    "🌈",
			Color:    "#e84393",
			Vocabulary: []VocabularyItem{
				{Word: "red", Translation: "rojo", Emoji: "🔴", Category: "colors"},
				{Word: "blue", Translation: "azul", Emoji: "🔵", Category: "colors"},
				{Word: "green", Translation: "verde", Emoji: "🟢", Category: "colors"},
				{Word: "yellow", Translation: "amarillo", Emoji: "🟡", Category: "colors"},
				{Word: "orange", Translation: "naranja", Emoji: "🟠", Category: "colors"},
				{Word: "purple", Translation: "morado", Emoji: "🟣", Category: "colors"},
				{Word: "pink", Translation: "rosado", Emoji: "💗", Category: "colors"},
				{Word: "brown", Translation: "marrón", Emoji: "🟤", Category: "colors"},
				{Word: "black", Translation: "negro", Emoji: "⚫", Category: "colors"},
				{Word: "white", Translation: "blanco", Emoji: "⚪", Category: "colors"},
				{Word: "kitchen", Translation: "cocina", Emoji: "🍳", Category: "house"},
				{Word: "bedroom", Translation: "dormitorio", Emoji: "🛏️", Category: "house"},
				{Word: "bathroom", Translation: "baño", Emoji: "🚿", Category: "house"},
				{Word: "living room", Translation: "sala de estar", Emoji: "🛋️", Category: "house"},
				{Word: "garden", Translation: "jardín", Emoji: "🏡", Category: "house"},
				{Word: "garage", Translation: "garaje", Emoji: "🚗", Category: "house"},
				{Word: "dining room", Translation: "comedor", Emoji: "🍽️", Category: "house"},
				{Word: "roof", Translation: "techo", Emoji: "🏠", Category: "house"},
				{Word: "window", Translation: "ventana", Emoji: "🪟", Category: "house"},
				{Word: "door", Translation: "puerta", Emoji: "🚪", Category: "house"},
				{Word: "floor", Translation: "piso", Emoji: "🧱", Category: "house"},
				{Word: "wall", Translation: "pared", Emoji: "🧱", Category: "house"},
				{Word: "grey", Translation: "gris", Emoji: "⚫", Category: "colors"},
			},
		},
		{
			ID:       "planet-2",
			Name:     "Planeta Salvaje y Juguetes",
			Subtitle: "Animals & Toys (1º Básico)",
			Emoji:    "🦁",
			Color:    "#fdcb6e",
			Vocabulary: []VocabularyItem{
				{Word: "dog", Translation: "perro", Emoji: "🐶", Category: "animals"},
				{Word: "cat", Translation: "gato", Emoji: "🐱", Category: "animals"},
				{Word: "bird", Translation: "pájaro", Emoji: "🐦", Category: "animals"},
				{Word: "fish", Translation: "pez", Emoji: "🐟", Category: "animals"},
				{Word: "rabbit", Translation: "conejo", Emoji: "🐰", Category: "animals"},
				{Word: "mouse", Translation: "ratón", Emoji: "🐭", Category: "animals"},
				{Word: "lion", Translation: "león", Emoji: "🦁", Category: "animals"},
				{Word: "elephant", Translation: "elefante", Emoji: "🐘", Category: "animals"},
				{Word: "monkey", Translation: "mono", Emoji: "🐵", Category: "animals"},
				{Word: "tiger", Translation: "tigre", Emoji: "🐯", Category: "animals"},
				{Word: "ball", Translation: "pelota", Emoji: "⚽", Category: "toys"},
				{Word: "doll", Translation: "muñeca", Emoji: "🪆", Category: "toys"},
				{Word: "car", Translation: "auto", Emoji: "🏎️", Category: "toys"},
				{Word: "train", Translation: "tren", Emoji: "🚂", Category: "toys"},
				{Word: "blocks", Translation: "bloques", Emoji: "🧱", Category: "toys"},
				{Word: "teddy bear", Translation: "oso de peluche", Emoji: "🧸", Category: "toys"},
				{Word: "kite", Translation: "volantín", Emoji: "🪁", Category: "toys"},
				{Word: "puzzle", Translation: "rompecabezas", Emoji: "🧩", Category: "toys"},
				{Word: "giraffe", Translation: "jirafa", Emoji: "🦒", Category: "animals"},
				{Word: "bear", Translation: "oso", Emoji: "🐻", Category: "animals"},
				{Word: "cow", Translation: "vaca", Emoji: "🐮", Category: "animals"},
				{Word: "pig", Translation: "cerdo", Emoji: "🐷", Category: "animals"},
				{Word: "bike", Translation: "bicicleta", Emoji: "🚲", Category: "toys"},
				{Word: "skate", Translation: "patín", Emoji: "🛼", Category: "toys"},
			},
		},
		{
			ID:       "planet-3",
			Name:     "Planeta de la Escuela",
			Subtitle: "School Supplies (1º Básico)",
			Emoji:    "🎒",
			Color:    "#0984e3",
			Vocabulary: []VocabularyItem{
				{Word: "pencil", Translation: "lápiz", Emoji: "✏️", Category: "school"},
				{Word: "pen", Translation: "lápiz pasta", Emoji: "🖊️", Category: "school"},
				{Word: "eraser", Translation: "goma de borrar", Emoji: "🧼", Category: "school"},
				{Word: "ruler", Translation: "regla", Emoji: "📏", Category: "school"},
				{Word: "book", Translation: "libro", Emoji: "📖", Category: "school"},
				{Word: "notebook", Translation: "cuaderno", Emoji: "📓", Category: "school"},
				{Word: "schoolbag", Translation: "mochila", Emoji: "🎒", Category: "school"},
				{Word: "pencil case", Translation: "estuche", Emoji: "👝", Category: "school"},
				{Word: "sharpener", Translation: "sacapuntas", Emoji: "✏️", Category: "school"},
				{Word: "scissors", Translation: "tijeras", Emoji: "✂️", Category: "school"},
				{Word: "glue", Translation: "pegamento", Emoji: "🧪", Category: "school"},
				{Word: "desk", Translation: "escritorio", Emoji: "🟫", Category: "school"},
				{Word: "chair", Translation: "silla", Emoji: "🪑", Category: "school"},
				{Word: "board", Translation: "pizarra", Emoji: "📋", Category: "school"},
				{Word: "paper", Translation: "papel", Emoji: "📄", Category: "school"},
				{Word: "crayon", Translation: "lápiz de cera", Emoji: "🖍️", Category: "school"},
			},
		},
		{
			ID:       "planet-4",
			Name:     "Planeta Meteorológico",
			Subtitle: "Weather & Greetings (2º Básico - U1)",
			Emoji:    "⚡",
			Color:    "#00cec9",
			Vocabulary: []VocabularyItem{
				{Word: "cloudy", Translation: "nublado", Emoji: "☁️", Category: "weather"},
				{Word: "fall", Translation: "otoño", Emoji: "🍂", Category: "weather"},
				{Word: "hot", Translation: "caluroso", Emoji: "🥵", Category: "weather"},
				{Word: "spring", Translation: "primavera", Emoji: "🌸", Category: "weather"},
				{Word: "summer", Translation: "verano", Emoji: "☀️", Category: "weather"},
				{Word: "winter", Translation: "invierno", Emoji: "❄️", Category: "weather"},
				{Word: "sunny", Translation: "soleado", Emoji: "🌞", Category: "weather"},
				{Word: "cold", Translation: "frío", Emoji: "🥶", Category: "weather"},
				{Word: "windy", Translation: "ventoso", Emoji: "💨", Category: "weather"},
				{Word: "rainy", Translation: "lluvioso", Emoji: "🌧️", Category: "weather"},
				{Word: "good morning", Translation: "buenos días", Emoji: "🌅", Category: "greetings"},
				{Word: "good afternoon", Translation: "buenas tardes", Emoji: "☀️", Category: "greetings"},
				{Word: "good evening", Translation: "buenas noches (al llegar)", Emoji: "🌆", Category: "greetings"},
				{Word: "good night", Translation: "buenas noches (al dormir)", Emoji: "🌌", Category: "greetings"},
				{Word: "snowy", Translation: "nevado", Emoji: "🌨️", Category: "weather"},
				{Word: "stormy", Translation: "tormentoso", Emoji: "⛈️", Category: "weather"},
				{Word: "rainbow", Translation: "arcoíris", Emoji: "🌈", Category: "weather"},
				{Word: "umbrella", Translation: "paraguas", Emoji: "☔", Category: "weather"},
				{Word: "hello", Translation: "hola", Emoji: "👋", Category: "greetings"},
				{Word: "goodbye", Translation: "adiós", Emoji: "🙋", Category: "greetings"},
			},
		},
		{
			ID:       "planet-5",
			Name:     "Planeta Bicho-Numérico",
			Subtitle: "Numbers & Insects (2º Básico - U2)",
			Emoji:    "🐜",
			Color:    "#6c5ce7",
			Vocabulary: []VocabularyItem{
				{Word: "one", Translation: "uno", Emoji: "1️⃣", Category: "numbers"},
				{Word: "two", Translation: "dos", Emoji: "2️⃣", Category: "numbers"},
				{Word: "three", Translation: "tres", Emoji: "3️⃣", Category: "numbers"},
				{Word: "four", Translation: "cuatro", Emoji: "4️⃣", Category: "numbers"},
				{Word: "five", Translation: "cinco", Emoji: "5️⃣", Category: "numbers"},
				{Word: "six", Translation: "seis", Emoji: "6️⃣", Category: "numbers"},
				{Word: "seven", Translation: "siete", Emoji: "7️⃣", Category: "numbers"},
				{Word: "eight", Translation: "ocho", Emoji: "8️⃣", Category: "numbers"},
				{Word: "nine", Translation: "nueve", Emoji: "9️⃣", Category: "numbers"},
				{Word: "ten", Translation: "diez", Emoji: "🔟", Category: "numbers"},
				{Word: "eleven", Translation: "once", Emoji: "🔢", Category: "numbers"},
				{Word: "twelve", Translation: "doce", Emoji: "🔢", Category: "numbers"},
				{Word: "thirteen", Translation: "trece", Emoji: "🔢", Category: "numbers"},
				{Word: "fourteen", Translation: "catorce", Emoji: "🔢", Category: "numbers"},
				{Word: "fifteen", Translation: "quince", Emoji: "🔢", Category: "numbers"},
				{Word: "sixteen", Translation: "dieciséis", Emoji: "🔢", Category: "numbers"},
				{Word: "seventeen", Translation: "diecisiete", Emoji: "🔢", Category: "numbers"},
				{Word: "eighteen", Translation: "dieciocho", Emoji: "🔢", Category: "numbers"},
				{Word: "nineteen", Translation: "diecinueve", Emoji: "🔢", Category: "numbers"},
				{Word: "twenty", Translation: "veinte", Emoji: "🔢", Category: "numbers"},
				{Word: "ant", Translation: "hormiga", Emoji: "🐜", Category: "insects"},
				{Word: "bee", Translation: "abeja", Emoji: "🐝", Category: "insects"},
				{Word: "firefly", Translation: "luciérnaga", Emoji: "💡", Category: "insects"},
				{Word: "ladybug", Translation: "chinita", Emoji: "🐞", Category: "insects"},
				{Word: "grasshopper", Translation: "saltamontes", Emoji: "🦗", Category: "insects"},
				{Word: "caterpillar", Translation: "oruga", Emoji: "🐛", Category: "insects"},
				{Word: "spider", Translation: "araña", Emoji: "🕷️", Category: "insects"},
				{Word: "butterfly", Translation: "mariposa", Emoji: "🦋", Category: "insects"},
				{Word: "mosquito", Translation: "mosquito", Emoji: "🦟", Category: "insects"},
				{Word: "fly", Translation: "mosca", Emoji: "🪰", Category: "insects"},
				{Word: "worm", Translation: "gusano", Emoji: "🪱", Category: "insects"},
				{Word: "dragonfly", Translation: "libélula", Emoji: "🦗", Category: "insects"},
				{Word: "thirty", Translation: "treinta", Emoji: "3️⃣0️⃣", Category: "numbers"},
				{Word: "forty", Translation: "cuarenta", Emoji: "4️⃣0️⃣", Category: "numbers"},
				{Word: "fifty", Translation: "cincuenta", Emoji: "5️⃣0️⃣", Category: "numbers"},
			},
		},
		{
			ID:       "planet-6",
			Name:     "Planeta Celebración y Familia",
			Subtitle: "Birthday, Family & Prepositions (2º Básico - U3)",
			Emoji:    "🎂",
			Color:    "#ff7675",
			Vocabulary: []VocabularyItem{
				{Word: "balloon", Translation: "globo", Emoji: "🎈", Category: "birthday"},
				{Word: "cake", Translation: "torta", Emoji: "🎂", Category: "birthday"},
				{Word: "candle", Translation: "vela", Emoji: "🕯️", Category: "birthday"},
				{Word: "gift", Translation: "regalo", Emoji: "🎁", Category: "birthday"},
				{Word: "chest", Translation: "baúl", Emoji: "📦", Category: "birthday"},
				{Word: "present", Translation: "obsequio", Emoji: "🎁", Category: "birthday"},
				{Word: "popcorn", Translation: "cabritas", Emoji: "🍿", Category: "birthday"},
				{Word: "sandwich", Translation: "sándwich", Emoji: "🥪", Category: "birthday"},
				{Word: "table", Translation: "mesa", Emoji: "🟫", Category: "birthday"},
				{Word: "grandma", Translation: "abuela", Emoji: "👵", Category: "family"},
				{Word: "birthday", Translation: "cumpleaños", Emoji: "🎉", Category: "birthday"},
				{Word: "dad", Translation: "papá", Emoji: "👨", Category: "family"},
				{Word: "aunt", Translation: "tía", Emoji: "👩", Category: "family"},
				{Word: "brother", Translation: "hermano", Emoji: "👦", Category: "family"},
				{Word: "sister", Translation: "hermana", Emoji: "👧", Category: "family"},
				{Word: "uncle", Translation: "tío", Emoji: "👨‍🦰", Category: "family"},
				{Word: "night", Translation: "noche", Emoji: "🌃", Category: "birthday"},
				{Word: "mom", Translation: "mamá", Emoji: "👩‍🦱", Category: "family"},
				{Word: "cousin", Translation: "primo / prima", Emoji: "🧑", Category: "family"},
				{Word: "grandpa", Translation: "abuelo", Emoji: "👴", Category: "family"},
				{Word: "nephew", Translation: "sobrino", Emoji: "👦", Category: "family"},
				{Word: "niece", Translation: "sobrina", Emoji: "👧", Category: "family"},
				{Word: "parents", Translation: "padres", Emoji: "👪", Category: "family"},
				{Word: "family", Translation: "familia", Emoji: "👨‍👩‍👧‍👦", Category: "family"},
				{Word: "invitation", Translation: "invitación", Emoji: "✉️", Category: "birthday"},
				{Word: "juice", Translation: "jugo", Emoji: "🧃", Category: "birthday"},
			},
			SpecialQuestions: []SpecialQuestion{
				{
					Type:        "preposition",
					Phrase:      "The alien is ___ the box.",
					Preposition: "in",
					Translation: "El alien está dentro de la caja.",
					Options:     []string{"in", "on", "under"},
					Visual:      "📦👽 (dentro)",
				},
				{
					Type:        "preposition",
					Phrase:      "The rocket is ___ the planet.",
					Preposition: "on",
					Translation: "El cohete está sobre el planeta.",
					Options:     []string{"in", "on", "under"},
					Visual:      "🚀🪐 (sobre)",
				},
				{
					Type:        "preposition",
					Phrase:      "The gift is ___ the table.",
					Preposition: "under",
					Translation: "El regalo está debajo de la mesa.",
					Options:     []string{"in", "on", "under"},
					Visual:      "🟫🎁 (debajo)",
				},
			},
		},
	},
	Stickers: []Sticker{
		// Logros básicos de exploración e inicio
		{ID: "st-explorer", Name: "Primeros Pasos", Emoji: "🛸", Desc: "Iniciar sesión por primera vez y ver el mapa estelar."},
		{ID: "st-first-star", Name: "Brillo Inicial", Emoji: "⭐", Desc: "Ganar la primera estrella en cualquier planeta."},

		// Medallas del Modo Normal (3 estrellas)
		{ID: "st-rocket", Name: "Medalla Arcoíris", Emoji: "🚀", Desc: "¡3 estrellas en el Planeta 1 (Normal)!"},
		{ID: "st-alien", Name: "Medalla Salvaje", Emoji: "🕺👽", Desc: "¡3 estrellas en el Planeta 2 (Normal)!"},
		{ID: "st-star", Name: "Medalla Escolar", Emoji: "🌟", Desc: "¡3 estrellas en el Planeta 3 (Normal)!"},
		{ID: "st-ufo", Name: "Medalla Meteorológica", Emoji: "🛸", Desc: "¡3 estrellas en el Planeta 4 (Normal)!"},
		{ID: "st-astronaut", Name: "Medalla Numérica", Emoji: "🧑‍🚀", Desc: "¡3 estrellas en el Planeta 5 (Normal)!"},
		{ID: "st-crown", Name: "Medalla Celebración", Emoji: "👑🪐", Desc: "¡3 estrellas en el Planeta 6 (Normal)!"},

		// Medallas del Modo Hard (3 estrellas)
		{ID: "st-rocket-hard", Name: "Hiper-Cohete de Antimateria", Emoji: "🌌", Desc: "¡3 estrellas en el Planeta 1 (Hard)!"},
		{ID: "st-alien-hard", Name: "Cosmo-Emperador", Emoji: "👽👑", Desc: "¡3 estrellas en el Planeta 2 (Hard)!"},
		{ID: "st-star-hard", Name: "Supernova Radiante", Emoji: "💥", Desc: "¡3 estrellas en el Planeta 3 (Hard)!"},
		{ID: "st-ufo-hard", Name: "Destructor Estelar", Emoji: "☄️", Desc: "¡3 estrellas en el Planeta 4 (Hard)!"},
		{ID: "st-astronaut-hard", Name: "Astronauta Pro Legendario", Emoji: "💫", Desc: "¡3 estrellas en el Planeta 5 (Hard)!"},
		{ID: "st-crown-hard", Name: "Monarca del Vacío", Emoji: "🏆", Desc: "¡3 estrellas en el Planeta 6 (Hard)!"},

		// Logros de progresión Normal
		{ID: "st-normal-complete", Name: "Héroe del Cosmos", Emoji: "🎖️", Desc: "Completar todos los planetas normales con al menos 1 estrella."},
		{ID: "st-normal-complete-2s", Name: "Astrónomo de Plata", Emoji: "🥈", Desc: "Completar todos los planetas normales con al menos 2 estrellas."},
		{ID: "st-normal-complete-3s", Name: "Conquistador de Constelaciones", Emoji: "🥇", Desc: "Completar todos los planetas normales con 3 estrellas en todos."},

		// Logros de progresión Hard
		{ID: "st-hard-complete", Name: "Titán del Espacio", Emoji: "🌋", Desc: "Completar todos los planetas hard con al menos 1 estrella."},
		{ID: "st-hard-complete-2s", Name: "Señor de la Gravedad", Emoji: "🪐", Desc: "Completar todos los planetas hard con al menos 2 estrellas."},
		{ID: "st-hard-complete-3s", Name: "Fénix Interestelar", Emoji: "🔥", Desc: "Completar todos los planetas hard con 3 estrellas en todos."},

		// Logro supremo
		{ID: "st-cosmo-god", Name: "Deidad Suprema del Universo", Emoji: "👑🌌", Desc: "Tener 3 estrellas en todos los planetas en ambos modos (Normal y Hard)."},

		// Logros divertidos / interactivos
		{ID: "st-streak-5", Name: "Cometa Veloz", Emoji: "☄️", Desc: "Lograr una racha de 5 respuestas correctas en una partida."},
		{ID: "st-streak-10", Name: "Centella del Cosmos", Emoji: "🌠", Desc: "Lograr una racha de 10 respuestas correctas en una partida."},
		{ID: "st-audio-master", Name: "Oído Galáctico", Emoji: "🎧", Desc: "Responder 5 preguntas de audio correctas seguidas."},
		{ID: "st-perfect-run", Name: "Misión Impecable", Emoji: "💯", Desc: "Completar cualquier planeta sin cometer fallos."},
		{ID: "st-writing-master", Name: "Escribano Espacial", Emoji: "✍️", Desc: "Responder 5 preguntas de escritura seguidas correctamente en modo Hard."},
		{ID: "st-tropa", Name: "La Tropa Unida", Emoji: "👨‍👩‍👧‍👦", Desc: "Obtener al menos 1 estrella con ambos perfiles (Sofía y Luciano) en el sistema."},
	},
}

// Structs para requests
type ProgressRequest struct {
	PlayerName  string `json:"playerName" binding:"required"`
	PlanetID    string `json:"planetId" binding:"required"`
	Stars       int    `json:"stars" binding:"gte=0,lte=3"`
	MaxStreak   int    `json:"maxStreak"`
	AudioStreak int    `json:"audioStreak"`
	PerfectRun  bool   `json:"perfectRun"`
	WriteStreak int    `json:"writeStreak"`
}

type ResetRequest struct {
	Password string `json:"password" binding:"required"`
}

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/game.db"
	}

	// Inicializar la base de datos SQLite
	database.InitDB(dbPath)

	r := gin.Default()

	// Configurar CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/vocabulary", getVocabulary)
		api.GET("/players", getPlayers)
		api.POST("/progress", saveProgress)
		api.POST("/reset", resetData)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor API escuchando en el puerto %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Error al arrancar el servidor: %v", err)
	}
}

func getVocabulary(c *gin.Context) {
	c.JSON(http.StatusOK, vocabularyData)
}

func getPlayers(c *gin.Context) {
	progress, err := database.GetPlayersProgress()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}

func saveProgress(c *gin.Context) {
	var req ProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Guardar el progreso de estrellas
	if err := database.SaveProgress(req.PlayerName, req.PlanetID, req.Stars); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 1. Desbloquear stickers básicos e incondicionales
	database.SaveSticker(req.PlayerName, "st-explorer")
	if req.Stars >= 1 {
		database.SaveSticker(req.PlayerName, "st-first-star")
	}

	// 2. Medallas por Planeta Normal y Hard
	if req.Stars == 3 {
		stickerID := ""
		switch req.PlanetID {
		case "planet-1":
			stickerID = "st-rocket"
		case "planet-2":
			stickerID = "st-alien"
		case "planet-3":
			stickerID = "st-star"
		case "planet-4":
			stickerID = "st-ufo"
		case "planet-5":
			stickerID = "st-astronaut"
		case "planet-6":
			stickerID = "st-crown"
		case "planet-1-hard":
			stickerID = "st-rocket-hard"
		case "planet-2-hard":
			stickerID = "st-alien-hard"
		case "planet-3-hard":
			stickerID = "st-star-hard"
		case "planet-4-hard":
			stickerID = "st-ufo-hard"
		case "planet-5-hard":
			stickerID = "st-astronaut-hard"
		case "planet-6-hard":
			stickerID = "st-crown-hard"
		}

		if stickerID != "" {
			database.SaveSticker(req.PlayerName, stickerID)
		}
	}

	// 3. Stickers de Rendimiento de Partida
	if req.MaxStreak >= 5 {
		database.SaveSticker(req.PlayerName, "st-streak-5")
	}
	if req.MaxStreak >= 10 {
		database.SaveSticker(req.PlayerName, "st-streak-10")
	}
	if req.AudioStreak >= 5 {
		database.SaveSticker(req.PlayerName, "st-audio-master")
	}
	if req.PerfectRun {
		database.SaveSticker(req.PlayerName, "st-perfect-run")
	}
	if req.WriteStreak >= 5 {
		database.SaveSticker(req.PlayerName, "st-writing-master")
	}

	// 4. Logros Globales Acumulados
	progressMap, err := database.GetPlayersProgress()
	if err == nil {
		normalPlanets := []string{"planet-1", "planet-2", "planet-3", "planet-4", "planet-5", "planet-6"}
		hardPlanets := []string{"planet-1-hard", "planet-2-hard", "planet-3-hard", "planet-4-hard", "planet-5-hard", "planet-6-hard"}
		
		playerState := progressMap[req.PlayerName]
		
		// Progreso Normal
		hasAllNormal1s := true
		hasAllNormal2s := true
		hasAllNormal3s := true
		for _, p := range normalPlanets {
			s := playerState.Stars[p]
			if s < 1 { hasAllNormal1s = false }
			if s < 2 { hasAllNormal2s = false }
			if s < 3 { hasAllNormal3s = false }
		}
		if hasAllNormal1s { database.SaveSticker(req.PlayerName, "st-normal-complete") }
		if hasAllNormal2s { database.SaveSticker(req.PlayerName, "st-normal-complete-2s") }
		if hasAllNormal3s { database.SaveSticker(req.PlayerName, "st-normal-complete-3s") }

		// Progreso Hard
		hasAllHard1s := true
		hasAllHard2s := true
		hasAllHard3s := true
		for _, p := range hardPlanets {
			s := playerState.Stars[p]
			if s < 1 { hasAllHard1s = false }
			if s < 2 { hasAllHard2s = false }
			if s < 3 { hasAllHard3s = false }
		}
		if hasAllHard1s { database.SaveSticker(req.PlayerName, "st-hard-complete") }
		if hasAllHard2s { database.SaveSticker(req.PlayerName, "st-hard-complete-2s") }
		if hasAllHard3s { database.SaveSticker(req.PlayerName, "st-hard-complete-3s") }

		// Logro Máximo (3 estrellas en todo en Normal y Hard)
		if hasAllNormal3s && hasAllHard3s {
			database.SaveSticker(req.PlayerName, "st-cosmo-god")
		}

		// La Tropa Unida (Ambos perfiles tienen al menos 1 estrella en total)
		sofiaState := progressMap["Sofia"]
		lucianoState := progressMap["Luciano"]
		sofiaTotalStars := 0
		lucianoTotalStars := 0
		for _, s := range sofiaState.Stars { sofiaTotalStars += s }
		for _, s := range lucianoState.Stars { lucianoTotalStars += s }
		if sofiaTotalStars >= 1 && lucianoTotalStars >= 1 {
			database.SaveSticker("Sofia", "st-tropa")
			database.SaveSticker("Luciano", "st-tropa")
		}
	}

	// Retornar estado actualizado
	progress, err := database.GetPlayersProgress()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}

func resetData(c *gin.Context) {
	var req ResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Password != "papa" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Palabra clave incorrecta"})
		return
	}

	if err := database.ResetAllData(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Retornar estado inicializado vacío
	progress, err := database.GetPlayersProgress()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}
