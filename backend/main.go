package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

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
	ID                   string            `json:"id"`
	Name                 string            `json:"name"`
	Subtitle             string            `json:"subtitle"`
	Emoji                string            `json:"emoji"`
	Color                string            `json:"color"`
	QuestionsCountNormal int               `json:"questionsCountNormal"`
	QuestionsCountHard   int               `json:"questionsCountHard"`
	StickerNormal        string            `json:"stickerNormal"`
	StickerHard          string            `json:"stickerHard"`
	Vocabulary           []VocabularyItem  `json:"vocabulary"`
	SpecialQuestions     []SpecialQuestion `json:"specialQuestions,omitempty"`
}

// Sticker representa un sticker coleccionable.
type Sticker struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Emoji      string `json:"emoji"`
	Desc       string `json:"desc"`
	Difficulty string `json:"difficulty"`
}

// Subject representa una materia completa cargada desde JSON
type Subject struct {
	SubjectID   string    `json:"subjectId"`
	SubjectName string    `json:"subjectName"`
	Emoji       string    `json:"emoji"`
	ThemeColor  string    `json:"themeColor"`
	Planets     []Planet  `json:"planets"`
	Stickers    []Sticker `json:"stickers"`
}

var subjectsMap = make(map[string]Subject)

var globalStickers = []Sticker{
	{ID: "st-explorer", Name: "Primeros Pasos", Emoji: "🛸", Desc: "Iniciar sesión por primera vez y ver el mapa estelar.", Difficulty: "easy"},
	{ID: "st-first-star", Name: "Brillo Inicial", Emoji: "⭐", Desc: "Ganar la primera estrella en cualquier planeta.", Difficulty: "easy"},
	{ID: "st-streak-5", Name: "Cometa Veloz", Emoji: "☄️", Desc: "Lograr una racha de 5 respuestas correctas en una partida.", Difficulty: "medium"},
	{ID: "st-streak-10", Name: "Centella del Cosmos", Emoji: "🌠", Desc: "Lograr una racha de 10 respuestas correctas en una partida.", Difficulty: "hard"},
	{ID: "st-perfect-run", Name: "Misión Impecable", Emoji: "💯", Desc: "Completar cualquier planeta sin cometer fallos.", Difficulty: "hard"},
	{ID: "st-tropa", Name: "La Tropa Unida", Emoji: "👨‍👩‍👧‍👦", Desc: "Obtener al menos 1 estrella con ambos perfiles (Sofía y Luciano) en el sistema.", Difficulty: "legendary"},
}

// Structs para requests
type ProgressRequest struct {
	PlayerName  string `json:"playerName" binding:"required"`
	SubjectID   string `json:"subjectId" binding:"required"`
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

	// Cargar materias dinámicas
	loadSubjects()

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
		api.GET("/subjects", getSubjects)
		api.GET("/subjects/:subjectId/planets", getSubjectPlanets)
		api.GET("/subjects/:subjectId/planets/:planetId/data", getPlanetData)
		api.GET("/subjects/:subjectId/stickers", getSubjectStickers)
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

// loadSubjects carga archivos JSON de materias desde data/subjects/
func loadSubjects() {
	paths := []string{"./data/subjects/*.json", "backend/data/subjects/*.json", "../backend/data/subjects/*.json"}
	var files []string
	var err error

	for _, p := range paths {
		files, err = filepath.Glob(p)
		if err == nil && len(files) > 0 {
			break
		}
	}

	if len(files) == 0 {
		log.Println("ADVERTENCIA: No se encontraron archivos JSON de materias.")
		return
	}

	for _, file := range files {
		data, err := ioutil.ReadFile(file)
		if err != nil {
			log.Printf("Error al leer archivo %s: %v", file, err)
			continue
		}

		var sub Subject
		if err := json.Unmarshal(data, &sub); err != nil {
			log.Printf("Error al parsear JSON %s: %v", file, err)
			continue
		}

		subjectsMap[sub.SubjectID] = sub
		log.Printf("Materia cargada con éxito: %s (%s) con %d planetas", sub.SubjectName, sub.SubjectID, len(sub.Planets))
	}
}

// GET /api/subjects
func getSubjects(c *gin.Context) {
	list := make([]gin.H, 0)
	for _, sub := range subjectsMap {
		list = append(list, gin.H{
			"id":         sub.SubjectID,
			"name":       sub.SubjectName,
			"emoji":      sub.Emoji,
			"themeColor": sub.ThemeColor,
		})
	}
	c.JSON(http.StatusOK, list)
}

// GET /api/subjects/:subjectId/planets
func getSubjectPlanets(c *gin.Context) {
	subjectID := c.Param("subjectId")
	subject, exists := subjectsMap[subjectID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Materia no encontrada"})
		return
	}

	list := make([]gin.H, 0)
	for _, p := range subject.Planets {
		list = append(list, gin.H{
			"id":                   p.ID,
			"name":                 p.Name,
			"subtitle":             p.Subtitle,
			"emoji":                p.Emoji,
			"color":                p.Color,
			"questionsCountNormal": p.QuestionsCountNormal,
			"questionsCountHard":   p.QuestionsCountHard,
		})
	}
	c.JSON(http.StatusOK, list)
}

// GET /api/subjects/:subjectId/planets/:planetId/data
func getPlanetData(c *gin.Context) {
	subjectID := c.Param("subjectId")
	planetID := c.Param("planetId")

	subject, exists := subjectsMap[subjectID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Materia no encontrada"})
		return
	}

	for _, p := range subject.Planets {
		if p.ID == planetID {
			c.JSON(http.StatusOK, p)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Planeta no encontrado"})
}

// GET /api/subjects/:subjectId/stickers
func getSubjectStickers(c *gin.Context) {
	subjectID := c.Param("subjectId")
	subject, exists := subjectsMap[subjectID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Materia no encontrada"})
		return
	}

	allStickers := append([]Sticker{}, globalStickers...)
	allStickers = append(allStickers, subject.Stickers...)

	c.JSON(http.StatusOK, allStickers)
}

// GET /api/players?subjectId=ingles
func getPlayers(c *gin.Context) {
	subjectID := c.Query("subjectId")
	if subjectID == "" {
		subjectID = "ingles"
	}

	var planetsOrder []string
	if subject, exists := subjectsMap[subjectID]; exists {
		for _, p := range subject.Planets {
			planetsOrder = append(planetsOrder, p.ID)
		}
	} else {
		planetsOrder = []string{"planet-1", "planet-2", "planet-3", "planet-4", "planet-5", "planet-6"}
	}

	progress, err := database.GetPlayersProgress(subjectID, planetsOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}

// POST /api/progress
func saveProgress(c *gin.Context) {
	var req ProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.SaveProgress(req.PlayerName, req.SubjectID, req.PlanetID, req.Stars); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	database.SaveSticker(req.PlayerName, req.SubjectID, "st-explorer")
	if req.Stars >= 1 {
		database.SaveSticker(req.PlayerName, req.SubjectID, "st-first-star")
	}

	if req.Stars == 3 {
		isHard := strings.HasSuffix(req.PlanetID, "-hard")
		basePlanetID := req.PlanetID
		if isHard {
			basePlanetID = strings.TrimSuffix(req.PlanetID, "-hard")
		}

		if subject, exists := subjectsMap[req.SubjectID]; exists {
			for _, p := range subject.Planets {
				if p.ID == basePlanetID {
					stickerID := p.StickerNormal
					if isHard {
						stickerID = p.StickerHard
					}
					if stickerID != "" {
						database.SaveSticker(req.PlayerName, req.SubjectID, stickerID)
					}
					break
				}
			}
		}
	}

	if req.MaxStreak >= 5 {
		database.SaveSticker(req.PlayerName, req.SubjectID, "st-streak-5")
	}
	if req.MaxStreak >= 10 {
		database.SaveSticker(req.PlayerName, req.SubjectID, "st-streak-10")
	}
	if req.PerfectRun {
		database.SaveSticker(req.PlayerName, req.SubjectID, "st-perfect-run")
	}

	var planetsOrder []string
	if subject, exists := subjectsMap[req.SubjectID]; exists {
		for _, p := range subject.Planets {
			planetsOrder = append(planetsOrder, p.ID)
		}
	}

	progressMap, err := database.GetPlayersProgress(req.SubjectID, planetsOrder)
	if err == nil {
		if subject, exists := subjectsMap[req.SubjectID]; exists {
			playerState := progressMap[req.PlayerName]

			hasAllNormal1s := true
			hasAllNormal2s := true
			hasAllNormal3s := true

			hasAllHard1s := true
			hasAllHard2s := true
			hasAllHard3s := true

			for _, p := range subject.Planets {
				sNormal := playerState.Stars[p.ID]
				if sNormal < 1 { hasAllNormal1s = false }
				if sNormal < 2 { hasAllNormal2s = false }
				if sNormal < 3 { hasAllNormal3s = false }

				sHard := playerState.Stars[p.ID+"-hard"]
				if sHard < 1 { hasAllHard1s = false }
				if sHard < 2 { hasAllHard2s = false }
				if sHard < 3 { hasAllHard3s = false }
			}

			if hasAllNormal1s { database.SaveSticker(req.PlayerName, req.SubjectID, "st-normal-complete") }
			if hasAllNormal2s { database.SaveSticker(req.PlayerName, req.SubjectID, "st-normal-complete-2s") }
			if hasAllNormal3s { database.SaveSticker(req.PlayerName, req.SubjectID, "st-normal-complete-3s") }

			if hasAllHard1s { database.SaveSticker(req.PlayerName, req.SubjectID, "st-hard-complete") }
			if hasAllHard2s { database.SaveSticker(req.PlayerName, req.SubjectID, "st-hard-complete-2s") }
			if hasAllHard3s { database.SaveSticker(req.PlayerName, req.SubjectID, "st-hard-complete-3s") }

			if hasAllNormal3s && hasAllHard3s {
				database.SaveSticker(req.PlayerName, req.SubjectID, "st-cosmo-god")
			}

			sofiaState := progressMap["Sofia"]
			lucianoState := progressMap["Luciano"]
			sofiaTotalStars := 0
			lucianoTotalStars := 0
			for _, s := range sofiaState.Stars { sofiaTotalStars += s }
			for _, s := range lucianoState.Stars { lucianoTotalStars += s }
			if sofiaTotalStars >= 1 && lucianoTotalStars >= 1 {
				database.SaveSticker("Sofia", req.SubjectID, "st-tropa")
				database.SaveSticker("Luciano", req.SubjectID, "st-tropa")
			}
		}
	}

	progress, err := database.GetPlayersProgress(req.SubjectID, planetsOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}

// POST /api/reset
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

	// Retornar estado vacío mapeado por defecto a ingles
	var planetsOrder []string
	if subject, exists := subjectsMap["ingles"]; exists {
		for _, p := range subject.Planets {
			planetsOrder = append(planetsOrder, p.ID)
		}
	}
	progress, err := database.GetPlayersProgress("ingles", planetsOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, progress)
}
