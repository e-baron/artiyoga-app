import React, { useState, ReactNode } from "react";

import { NavigationContextProps } from "@/types";

interface NavigationProviderProps {
  children: ReactNode;
}

const NavigationContext = React.createContext<
  NavigationContextProps | undefined
>(undefined);

const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [activePageMenuItem, setActivePageMenuItem] = useState<string>("");
  const [activePageMenuItemIsVisible, setActivePageMenuItemIsVisible] =
    useState<boolean>(false);

  const contextValue: NavigationContextProps = {
    activePageMenuItem,
    setActivePageMenuItem,
    activePageMenuItemIsVisible,
    setActivePageMenuItemIsVisible,
  };

  return (
    <NavigationContext.Provider
      value={contextValue}
    >
    {children}
    </NavigationContext.Provider>
  );
};

export { NavigationContext, NavigationProvider };
