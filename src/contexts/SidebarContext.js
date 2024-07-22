import React, { useState, useEffect, useContext, createContext } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [activeMenu, setActiveMenu] = useState('/');
  
    return (
      <SidebarContext.Provider value={{ activeMenu, setActiveMenu }}>
        {children}
      </SidebarContext.Provider>
    );
  };
  
  export const useSidebar = () => {
    return useContext(SidebarContext);
  };