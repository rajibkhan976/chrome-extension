import { createContext, useState } from "react";

const ModeContext = createContext()

const ThemeContextProvider = (props) => {
    const [darkMode, setDarkMode] = useState(true)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    return (
     <>
        <ModeContext.Provider value={{darkMode, toggleDarkMode}}>
            {props.children}
        </ModeContext.Provider>
     </>   
    );
}
 
export {ModeContext, ThemeContextProvider};