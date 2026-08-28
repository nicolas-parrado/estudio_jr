package main

// VocabularyItem representa una palabra con traducción, emoji, categoría y dificultad.
type VocabularyItem struct {
	Word        string `json:"word"`
	Translation string `json:"translation"`
	Emoji       string `json:"emoji"`
	Category    string `json:"category"`
	Difficulty  string `json:"difficulty,omitempty"`
}

// SpecialQuestion representa una pregunta de lógica (como preposiciones, ciencias o matemáticas)
type SpecialQuestion struct {
	Type            string   `json:"type"`
	Phrase          string   `json:"phrase,omitempty"`
	Preposition     string   `json:"preposition,omitempty"`
	Translation     string   `json:"translation,omitempty"`
	Options         []string `json:"options,omitempty"`
	Visual          string   `json:"visual,omitempty"`
	Question        string   `json:"question,omitempty"`
	CorrectAnswer   string   `json:"correctAnswer,omitempty"`
	Emoji           string   `json:"emoji,omitempty"`
	Animal          string   `json:"animal,omitempty"`
	Sequence        []string `json:"sequence,omitempty"`
	Instruction     string   `json:"instruction,omitempty"`
	Concept         string   `json:"concept,omitempty"`
	CorrectCategory string   `json:"correctCategory,omitempty"`
	Explanation     string   `json:"explanation,omitempty"`
	// Campos para Matemáticas
	Expression     string `json:"expression,omitempty"`
	MissingNumber  string `json:"missingNumber,omitempty"`
	LeftSide       string `json:"leftSide,omitempty"`
	RightSide      string `json:"rightSide,omitempty"`
	Story          string `json:"story,omitempty"`
	QuestionPrompt string `json:"questionPrompt,omitempty"`
	OperationType  string `json:"operationType,omitempty"`
	Num1           int    `json:"num1,omitempty"`
	Num2           int    `json:"num2,omitempty"`
	Tens           *int   `json:"tens,omitempty"`
	Units          *int   `json:"units,omitempty"`
	Number         *int   `json:"number,omitempty"`
	LeftNumber     *int   `json:"leftNumber,omitempty"`
	RightNumber    *int   `json:"rightNumber,omitempty"`
	Difficulty     string `json:"difficulty,omitempty"`
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
	QuestionsCountInsane int               `json:"questionsCountInsane"`
	StickerNormal        string            `json:"stickerNormal"`
	StickerHard          string            `json:"stickerHard"`
	StickerInsane        string            `json:"stickerInsane"`
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
