import React, { createContext, useContext, useEffect, useState } from "react";

interface BigkasContextType {
  selectedLevel: any | null;
  setSelectedLevel: (level: string | null) => void;
  selectedMode: string | null;
  setSelectedMode: (mode: string | null) => void;
  bigkasResults: any | null;
  setBigkasResults: (results: any | null) => void;
  selectedGradeLevel: string;
  setSelectedGradeLevel: (gradeLevel: string) => void;
}

const BigkasContext = createContext<BigkasContextType | undefined>(undefined);

export const useBigkasContext = () => {
  const ctx = useContext(BigkasContext);
  if (!ctx) throw new Error("useBigkasContext must be used within BigkasProvider");
  return ctx;
};

export const BigkasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLevel, setSelectedLevelState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedLevel");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedMode, setSelectedModeState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedMode");
    return stored ? JSON.parse(stored) : null;
  });
  const [bigkasResults, setBigkasResultsState] = useState<any>(() => {
    const stored = sessionStorage.getItem("bigkasResults");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedGradeLevel, setSelectedGradeLevelState] = useState<string>(() => {
    const stored = sessionStorage.getItem("selectedGradeLevel");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (selectedLevel) {
      sessionStorage.setItem("selectedLevel", JSON.stringify(selectedLevel));
    } else {
      sessionStorage.removeItem("selectedLevel");
    }
  }, [selectedLevel]);
  useEffect(() => {
    if (selectedMode) {
      sessionStorage.setItem("selectedMode", JSON.stringify(selectedMode));
    } else {
      sessionStorage.removeItem("selectedMode");
    }
  }, [selectedMode]);
  useEffect(() => {
    if (bigkasResults) {
      sessionStorage.setItem("bigkasResults", JSON.stringify(bigkasResults));
    } else {
      sessionStorage.removeItem("bigkasResults");
    }
  }, [bigkasResults]);
  useEffect(() => {
    if (selectedGradeLevel) {
      sessionStorage.setItem("selectedGradeLevel", JSON.stringify(selectedGradeLevel));
    } else {
      sessionStorage.removeItem("selectedGradeLevel");
    }
  }, [selectedGradeLevel]);

  const setSelectedLevel = (levelData: any | null) => {
    setSelectedLevelState(levelData);
  };
  const setSelectedMode = (modeData: any | null) => {
    setSelectedModeState(modeData);
  };
  const setBigkasResults = (resultsData: any | null) => {
    setBigkasResultsState(resultsData);
  };
  const setSelectedGradeLevel = (gradeLevel: string) => {
    setSelectedGradeLevelState(gradeLevel);
  };

  return (
    <BigkasContext.Provider value={{ selectedLevel, setSelectedLevel, selectedMode, setSelectedMode, bigkasResults, setBigkasResults, selectedGradeLevel, setSelectedGradeLevel }}>
      {children}
    </BigkasContext.Provider>
  );
};