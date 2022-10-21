import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage";

import "./css/header.css";

// import Logo from "../../assets/images/logo.png";
import SVGAsset from "./SVGAsset";
// import { useEffect } from "react/cjs/react.development";
const kyubiSettings = require("../../kyubiSettings.json");

const HeaderExtension = (props) => {
  let history = useNavigate();

  const [headerMenu, setHeaderMenu] = useState(false);
  const [logo, setLogo] = useState('');
  const [mailTo, setMailTo] = useState('');
  const [alert, setAlert] = useState(false);

  useEffect(()=>{
    // console.log("kubisettings data : ", kyubiSettings.logo.primary_logo);
    setLogo(kyubiSettings.logo.primary_logo);
    setMailTo(kyubiSettings.mailTo)
  },[])

  /**
   * erase user info fro localstorae and o to login
   * @param {* onClick event} e 
   */
  const logout = (e) =>{
    e.preventDefault();
    // console.log("pressed on logout button");
    chrome.storage.local.remove(["user"],()=>{
      history('/');
      props.logDataChange(false)
    })
  }

  /**
   * Show popup for cancel account
   * @param {* onClick event} e 
   */
  const cancelAccount = (e) => {
    e.preventDefault();
    setAlert(true);
  }

  /**
   * close popup for cancel account
   * @param {* onClick event} e 
   */
  const closeAlert = (e) => {
    e.preventDefault();
    setAlert(false);
  }

  return (
    <>
      <header className="header d-flex f-align-center f-justify-between">
        <Link className="logo_header d-inline-f" to="/">
          <img src={logo} alt="Logo" />
        </Link>

        {props.logState && (
          <div className="menuHeader">
            <button
              className="btn triggerHeader no_shadow"
              onClick={() => setHeaderMenu(true)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            {headerMenu && (
              <div className="menuHeaderBody">
                <button
                  className="btn_inline closeMenu"
                  onClick={() => setHeaderMenu(false)}
                ></button>
                <ul>
                  <li>
                    <Link to="/" onClick={() => setHeaderMenu(false)}>
                      <figure>
                        <SVGAsset type="view-stats" />
                      </figure>
                      <span>View stats</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/engagement-modes"
                      onClick={() => setHeaderMenu(false)}
                    >
                      <figure>
                        <SVGAsset type="modes" />
                      </figure>
                      <span>Set-up modes</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/engagement-portal"
                      target="_blank"
                      onClick={() => setHeaderMenu(false)}
                    >
                      <figure>
                        <SVGAsset type="external" />
                      </figure>
                      <span>Go to portal</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/change-password"
                      onClick={() => setHeaderMenu(false)}
                    >
                      <figure>
                        <SVGAsset type="change-password" />
                      </figure>
                      <span>Change Password</span>
                    </Link>
                  </li>
                  {mailTo && mailTo.length && <li>
                    <Link
                      to="#"
                      onClick={(e) => {setHeaderMenu(false); cancelAccount(e);}}
                    >
                      <figure>
                        <SVGAsset type="lock" />
                      </figure>
                      <span>Cancel Account</span>
                    </Link>
                  </li>}
                  <li>
                    <a href="javascript:void(0)" onClick={(e)=>{logout(e)}}>
                      <figure>
                        <SVGAsset type="logout" />
                      </figure>
                      <span>Log out</span>
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        {props.logState && (
          <div className="logTime">(UTC) 15:18 Monday, 4 October 2021</div>
        )}
      </header>
      {alert && <AlertMessage
        type="warning"
        headerText="Cancellation"
        contentAlert={
          <>
            Mail us in this email id: <a href={`mailto:${kyubiSettings.mailTo}`}>{kyubiSettings.mailTo}</a>
          </>
        }
        onClick = {(e)=>closeAlert(e)}
      />}
    </>
  );
};

export default HeaderExtension;
