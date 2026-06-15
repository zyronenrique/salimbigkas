export interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  answer: string;
  numAnswer: number;
  image: string | null;
  imageFile: File | null;
  categories: string[];
  correctItems?: Record<string, string[]>;
  shuffledOptions?: string[];
  letterBank?: string[];
  itemBank?: string[];
  leftItems?: string[];
  rightItems?: string[];
  matches?: number[];
  shuffledRightItems?: string[];
  targetWord?: string;
  syllableParts?: string[];
}

export const defaultQuestion = (type: string): Question => ({
  id: crypto.randomUUID(),
  type,
  question: type === "enumeration" 
    ? "Categorize the following items into their correct groups:"
    : type === "matching"
    ? "Match each item from Column A with the correct item from Column B:"
    : type === "syllable"
    ? "Drag the syllable parts to form the complete word:"
    : "",
  options: type === "multiple" ? ["", "", "", ""] : [],
  answer: type === "identification" ? "" : "",
  numAnswer: 0,
  image: null,
  imageFile: null,
  categories: type === "enumeration" ? [""] : [""],
  correctItems: type === "enumeration" ? {} : undefined,
  shuffledOptions: type === "multiple" ? ["", "", "", ""] : undefined,
  letterBank: type === "identification" ? [] : undefined,
  itemBank: type === "enumeration" ? [] : undefined,
  leftItems: type === "matching" ? ["", "", ""] : undefined,
  rightItems: type === "matching" ? ["", "", ""] : undefined,
  matches: type === "matching" ? [0, 1, 2] : undefined,
  shuffledRightItems: type === "matching" ? ["", "", ""] : undefined,
  targetWord: type === "syllable" ? "" : undefined,
  syllableParts: type === "syllable" ? [""] : undefined,
});