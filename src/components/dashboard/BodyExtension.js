import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Nav from "../shared/Nav";
import "../../assets/scss/pages/_main.scss"

const BodyExtension = (props) => {
  // const [dashboardActive, setDashboardActive] = useState(false);
  // console.log("I am in body extention");
  // chrome.storage.local.get(['fbUserInfo'], (resp)=>{
  //   // console.log("response from local in body ::: ", resp.fbUserInfo);
  // })

  const navigate = useNavigate()
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "checkTabUrl" });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // console.log("request ::::::::::: ", request)
      switch (request.action) {
        case "setSettingsForGroup":
          props.setPageForSentFR("setSettingsForGroup");
          navigate("/friend-request");
          break;

        default:
          break;
      }
      sendResponse(true)
    })
  }, []);

  return (
    <div className="main-content d-flex f-1"> {/** d-flex-column */}
      <Nav />
      <div className="fr-view-section f-1 d-flex d-flex-column">
        <Outlet />
      </div>
    </div>
  );
};

export default BodyExtension;
