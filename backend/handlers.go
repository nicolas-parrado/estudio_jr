package main

import (
	"net/http"
	"strings"

	"ingles-backend/database"

	"github.com/gin-gonic/gin"
)

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
			"questionsCountInsane": p.QuestionsCountInsane,
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

// GET /api/players
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
		isInsane := strings.HasSuffix(req.PlanetID, "-insane")
		isHard := strings.HasSuffix(req.PlanetID, "-hard")
		basePlanetID := req.PlanetID
		if isInsane {
			basePlanetID = strings.TrimSuffix(req.PlanetID, "-insane")
		} else if isHard {
			basePlanetID = strings.TrimSuffix(req.PlanetID, "-hard")
		}

		if subject, exists := subjectsMap[req.SubjectID]; exists {
			for _, p := range subject.Planets {
				if p.ID == basePlanetID {
					stickerID := p.StickerNormal
					if isInsane {
						stickerID = p.StickerInsane
					} else if isHard {
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

	// Invocar validación y asignación de logros en medals.go
	checkCompletionMedals(req.PlayerName, req.SubjectID, req.MaxStreak, req.PerfectRun)

	var planetsOrder []string
	if subject, exists := subjectsMap[req.SubjectID]; exists {
		for _, p := range subject.Planets {
			planetsOrder = append(planetsOrder, p.ID)
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
