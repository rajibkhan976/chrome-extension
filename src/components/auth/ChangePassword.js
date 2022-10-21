import React, { Suspense, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../shared/Loader";
import SVGAsset from "../shared/SVGAsset";
import { changePassword } from "../../service/Auth";
import AlertMessage from "../shared/AlertMessage";

import "../dashboard/css/dashboard.css";

const ChangePassword = () => {

  let history = useNavigate();

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cNewpassword, setCNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [cNewpasswordError, setCNewpasswordError] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
  }, []);

  const changeCls = (e) => {
    setPassword(e.target.value)
  }

  const changeNps = (e) => {
    setNewPassword(e.target.value)
  }

  const changeCnps = (e) => {
    setCNewPassword(e.target.value)
  }

  const getValid = async (e) => {
    e.preventDefault();
    if (!password.length)
      setPasswordError("Please Provide Password");
    else if (password.length < 6)
      setPasswordError("Password legnth must be minimum 6.")
    else if (!newPassword.length)
      setNewPasswordError("Please Provide Password")
    else if (newPassword.length < 6)
      setNewPasswordError("Password legnth must be minimum 6.")
    else if (!cNewpassword.length)
      setCNewpasswordError("Please Provide Password")
    else if (cNewpassword.length < 6)
      setCNewpasswordError("Password legnth must be minimum 6.")
    else if (password === newPassword)
      setNewPasswordError("Please provide different new password.")
    else if (newPassword !== cNewpassword)
      setCNewpasswordError("New password and confirm new password should be same.")
    else {
      setPasswordError("")
      setNewPasswordError("")
      setCNewpasswordError("")
      changePasswordHit(password, newPassword, cNewpassword)
    }
  }

  const changePasswordHit = async (password, newPassword, cNewpassword) => {
    // const email = JSON.parse(localStorage.getItem('user')).email;
    let email, token;
    chrome.storage.local.get(["user"], async (res)=>{
      console.log("res ::: ", res);
      console.log("res.user ::: ", res.user);
      token = res && res.user && res.user.token
      email = res && res.user && res.user.email
      console.log("email : ", email);
      console.log("token : ", token);
      const body = {
        // extensionId : configStore.extId,
        email: email,
        password: password,
        confirmNewPassword: cNewpassword,
        newPassword: newPassword
      }
      console.log("body : ", body);
      const respose = await changePassword(body, token);
      console.log("response : ", respose);
      if (respose && respose.status) {
        // alert(respose.message);
        setAlert(true);
        setAlertMsg(respose.message);
        setAlertText("Change Password");
      } else {
        setAlert(true);
        setAlertMsg("Something went wrong. Could not able to change the password.");
        setAlertType("error");
        setAlertText("Change Password")
        // alert();
      }
    })
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
    history('/')
  }

  return (
    <>
    <div className="em_ext_content">
      <div className="ext_main h-100 dashboardBody changePasswordExt">
        <header className="innerBodyHeader">
          <Link to="/" className="inline-btn btn-horizontal-gradient-2 r-30">
            <Suspense fallback={<Loader />}>
              <SVGAsset type="back_arrow" />
            </Suspense>
          </Link>
          <h2>Change Password</h2>
        </header>

        <div className="dashboardStats">
          <form autoComplete="off">
            <div className="form-group">
              <label>Current Password</label>
              <div className="form-row">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Present Password"
                  onChange={changeCls}
                  value={password}
                />
              </div>
              {passwordError && <div className="error">{passwordError}</div>}
            </div>
            <div className="form-group">
              <label>Change Password</label>
              <div className="form-row">
                <input
                  type="password"
                  className="form-control"
                  placeholder="New Password"
                  onChange={changeNps}
                  value={newPassword}
                />
              </div>
              {newPasswordError && <div className="error">{newPasswordError}</div>}
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="form-row">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm New Password"
                  onChange={changeCnps}
                  value={cNewpassword}
                />
              </div>
              {cNewpasswordError && <div className="error">{cNewpasswordError}</div>}
            </div>

            <div className="form-group">
              <div className="form-row">
                <button className="btn btn-static-theme" onClick={(e) => getValid(e)}>
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

export default ChangePassword;
