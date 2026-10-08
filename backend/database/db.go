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
	runMigrationsIfNeeded()
}

func createTablesSchema() {
	// Tabla de progreso con subject_id
	queryProgress := `
	CREATE TABLE IF NOT EXISTS progress (
		player_name TEXT NOT NULL,
		subject_id TEXT NOT NULL,
		planet_id TEXT NOT NULL,
		stars_earned INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (player_name, subject_id, planet_id)
	);`

	// Tabla de stickers coleccionados con subject_id
	queryStickers := `
	CREATE TABLE IF NOT EXISTS stickers (
		player_name TEXT NOT NULL,
		subject_id TEXT NOT NULL,
		sticker_id TEXT NOT NULL,
		PRIMARY KEY (player_name, subject_id, sticker_id)
	);`

	if _, err := DB.Exec(queryProgress); err != nil {
		log.Fatalf("Error al crear tabla progress: %v", err)
	}

	if _, err := DB.Exec(queryStickers); err != nil {
		log.Fatalf("Error al crear tabla stickers: %v", err)
	}

	fmt.Println("Base de datos SQLite inicializada correctamente con tablas.")
}

// runMigrationsIfNeeded realiza la migración de esquemas viejos al nuevo con subject_id de forma automática
func runMigrationsIfNeeded() {
	// Verificar si la tabla progress contiene la columna subject_id
	rows, err := DB.Query("PRAGMA table_info(progress);")
	if err != nil {
		log.Printf("Error al consultar info de tabla progress: %v", err)
		return
	}
	defer rows.Close()

	hasSubjectID := false
	for rows.Next() {
		var cid int
		var name, typeStr string
		var notnull, pk int
		var dfltVal interface{}
		if err := rows.Scan(&cid, &name, &typeStr, &notnull, &dfltVal, &pk); err != nil {
			log.Printf("Error leyendo info de columnas: %v", err)
			return
		}
		if name == "subject_id" {
			hasSubjectID = true
			break
		}
	}

	if hasSubjectID {
		log.Println("La base de datos ya tiene el esquema actualizado (subject_id presente).")
		return
	}

	log.Println("Migrando base de datos al nuevo esquema multi-materia...")

	// Iniciar Transacción para la migración
	tx, err := DB.Begin()
	if err != nil {
		log.Fatalf("Error al iniciar transacción de migración: %v", err)
	}
	defer tx.Rollback()

	// Renombrar tablas viejas
	if _, err := tx.Exec("ALTER TABLE progress RENAME TO progress_old;"); err != nil {
		log.Fatalf("Error renombrando progress: %v", err)
	}
	if _, err := tx.Exec("ALTER TABLE stickers RENAME TO stickers_old;"); err != nil {
		log.Fatalf("Error renombrando stickers: %v", err)
	}

	// Crear nuevas tablas con subject_id
	queryNewProgress := `
	CREATE TABLE progress (
		player_name TEXT NOT NULL,
		subject_id TEXT NOT NULL,
		planet_id TEXT NOT NULL,
		stars_earned INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (player_name, subject_id, planet_id)
	);`
	queryNewStickers := `
	CREATE TABLE stickers (
		player_name TEXT NOT NULL,
		subject_id TEXT NOT NULL,
		sticker_id TEXT NOT NULL,
		PRIMARY KEY (player_name, subject_id, sticker_id)
	);`

	if _, err := tx.Exec(queryNewProgress); err != nil {
		log.Fatalf("Error creando nueva tabla progress: %v", err)
	}
	if _, err := tx.Exec(queryNewStickers); err != nil {
		log.Fatalf("Error creando nueva tabla stickers: %v", err)
	}

	// Migrar datos existentes mapeándolos por defecto a 'ingles'
	if _, err := tx.Exec("INSERT INTO progress (player_name, subject_id, planet_id, stars_earned) SELECT player_name, 'ingles', planet_id, stars_earned FROM progress_old;"); err != nil {
		log.Fatalf("Error migrando datos a progress: %v", err)
	}
	if _, err := tx.Exec("INSERT INTO stickers (player_name, subject_id, sticker_id) SELECT player_name, 'ingles', sticker_id FROM stickers_old;"); err != nil {
		log.Fatalf("Error migrando datos a stickers: %v", err)
	}

	// Eliminar tablas temporales viejas
	if _, err := tx.Exec("DROP TABLE progress_old;"); err != nil {
		log.Fatalf("Error eliminando progress_old: %v", err)
	}
	if _, err := tx.Exec("DROP TABLE stickers_old;"); err != nil {
		log.Fatalf("Error eliminando stickers_old: %v", err)
	}

	// Confirmar cambios
	if err := tx.Commit(); err != nil {
		log.Fatalf("Error confirmando transacción de migración: %v", err)
	}

	log.Println("Migración a esquema multi-materia completada exitosamente.")
}

// DefaultPlayers lista los pilotos registrados por defecto en el sistema
var DefaultPlayers = []string{"Sofia", "Luciano", "Amanda"}

// PlayerState representa el progreso consolidado de un jugador para el frontend
type PlayerState struct {
	Stars           map[string]int `json:"stars"`
	UnlockedPlanets []string       `json:"unlockedPlanets"`
	Stickers        []string       `json:"stickers"`
}

// GetPlayersProgress recupera el progreso estructurado de los alumnos para un subject específico
func GetPlayersProgress(subjectID string, planetsOrder []string) (map[string]PlayerState, error) {
	// Determinar el planeta de inicio (primer planeta de planetsOrder si existe, si no "planet-1")
	firstPlanet := "planet-1"
	if len(planetsOrder) > 0 {
		firstPlanet = planetsOrder[0]
	}

	state := make(map[string]PlayerState)
	for _, name := range DefaultPlayers {
		state[name] = PlayerState{
			Stars:           make(map[string]int),
			UnlockedPlanets: []string{firstPlanet},
			Stickers:        make([]string, 0),
		}
	}

	// 1. Cargar estrellas ganadas para la materia actual
	rows, err := DB.Query("SELECT player_name, planet_id, stars_earned FROM progress WHERE subject_id = ?", subjectID)
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

	// 2. Cargar todos los stickers del alumno (de todos los ramos, para el álbum centralizado)
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

	// 3. Calcular planetas desbloqueados dinámicamente según la lógica de progresión de esta materia
	for _, name := range DefaultPlayers {
		player := state[name]
		if len(planetsOrder) > 0 {
			// Empezar desde el primer planeta y desbloquear el siguiente si el actual tiene >= 1 estrella
			for i, pID := range planetsOrder {
				stars := player.Stars[pID]
				if stars >= 1 && i+1 < len(planetsOrder) {
					nextPID := planetsOrder[i+1]
					if !contains(player.UnlockedPlanets, nextPID) {
						player.UnlockedPlanets = append(player.UnlockedPlanets, nextPID)
					}
				}
			}
		}
		state[name] = player
	}

	return state, nil
}

// SaveProgress guarda el progreso obtenido en estrellas para una materia y planeta específicos
func SaveProgress(playerName, subjectID, planetID string, stars int) error {
	// Primero leemos la puntuación anterior para guardar solo si es mejor
	var prevStars int
	err := DB.QueryRow("SELECT stars_earned FROM progress WHERE player_name = ? AND subject_id = ? AND planet_id = ?", playerName, subjectID, planetID).Scan(&prevStars)
	
	if err == sql.ErrNoRows {
		// Insertar nuevo registro
		_, err = DB.Exec("INSERT INTO progress (player_name, subject_id, planet_id, stars_earned) VALUES (?, ?, ?, ?)", playerName, subjectID, planetID, stars)
		return err
	} else if err != nil {
		return err
	}

	// Si las nuevas estrellas son mayores, actualizamos
	if stars > prevStars {
		_, err = DB.Exec("UPDATE progress SET stars_earned = ? WHERE player_name = ? AND subject_id = ? AND planet_id = ?", stars, playerName, subjectID, planetID)
		return err
	}

	return nil
}

// SaveSticker desbloquea un sticker para un jugador bajo una materia específica
func SaveSticker(playerName, subjectID, stickerID string) error {
	_, err := DB.Exec("INSERT OR IGNORE INTO stickers (player_name, subject_id, sticker_id) VALUES (?, ?, ?)", playerName, subjectID, stickerID)
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
