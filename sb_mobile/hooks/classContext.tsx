import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ClassContextType {
  allYunits: any | null;
  setAllYunits: (yunits: any | null) => void;
  selectedYunit: any | null;
  setSelectedYunit: (yunitData: any | null) => void;
  selectedLesson: any | null;
  setSelectedLesson: (lessonData: any | null) => void;
  lastViewedLesson: any | null;
  setLastViewedLesson: (lessonData: any | null) => void;
  className: string;
  setClassName: (className: string) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  mode: string;
  setMode: (mode: string) => void;
  aiRecommendations: any | null;
  setAiRecommendations: (data: any | null) => void;
  resetClassContext: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClassContext = () => {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error("useClassContext must be used within ClassProvider");
  return ctx;
};

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allYunits, setAllYunitsState] = useState<any | null>(null);
  const [selectedYunit, setSelectedYunitState] = useState<any>(null);
  const [selectedLesson, setSelectedLessonState] = useState<any>(null);
  const [lastViewedLesson, setLastViewedLessonState] = useState<any>(null);
  const [className, setClassNameState] = useState<string>("");
  const [videoUrl, setVideoUrlState] = useState<string>("");
  const [mode, setModeState] = useState<string>("");
  const [aiRecommendations, setAiRecommendationsState] = useState<any | null>(null);

  useEffect(() => {
    const loadStored = async () => {
      const yunits = await AsyncStorage.getItem("allYunits");
      setAllYunitsState(yunits ? JSON.parse(yunits) : null);
      const yunit = await AsyncStorage.getItem("selectedYunit");
      setSelectedYunitState(yunit ? JSON.parse(yunit) : null);
      const lesson = await AsyncStorage.getItem("selectedLesson");
      setSelectedLessonState(lesson ? JSON.parse(lesson) : null);
      const lastViewed = await AsyncStorage.getItem("lastViewedLesson");
      setLastViewedLessonState(lastViewed ? JSON.parse(lastViewed) : null);
      const className = await AsyncStorage.getItem("className");
      setClassNameState(className ? JSON.parse(className) : "");
      const storedVideoUrl = await AsyncStorage.getItem("videoUrl"); 
      setVideoUrlState(storedVideoUrl ? storedVideoUrl : "");
      const mode = await AsyncStorage.getItem("mode");
      setModeState(mode ? JSON.parse(mode) : "");
      const aiRecommendations = await AsyncStorage.getItem("aiRecommendations");
      setAiRecommendationsState(aiRecommendations ? JSON.parse(aiRecommendations) : null);
    };
    loadStored();
  }, []);

  useEffect(() => {
    const storeAllYunits = async () => {
      if (allYunits) {
        await AsyncStorage.setItem("allYunits", JSON.stringify(allYunits));
      }
    };
    storeAllYunits();
  }, [allYunits]);

  useEffect(() => {
    const storeYunit = async () => {
      if (selectedYunit) {
        await AsyncStorage.setItem("selectedYunit", JSON.stringify(selectedYunit));
      }
    };
    storeYunit();
  }, [selectedYunit]);

  useEffect(() => {
    const storeLesson = async () => {
      if (selectedLesson) {
        await AsyncStorage.setItem("selectedLesson", JSON.stringify(selectedLesson));
      }
    };
    storeLesson();
  }, [selectedLesson]);

  useEffect(() => {
    const storeLastViewedLesson = async () => {
      if (lastViewedLesson) {
        await AsyncStorage.setItem("lastViewedLesson", JSON.stringify(lastViewedLesson));
      }
    };
    storeLastViewedLesson();
  }, [lastViewedLesson]);

  useEffect(() => {
    const storeClassName = async () => {
      if (className) {
        await AsyncStorage.setItem("className", JSON.stringify(className));
      }
    };
    storeClassName();
  }, [className]);

  useEffect(() => {
    const storeVideoUrl = async () => {
      if (videoUrl) {
        await AsyncStorage.setItem("videoUrl", videoUrl);
      }
    };
    storeVideoUrl();
  }, [videoUrl]);

  useEffect(() => {
    const storeMode = async () => {
      if (mode) {
        await AsyncStorage.setItem("mode", JSON.stringify(mode));
      }
    };
    storeMode();
  }, [mode]);

  useEffect(() => {
    const storeAiRecommendations = async () => {
      if (aiRecommendations) {
        await AsyncStorage.setItem("aiRecommendations", JSON.stringify(aiRecommendations));
      }
    };
    storeAiRecommendations();
  }, [aiRecommendations]);

  const setAllYunits = (yunits: any | null) => {
    setAllYunitsState(yunits);
  };

  const setSelectedYunit = (yunitData: any | null) => {
    setSelectedYunitState(yunitData);
  };
  const setSelectedLesson = (lessonData: any | null) => {
    setSelectedLessonState(lessonData);
  };
  const setLastViewedLesson = (lessonData: any | null) => {
    setLastViewedLessonState(lessonData);
  };
  const setClassName = (className: string) => {
    setClassNameState(className);
  };
  const setVideoUrl = (url: string) => {
    setVideoUrlState(url);
  };
  const setMode = (mode: string) => {
    setModeState(mode);
  };
  const setAiRecommendations = (data: any | null) => {
    setAiRecommendationsState(data);
  };

  const resetClassContext = async () => {
    setAllYunitsState(null);
    setSelectedYunitState(null);
    setSelectedLessonState(null);
    setLastViewedLessonState(null);
    setClassNameState("");
    setVideoUrlState("");
    setModeState("");
    setAiRecommendationsState(null);

    await AsyncStorage.multiRemove([
      "allYunits",
      "selectedYunit",
      "selectedLesson",
      "lastViewedLesson",
      "className",
      "videoUrl",
      "mode",
      "aiRecommendations",
    ]);
  };

  return (
    <ClassContext.Provider value={{ 
      allYunits, setAllYunits, 
      selectedYunit, setSelectedYunit, 
      selectedLesson, setSelectedLesson, 
      lastViewedLesson, setLastViewedLesson, 
      className, setClassName, 
      videoUrl, setVideoUrl, 
      mode, setMode, 
      aiRecommendations, setAiRecommendations,
      resetClassContext
    }}>
      {children}
    </ClassContext.Provider>
  );
};