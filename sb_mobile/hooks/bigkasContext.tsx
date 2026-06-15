import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BigkasContextType {
  selectedLevel: any | null;
  setSelectedLevel: (level: any | null) => void;
  selectedMode: any | null;
  setSelectedMode: (mode: any | null) => void;
  selectedModePhrases?: any | null;
  setSelectedModePhrases: (phrases: any | null) => void;
  bigkasResults: any | null;
  setBigkasResults: (results: any | null) => void;
  resetBigkasContext: () => void;
}

const BigkasContext = createContext<BigkasContextType | undefined>(undefined);

export const useBigkasContext = () => {
  const ctx = useContext(BigkasContext);
  if (!ctx) throw new Error("useBigkasContext must be used within BigkasProvider");
  return ctx;
};

export const BigkasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLevel, setSelectedLevelState] = useState<any>(null);
  const [selectedMode, setSelectedModeState] = useState<any>(null);
  const [selectedModePhrases, setSelectedModePhrasesState] = useState<any>(null);
  const [bigkasResults, setBigkasResultsState] = useState<any>(null);

  useEffect(() => {
    const loadStored = async () => {
      const level = await AsyncStorage.getItem("selectedLevel");
      setSelectedLevelState(level ? JSON.parse(level) : null);
      const mode = await AsyncStorage.getItem("selectedMode");
      setSelectedModeState(mode ? JSON.parse(mode) : null);
      const phrases = await AsyncStorage.getItem("selectedModePhrases");
      setSelectedModePhrasesState(phrases ? JSON.parse(phrases) : null);
      const results = await AsyncStorage.getItem("bigkasResults");
      setBigkasResultsState(results ? JSON.parse(results) : null);
    };
    loadStored();
  }, []);

  useEffect(() => {
    const storeLevel = async () => {
      if (selectedLevel) {
        await AsyncStorage.setItem("selectedLevel", JSON.stringify(selectedLevel));
      }
    };
    storeLevel();
  }, [selectedLevel]);

  useEffect(() => {
    const storeMode = async () => {
      if (selectedMode) {
        await AsyncStorage.setItem("selectedMode", JSON.stringify(selectedMode));
      }
    };
    storeMode();
  }, [selectedMode]);

  useEffect(() => {
    const storeModePhrases = async () => {
      if (selectedModePhrases) {
        await AsyncStorage.setItem("selectedModePhrases", JSON.stringify(selectedModePhrases));
      }
    };
    storeModePhrases();
  }, [selectedModePhrases]);

  useEffect(() => {
    const storeResults = async () => {
      if (bigkasResults) {
        await AsyncStorage.setItem("bigkasResults", JSON.stringify(bigkasResults));
      }
    };
    storeResults();
  }, [bigkasResults]);

  const setSelectedLevel = (levelData: any | null) => {
    setSelectedLevelState(levelData);
  };
  const setSelectedMode = (modeData: any | null) => {
    setSelectedModeState(modeData);
  };
  const setSelectedModePhrases = (phrases: any | null) => {
    setSelectedModePhrasesState(phrases);
  };
  const setBigkasResults = (resultsData: any | null) => {
    setBigkasResultsState(resultsData);
  };

  const resetBigkasContext = async () => {
    setSelectedLevelState(null);
    setSelectedModeState(null);
    setSelectedModePhrasesState(null);
    setBigkasResultsState(null);

    await AsyncStorage.multiRemove([
      "selectedLevel",
      "selectedMode",
      "selectedModePhrases",
      "bigkasResults",
    ]);
  };

  return (
    <BigkasContext.Provider value={{ selectedLevel, setSelectedLevel, selectedMode, setSelectedMode, selectedModePhrases, setSelectedModePhrases, bigkasResults, setBigkasResults, resetBigkasContext }}>
      {children}
    </BigkasContext.Provider>
  );
};