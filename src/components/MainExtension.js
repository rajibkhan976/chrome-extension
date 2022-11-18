import { useContext, useState } from "react";

import { BrowserRouter } from "react-router-dom";

import HeaderExtension from "./shared/HeaderExtension.js";
import FooterExtension from "./shared/FooterExtension.js";
import ServerMessages from "./shared/ServerMessages.js";
// import "../assets/scss/pages/_messages.scss";
// import {EditIcon, DeleteIcon, DragIcon, ServerError, CrossWhite} from "../assets/icons/Icons";

import AppRoutes from "../routes.js";
import { ModeContext } from "../context/ThemeContext";
import NotInFacebookAlert from "./shared/NotInFacebookAlert.js";

const MainExtension = () => {
  const { darkMode } = useContext(ModeContext);
  const [notInFb, setNotInFb] = useState(false)

  return (
    <div className={darkMode ? 
      `fr-main theme-default d-flex d-flex-column ${notInFb && 'outsideFb'}` : 
      `fr-main d-flex d-flex-colum ${notInFb && 'outsideFb'}`}>
      {!notInFb ? <BrowserRouter>
        <HeaderExtension />
        <AppRoutes />
        <FooterExtension />
        {/* <ServerMessages /> */}
      </BrowserRouter> : 
      <NotInFacebookAlert />}
    </div>
  );
};

export default MainExtension;
