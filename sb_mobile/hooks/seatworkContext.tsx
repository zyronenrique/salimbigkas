import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SeatworkContextType {
  selectedSeatwork: any | null;
  setSelectedSeatwork: (seatworkData: any | null) => void;
  results: any | null;
  setResults: (resultsData: any | null) => void;
  resetSeatworkContext: () => void;
}

const SeatworkContext = createContext<SeatworkContextType | undefined>(undefined);

export const useSeatworkContext = () => {
  const ctx = useContext(SeatworkContext);
  if (!ctx) throw new Error("useSeatworkContext must be used within SeatworkProvider");
  return ctx;
};

export const SeatworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSeatwork, setSelectedSeatworkState] = useState<any>(null);
  const [results, setResultsState] = useState<any>(null);

  useEffect(() => {
    const loadStored = async () => {
      const seatwork = await AsyncStorage.getItem("selectedSeatwork");
      setSelectedSeatworkState(seatwork ? JSON.parse(seatwork) : null);
      const seatworkResults = await AsyncStorage.getItem("seatworkResults");
      setResultsState(seatworkResults ? JSON.parse(seatworkResults) : null);
    };
    loadStored();
  }, []);

  useEffect(() => {
    const storeSeatwork = async () => {
      if (selectedSeatwork) {
        await AsyncStorage.setItem("selectedSeatwork", JSON.stringify(selectedSeatwork));
      }
    };
    storeSeatwork();
  }, [selectedSeatwork]);

  useEffect(() => {
    const storeResults = async () => {
      if (results) {
        await AsyncStorage.setItem("seatworkResults", JSON.stringify(results));
      }
    };
    storeResults();
  }, [results]);

  const setSelectedSeatwork = (seatworkData: any | null) => {
    setSelectedSeatworkState(seatworkData);
  };

  const setResults = (resultsData: any | null) => {
    setResultsState(resultsData);
  };

  const resetSeatworkContext = async () => {
    setSelectedSeatworkState(null);
    setResultsState(null);

    await AsyncStorage.multiRemove([
      "selectedSeatwork",
      "seatworkResults",
    ]);
  };

  return (
    <SeatworkContext.Provider value={{ selectedSeatwork, setSelectedSeatwork, results, setResults, resetSeatworkContext }}>
      {children}
    </SeatworkContext.Provider>
  );
};