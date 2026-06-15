import { createContext, useContext, ReactNode } from "react";
import { useLogRegState } from "./useLogRegState";

type LogRegContextType = ReturnType<typeof useLogRegState>;

const LogRegContext = createContext<LogRegContextType | undefined>(undefined);

export const LogRegProvider = ({ children }: { children: ReactNode }) => {
  const logReg = useLogRegState();
  return (
    <LogRegContext.Provider value={logReg}>
      {children}
    </LogRegContext.Provider>
  );
};

export const useLogReg = () => {
  const context = useContext(LogRegContext);
  if (!context) {
    throw new Error("useLogReg must be used within a LogRegProvider");
  }
  return context;
};
