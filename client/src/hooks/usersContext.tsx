import React, { createContext, useContext, useEffect, useState } from "react";

interface UsersContextType {
  selectedUser: any | null;
  setSelectedUser: (userData: any | null) => void;
  isEditingUser: boolean;
  setIsEditingUser: (isEditing: boolean) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useUsersContext = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsersContext must be used within UsersProvider");
  return ctx;
};

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedUser, setSelectedUserState] = useState<any>(() => {
    const stored = sessionStorage.getItem("selectedUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [isEditingUser, setIsEditingUserState] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("isEditingUser");
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    if (selectedUser) {
      sessionStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    } else {
      sessionStorage.removeItem("selectedUser");
    }
  }, [selectedUser]);
  useEffect(() => {
    if (isEditingUser) {
      sessionStorage.setItem("isEditingUser", JSON.stringify(isEditingUser));
    } else {
      sessionStorage.removeItem("isEditingUser");
    }
  }, [isEditingUser]);

  const setSelectedUser = (userData: any | null) => {
    setSelectedUserState(userData);
  };
  const setIsEditingUser = (isEditing: boolean) => {
    setIsEditingUserState(isEditing);
  };

  return (
    <UsersContext.Provider value={{ selectedUser, setSelectedUser, isEditingUser, setIsEditingUser }}>
      {children}
    </UsersContext.Provider>
  );
};