package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"ingles-backend/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var subjectsMap = make(map[string]Subject)

var globalStickers = []Sticker{
	{ID: "st-explorer", Name: "Primeros Pasos", Emoji: "🛸", Desc: "Iniciar sesión por primera vez y ver el mapa estelar.", Difficulty: "easy"},
	{ID: "st-first-star", Name: "Brillo Inicial", Emoji: "⭐", Desc: "Ganar la primera estrella en cualquier planeta.", Difficulty: "easy"},
	{ID: "st-streak-5", Name: "Cometa Veloz", Emoji: "☄️", Desc: "Lograr una racha de 5 respuestas correctas en una partida.", Difficulty: "medium"},
	{ID: "st-streak-10", Name: "Centella del Cosmos", Emoji: "🌠", Desc: "Lograr una racha de 10 respuestas correctas en una partida.", Difficulty: "hard"},
	{ID: "st-perfect-run", Name: "Misión Impecable", Emoji: "💯", Desc: "Completar cualquier planeta sin cometer fallos.", Difficulty: "hard"},
	{ID: "st-tropa", Name: "La Tropa Unida", Emoji: "👨‍👩‍👧‍👦", Desc: "Obtener al menos 1 estrella con ambos perfiles (Sofía y Luciano) en el sistema.", Difficulty: "legendary"},
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

// loadSubjects carga archivos JSON de materias desde data/subjects/ y sus planetas modulares
func loadSubjects() {
	paths := []string{"./data/subjects", "backend/data/subjects", "../backend/data/subjects"}
	var baseDir string
	for _, p := range paths {
		if info, err := os.Stat(p); err == nil && info.IsDir() {
			baseDir = p
			break
		}
	}

	if baseDir == "" {
		log.Println("ADVERTENCIA: No se encontró el directorio de materias.")
		return
	}

	files, err := filepath.Glob(filepath.Join(baseDir, "*.json"))
	if err != nil || len(files) == 0 {
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

		// Revisar si existe carpeta con planetas modulares para esta materia (<baseDir>/<subjectID>/)
		subjectFolder := filepath.Join(baseDir, sub.SubjectID)
		for i, p := range sub.Planets {
			planetFile := filepath.Join(subjectFolder, p.ID+".json")
			if _, err := os.Stat(planetFile); err == nil {
				planetData, err := ioutil.ReadFile(planetFile)
				if err == nil {
					var fullPlanet Planet
					if err := json.Unmarshal(planetData, &fullPlanet); err == nil {
						if len(fullPlanet.Vocabulary) > 0 {
							sub.Planets[i].Vocabulary = fullPlanet.Vocabulary
						}
						if len(fullPlanet.SpecialQuestions) > 0 {
							sub.Planets[i].SpecialQuestions = fullPlanet.SpecialQuestions
						}
						if fullPlanet.Name != "" {
							sub.Planets[i].Name = fullPlanet.Name
						}
						if fullPlanet.Subtitle != "" {
							sub.Planets[i].Subtitle = fullPlanet.Subtitle
						}
						if fullPlanet.Emoji != "" {
							sub.Planets[i].Emoji = fullPlanet.Emoji
						}
						if fullPlanet.Color != "" {
							sub.Planets[i].Color = fullPlanet.Color
						}
						if fullPlanet.QuestionsCountNormal > 0 {
							sub.Planets[i].QuestionsCountNormal = fullPlanet.QuestionsCountNormal
						}
						if fullPlanet.QuestionsCountHard > 0 {
							sub.Planets[i].QuestionsCountHard = fullPlanet.QuestionsCountHard
						}
						if fullPlanet.StickerNormal != "" {
							sub.Planets[i].StickerNormal = fullPlanet.StickerNormal
						}
						if fullPlanet.StickerHard != "" {
							sub.Planets[i].StickerHard = fullPlanet.StickerHard
						}
					} else {
						log.Printf("Error al parsear JSON del planeta %s: %v", planetFile, err)
					}
				}
			}
		}

		subjectsMap[sub.SubjectID] = sub
		log.Printf("Materia cargada con éxito: %s (%s) con %d planetas", sub.SubjectName, sub.SubjectID, len(sub.Planets))
	}
}

