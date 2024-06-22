import { useState, useEffect, memo } from "react";
import runningAnimation from "../../assets/animations/animation.json";
import Lottie from "react-lottie-player";
import helper from "../../extensionScript/helper";
import "../../assets/scss/pages/_automation-runner.scss";
import AutomationStats from "./AutomationStats";
import { BoxOutIcon } from '../../assets/icons/Icons';


const AutomationRunner = ({ setrunningScript, setRequestActive, statistics, source }) => {
  const [stats, setStats] = useState(statistics);
  useEffect(() => {
    chrome.runtime.onMessage.addListener(
      async (request, sender, sendResponse) => {
        console.log("request ::: ****************************** ", request);
        switch (request.action) {
          case "FRSendCount":
            // setFRProgress(request.FriendRequestCount);
            break;

          case "profile_viewed":
            // setProfileViewed(request.profile_viewed);
            break;
          case "close":
            // console.log("Close the tabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
            window.close();
            break;

          case "stop":
            // setModalOpen(false);
            setrunningScript(false);
            setRequestActive("groups");
            break;

          case "showCount":
            console.log("showCount", request);
            if (request.paylaod.source === source) {
              setStats(request.paylaod)
            }
            // if(request.payload.source === "groups"){
            //     setStats(request.payload)
            // }
            // if(request.payload.source === "post"){
            //     setStats(request.payload)
            // }
            // if(request.payload.source === "suggestions"){
            //     setStats(request.payload)
            // }
            break;
          default:
            break;
        }
      }
    );
  }, [])

  useEffect(() => {
    (async () => {

      const showCount = await helper.getDatafromStorage("showCount");
      // console.log("showCount :: local storage :::::::: ", showCount);
      if (showCount && showCount.source === source)
        setStats(showCount)
      const frsentcount = await helper.getDatafromStorage("FRSendCount");
      const profile_viewed = await helper.getDatafromStorage("profile_viewed");
      // console.log("frsentcount ::::::::::::: ", frsentcount)
      // console.log("profile_viewed ::::::::::::: ", profile_viewed)
      if (frsentcount !== null || !helper.isEmptyObj(frsentcount)) {
        // console.log("frsentcount ::: ", frsentcount);
        // setFRProgress(frsentcount);
      }
      if (profile_viewed !== null || !helper.isEmptyObj(profile_viewed)) {
        // console.log("profile_viewed ::: ", profile_viewed);
        // setProfileViewed(profile_viewed);
      }
    })();
  }, []);

  const PORTAL_URL = process.env.REACT_APP_APP_URL;

  const pauseSendingFR = async (e) => {
    e.preventDefault();
    await helper.saveDatainStorage("runAction", "pause");
    chrome.runtime.sendMessage({ action: "pause" });
    setrunningScript(false);
    setRequestActive("groups");
  };

  return (
    <div className="friender-running-wraper">

      <div className="animation-wraper">
        <figure>
          <Lottie
            //loop = {4}
            animationData={runningAnimation}
            play
            background="transparent"
            style={{ width: "255px", height: "147px" }}
          />
        </figure>

        {true && <div className="loader-wraper">
          <p>Making friends based on your choices</p>
          <div class="progressbar">
            <div
              class="progress-status"
              style={{ width: (stats.queueCount / stats.memberCount) * 100 + "%" }}
            ></div>
          </div>
        </div>}
      </div>

      <AutomationStats
        // profileViewed={profileViewed}
        // fRProgress={fRProgress}
        automationrunner={true}
        setrunningScript={setrunningScript}
        pauseSendingFR={pauseSendingFR}
        setRequestActive={setRequestActive}
        stats={stats}
        source={source}
      >
        <p className="result-view">
          {" "}
          <a href={PORTAL_URL + "/friends/friends-queue"} target="_blank">
            <span>View your results</span>
            <span className="result-view-icon"><BoxOutIcon /></span>
          </a>{" "}
        </p>
      </AutomationStats>



      {/* <div className="note-inline text-center">
        Pause and modify your choice anytime and Run again
      </div> */}
    </div>
  );
};

export default memo(AutomationRunner);
