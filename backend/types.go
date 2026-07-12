package main

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

// ProgressRequest representa el payload para guardar progreso del estudiante.
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

// ResetRequest representa la verificación de contraseña para formatear los datos.
type ResetRequest struct {
	Password string `json:"password" binding:"required"`
}
