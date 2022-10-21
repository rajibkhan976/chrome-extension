import React, { useState, useEffect } from "react";
import "../assets/css/style.css";
import "../components/shared/css/shared.css"

import { BrowserRouter } from "react-router-dom";

import HeaderExtension from "./shared/HeaderExtension.js";
import FooterExtension from "./shared/FooterExtension.js";

import AppRoutes from "../routes.js";

const MainExtension = () => {
  const [logState, setLogState] = useState(false);
  useEffect(()=>{
    // console.log("I am in main Extension.........");
    chrome.storage.local.get(["user"], (res)=>{
      // console.log("res ::: ", res);
      // console.log("res.user ::: ", res.user);
      if(res && res.user && res.user.token){
        setLogState(true)
      }else{
        setLogState(false)
      }
    })
  },[]);

  const logDataChange = (data) => {
    data ? setLogState(true) : setLogState(false)
  }

  return (
    <div className={logState ? "em_ext_main" : "em_ext_main em_auth"}>
      <BrowserRouter>
        <HeaderExtension logState={logState } logDataChange={logDataChange} />
        <AppRoutes logState={logState} logDataChange={logDataChange} />
        <FooterExtension logState={logState} />
      </BrowserRouter>
    </div>
  );
};

export default MainExtension;
