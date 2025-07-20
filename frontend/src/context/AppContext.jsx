import { createContext, useContext, useState } from "react";

// 1. Create context
const AppContext = createContext();

// 2. Create provider
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState("Dumb");

  const updateUser = (name) => {
    setUser(name);
  };

  return (
    <AppContext.Provider value={{ user, updateUser }}>
      {children}
    </AppContext.Provider>
  );
};

export let useAppContext = () => {
  return useContext(AppContext);
};
