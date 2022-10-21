import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { adminLogin, saveFbUserInfoDB } from "../../service/Auth";
import "./css/auth.css";
import Loader from "../shared/Loader";
import loginHelper from "../../helper/helper";
import AlertMessage from "../shared/AlertMessage";


const kyubiSettings = require("../../kyubiSettings.json");

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loader, setLoader] = useState(false);
  const [alert, setAlert] = useState(false);

  const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let history = useNavigate();

  /**
   * setting state of email from email input box
   * @param {* onChange event} e 
   */
  const changeEmail = (e) => {
    // console.log(e.target.value);
    setEmail(e.target.value)
  }

  /**
   * setting state of password from password input box
   * @param {* onChange event} e 
   */
  const changeCls = (e) => {
    setPassword(e.target.value)
  }

  /**
   * validate email and password from input boxes after click on login buton
   * @param {* onClick event} event 
   */
  const getValid = async (event) => {
    event.preventDefault();
    if (!email.length)
      setEmailError("Please Provide email")
    else if (!email.match(regexEmail))
      setEmailError("Please Provide proper email")
    else if (!password.length)
      setPasswordError("Please Provide Password")
    else if (password.length < 6)
      setPasswordError("Password legnth must be minimum 6.")
    else {
      setPasswordError("")
      setEmailError("")
      setLoader(true)
      getDeviceId(email, password);
    }
  }

  /**
   * hit the login api from kyubiSettings urls to get response
   * @param {* email provided by user} email 
   * @param {* password provided by user} password 
   * @param {* deviceID is unique browser id for a unique device} deviceID 
   * @param {* value of confirmLogout for body of post loin api} confirmLogout 
   */
  const loginToDemo = async (email, password, deviceID, confirmLogout) => {
    const body = {
      extensionId: kyubiSettings.extId,
      email: email,
      password: password,
      deviceId: deviceID,
      confirmLogout: confirmLogout,
      // subscription: subscription ? subscription : null
    }
    // console.log("body : ", body);
    const respose = await adminLogin(body);
    // console.log("response : ", respose);
    if (respose.data) {
      setLoader(false);
      if (respose.data.status == true && respose.data.token) {
        saveToken(email, respose.data, deviceID);
      } else if (respose.data.status && !respose.data.token) {
        // const ConfirmMsg = alert(respose.message);
        // if (ConfirmMsg == true) {
        loginToDemo(email, password, deviceID, true);
        // } else {

        // }
      } else if (respose.data.status == false) {
        setLoader(false);
        setEmailError(respose.data.message)
      } else { }
    } else {
      setLoader(false);
      setEmailError("Something went wrong.")
    }
  }

  /**
   * save token, deviceId, email in local storage for further use
   * @param {* valid email for login} email 
   * @param {* sccess response from kyubi login api } respose 
   * @param {* deviceID is unique browser id for a unique device} deviceID 
   */
  const saveToken = async (email, respose, deviceID) => {
    // console.log(email, respose, deviceID);
    const isfbProfileInfoStored = await loginHelper.login();
    console.log("isfbProfileInfoStored : ", isfbProfileInfoStored);
    if(isfbProfileInfoStored[0])
    {
      let user = {
        email: email,
        token: respose.token,
        deviceID: deviceID,
        plan: respose.plan,
        // extId: kyubiSettings.extId
      };
      isfbProfileInfoStored[1].extensionID = kyubiSettings.extId;
      isfbProfileInfoStored[1].kyubiEmail = email;
      isfbProfileInfoStored[1].plan = respose.plan
      // console.log("isfbProfileInfoStored[1] : ", isfbProfileInfoStored[1]);
      const saveUserInfoDB = await saveFbUserInfoDB(isfbProfileInfoStored[1]);
      console.log("saveUserInfoDB : ", saveUserInfoDB);
      if(saveUserInfoDB && saveUserInfoDB.status)
      {
        chrome.storage.local.set({"fbUserInfo" : isfbProfileInfoStored[1]});

        chrome.storage.local.set({ "user": user }, async () => {
          // console.log("user info saved");
            history('/');
            props.logDataChange(true);
        })
      }
    }
    else{
      setAlert(true);
    }
  }

  /**
   * fetching deviceId
   * @param {* valid email provided from user} email 
   * @param {* password provided from user after validation} password 
   */
  const getDeviceId = (email, password) => {
    var navigator_info = window.navigator;
    var screen_info = window.screen;
    var uid = navigator_info.mimeTypes.length;
    uid += navigator_info.userAgent.replace(/\D+/g, "");
    uid += navigator_info.plugins.length;
    uid += screen_info.height || "";
    uid += screen_info.width || "";
    uid += screen_info.pixelDepth || "";
    // return uid;
    loginToDemo(email, password, uid, false)
  };

  useEffect(() => {
    if (!email.length)
      setEmailError("Please Provide email")
    else if (!email.match(regexEmail))
      setEmailError("Please Provide proper email")
    else
      setEmailError("")
  }, [email]);

  useEffect(() => {
    if (!password.length)
      setPasswordError("Please Provide Password")
    else if (password.length < 6)
      setPasswordError("Password legnth must be minimum 6.")
    else
      setPasswordError("")
  }, [password])



  /**
   * close popup for cancel account
   * @param {* onClick event} e 
   */
   const closeAlert = (e) => {
    e.preventDefault();
    setAlert(false);
  }

  const clickOkBtn = (e) => {
    e.preventDefault();
    setAlert(false);
    chrome.tabs.create({ url: "https://www.facebook.com/login" });
  }

  return (
    <>
      {loader && <Loader />}
      <div className="em_ext_content">
        <div className="ext_main h-100 d-flex f-column f-justify-center">
          <header className="innerBodyHeader">
            <h2>
              <small>Welcome</small>
              Log in to continue
            </h2>
          </header>

          <div className="auth_form">
            <form autoComplete="off">
              <div className="form-group">
                <label>Email address</label>
                <div className="form-row">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write your email"
                    onChange={changeEmail}
                    value={email}
                  />
                </div>
                {emailError && <div className="error">{emailError}</div>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="form-row">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="********"
                    onChange={changeCls}
                    value={password}
                  />
                </div>
                {passwordError && <div className="error">{passwordError}</div>}
              </div>

              <div className="form-forgot-pass text-right">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="form-group">
                <div className="form-row">
                  <button className="btn btn-static-theme" onClick={(event) => { getValid(event) }}>Log In</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {alert && <AlertMessage
        type="warning"
        headerText="Cancellation"
        contentAlert={
          <>
            <p>Please login into facebook</p>
            <button class="inline-btn btn-medium btn-vertical-gradient" onClick={(e)=>clickOkBtn(e)}>ok</button>
          </>
        }
        onClick = {(e)=>closeAlert(e)}
      />}
    </>
  );
};

export default Login;
