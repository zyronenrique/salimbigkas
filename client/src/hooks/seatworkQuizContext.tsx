import React, { createContext, useContext, useEffect, useState } from "react";

interface SeatworkQuizContextType {
  selectedQuiz: any | null;
  setSelectedQuiz: (quizData: any | null) => void;
  selectedSeatwork: any | null;
  setSelectedSeatwork: (seatworkData: any | null) => void;
  quizResults: any | null;
  setQuizResults: (results: any | null) => void;
  seatworkResults: any | null;
  setSeatworkResults: (results: any | null) => void;
  selectedClassId: string;
  setSelectedClassId: (classId: string) => void;
}

const SeatworkQuizContext = createContext<SeatworkQuizContextType | undefined>(undefined);

export const useSeatworkQuizContext = () => {
  const ctx = useContext(SeatworkQuizContext);
  if (!ctx) throw new Error("useSeatworkQuizContext must be used within SeatworkQuizProvider");
  return ctx;
};

export const SeatworkQuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedQuiz, setSelectedQuizState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedQuiz");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedSeatwork, setSelectedSeatworkState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedSeatwork");
    return stored ? JSON.parse(stored) : null;
  });
  const [quizResults, setQuizResultsState] = useState<any>(() => {
    const stored = sessionStorage.getItem("quizResults");
    return stored ? JSON.parse(stored) : null;
  });
  const [seatworkResults, setSeatworkResultsState] = useState<any>(() => {
    const stored = sessionStorage.getItem("seatworkResults");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedClassId, setSelectedClassIdState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedClassId");
    return stored ? JSON.parse(stored) : "";
  });

  useEffect(() => {
    if (selectedQuiz) {
      sessionStorage.setItem("selectedQuiz", JSON.stringify(selectedQuiz));
    } else {
      sessionStorage.removeItem("selectedQuiz");
    }
  }, [selectedQuiz]);
  useEffect(() => {
    if (selectedSeatwork) {
      sessionStorage.setItem("selectedSeatwork", JSON.stringify(selectedSeatwork));
    } else {
      sessionStorage.removeItem("selectedSeatwork");
    }
  }, [selectedSeatwork]);
  useEffect(() => {
    if (quizResults) {
      sessionStorage.setItem("quizResults", JSON.stringify(quizResults));
    } else {
      sessionStorage.removeItem("quizResults");
    }
  }, [quizResults]);
  useEffect(() => {
    if (seatworkResults) {
      sessionStorage.setItem("seatworkResults", JSON.stringify(seatworkResults));
    } else {
      sessionStorage.removeItem("seatworkResults");
    }
  }, [seatworkResults]);
  useEffect(() => {
    if (selectedClassId) {
      sessionStorage.setItem("selectedClassId", JSON.stringify(selectedClassId));
    } else {
      sessionStorage.removeItem("selectedClassId");
    }
  }, [selectedClassId]);

  const setSelectedQuiz = (quizData: any | null) => {
    setSelectedQuizState(quizData);
  };
  const setSelectedSeatwork = (seatworkData: any | null) => {
    setSelectedSeatworkState(seatworkData);
  };
  const setQuizResults = (results: any | null) => {
    setQuizResultsState(results);
  };
  const setSeatworkResults = (results: any | null) => {
    setSeatworkResultsState(results);
  };
  const setSelectedClassId = (classId: string) => {
    setSelectedClassIdState(classId);
  };

  return (
    <SeatworkQuizContext.Provider value={{ 
      selectedQuiz, 
      setSelectedQuiz, 
      selectedSeatwork, 
      setSelectedSeatwork, 
      quizResults, 
      setQuizResults, 
      seatworkResults, 
      setSeatworkResults,
      selectedClassId, 
      setSelectedClassId,
    }}>
      {children}
    </SeatworkQuizContext.Provider>
  );
};