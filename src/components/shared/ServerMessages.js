import { useEffect } from "react";
import {  CrossWhite } from "../../assets/icons/Icons";
import "../../assets/scss/pages/_serverMessage.scss";
const ServerMessages = ({
  type="error",
  icon="i",
  headerTxt="Message",
  msgText = "Something went wrong!",
  openNotification,
  setOpenNotification,
}) => {
  useEffect(()=>{
    if (openNotification) {
      const timeoutId = setTimeout(() => {
        setOpenNotification(false);
      }, 4500);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  },[openNotification])
  return (
    <div className={`server-message ${type}`}>
      <div className="server-message-wraper">
        <span className="icon-wraper">
          {icon}
        
        </span>
        <span className="server-message-info">
          <p>{headerTxt}</p>
          <p>{msgText}</p>
          {/* <p>Error code 404</p> */}
        </span>
        <span
          className="close-message"
          onClick={() => {
            setOpenNotification(false);
          }}
        >
          <CrossWhite />
        </span>
        <span className="alert-border"></span>
      </div>
    </div>
  );
};

export default ServerMessages;
