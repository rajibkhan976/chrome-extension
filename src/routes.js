import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate, redirect } from "react-router-dom";

import BodyExtension from "./components/dashboard/BodyExtension";
import Home from "./components/home/home";
import FriendRequest from "./components/dashboard/FriendRequest";
import Messages from "./components/dashboard/Messages";
import Notes from "./components/dashboard/Notes";
import Messenger from "./components/dashboard/Messenger";

const Approutes = (props) => {
  const [settingPage, setSettingPage] = useState("")
  const setPageForSentFR = (settings) => {
    switch(settings){
      case "setSettingsForGroup" : 
                                    setSettingPage(settings);
                                    break;
      default : 
                break;
    }
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<BodyExtension setPageForSentFR={setPageForSentFR} />}
        >
          {/* 
          --- Commented out this portion as its non-function as of Sprint-3 ---
          <Route
            index
            element={
              <Home />
            }
          /> */}
          <Route
            // path="friend-request"
            index
            element={
              <FriendRequest settingPage={settingPage} />
            }
          />
          {/* <Route
            path="messages"
            element={
              <Messages />
            }
          /> */}
          {/*
          --- Commented out this portion as its non-function as of Sprint-3 ---
          <Route
            path="notes"
            element={
              <Notes />
            }
          />
          <Route
            path="messenger"
            element={
              <Messenger />
            }
          /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
};

export default Approutes;
