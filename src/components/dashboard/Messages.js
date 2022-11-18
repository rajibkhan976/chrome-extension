import { React, memo, useCallback, useEffect, useState } from "react";
import SagementListings from "./Messages/SagementListings";
import GroupListings from "./Messages/GroupListings";
import DmfListings from "./Messages/DmfListings";
import MessageTabs from "./Messages/MessageTabs";
import "../../assets/scss/pages/_messages.scss";
import {EditIcon, DeleteIcon, DragIcon, ServerError, CrossWhite} from "../../assets/icons/Icons";

const Messages = () => {
  const [showDetails, setShowDetails] = useState(false);
  const setShowDetailsFn = (idx) => {
    setShowDetails(idx);
    //setShowDetails((current) => !current);
  };
  const setHideDetailsFn = () => {
    setShowDetails(null);
  };

  const [activeTab, setactiveTab] = useState("dmf");
  const dmfTab = () => {
    setactiveTab("dmf");
  };
  const sagementTab = () => {
    setactiveTab("sagement");
  };
  const groupTab = () => {
    setactiveTab("group");
  };



  return (
    <div className="message-page-wraper">
      <MessageTabs
        activeTab={activeTab}
        dmfTab={dmfTab}
        sagementTab={sagementTab}
        groupTab={groupTab}
      />

      {activeTab === "dmf" && (       
        <DmfListings
        setShowDetailsFn={setShowDetailsFn}
        setHideDetailsFn={setHideDetailsFn}
        showDetails={showDetails}
        />
      )}

      {activeTab === "sagement" && (
        <SagementListings
          setShowDetailsFn={setShowDetailsFn}
          setHideDetailsFn={setHideDetailsFn}
          showDetails={showDetails}
        />
      )}

      {activeTab === "group" && (
        <GroupListings
          setShowDetailsFn={setShowDetailsFn}
          setHideDetailsFn={setHideDetailsFn}
          showDetails={showDetails}
        />
      )}

      
    </div>
  );
};

export default Messages;
