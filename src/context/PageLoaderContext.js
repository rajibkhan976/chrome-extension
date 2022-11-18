import { createContext, useState } from "react";

const LoaderContext = createContext()

const LoaderContextProvider = (props) => {
    const [pageLoaderMode, setPageLoaderMode] = useState(false)

    const switchLoaderOn = () => {
        setPageLoaderMode(true)
    }
    const switchLoaderOff = () => {
        setPageLoaderMode(false)
    }

    return (
     <>
        <LoaderContext.Provider value={{pageLoaderMode, switchLoaderOn, switchLoaderOff}}>
            {props.children}
        </LoaderContext.Provider>
     </>   
    );
}
 
export {LoaderContext, LoaderContextProvider};