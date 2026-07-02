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
		{ID: "st-rocket", Name: "Cohete Dorado", Emoji: "🚀", Desc: "¡Perfecto en el Planeta 1!"},
		{ID: "st-alien", Name: "Cosmo Bailarín", Emoji: "🕺👽", Desc: "¡Perfecto en el Planeta 2!"},
		{ID: "st-star", Name: "Supernova Radiante", Emoji: "🌟", Desc: "¡Perfecto en el Planeta 3!"},
		{ID: "st-ufo", Name: "Platillo Volador", Emoji: "🛸", Desc: "¡Perfecto en el Planeta 4!"},
		{ID: "st-astronaut", Name: "Astronauta Pro", Emoji: "🧑‍🚀", Desc: "¡Perfecto en el Planeta 5!"},
		{ID: "st-crown", Name: "Rey/Reina del Cosmos", Emoji: "👑🪐", Desc: "¡Perfecto en el Planeta 6!"},
	},
}

// Structs para requests
type ProgressRequest struct {
	PlayerName string `json:"playerName" binding:"required"`
	PlanetID   string `json:"planetId" binding:"required"`
	Stars      int    `json:"stars" binding:"gte=0,lte=3"`
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

	// Si obtuvo 3 estrellas, desbloquear y guardar el sticker del planeta
	if req.Stars == 3 {
		// Mapear planet-1 a st-rocket, planet-2 a st-alien...
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
		}

		if stickerID != "" {
			if err := database.SaveSticker(req.PlayerName, stickerID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
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
