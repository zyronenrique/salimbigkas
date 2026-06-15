import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface LogRegContextType {
    reauthenticate: boolean;
    setReauthenticate: (reauth: boolean) => void;
    proceedToPassword: boolean;
    setProceedToPassword: (proceed: boolean) => void;
    email: string;
    setEmail: (email: string) => void;
    fullname: string;
    setFullname: (fullname: string) => void;
    role: string;
    setRole: Dispatch<SetStateAction<string>>;
    gradeLevel: string;
    setGradeLevel: Dispatch<SetStateAction<string>>;
    password: string;
    setPassword: (password: string) => void;
    icon: string;
    setIcon: (icon: string) => void;
    resetState: () => void;
}

const LogRegContext = createContext<LogRegContextType | undefined>(undefined);

export const useLogRegContext = () => {
    const ctx = useContext(LogRegContext);
    if (!ctx) throw new Error("useLogRegContext must be used within LogRegProvider");
    return ctx;
};

export const LogRegProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reauthenticate, setReauthenticateState] = useState<boolean>(false);
    const [proceedToPassword, setProceedToPasswordState] = useState<boolean>(false);
    const [icon, setIconState] = useState<string>("");
    const [email, setEmailState] = useState<string>("");
    const [fullname, setFullnameState] = useState<string>("");
    const [role, setRoleState] = useState<string>("");
    const [gradeLevel, setGradeLevelState] = useState<string>("");
    const [password, setPasswordState] = useState<string>("");

    const setReauthenticate = (reauth: boolean) => setReauthenticateState(reauth);
    const setProceedToPassword = (proceed: boolean) => setProceedToPasswordState(proceed);
    const setIcon = (icon: string) => setIconState(icon);
    const setEmail = (email: string) => setEmailState(email);
    const setFullname = (fullname: string) => setFullnameState(fullname);
    const setRole = setRoleState;
    const setGradeLevel = setGradeLevelState;
    const setPassword = (password: string) => setPasswordState(password);

    const resetState = () => {
        setReauthenticateState(false);
        setProceedToPasswordState(false);
        setIconState("");
        setEmailState("");
        setFullnameState("");
        setRoleState("");
        setGradeLevelState("");
        setPasswordState("");
    };
    
    return (
        <LogRegContext.Provider value={{ reauthenticate, setReauthenticate, proceedToPassword, setProceedToPassword, icon, setIcon, email, setEmail, fullname, setFullname, role, setRole, gradeLevel, setGradeLevel, password, setPassword, resetState }}>
            {children}
        </LogRegContext.Provider>
    );
};