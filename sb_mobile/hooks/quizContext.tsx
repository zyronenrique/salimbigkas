import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface QuizContextType {
  selectedQuiz: any | null;
  setSelectedQuiz: (quizData: any | null) => void;
  results: any | null;
  setResults: (resultsData: any | null) => void;
  resetQuizContext: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuizContext = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuizContext must be used within QuizProvider");
  return ctx;
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedQuiz, setSelectedQuizState] = useState<any>(null);
  const [results, setResultsState] = useState<any>(null);

  useEffect(() => {
    const loadStored = async () => {
      const quiz = await AsyncStorage.getItem("selectedQuiz");
      setSelectedQuizState(quiz ? JSON.parse(quiz) : null);
      const quizResults = await AsyncStorage.getItem("quizResults");
      setResultsState(quizResults ? JSON.parse(quizResults) : null);
    };
    loadStored();
  }, []);

  useEffect(() => {
    const storeQuiz = async () => {
      if (selectedQuiz) {
        await AsyncStorage.setItem("selectedQuiz", JSON.stringify(selectedQuiz));
      }
    };
    storeQuiz();
  }, [selectedQuiz]);

  useEffect(() => {
    const storeResults = async () => {
      if (results) {
        await AsyncStorage.setItem("quizResults", JSON.stringify(results));
      }
    };
    storeResults();
  }, [results]);

  const setSelectedQuiz = (quizData: any | null) => {
    setSelectedQuizState(quizData);
  };

  const setResults = (resultsData: any | null) => {
    setResultsState(resultsData);
  };

  const resetQuizContext = async () => {
    setSelectedQuizState(null);
    setResultsState(null);

    await AsyncStorage.multiRemove([
      "selectedQuiz",
      "quizResults",
    ]);
  };

  return (
    <QuizContext.Provider value={{ selectedQuiz, setSelectedQuiz, results, setResults, resetQuizContext }}>
      {children}
    </QuizContext.Provider>
  );
};