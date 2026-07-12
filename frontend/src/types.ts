export interface VocabularyItem {
  word: string;
  translation: string;
  emoji: string;
  category: string;
}

export interface SpecialQuestion {
  type: string;
  phrase: string;
  preposition: string;
  translation: string;
  options: string[];
  visual: string;
}

export interface Planet {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
  vocabulary: VocabularyItem[];
  specialQuestions?: SpecialQuestion[];
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export interface GameData {
  planets: Planet[];
  stickers: Sticker[];
}

export interface PlayerState {
  stars: Record<string, number>;
  unlockedPlanets: string[];
  stickers: string[];
}

export type PlayersProgress = Record<string, PlayerState>;

// Tipos para preguntas locales del frontend estructuradas
export type QuestionType = "trivia" | "audio" | "drag-drop" | "memorice" | "preposition" | "true-false" | "fill-vowels" | "writing";

export interface StandardQuestion {
  type: "trivia" | "audio";
  word: string;
  translation: string;
  emoji: string;
  options: string[];
  correctAnswer: string;
}

export interface DragDropQuestion {
  type: "drag-drop";
  items: { word: string; emoji: string; translation: string }[];
  isSpanishLeft: boolean; // Indica si la columna izquierda es español y derecha inglés
}

export interface MemoryCard {
  word: string;
  emoji: string;
  id: number;
}

export interface MemoriceQuestion {
  type: "memorice";
  pairs: MemoryCard[];
}

export interface PrepositionQuestion {
  type: "preposition";
  phrase: string;
  preposition: string;
  translation: string;
  options: string[];
  visual: string;
}

export interface TrueFalseQuestion {
  type: "true-false";
  word: string;
  translation: string;
  emoji: string;
  isCorrectMatch: boolean;
  shownTranslation: string;
}

export interface FillVowelsQuestion {
  type: "fill-vowels";
  word: string;
  translation: string;
  emoji: string;
  maskedWord: string;
  correctVowels: string[];
}

export interface WritingQuestion {
  type: "writing";
  word: string;
  translation: string;
  emoji: string;
}

export type GameQuestion = 
  | StandardQuestion 
  | DragDropQuestion 
  | MemoriceQuestion 
  | PrepositionQuestion 
  | TrueFalseQuestion 
  | FillVowelsQuestion 
  | WritingQuestion;
