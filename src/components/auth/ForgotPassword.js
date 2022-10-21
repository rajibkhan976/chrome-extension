import React, { Suspense,  useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../service/Auth";

import Loader from "../shared/Loader";
import AlertMessage from "../shared/AlertMessage";

import "./css/auth.css";

const SVGAsset = React.lazy(() => import("../shared/SVGAsset"));

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertText, setAlertText] = useState("");

  const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  let history = useNavigate();



 /**
 * setting state of email from email input box
 * @param {* onChange event} e 
 */
const changeEmail = (e) => {
    setEmail(e.target.value)
}

useEffect(() => {
    if (!email.length) 
        setEmailError("Please Provide email")
    else if(!email.match(regexEmail))
        setEmailError("Please Provide proper email")
    else{
        setEmailError("");
    }
}, [email]);

/**
 * hit forot password kyubi api
 * @param {* valid email provided by user} email 
 */

const hitForgotPassword = async (email) => {
    // console.log("email... : ...", email);
    const resp = await forgotPassword(email);
    console.log("resp of forgot in component :: ", resp);
    if(resp.status){
      // alert(resp.message);
      setAlert(true);
      setAlertMsg(resp.message);
      setAlertText("Forgot Password");
      // history('/login');
    }else{
      setAlert(true);
      resp && resp.message ? setAlertMsg(resp.message) :  setAlertMsg("Something went wrong. Could not able to change the password.");
      setAlertType("error");
      setAlertText("Forgot Password")
    }
}

const closeAlert = (e) => {
  e.preventDefault();
  setAlert(false);
  setAlertMsg("");
  setAlertType("");
  setAlertText("")
}

const clickOkBtn = (e) => {
  e.preventDefault();
  history('/login')
}

/**
 * validate email from input fro user after click on forget password buton
 * @param {*onClick event} e 
 */
const getValid = (e) => {
  e.preventDefault()
  if(!email.length)
      setEmailError("Please Provide email")
  else if(!email.match(regexEmail))
      setEmailError("Please Provide proper email")
  else{
      setEmailError("")
      hitForgotPassword(email);
  }

}
  return (
    <>
    <div className="em_ext_content">
      <div className="ext_main h-100 d-flex f-column f-justify-center">
        <header className="innerBodyHeader">
          <Link to="/" className="inline-btn btn-horizontal-gradient-2 r-30">
            <Suspense fallback={<Loader/>}>
              <SVGAsset type="back_arrow" />
            </Suspense>
          </Link>
          <h2>
            Forgot Password?
            <small>Please enter your registered Email Id</small>
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
                  placeholder="Write your name"
                  onChange={changeEmail} 
                  value={email}
                />
              </div>
              {emailError && <div className="error">{emailError}</div>}
            </div>

            <div className="form-group">
              <div className="form-row">
                <button className="btn btn-static-theme" onClick={(e)=>{getValid(e)}}>
                  Change Password
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    {alert && <AlertMessage
      type={alertType}
      headerText={alertText}
      contentAlert={
        <>
          <div>{alertMsg}</div>
          <br/>
          <button class="inline-btn btn-medium btn-vertical-gradient" onClick={(e)=>clickOkBtn(e)}>ok</button>
        </>
      }
      onClick = {(e)=>closeAlert(e)}
    />}
    </>
  );
};

export default ForgotPassword;
