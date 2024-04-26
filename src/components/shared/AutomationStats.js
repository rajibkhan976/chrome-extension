import { useEffect, useState } from "react";
import helper from "../../extensionScript/helper";
import Modal from "./Modal";
import { Bolt } from "./SVGAsset";


const AutomationStats = (props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [fRProgress, setFRProgress] = useState(0);
  const [profileViewed, setProfileViewed] = useState(0);

  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      // console.log("request ::: ****************************** ", request);
      switch (request.action) {
        case "FRSendCount":
          setFRProgress(request.FriendRequestCount);
          break;

        case "profile_viewed":
          setProfileViewed(request.profile_viewed);
          break;


        case "stop":
          setModalOpen(false);
          props.setrunningScript(false);
          props.setRequestActive("groups");
          break;

        default:
          break;
      }
    }
  );

  useEffect(() => {
    (async () => {
      const frsentcount = await helper.getDatafromStorage("FRSendCount");
      const profile_viewed = await helper.getDatafromStorage("profile_viewed");
      // console.log("frsentcount ::::::::::::: ", frsentcount)
      // console.log("profile_viewed ::::::::::::: ", profile_viewed)
      if (frsentcount !== null || !helper.isEmptyObj(frsentcount)) {
        // console.log("frsentcount ::: ", frsentcount);
        setFRProgress(frsentcount);
      }
      if (profile_viewed !== null || !helper.isEmptyObj(profile_viewed)) {
        // console.log("profile_viewed ::: ", profile_viewed);
        setProfileViewed(profile_viewed);
      }
    })();
  }, []);

  const stopSendingFR = async () => {
    //e.preventDefault();
    await helper.removeDatafromStorage("FRSendCount");
    await helper.removeDatafromStorage("profile_viewed");
    await helper.saveDatainStorage("runAction", "stop");
    chrome.runtime.sendMessage({ action: "stop" });
    setModalOpen(false);
    props.setrunningScript && props.setrunningScript(false);
    props.setIsPaused && props.setIsPaused(false)
    props.setRequestActive("groups");
  };


  return (
    <div className="auto-stats">
      <Modal
        modalType="delete-type"
        modalIcon={"Icon"}
        headerText={"Stop making friends"}
        bodyText={
          "This will stop sending friend request. Are you sure you want to stop this run?"
        }
        open={modalOpen}
        setOpen={setModalOpen}
        ModalFun={stopSendingFR}
        btnText={"Yes, Stop"}
      />

      {/* {props.automationrunner && <div className="loader-wraper">
        <p>Making friends based on your choices</p>
        <div class="progressbar">
          <div
            class="progress-status"
            style={{ width: (fRProgress / profileViewed) * 100 + "%" }}
          ></div>
        </div>
      </div>} */}

      <div className="progress-infos-wraper d-flex d-flex-center">
        <div className="progress-infos profile-viewed">
          <h4>{profileViewed}</h4>
          <p>Profile viewed</p>
        </div>
        <div className="progress-infos request-sent">
          <h4>{fRProgress}</h4>
          <p>Friend request sent</p>
        </div>
      </div>

      {props?.children && props.children}

      {/* <div className="action-btn-wraper d-flex d-flex-center">
        <button
          className="btn btn-theme pause-btn"
          onClick={(e) => props.pauseSendingFR(e)}
        >
          <figure>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4.5"
                y="3.75"
                width="3"
                height="10.5"
                rx="1"
                fill="#BDBDBD"
              />
              <rect
                x="10.5"
                y="3.75"
                width="3"
                height="10.5"
                rx="1"
                fill="#BDBDBD"
              />
            </svg>
          </figure>
          <span>Pause & Edit</span>
        </button>

        <button className="btn stop-btn" onClick={() => setModalOpen(true)}>
          <figure>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clip-rule="evenodd"
                d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75ZM5.25 10H12.75V8H5.25V10Z"
                fill="white"
              />
            </svg>
          </figure>
          <span>Stop</span>
        </button>

        <button
          className="btn btn-theme w-100 btn-resume"

          onClick={(e) => props.runFrinderHandle(true)}
          disabled={props.disabled}
        >
          <figure className="btn-ico">
            <Bolt />
          </figure>
          <span>Resume</span>
        </button>

      </div> */}

    </div>
  );
}

export default AutomationStats;