import React, { createContext, useContext, useEffect, useState } from "react";

interface ClassContextType {
  selectedClass: any | null;
  setSelectedClass: (classData: any | null) => void;
  selectedYunit: any | null;
  setSelectedYunit: (yunitData: any | null) => void;
  selectedLesson: any | null;
  setSelectedLesson: (lessonData: any | null) => void;
  fileUrl: string;
  setFileUrl: (url: string) => void;
  pageNumber: any | null;
  setPageNumber: (pageNumber: any | null) => void;
  nextLessonNumber: number;
  setNextLessonNumber: (lessonNumber: number) => void;
  isEditMode?: boolean;
  setIsEditMode: (editMode: boolean) => void;
  selectedStudent: any | null;
  setSelectedStudent: (studentData: any | null) => void;
  isQuiz: boolean;
  setIsQuiz: (isQuiz: boolean) => void;
  isSeatWork: boolean;
  setIsSeatWork: (isSeatWork: boolean) => void;
  className: string;
  setClassName: (className: string) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClassContext = () => {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error("useClassContext must be used within ClassProvider");
  return ctx;
};

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedClass, setSelectedClassState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedClass");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedYunit, setSelectedYunitState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedYunit");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedLesson, setSelectedLessonState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedLesson");
    return stored ? JSON.parse(stored) : null;
  });
  const [fileUrl, setFileUrlState] = useState<string>(() => {
    const stored = sessionStorage.getItem("fileUrl");
    return stored ? JSON.parse(stored) : null;
  });
  const [pageNumber, setPageNumberState] = useState<any>(() => {
    const stored = sessionStorage.getItem("pageNumber");
    return stored ? JSON.parse(stored) : null;
  });
  const [isEditMode, setIsEditModeState] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("isEditMode");
    return stored ? JSON.parse(stored) : false;
  });
  const [selectedStudent, setSelectedStudentState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedStudent");
    return stored ? JSON.parse(stored) : null;
  });
  const [isQuiz, setIsQuizState] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("isQuiz");
    return stored ? JSON.parse(stored) : false;
  });
  const [isSeatWork, setIsSeatWorkState] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("isSeatWork");
    return stored ? JSON.parse(stored) : false;
  });
  const [className, setClassNameState] = useState<string>(() => {
    const stored = sessionStorage.getItem("className");
    return stored ? JSON.parse(stored) : "";
  });
  const [nextLessonNumber, setNextLessonNumberState] = useState<number>(() => {
    const stored = sessionStorage.getItem("nextLessonNumber");
    return stored ? JSON.parse(stored) : 1;
  });

  useEffect(() => {
    if (selectedClass) {
      sessionStorage.setItem("selectedClass", JSON.stringify(selectedClass));
    } else {
      sessionStorage.removeItem("selectedClass");
    }
  }, [selectedClass]);
  useEffect(() => {
    if (selectedYunit) {
      sessionStorage.setItem("selectedYunit", JSON.stringify(selectedYunit));
    } else {
      sessionStorage.removeItem("selectedYunit");
    }
  }, [selectedYunit]);
  useEffect(() => {
    if (selectedLesson) {
      sessionStorage.setItem("selectedLesson", JSON.stringify(selectedLesson));
    } else {
      sessionStorage.removeItem("selectedLesson");
    }
  }, [selectedLesson]);
  useEffect(() => {
    if (fileUrl) {
      sessionStorage.setItem("fileUrl", JSON.stringify(fileUrl));
    } else {
      sessionStorage.removeItem("fileUrl");
    }
  }, [fileUrl]);
  useEffect(() => {
    if (pageNumber) {
      sessionStorage.setItem("pageNumber", JSON.stringify(pageNumber));
    } else {
      sessionStorage.removeItem("pageNumber");
    }
  }, [pageNumber]);
  useEffect(() => {
    if (isEditMode) {
      sessionStorage.setItem("isEditMode", JSON.stringify(isEditMode));
    } else {
      sessionStorage.removeItem("isEditMode");
    }
  }, [isEditMode]);
  useEffect(() => {
    if (selectedStudent) {
      sessionStorage.setItem("selectedStudent", JSON.stringify(selectedStudent));
    } else {
      sessionStorage.removeItem("selectedStudent");
    }
  }, [selectedStudent]);
  useEffect(() => {
    if (isQuiz) {
      sessionStorage.setItem("isQuiz", JSON.stringify(isQuiz));
    } else {
      sessionStorage.removeItem("isQuiz");
    }
  }, [isQuiz]);
  useEffect(() => {
    if (isSeatWork) {
      sessionStorage.setItem("isSeatWork", JSON.stringify(isSeatWork));
    } else {
      sessionStorage.removeItem("isSeatWork");
    }
  }, [isSeatWork]);
  useEffect(() => {
    if (className) {
      sessionStorage.setItem("className", JSON.stringify(className));
    } else {
      sessionStorage.removeItem("className");
    }
  }, [className]);
  useEffect(() => {
    if (nextLessonNumber) {
      sessionStorage.setItem("nextLessonNumber", JSON.stringify(nextLessonNumber));
    } else {
      sessionStorage.removeItem("nextLessonNumber");
    }
  }, [nextLessonNumber]);

  const setSelectedClass = (classData: any | null) => {
    setSelectedClassState(classData);
  };
  const setSelectedYunit = (yunitData: any | null) => {
    setSelectedYunitState(yunitData);
  };
  const setSelectedLesson = (lessonData: any | null) => {
    setSelectedLessonState(lessonData);
  };
  const setFileUrl = (url: string) => {
    setFileUrlState(url);
  };
  const setPageNumber = (pageNumber: any | null) => {
    setPageNumberState(pageNumber);
  };
  const setIsEditMode = (editMode: boolean) => {
    setIsEditModeState(editMode);
  };
  const setSelectedStudent = (studentData: any | null) => {
    setSelectedStudentState(studentData);
  };
  const setIsQuiz = (isQuiz: boolean) => {
    setIsQuizState(isQuiz);
  };
  const setIsSeatWork = (isSeatWork: boolean) => {
    setIsSeatWorkState(isSeatWork);
  };
  const setClassName = (className: string) => {
    setClassNameState(className);
  };
  const setNextLessonNumber = (lessonNumber: number) => {
    setNextLessonNumberState(lessonNumber);
  };

  return (
    <ClassContext.Provider value={{ 
      selectedClass, 
      setSelectedClass, 
      selectedYunit, 
      setSelectedYunit, 
      selectedLesson, 
      setSelectedLesson,
      fileUrl, 
      setFileUrl,
      pageNumber,
      setPageNumber,
      nextLessonNumber, 
      setNextLessonNumber, 
      isEditMode, 
      setIsEditMode, 
      selectedStudent, 
      setSelectedStudent, 
      isQuiz, 
      setIsQuiz, 
      isSeatWork, 
      setIsSeatWork, 
      className, 
      setClassName,
    }}>
      {children}
    </ClassContext.Provider>
  );
};