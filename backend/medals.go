package main

import (
	"ingles-backend/database"
)

// checkCompletionMedals valida y asigna insignias/stickers de racha, juego perfecto o avance del mapa estelar.
func checkCompletionMedals(playerName string, subjectID string, maxStreak int, perfectRun bool) {
	// 1. Validar rachas e hitos individuales
	if maxStreak >= 5 {
		database.SaveSticker(playerName, subjectID, "st-streak-5")
	}
	if maxStreak >= 10 {
		database.SaveSticker(playerName, subjectID, "st-streak-10")
	}
	if perfectRun {
		database.SaveSticker(playerName, subjectID, "st-perfect-run")
	}

	// 2. Cargar orden de planetas para la materia
	var planetsOrder []string
	if subject, exists := subjectsMap[subjectID]; exists {
		for _, p := range subject.Planets {
			planetsOrder = append(planetsOrder, p.ID)
		}
	}

	// 3. Evaluar insignias globales de completitud
	progressMap, err := database.GetPlayersProgress(subjectID, planetsOrder)
	if err == nil {
		if subject, exists := subjectsMap[subjectID]; exists {
			playerState := progressMap[playerName]

			hasAllNormal1s := true
			hasAllNormal2s := true
			hasAllNormal3s := true

			hasAllHard1s := true
			hasAllHard2s := true
			hasAllHard3s := true

			hasAllInsane1s := true
			hasAllInsane2s := true
			hasAllInsane3s := true

			for _, p := range subject.Planets {
				sNormal := playerState.Stars[p.ID]
				if sNormal < 1 {
					hasAllNormal1s = false
				}
				if sNormal < 2 {
					hasAllNormal2s = false
				}
				if sNormal < 3 {
					hasAllNormal3s = false
				}

				sHard := playerState.Stars[p.ID+"-hard"]
				if sHard < 1 {
					hasAllHard1s = false
				}
				if sHard < 2 {
					hasAllHard2s = false
				}
				if sHard < 3 {
					hasAllHard3s = false
				}

				sInsane := playerState.Stars[p.ID+"-insane"]
				if sInsane < 1 {
					hasAllInsane1s = false
				}
				if sInsane < 2 {
					hasAllInsane2s = false
				}
				if sInsane < 3 {
					hasAllInsane3s = false
				}
			}

			if hasAllNormal1s {
				database.SaveSticker(playerName, subjectID, "st-normal-complete")
			}
			if hasAllNormal2s {
				database.SaveSticker(playerName, subjectID, "st-normal-complete-2s")
			}
			if hasAllNormal3s {
				database.SaveSticker(playerName, subjectID, "st-normal-complete-3s")
			}

			if hasAllHard1s {
				database.SaveSticker(playerName, subjectID, "st-hard-complete")
			}
			if hasAllHard2s {
				database.SaveSticker(playerName, subjectID, "st-hard-complete-2s")
			}
			if hasAllHard3s {
				database.SaveSticker(playerName, subjectID, "st-hard-complete-3s")
			}

			if hasAllInsane1s {
				database.SaveSticker(playerName, subjectID, "st-insane-complete")
			}
			if hasAllInsane2s {
				database.SaveSticker(playerName, subjectID, "st-insane-complete-2s")
			}
			if hasAllInsane3s {
				database.SaveSticker(playerName, subjectID, "st-insane-complete-3s")
			}

			if hasAllNormal3s && hasAllHard3s && hasAllInsane3s {
				database.SaveSticker(playerName, subjectID, "st-multiverse-master")
			} else if hasAllNormal3s && hasAllHard3s {
				database.SaveSticker(playerName, subjectID, "st-cosmo-god")
			}

			// Validar logro cooperativo "La Tropa Unida"
			tropaPilotsWithStars := 0
			for _, pName := range database.DefaultPlayers {
				pState, exists := progressMap[pName]
				if exists {
					pTotal := 0
					for _, s := range pState.Stars {
						pTotal += s
					}
					if pTotal >= 1 {
						tropaPilotsWithStars++
					}
				}
			}
			if tropaPilotsWithStars >= 2 {
				for _, pName := range database.DefaultPlayers {
					database.SaveSticker(pName, subjectID, "st-tropa")
				}
			}
		}
	}
}
