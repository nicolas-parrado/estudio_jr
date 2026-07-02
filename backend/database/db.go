package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/glebarez/go-sqlite"
)

var DB *sql.DB

// InitDB inicializa la base de datos de SQLite y crea las tablas necesarias.
func InitDB(dbPath string) {
	// Asegurar que la carpeta contenedora exista
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatalf("Error al crear directorio para la DB: %v", err)
	}

	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Error al abrir SQLite: %v", err)
	}

	// Habilitar claves foráneas
	_, err = DB.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		log.Fatalf("Error al activar claves foráneas: %v", err)
	}

	createTablesSchema()
}

func createTablesSchema() {
	// Tabla de progreso
	queryProgress := `
	CREATE TABLE IF NOT EXISTS progress (
		player_name TEXT NOT NULL,
		planet_id TEXT NOT NULL,
		stars_earned INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (player_name, planet_id)
	);`

	// Tabla de stickers coleccionados
	queryStickers := `
	CREATE TABLE IF NOT EXISTS stickers (
		player_name TEXT NOT NULL,
		sticker_id TEXT NOT NULL,
		PRIMARY KEY (player_name, sticker_id)
	);`

	if _, err := DB.Exec(queryProgress); err != nil {
		log.Fatalf("Error al crear tabla progress: %v", err)
	}

	if _, err := DB.Exec(queryStickers); err != nil {
		log.Fatalf("Error al crear tabla stickers: %v", err)
	}

	fmt.Println("Base de datos SQLite inicializada correctamente con tablas.")
}

// PlayerState representa el progreso consolidado de un jugador para el frontend
type PlayerState struct {
	Stars           map[string]int `json:"stars"`
	UnlockedPlanets []string       `json:"unlockedPlanets"`
	Stickers        []string       `json:"stickers"`
}

// GetPlayersProgress recupera el progreso estructurado de Sofia y Luciano
func GetPlayersProgress() (map[string]PlayerState, error) {
	state := map[string]PlayerState{
		"Sofia": {
			Stars:           make(map[string]int),
			UnlockedPlanets: []string{"planet-1"},
			Stickers:        make([]string, 0),
		},
		"Luciano": {
			Stars:           make(map[string]int),
			UnlockedPlanets: []string{"planet-1"},
			Stickers:        make([]string, 0),
		},
	}

	// 1. Cargar estrellas ganadas
	rows, err := DB.Query("SELECT player_name, planet_id, stars_earned FROM progress")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var name, planetID string
		var stars int
		if err := rows.Scan(&name, &planetID, &stars); err != nil {
			return nil, err
		}
		if player, exists := state[name]; exists {
			player.Stars[planetID] = stars
			state[name] = player
		}
	}

	// 2. Cargar stickers
	sRows, err := DB.Query("SELECT player_name, sticker_id FROM stickers")
	if err != nil {
		return nil, err
	}
	defer sRows.Close()

	for sRows.Next() {
		var name, stickerID string
		if err := sRows.Scan(&name, &stickerID); err != nil {
			return nil, err
		}
		if player, exists := state[name]; exists {
			player.Stickers = append(player.Stickers, stickerID)
			state[name] = player
		}
	}

	// 3. Calcular planetas desbloqueados dinámicamente según la lógica de progresión
	planetsOrder := []string{"planet-1", "planet-2", "planet-3", "planet-4", "planet-5", "planet-6"}
	for _, name := range []string{"Sofia", "Luciano"} {
		player := state[name]
		// Empezar desde planet-1 y desbloquear el siguiente si el actual tiene >= 1 estrella
		for i, pID := range planetsOrder {
			stars := player.Stars[pID]
			if stars >= 1 && i+1 < len(planetsOrder) {
				nextPID := planetsOrder[i+1]
				if !contains(player.UnlockedPlanets, nextPID) {
					player.UnlockedPlanets = append(player.UnlockedPlanets, nextPID)
				}
			}
		}
		state[name] = player
	}

	return state, nil
}

// SaveProgress guarda el progreso obtenido en estrellas
func SaveProgress(playerName, planetID string, stars int) error {
	// Primero leemos la puntuación anterior para guardar solo si es mejor
	var prevStars int
	err := DB.QueryRow("SELECT stars_earned FROM progress WHERE player_name = ? AND planet_id = ?", playerName, planetID).Scan(&prevStars)
	
	if err == sql.ErrNoRows {
		// Insertar nuevo registro
		_, err = DB.Exec("INSERT INTO progress (player_name, planet_id, stars_earned) VALUES (?, ?, ?)", playerName, planetID, stars)
		return err
	} else if err != nil {
		return err
	}

	// Si las nuevas estrellas son mayores, actualizamos
	if stars > prevStars {
		_, err = DB.Exec("UPDATE progress SET stars_earned = ? WHERE player_name = ? AND planet_id = ?", stars, playerName, planetID)
		return err
	}

	return nil
}

// SaveSticker desbloquea un sticker para un jugador
func SaveSticker(playerName, stickerID string) error {
	_, err := DB.Exec("INSERT OR IGNORE INTO stickers (player_name, sticker_id) VALUES (?, ?)", playerName, stickerID)
	return err
}

// ResetAllData borra todos los registros de la DB
func ResetAllData() error {
	_, err := DB.Exec("DELETE FROM progress")
	if err != nil {
		return err
	}
	_, err = DB.Exec("DELETE FROM stickers")
	return err
}

func contains(arr []string, val string) bool {
	for _, item := range arr {
		if item == val {
			return true
		}
	}
	return false
}
