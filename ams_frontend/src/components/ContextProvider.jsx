import React from "react";
import SliderContext from "./ContexApi";
import { useState } from "react";

const SliderContextProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <SliderContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SliderContext.Provider>
  );
};

export default SliderContextProvider;
