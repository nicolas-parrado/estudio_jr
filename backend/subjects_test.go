package main

import (
	"testing"
)

func TestLoadSubjects(t *testing.T) {
	loadSubjects()

	// 1. Verificar materia Inglés
	ingles, exists := subjectsMap["ingles"]
	if !exists {
		t.Fatalf("Materia 'ingles' no fue cargada en subjectsMap")
	}

	if len(ingles.Planets) != 8 {
		t.Fatalf("Se esperaban 8 planetas en 'ingles', se encontraron %d", len(ingles.Planets))
	}

	// Verificar Planeta 7
	p7 := ingles.Planets[6]
	if p7.ID != "planet-7" || p7.Name != "Planeta Vocaciones y Rasgos" {
		t.Errorf("Planeta 7 incorrecto: %+v", p7)
	}
	if len(p7.Vocabulary) == 0 {
		t.Errorf("Planeta 7 no tiene vocabulario cargado")
	}
	if len(p7.SpecialQuestions) == 0 {
		t.Errorf("Planeta 7 no tiene preguntas especiales cargadas")
	}

	// Verificar Planeta 8
	p8 := ingles.Planets[7]
	if p8.ID != "planet-8" || p8.Name != "Planeta Safari Salvaje" {
		t.Errorf("Planeta 8 incorrecto: %+v", p8)
	}
	if len(p8.Vocabulary) == 0 {
		t.Errorf("Planeta 8 no tiene vocabulario cargado")
	}
	if len(p8.SpecialQuestions) == 0 {
		t.Errorf("Planeta 8 no tiene preguntas especiales cargadas")
	}

	// 2. Verificar materia Ciencias Naturales
	ciencias, exists := subjectsMap["ciencias_naturales"]
	if !exists {
		t.Fatalf("Materia 'ciencias_naturales' no fue cargada en subjectsMap")
	}
	if len(ciencias.Planets) != 1 {
		t.Fatalf("Se esperaba 1 planeta en 'ciencias_naturales', se encontraron %d", len(ciencias.Planets))
	}
	pSci := ciencias.Planets[0]
	if len(pSci.Vocabulary) == 0 {
		t.Errorf("Planeta de ciencias no tiene vocabulario cargado")
	}
	if len(pSci.SpecialQuestions) == 0 {
		t.Errorf("Planeta de ciencias no tiene preguntas especiales cargadas")
	}

	// 3. Verificar materia Matemáticas
	matematicas, exists := subjectsMap["matematicas"]
	if !exists {
		t.Fatalf("Materia 'matematicas' no fue cargada en subjectsMap")
	}
	if len(matematicas.Planets) != 4 {
		t.Fatalf("Se esperaban 4 planetas en 'matematicas', se encontraron %d", len(matematicas.Planets))
	}
	for idx, p := range matematicas.Planets {
		if len(p.SpecialQuestions) == 0 {
			t.Errorf("Planeta %d de matemáticas (%s) no tiene preguntas especiales cargadas", idx+1, p.ID)
		}
		// Verificar que los campos no se pierdan al deserializar
		if idx == 0 && p.SpecialQuestions[0].Expression == "" {
			t.Errorf("Planeta 1 de matemáticas perdió el campo Expression en sus preguntas")
		}
		if idx == 1 && p.SpecialQuestions[0].Story == "" {
			t.Errorf("Planeta 2 de matemáticas perdió el campo Story en sus preguntas")
		}
	}
	if len(matematicas.Stickers) != 8 {
		t.Errorf("Se esperaban 8 stickers en matemáticas, se encontraron %d", len(matematicas.Stickers))
	}

	// 4. Verificar stickers de inglés
	if len(ingles.Stickers) < 15 {
		t.Errorf("Stickers de inglés incompletos: %d", len(ingles.Stickers))
	}
}
