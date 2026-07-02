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
export type QuestionType = "trivia" | "visual" | "audio" | "drag-drop" | "memorice" | "preposition";

export interface StandardQuestion {
  type: "trivia" | "visual" | "audio";
  word: string;
  translation: string;
  emoji: string;
  options: string[];
  correctAnswer: string;
}

export interface DragDropQuestion {
  type: "drag-drop";
  items: { word: string; emoji: string; translation: string }[];
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

export type GameQuestion = StandardQuestion | DragDropQuestion | MemoriceQuestion | PrepositionQuestion;
