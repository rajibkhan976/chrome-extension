import { io } from "socket.io-client";
import helper from "./helper";
import common from "./commonScript";
import { settingsType } from "../config/config";
const APPURL = process.env.REACT_APP_APP_URL
const settingApi = process.env.REACT_APP_SETTING_API;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const unfriendApi = "https://www.facebook.com/ajax/profile/removefriendconfirm.php?dpr=1";
const action_url = "https://www.facebook.com/friends/list?opener=fr_sync";
const HEADERS = {
  "Content-Type": "application/json",
};
let socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket", "polling"], // use WebSocket first, if available
});
const schedulerIntvTime = 10;
const pendingFRIntvTime = 120;
const reFRIntvTime = 240;

let frToken =  ""; 
let tabsId;
let payload;

chrome.runtime.onInstalled.addListener((res) => {
  // sendMessageAcceptOrReject();
  // return;
  chrome.storage.local.remove(['lastAutoSyncFriendListDate']);
  chrome.storage.local.remove(['lastAutoSyncFriendListId']);
  
  reloadPortal();

  fbDtsg((fbDtsg, userID) => {
    chrome.storage.local.set({
      fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
    });
  });
  if (res && res.reason === "install") {
    chrome.tabs.create({
      url: APPURL + "/extension-success",
      active: true,
    });
  }
  chrome.alarms.clear("scheduler")
  chrome.alarms.create("scheduler", {periodInMinutes: schedulerIntvTime})
  chrome.alarms.clear("pendingFR")
  chrome.alarms.create("pendingFR", {periodInMinutes: pendingFRIntvTime})
  chrome.alarms.clear("reFriending")
  chrome.alarms.create("reFriending", {periodInMinutes: reFRIntvTime})

  return false;
});

chrome.action.onClicked.addListener(function (activeInfo) {
  // console.log("activeInfo on clicked ::::: ", activeInfo)
  setPopup(activeInfo.url);
});

const setPopup = async () => {
  const fr_token = await helper.getDatafromStorage("fr_token")
  // console.log("fr_token ::: ", fr_token)
  if(!helper.isEmptyObj(fr_token)){
    chrome.action.setPopup({ popup: "popup.html" });
  }
  else{
    chrome.tabs.create({ url: process.env.REACT_APP_APP_URL });
  }
};

const fbDtsg = (callback = null) => {
  const headers = {
    Accept : 'text/html,application/xhtml+xml,application/xml'
  };
  
  const requestOptions = {
    method: 'GET',
    headers: headers
  };
  fetch("https://www.facebook.com/", requestOptions)
    .then((e) => e.text())
    .then(async (e) => {
      // console.log("e ::: ", e)
      let userProfileData = e.match(/\{"u":"\\\/ajax\\\/qm\\\/\?[^}]*\}/gm);
      userProfileData =  userProfileData[0];
      userProfileData = JSON.parse(userProfileData);
      if(userProfileData && userProfileData.f && userProfileData.u){
        const fbDtsg = userProfileData.f;
        const userId = userProfileData.u.split("__user=")[1].split("&")[0];
        if (callback) {
          callback(fbDtsg,userId);
        }
      }else{
        getFBUserData(callback);
      }
    })
    .catch(() => {
      if (callback) {
        callback(null);
      }
    });
};

const getFBUserData = (callback, connectProfile = false) => {
  chrome.tabs.create(
    { url: 'https://www.facebook.com/me', active: false, pinned: true, selected: false },
    (tab) => {
      chrome.tabs.onUpdated.addListener(async function listener(
        tabId,
        info
      ) {
        if (info.status === "complete" && tabId === tab.id) {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.storage.local.set({ tabsId: tab.id });
          injectScript(tab.id, ["helper.js", "collectData.js"]);
          await helper.sleep(2000);
          const profileData = await chrome.tabs.sendMessage(tab.id, {action : "profileData"});
          tab && tab.id && chrome.tabs.remove(tab.id);
          // console.log("profileData :: ", profileData)
          if(profileData && !helper.isEmptyObj(profileData)){
            if (callback) {
              if(profileData.status && profileData.isFbLoggedin){
                if(connectProfile){
                  callback({
                    "text": profileData.name,
                    "path": profileData.profileUrl,
                    "uid": profileData.userId,
                    "photo": profileData.profilePicture,
                    "isFbLoggedin": true},
                  )
                }
                else
                  callback(profileData.fbDtsg, profileData.userId);
              }else
                callback(profileData)
            }
          }else{
              if (callback) 
                callback({"status"  : false});
          }
        }
      });
    }
  );

}

const injectScript = (tabId, contentScript) => {

  chrome.scripting.executeScript(
    {
      target: { tabId: parseInt(tabId) },
      files: contentScript,
    },
    () => {
      // console.log('injected script');
    }
  );
};

const syncFriendList = async (fbUserId, sendResponseExternal = null) => {
  // console.log("syncFriendList() in bg");

  chrome.storage.local.set({ lastAutoSyncFriendListDate: new Date().toJSON() });

  fbDtsg((fbDtsg, userID) => {
    chrome.storage.local.set({
      fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
    });
    chrome.storage.local.set({ lastAutoSyncFriendListDate: (new Date()).toJSON() });
    chrome.storage.local.set({ lastAutoSyncFriendListId: fbUserId });
    sendMessageToPortalScript({action: "fr_isSyncing", content: "active", type: "cookie"});
  });
  syncFriendLength((request)=>{
    // console.log("request ::: ", request)
    checkTabsActivation("fr_sync");
    chrome.tabs.create(
      { url: "https://www.facebook.com/me?opener=fr_sync", active: false, pinned: true, selected: false },
      (tab) => {
        chrome.tabs.onUpdated.addListener(async function listener(
          tabId,
          info
        ) {
          if (info.status === "complete" && tabId === tab.id) {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.storage.local.set({ tabsId: tab.id });
            injectScript(tab.id, ["helper.js", "contentScript.js"]);
          }
        });
      }
    );
  });
}

const checkTabsActivation = async (opener) => {
  const tab = await chrome.tabs.query({ url: "https://www.facebook.com/*?opener=" + opener });
  console.log("tab ::: ", tab)
  if(tab.length > 0 )
    for(let i = 0; i < tab.length; ++i){
      chrome.tabs.remove(parseInt(tab[i].id));
    }
}

chrome.runtime.onMessageExternal.addListener(async function (
  request,
  sender,
  sendResponseExternal
) {
  console.log("request ::::::: ", request)
  // console.log("sendResponseExternal : ", sendResponseExternal)
  chrome.storage.local.set({ senExternalResponse: sendResponseExternal });
  switch (request.action) {
    case "extensionInstallation":
      await helper.saveDatainStorage("fr_token", request.frLoginToken)
      sendResponseExternal(true);
      break;
    case "syncprofile":
      if (request.frLoginToken !== null) {
        await helper.saveDatainStorage("fr_token", request.frLoginToken)
        getProfileInfo((userProfileData) =>
          sendResponseExternal(userProfileData)
        );
      }else {
        sendResponseExternal({
          status: false,
          message: "Auth failed"
        });
       }
      break;
    case "syncFriendLength":
      if (request.frLoginToken == null) {
        chrome.action.setBadgeText({ text: "Not loggedin yet in Friender" });
        return;
      } else {
      await helper.saveDatainStorage("fr_token", request.frLoginToken)
        chrome.action.setBadgeText({ text: "loggedin" });
        chrome.action.setBadgeBackgroundColor({ color: "blue" });
        syncFriendLength(sendResponseExternal);
      }
      break;
    case "manualSyncFriendList":
    case "syncFriendList":
      fbDtsg((fbDtsg, userID) => {
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
      });
      chrome.tabs.create(
        { url: "https://www.facebook.com/me?opener=fr_sync", active: false, pinned: true, selected: false },
        (tab) => {
          console.log("Syncing tab ::::::::::::", tab)
          chrome.tabs.onUpdated.addListener(async function listener(
            tabId,
            info
          ) {
            if (info.status === "complete" && tabId === tab.id) {
              chrome.tabs.onUpdated.removeListener(listener);
              chrome.storage.local.set({ tabsId: tab.id });
              injectScript(tab.id, ["helper.js", "contentScript.js"]);
            }
          });
        }
      );
      break;
    case "frienderLogout":
      checkTabsActivation("fr_sync");
      chrome.storage.local.remove("fr_token")
      stopRunningScript();
      removeTab("tabsId")
      break;
    case "unfriend" :     
      let resp = await unfriend(request.payload);
      sendResponseExternal(resp);
      break;
    case "logout" : 
      chrome.storage.local.remove('fr_token');
      break;
    case "deletePendingFR" : 
    console.log("Delete All.................", request)
      fbDtsg(async(fbDtsg, userID) => {
        if(!userID)
          return;
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
        if(userID === request.fbUserId){
          const outgoingPendingRequestDefinition = await helper.getOutgoingPendingRequestList( userID, false )
          if(!outgoingPendingRequestDefinition || outgoingPendingRequestDefinition.length === 0){
            sendMessageToPortalScript({type : "cookie", content : "Empty", action : "deleteAllPendingFR"})
            return;
          }
          cancelPendingFriendRequest(outgoingPendingRequestDefinition, fbDtsg, userID)
        }
        else{
          sendMessageToPortalScript({type : "cookie", content : "Done", action : "deleteAllPendingFR"})
          sendMessageToPortalScript({type : "alert", content : "Please login to selected profile in facebook to delete all."})
        }
      });
      break;

    case "getUidForThisUrl" : 
      if(request && request.url)
        getprofileDataofURL(request.url, sendResponseExternal)
      break;

    default:
      break;
  }
});

const syncFriendLength = async (sendResponseExternal = null) => {
  // console.log("syncFriendLength()");
  getProfileInfo((userProfileData) => {
    // console.log("userProfileData : ", userProfileData)
    if (userProfileData === null) {
      sendResponseExternal({
        action: "noFBLoggedIn",
        warningMsg:
          "Please login in Facebook. To loging please open this https://www.facebook.com/",
        userProfileData: {
          profileUrl: "",
          profilePicture: "",
          Name: "",
          userId: "",
        },
      });
    } else {
      chrome.tabs.create(
        { url: action_url, active: false, pinned: true, selected: false },
        (tab) => {
          chrome.tabs.onUpdated.addListener(async function listener(
            tabId,
            info
          ) {
            if (info.status === "complete" && tabId === tab.id) {
              chrome.tabs.onUpdated.removeListener(listener);
              tabsId = tab.id;
              chrome.storage.local.set({ tabsId: tabsId });
              injectScript(tab.id, ["getFriendLength.js"]);
            }
          });
        }
      );
      // console.log("********************")
      chrome.runtime.onMessage.addListener(async function (
        request,
        sender,
        sendResponse
      ) {
        // console.log("request ::: ", request)
        if (request.action === "friendCount") {
          const userData = {
            profileUrl: "https://www.facebook.com" + userProfileData.path,
            profilePicture: userProfileData.photo,
            name: userProfileData.text,
            userId: userProfileData.uid,
          };
          request.userProfileData = userData;
          await helper.saveDatainStorage("friendLength", request.friendLength)
          removeTab("tabsId");
          sendResponseExternal(request);
          // if(callback !== null){
          //   callback();
          // }
        }
      });
    }
  });
};

const getProfileInfo = (callback = null) => {
  const headers = {
    Accept : 'text/html,application/xhtml+xml,application/xml'
  };
  
  const requestOptions = {
    method: 'GET',
    headers: headers
  };
  fetch("https://www.facebook.com/", requestOptions)
    .then((e) => e.text())
    .then(async (e) => {
      // console.log("e ::: ", e) 
      let userProfileData = e.match(/\{"u":"\\\/ajax\\\/qm\\\/\?[^}]*\}/gm);
      // console.log("userProfileData ::: ", userProfileData)
      if(userProfileData){
        userProfileData =  userProfileData[0];
        userProfileData = JSON.parse(userProfileData);
        if(userProfileData && userProfileData.f && userProfileData.u){
          console.log("inside if block......................")
          const userId = userProfileData.u.split("__user=")[1].split("&")[0];
          let profileUrls = e.split(`"profile_picture":{"uri":"`)
          profileUrls = profileUrls && profileUrls.length > 1 && profileUrls[1];
          profileUrls = profileUrls && profileUrls.split(`"},`)[0]
          profileUrls = profileUrls && profileUrls.replaceAll("\\", "")
          console.log("profile pic :3333333333333333333333:: ", profileUrls);
          if (callback) {
            console.log("callback is here")
            let profileUpdate = {
              uid: userId.toString(),
              path: "/" + userId,
              text: e.split('"NAME":"') && e.split('"NAME":"').length > 1 ? e.split('"NAME":"')[1].split('",')[0] : "",
              photo: profileUrls && profileUrls.length > 0 ? profileUrls : '',
              isFbLoggedin: true,
              status : true
            };
            console.log("profileUpdate ::: ", profileUpdate)
            callback(profileUpdate);
          }
        }else{
          if(e.indexOf(`Log in`) > -1)
            callback({status: true, isFbLoggedin : false})
          else
            getFBUserData(callback, true);
        }
      }else{
        if(e.indexOf(`Log in`) < -1)
          callback({status: true, isFbLoggedin : false})
        else
          getFBUserData(callback, true);
      }
    })
    .catch((e) => {
      // console.log(e)
      if (callback) {
        callback(null);
      }
    });
};

const sendMessageToPortalScript = async (request) => {
  const [tab] = await chrome.tabs.query({title: "Friender", url: process.env.REACT_APP_APP_URL + "/*" });
  // console.log("send msg",request.action, request.content)
  // console.log("send msg to the tab :: ",tab)
  
  if (tab) {
    // console.log("Req to portal", request.action)
    chrome.tabs.sendMessage(tab.id, request);
  }
}

// This function is called to reload portal after reloading the extension
const reloadPortal = async () =>{
  const [...tab] = await chrome.tabs.query({title: "Friender", url: process.env.REACT_APP_APP_URL + "/*" });
  console.log("tab", tab)
  for(let i=0; i < tab.length; ++i){
    chrome.tabs.update(tab[i].id, { url: tab[i].url });
  }
}


// this function is called to connect Ticket master
const ConnectToSocket = async (request)    =>{

  if (!frToken) {
    frToken = await helper.getDatafromStorage("fr_token"); 
  }

  if (!socket || !socket.connected) {
    // console.log("reconnect socket",frToken )
    socket = io(SOCKET_URL, {
     auth: {token: frToken},
     transports: ["websocket", "polling"] // use WebSocket first, if available
   });
   }
  
  socket.on("connect_error", (e) => {
      // console.log("There is a socket connection Error", e);
      socket.io.opts.transports = ["polling", "websocket"];
  });
  
  socket.on('connect', function () {
    socket.emit('join', {token: frToken});
  });

  socket.emit(request.action, request, function (data) {
    // console.log("socket resp", data)
  });

}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.action) {
    case "facebookLogin":
      const logintimeOut = setTimeout(() => {
        fbDtsg((fbDtsg, userID) => {
          // console.log({ fbDtsg: fbDtsg, userID: userID });
          chrome.storage.local.set({
            fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
          });
          clearTimeout(logintimeOut);
        });
      }, 5000);
      break;

    case "finalFriendListWithMsg":
      fbDtsg((fbDtsg, userID) => {
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
        chrome.runtime.sendMessage({
          action: "getCommentreaction",
          finalFriendListWithMsg: request.finalFriendListWithMsg,
        });
      });
      break;

    case "countBadge":
      chrome.action.setBadgeText({ text: request.count.toString() });
      ConnectToSocket(request);
      sendMessageToPortalScript({action: "fr_countBadge", content: request.count.toString()})
      break;

    case "facebookLoggedOut":
      helper.removeDatafromStorage("fbTokenAndId");
      ConnectToSocket(request);
      checkTabsActivation("fr_sync");
      removeTab("tabsId");
      chrome.action.setBadgeText({ text: "" });
      break;

    case "finalFriendList":
      ConnectToSocket(request);
      chrome.action.setBadgeText({ text: "Done" });
      break;

    case "sendUpdate":
      console.log("request.isSyncing ::: ", request.isSyncing , request);
      if (request.tabClose !== undefined && request.tabClose) {
        checkTabsActivation("fr_sync");
        removeTab("tabsId");
      }
      ConnectToSocket(request);
      sendMessageToPortalScript({action: "fr_update", content: request.update});
      sendMessageToPortalScript({action: "fr_isSyncing", content: request.isSyncing, type: "cookie"});
      break;

    case "resetFbdtsg":
      fbDtsg((fbDtsg, userID) => {
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
      });
      break;

    case "sendFriendRequestInGroup":
      chrome.tabs.query({ currentWindow: true, active: true }, async (tab) => {
        // console.log("tabInfo ::: ", tab[0].url, tab[0].url.includes("https://www.facebook.com/groups/"), tab[0].url.includes("people"));
        if (
          tab &&
          tab.length &&
          tab[0].url.includes("https://www.facebook.com/groups/") &&
          (tab[0].url.includes("members") || tab[0].url.includes("people"))
        ) {
          // console.log("its matched");
          await helper.saveDatainStorage("tabId", tab[0].id)
          injectScript(tab[0].id, ["helper.js", "groupContent.js"]);
          setTimeout(() => {
            chrome.tabs.sendMessage(tab[0].id, request);
          }, 1000);
        }
      });
      break;

    case "checkTabUrl":
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        if (tabs[0].url.includes("groups") && (tabs[0].url.includes("members") || tabs[0].url.includes("people"))) {
          // console.log("url ::: ", tabs[0].url);
          chrome.alarms.create("setSettingsForGroup", { when: Date.now() })
        }
        else{
          chrome.tabs.create({ url: process.env.REACT_APP_APP_URL });
        }
      })
      break;

    case "reSendFriendRequestInGroup":
      const currentTabId = await helper.getDatafromStorage("tabId");
      chrome.tabs.sendMessage(Number(currentTabId), request);
      break;

    case "stop":
      const currentFBTabId = await helper.getDatafromStorage("tabId");
      chrome.tabs.sendMessage(Number(currentFBTabId), request);
      break;

    case "pause":
      // console.log("Paused.")
      const currentFBTabIdIs = await helper.getDatafromStorage("tabId");
      chrome.tabs.sendMessage(Number(currentFBTabIdIs), request);
      break;

    case "getGenderCountryAndTier":
                              // console.log("request ::: ", request);
                              const genderCountryAndTier = await getGenderCountryAndTiers(request.name);
                              // console.log("genderCountryAndTier ::: ", genderCountryAndTier);
                              // if(request.from){
                                const tabId = await helper.getDatafromStorage("tabId");
                                // console.log("tabsID :: ", tabId, Number(tabId))
                                chrome.tabs.sendMessage(Number(tabId), {...request, "responsePayload" : genderCountryAndTier});
                              // }
                              break;

    case "getGenderCountryAndTierForIncoming":
                                // console.log("request ::: ", request);
                                const list = [...request.incomingPendingList]
                                // console.log("list ::: ", list);
                                list.forEach(async(el, i)=>{
                                  const getGenderCountryAndTierForIncoming = await getGenderCountryAndTiers(el.friendName);
                                  console.log("getGenderCountryAndTierForIncoming ::: ", getGenderCountryAndTierForIncoming)
                                  list[i] = {...list[i], 
                                    "gender": getGenderCountryAndTierForIncoming.gender ? getGenderCountryAndTierForIncoming.gender : "N/A",
                                    "country": getGenderCountryAndTierForIncoming.countryName ? getGenderCountryAndTierForIncoming.countryName : "N/A",
                                    "tier": getGenderCountryAndTierForIncoming.Tiers ? getGenderCountryAndTierForIncoming.Tiers : "N/A"
                                    };
                                  if(list.length - 1 === i)
                                    await common.storeIncomingPendingReq(request.userId, list)
                                });
                                break;
  

    case "updateCountryAndTier": 
                              console.log(" UPDATE GENDER COUNTRY AND TIER CALLED",request)
                              updateGenderCountryAndTier(request);    
                              break;
          
    case "sendMessage":
        sendMessage(request.fbDtsg, request.userId, request.recieverId, request.name, request.message, request.settingsType);
      break;

    case "sendMessageAcceptOrReject":
      sendMessageAcceptOrReject()
      break;
                          
    default : break;
  }
})

const removeTab = (tabID) => {
  chrome.storage.local.get(tabID, (res) => {
    chrome.tabs.remove(parseInt(res[tabID]));
  });
};

/**
 * Unfriend selected friends from FB
 * @param Array friends 
 */
const unfriend = async  (friends) => {
  
  // console.log("Inside unfriend ()")
  let deletedFriends = [];
  
  for (let i = 0; i < friends.length; i++){
    let friend = friends[i];
    // console.log("unfriending = ", friend.friendFbId)
    let fbuserDetails = await helper.getDatafromStorage("fbTokenAndId");
    let fbDtsg = fbuserDetails.fbDtsg;
    
    if (!fbDtsg) {
      fbDtsg((fbDtsg, userID) => {
        chrome.storage.local.set({ fbTokenAndId: { fbDtsg: fbDtsg, userID: userID } });
      //  fbuserId = userID;
      });
    }

    let uid = friend.friendFbId;
    var payload = new FormData();
    payload.append('__a', '1');
    payload.append('fb_dtsg', fbDtsg);
    payload.append('uid', uid);

    let unfriendResp = await fetch(unfriendApi, {
      body: payload,
      method: 'POST'
    })
      
    deletedFriends.push({ uid: uid, resp: unfriendResp })
    // unfriendResp = await sendRequest(unfriendApi, 'POST', payload);
    // console.log("unfriendResp", unfriendResp);
    let delay = helper.getRandomInteger(1000 * 30, 1000 * 60 * 2); // 30 secs to 2 mins

    if (i + 1 === friends.length) {
      return deletedFriends;
    } else {
      await helper.sleep(delay);
    }
    
  };
  // console.log("unfriendedList", deletedFriends);
  return deletedFriends;
}

/**
 * Check is there async is active and scheduled now
 */
const checkScheduledSync = async () => {
  let fbuserDetails = await helper.getDatafromStorage("fbTokenAndId");
  let fbuserId = fbuserDetails.userID;
  let frToken = await helper.getDatafromStorage("fr_token");

  if (!fbuserId) {
    // console.log("fbuserId", fbuserId);
    fbDtsg((fbDtsg, userID) => {
      chrome.storage.local.set({
        fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
      });
      fbuserId = userID;
    });
  }

  let reqBody = {
    "token": frToken,
    "fbUserId": fbuserId
  }
  // let tb = await helper.getDatafromStorage("friendLength");
  // console.log("checking scheduled sync", tb)

  // Get the settings
  HEADERS.authorization = await helper.getDatafromStorage("fr_token"); 

  let settingResp = await fetch(settingApi, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(reqBody)
    })
  let settings = await settingResp.json();
  settings = settings && settings.data ? settings.data[0] : {};
  // console.log("setting", settings)
  
  let timenow = new Date();
  timenow = timenow.getHours();

  let scheduleFromTime = settings && settings.day_bak_to_analyse_friend_engagement_settings 
    && settings.day_bak_to_analyse_friend_engagement_settings[0] 
    ? settings.day_bak_to_analyse_friend_engagement_settings[0].from_time 
    : "00:00";
  let scheduleToTime = settings && settings.day_bak_to_analyse_friend_engagement_settings 
    && settings.day_bak_to_analyse_friend_engagement_settings[0] 
    ? settings.day_bak_to_analyse_friend_engagement_settings[0].to_time 
    : "24:00";
  scheduleFromTime = Number((scheduleFromTime.split(":"))[0]);
  scheduleToTime = Number((scheduleToTime.split(":"))[0]);

  // Run auto sync if its enable, scheduled now and not already running
  let todayDate = new Date();
  let lastSyncDate = await helper.getDatafromStorage(
    "lastAutoSyncFriendListDate"
  );
  let isAlreadySyncedToday = false;
  let lastSyncId = [];
  if (lastSyncDate && !helper.isEmptyObj(lastSyncDate)) {
    lastSyncDate = new Date(lastSyncDate)
    isAlreadySyncedToday = todayDate.setHours(0,0,0,0) === lastSyncDate.setHours(0,0,0,0);
    if(isAlreadySyncedToday){
      lastSyncId = await helper.getDatafromStorage(
        "lastAutoSyncFriendListId"
      );
      console.log("lastSyncId ::: ", lastSyncId, fbuserId);
      if (lastSyncId && !helper.isEmptyObj(lastSyncId) && lastSyncId.length > 0) {
        if(lastSyncId.indexOf(fbuserId) < 0){
          isAlreadySyncedToday = false;
        }
      }
      else{
        isAlreadySyncedToday = false;
      }
    }
  }

 // console.log("Synced for today", isAlreadySyncedToday, lastSyncDate)
 // !isAlreadySyncedToday put it in below if
 // removed for demo only
  if (!isAlreadySyncedToday
    && settings && settings.day_bak_to_analyse_friend_engagement
    && (timenow >= scheduleFromTime && timenow < scheduleToTime)
    ) {
      console.log(
        "isAlreadySyncedToday:", isAlreadySyncedToday,
        "scheduleFromTime:", scheduleFromTime,
        "schedulerToTime", scheduleToTime,
        "lastSyncDate:", lastSyncDate,
        "timeNow : ", timenow
      )
      console.log("Syncing friends from scheduler");
      syncFriendList([...lastSyncId, fbuserId]);
  } else {
    
    // Do not fucking remove below console
    // Kept for the debuging
    console.log("Maybe syncing is already done or inprogress or not scheduled now");
    console.log(
      "isAlreadySyncedToday:", isAlreadySyncedToday,
      "scheduleFromTime:", scheduleFromTime,
      "schedulerToTime", scheduleToTime,
      "lastSyncDate:", lastSyncDate
    )
  }
};


chrome.alarms.onAlarm.addListener(async(alarm) => {
  // console.log("alarm ::: ", alarm)
  switch (alarm.name) {
    case "setSettingsForGroup":
      // console.log("logi logi");
      chrome.runtime.sendMessage({ action: "setSettingsForGroup" }, () => {
        // console.log("****************************", chrome.runtime.lastError)
      });
      chrome.alarms.clear("setSettingsForGroup")
      break;
    
      case "scheduler": 
        console.log("scheduler called");
        checkScheduledSync();
      break;

      case "pendingFR":
        checkPendingFR();
        break;

      case "reFriending" : 
          getRefriendingList()
        break;
      
      case "InitiateSendMessages" :
          const payload = await helper.getDatafromStorage("payload");
          // console.log("payload ::: ", payload)
          InitiateSendMessages(payload.fbDtsg, payload.userId, payload.sentFRLogForAccept, payload.sentFRLogForReject, payload.fetchIncomingLog, payload.fetchIncomingFRLogForAccept, payload.fetchIncomingFRLogForReject);
          break;

    default: break;
  }

});

chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
  const CurrentTabId = await helper.getDatafromStorage("tabId");
  const CurrentTabsId = await helper.getDatafromStorage("tabsId");

  if (tabID === Number(CurrentTabId)) {
    if(changeInfo && changeInfo.status && changeInfo.status === "loading"){
      chrome.tabs.sendMessage(Number(CurrentTabId), {action: "stop"})
      stopRunningScript();
    }
  }
  if (tabID === Number(CurrentTabsId)) {
    stopRunningScript("syncFriends");
  }
}
)

chrome.tabs.onRemoved.addListener(async (tabID) => {
  
  const CurrentTabId = await helper.getDatafromStorage("tabId");
  // const CurrentTabsId = await helper.getDatafromStorage("tabsId");
  if (tabID === Number(CurrentTabId)) {
    stopRunningScript()
  }

}
)

const stopRunningScript = async (action = "sendFR") => {
  if (action === "sendFR") {
    await helper.removeDatafromStorage("runAction");
    await helper.removeDatafromStorage("FRSendCount");
    await helper.removeDatafromStorage("profile_viewed");
  }
  if (action === "syncFriends") {
    // await helper.removeDatafromStorage("friendLength");
  }
}

// Test scheduler func
// chrome.storage.local.remove(['lastAutoSyncFriendListDate']);
// checkScheduledSync();

const updateGenderCountryAndTier = async (request) => {

  async function proceedToUpdateGenderCountryAndTier (exFriendList = []){
    /**
     * 
     * @param {
     * *0 : no match and no data found (P.S :  currentData field always comes empty in this state)
     * *1 : both match and data found (P.S : currentData field has all the required info hence we can use this and skip calling gender API)
     * *2 : perfect match not found but data found (P.S : you can use the currentData field here as per your need, if required) 
     * } status 
     * @returns 
     */
    async function checkExsistingData (currFriend){
      return new Promise(async (resolve,reject)=>{
        // console.log("inside check exsisting data",exFriendList)
        if(exFriendList.length){
          const foundFriend = await exFriendList.find(exFriendList => exFriendList.friendFbId == currFriend.id);
          // console.log("foundFriend",foundFriend)
          if(foundFriend){
            if(foundFriend.tier!=undefined && foundFriend.tier!="NA" && foundFriend.country!= undefined && foundFriend.country != "NA" && foundFriend.friendGender!= undefined && foundFriend.friendGender!= "NA" && foundFriend.friendGender != "UNKNOWN"){
              // console.log("** Local match found - No gender API call required",foundFriend)
              resolve({
                status : 1,
                currentData : foundFriend
              })
            }else{
              // console.log("** Data found but didnt match with criteria, hence API call is required",foundFriend)
              resolve({
                status : 2,
                currentData : foundFriend
              })  
            }
          }else{
            // console.log("** No match and no data found, hence API call is required")
            resolve({
              status : 0,
              currentData : []
            })
          }
        }else{
          // console.log("** No match and no data found, hence API call is required")
          resolve({
            status : 0,
            currentData : []
          })
        }
      })
    }
    async function fetchGenderCountryTier (friend){
      return new Promise((resolve,reject)=>{
        fetch(process.env.REACT_APP_GENDER_COUNTRY_AND_TIER_URL, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "name": friend.name,
          }),
        })
        .then((response) => response.json())
        .then((res) => {
          const resp = res.data ? res.data : res;
  
          if (!resp.errorType) {
            
            resolve({
              status : true,
              country : res.body.countryName,
              tier : res.body.Tiers,
              gender : res.body.gender
            })
          }  
        })
        .catch((err) => {
          resolve({
            status : false,
            country : "",
            tier : "",
            gender : ""
          })
          console.log("err ::: ", err);
        });
      })
    }

    let friendList = request.friendList;
    let fbUserId = request.fbUserId;
    let listLen = friendList.length;

    if (!listLen) return false;
    let updateFriendPayload = [];
    let totalGenderAPIHits = 0
    let totalLocalfetchs = 0
    for (let i = 0; i < listLen; i++) {
      let friend = friendList[i];
      let friendPayload = {
        friendFbId: friend.id,
        country: "N/A",
        tier: "N/A"
      } 
      if (i % 500 === 0) {
        console.log("lets sleep")
        await helper.sleep(1000*5)
     }
     
     let exFriendData = await checkExsistingData(friend)
     if(exFriendData.status != 1){
       let fetchGenderAPI = await fetchGenderCountryTier(friend)
       if(fetchGenderAPI.status){
        console.log("actual friend object",friend)
        console.log("GENDER from gender API",fetchGenderAPI.gender)
        console.log("conditioned final gender",friend.gender!=undefined && friend.gender!="UNKNOWN"?friend.gender:fetchGenderAPI.gender)
         friendPayload.country = fetchGenderAPI.country 
         friendPayload.tier = fetchGenderAPI.tier
         friendPayload["friendGender"] = friend.gender!=undefined && friend.gender!="UNKNOWN"?friend.gender:fetchGenderAPI.gender
         totalGenderAPIHits++
         console.log("payload from Gender API",friendPayload)
         updateFriendPayload.push(friendPayload);
       }

     }else{
      totalLocalfetchs++
       friendPayload.country = exFriendData.currentData.country;
       friendPayload.tier = exFriendData.currentData.tier
       // friendPayload.friendGender = exFriendData.friendGender
       console.log("payload from local data",friendPayload)
       updateFriendPayload.push(friendPayload);
     }

     if (i + 1 === listLen) {
      // console.log("Country List", updateFriendPayload);
      setTimeout( () => {
        console.log("totalGenderAPIhits ::",totalGenderAPIHits)
        console.log("totalLocalfetchs ::",totalLocalfetchs)
        console.log("Update country and Tier",updateFriendPayload)
        updateFriendList(updateFriendPayload, fbUserId)
      },2000)
    }
   }
  }


  let fr_token = await helper.getDatafromStorage("fr_token");
   fetch(process.env.REACT_APP_FETCH_EX_FRIENDS,{
    method : "POST",
    mode :"cors",
    headers : {
      "Content-Type" : "application/json",
      "authorization": fr_token,
    },
    body : JSON.stringify({
      fbUserId : request.fbUserId
    })
   })
   .then((response) => response.json())
   .then((res) => { 
    if(res && res.data!=undefined && res.data.length && res.data[0].friend_details!=undefined && res.data[0].friend_details.length){
      console.log("friend list present***",res.data[0].friend_details)
      proceedToUpdateGenderCountryAndTier(res.data[0].friend_details)
    }else{
      console.log("Else block : friend list not present")
      proceedToUpdateGenderCountryAndTier()      
    }
   })
   .catch(error=>{
     console.log("error block so directly fetching gender country and tier",error)
     proceedToUpdateGenderCountryAndTier()
   })
}



const updateFriendList = async (friendList, fbProfileId) => {
  let fr_token = await helper.getDatafromStorage("fr_token");
  
  if (!fr_token) return false;

  const friendListPayload = {
    "facebookUserId": fbProfileId,
    "friend_details" : friendList
  }
  // console.log("friendListPayload :::::::::::::::::: ", friendListPayload);
  await fetch(process.env.REACT_APP_SETTING_STORE_FRIEND_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": fr_token,
    },
    body: JSON.stringify(friendListPayload),
  });
}

const getGenderCountryAndTiers = async (name) => {
  return new Promise((resolve, reject) => {
    fetch(process.env.REACT_APP_GENDER_COUNTRY_AND_TIER_URL, {
    method: "POST",
    mode: "cors",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify({
    "name" : name,
    }),
    })
    .then((response) => response.json())
    .then((res) => {
    
        const resp = res.data ? res.data : res;
        // console.log("resp", resp);
        if (resp.errorType) {
          resolve(false);
    
        } else {
          resolve(resp.body);
        }
    
      })
      .catch((err) => {
        resolve(false);
      });
  });
  }

  const checkPendingFR = async () => {
    const fbuserDetails = await helper.getDatafromStorage("fbTokenAndId");
    let fbuserId = fbuserDetails.userID;
    let frToken = await helper.getDatafromStorage("fr_token");
  
    if (!fbuserId) {
      console.log("fbuserId", fbuserId);
      fbDtsg((fbDtsg, userID) => {
        console.log("userID", userID);
        if(!userID)
          return;
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
        fbuserId = userID;
      });
    }
  
    if(!fbuserId)
      return;

    let reqBody = {
      "token": frToken,
      "fbUserId": fbuserId
    }

    // Get the settings
    const fr_token = await helper.getDatafromStorage("fr_token");
    if(!fr_token && helper.isEmptyObj(fr_token)){
      return;
    }
    HEADERS.authorization = fr_token
  
    let settingResp = await fetch(settingApi, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(reqBody)
      })
    let settings = await settingResp.json();
    // console.log("setting", settings.data)
    settings = settings && settings.data ? settings.data[0] : {};
    // console.log("setting", settings)
    if(settings && settings.automatic_cancel_friend_requests){
      let settingsDetails = settings.automatic_cancel_friend_requests_settings &&
                            settings.automatic_cancel_friend_requests_settings[0].remove_after && 
                            settings.automatic_cancel_friend_requests_settings[0].remove_after
      console.log(settingsDetails)
      if(settingsDetails){
        fbDtsg(async (fbDtsg, userID) => {
          console.log("fbDtsg, userID ::: ", fbDtsg, userID)
          if(!userID)
            return;
          chrome.storage.local.set({
            fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
          });
          const outgoingPendingRequestDefinition = await helper.getOutgoingPendingRequestList( userID, true, settingsDetails)
          console.log("getOutgoingPendingRequestList ::: ", outgoingPendingRequestDefinition)
          if(!outgoingPendingRequestDefinition || outgoingPendingRequestDefinition.length === 0){
            sendMessageToPortalScript({type : "cookie", content : "Empty", action : "deleteAllPendingFR"})
            return;
          }
          cancelPendingFriendRequest(outgoingPendingRequestDefinition, fbDtsg, userID)
        });
      }
    }
  }

  const cancelPendingFriendRequest = async (requestList, fbDtsg, userID, refriending = false) => {
    
    const fr_token = await helper.getDatafromStorage("fr_token");
    if(!fr_token && helper.isEmptyObj(fr_token)){
      return;
    }
    if(requestList.length > 0 && requestList[0].friendFbId){
      sendMessageToPortalScript({type : "cookie", content : "Active", action : "deleteAllPendingFR"})
      let cancelReqPayload = {
        av: userID,
        __user: userID,
        __a: 1,
        __comet_req: 15,
        fb_dtsg: fbDtsg,
        variables: JSON.stringify({
            "input":{"cancelled_friend_requestee_id":requestList[0].friendFbId,
                      "source":"profile",
                      "actor_id":userID,
                      "client_mutation_id":"1"
                    },
            "scale":1
        }),
        server_timestamps: true,
        dpr: 1,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "FriendingCometFriendRequestCancelMutation",
        doc_id: 5247084515315799
      }
      const cancelFriendRequestSerive = await fetch(
        "https://www.facebook.com/api/graphql/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "text/html,application/json",
            "x-fb-friendly-name": "FriendingCometFriendRequestCancelMutation",
          },
          body: helper.serialize(cancelReqPayload),
      });
      let cancelFriendRequestDefinition = await cancelFriendRequestSerive.text();
      cancelFriendRequestDefinition = helper.makeParsable(cancelFriendRequestDefinition);
      console.log("cancelFriendRequestDefinition :::: ", cancelFriendRequestDefinition);
      let isCancelFriendRequest = cancelFriendRequestDefinition && 
                                      cancelFriendRequestDefinition.data && 
                                      cancelFriendRequestDefinition.data.friend_request_cancel && 
                                      cancelFriendRequestDefinition.data.friend_request_cancel.cancelled_friend_requestee ? true : false;
      console.log("isCancelFriendRequest :::: ", isCancelFriendRequest)
      const isDeletedFromPortal = await helper.deleteFRFromFriender([requestList[0]._id], userID);
      console.log("isDeletedFromPorta ::: ", isDeletedFromPortal);
      if(refriending && isCancelFriendRequest){
        await helper.sleep(((Math.random * 241) + 60) *1000);
        await common.sentFriendRequest(userID, fbDtsg, requestList[0].friendFbId, "groups_member_list");
        const refriendingPayload = {
          "country": requestList[0].country,
          "fb_user_id": requestList[0].fb_user_id,
          "finalSource": requestList[0].finalSource,
          "friend_request_send": 1,
          "friendFbId": requestList[0].friendFbId,
          "friendName": requestList[0].friendName,
          "friendProfilePicture": requestList[0].friendProfilePicture,
          "friendProfileUrl": requestList[0].friendProfileUrl,
          "gender": requestList[0].gender,
          "groupName": requestList[0].groupName,
          "groupUrl": requestList[0].groupUrl,
          "matchedKeyword": requestList[0].matchedKeyword,
          "refriending": requestList[0].refriending,
          "refriending_attempt": Number(requestList[0].refriending_attempt) + 1,
          "refriending_max_attempts": requestList[0].refriending_max_attempts,
          "refriending_pending_days": Number(requestList[0].refriending_pending_days),
          "settingsId": requestList[0].settings_id,
          "tier": requestList[0].tier,
          "is_settings_stop" : false
      }
        await common.UpdateSettingsAfterFR(fr_token,  refriendingPayload);
      }
      const time = helper.getRandomInteger(3000, 5000);
      await helper.sleep(time);
      requestList.shift();
      cancelPendingFriendRequest(requestList, fbDtsg, userID, refriending);
    }
    else{
      
      const fr_token = await helper.getDatafromStorage("fr_token");
      if(!fr_token && helper.isEmptyObj(fr_token)){
        return;
      }
      sendMessageToPortalScript({type : "cookie", content : "Done", action : "deleteAllPendingFR"})
    }
  }

  const getRefriendingList = async () => {
  const fr_token = await helper.getDatafromStorage("fr_token");
    if(!fr_token)
      return
    fbDtsg(async (fbDtsg, userID) => {
      chrome.storage.local.set({
        fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
      });
      HEADERS.authorization = fr_token;
      let reFriendingList = await fetch(process.env.REACT_APP_REFRIENDING_URL + userID, {
        method: 'GET',
        headers: HEADERS
      });
      reFriendingList = await reFriendingList.json();
      console.log("reFriendingList ::: ", reFriendingList.data);
      if(reFriendingList && reFriendingList.data && reFriendingList.data.length > 0){
        cancelPendingFriendRequest(reFriendingList.data, fbDtsg, userID, true);
      }
    });
  }

  const getprofileDataofURL = (url, sendResponseExternal) => {
    chrome.tabs.create(
      { url: url, active: false, pinned: true, selected: false },
      (tab) => {
        chrome.tabs.onUpdated.addListener(async function listener(
          tabId,
          info
        ) {
          if (info.status === "complete" && tabId === tab.id) {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.storage.local.set({ tabsId: tab.id });
            injectScript(tab.id, ["helper.js", "collectData.js"]);
            await helper.sleep(2000);
            const userId = await chrome.tabs.sendMessage(tab.id, {action : "getUserId"});
            tab && tab.id && chrome.tabs.remove(tab.id);
            // console.log("userId ::: ", userId);
            sendResponseExternal(userId)
          }
        });
      }
    );
  }

const sendMessage = async (dtsg, fbId, receiverId, name, message="good afternoon", settingsType, alt = false) => {
  return new Promise(async (resolve, reject) => {
    try {
          if(message.trim() === "")
            resolve(false);
          else{
            let Ids = `ids[${receiverId}]`;
            let text_ids = `text_ids[${receiverId}]`;
            // console.log("alt :: ", alt)
            if (alt) {
              var tids = `cid.c.${fbId}:${receiverId}`;
            } else {
              var tids = `cid.c.${receiverId}:${fbId}`;
            }

            let data = {
              __user: fbId,
              fb_dtsg: dtsg,
              body: message,
              send: "Send",
              [text_ids]: name,
              [Ids]: receiverId,
              tids: tids,
              waterfall_source: "message",
              server_timestamps: true,
            };

            let a = await fetch(
              "https://mbasic.facebook.com/messages/send/?icm=1&refid=12&ref=dbl",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Accept: "text/html,application/json",
                },
                body: helper.serialize(data),
              }
            );

            const response = await a.text();
            if (!alt && response.includes("You cannot perform that action")) {
              console.log("Executing alternate message sending");
              resolve(false);
              // asynchronously it will resolve the send message in alt way
              sendMessage(dtsg, fbId, receiverId, name, message, settingsType, true);
            } else  if(alt && response.includes("You cannot perform that action")) {
              resolve(false)
            }else if(response.includes("It looks like you were misusing this feature by going too fast. You’ve been temporarily blocked from using it.")){
              resolve(false)
            }
            else{
              console.log("Successfully resolved the alternate message sending technique");
              const fr_token = await helper.getDatafromStorage("fr_token");
              await common.confirmSentMessage(fr_token, {
                "fbUserId":fbId,
                "friendFbId":receiverId,
                "settingsType": settingsType
              });
              resolve(true);
            }
          }
    } catch (error) {
      console.log("Send Message Error", error);
      resolve(false);
    }
  });
};

const sendMessageAcceptOrReject= async() => {
  // console.log("orre oreewaaa.......................");
  fbDtsg(async(fbDtsg, userId)=>{
    if (!frToken || frToken === "") {
      frToken = await helper.getDatafromStorage("fr_token"); 
    }
    let reqBody = {
      // "token": frToken,
      "fbUserId": userId
    }
    HEADERS.authorization = frToken; 
    let settingResp = await fetch(settingApi, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(reqBody)
    })
    let settings = await settingResp.json();
    settings = settings && settings.data ? settings.data[0] : {};
    console.log("settings ::: ", settings);
    if(settings.send_message_when_someone_accept_new_friend_request || 
      settings.send_message_when_reject_friend_request ||
      settings.send_message_when_someone_sends_me_friend_request ||
      settings.send_message_when_reject_incoming_friend_request ||
      settings.send_message_when_accept_incoming_friend_request){
        let fetchIncomingLog = [],
            fetchIncomingFRLogForAccept = [],
            fetchIncomingFRLogForReject = [],
            fetchSentFRLogForAccept = [],
            fetchSentFRLogForReject = [];
        // console.log("fbDtsg, userId ::::::::::::::::: ", fbDtsg, userId);
        const fetchSentFRLog = await helper.fetchSentFRLog(userId);
        console.log("fetchSentFRLog ::: ", fetchSentFRLog)

        if(settings.send_message_when_someone_sends_me_friend_request){
            fetchIncomingLog = fetchSentFRLog.filter(el => el 
              && el.friendRequestStatus.toLocaleLowerCase().trim() === "pending" 
              && el.is_incoming === true );
            console.log("fetchIncomingLog ::: ", fetchIncomingLog)
        }
        if(settings.send_message_when_accept_incoming_friend_request){
          fetchIncomingFRLogForAccept = fetchSentFRLog.filter(el => el 
            && el.friendRequestStatus.toLocaleLowerCase().trim() === "accepted" 
            && el.is_incoming === true
            && (el.message_sending_status !== "Send" 
            || el.message_sending_setting_type !== settingsType.whenAcceptedByMember));
          console.log("fetchIncomingFRLogForAccept ::: ", fetchIncomingFRLogForAccept);
        }
        if(settings.send_message_when_reject_incoming_friend_request){
          fetchIncomingFRLogForReject = fetchSentFRLog.filter(el => el 
            && el.friendRequestStatus.toLocaleLowerCase().trim() === "rejected" 
            && el.is_incoming === true
            && (el.message_sending_status !== "Send" 
            || el.message_sending_setting_type !== settingsType.whenRejectedByMember));
          console.log("fetchIncomingFRLogForReject ::: ", fetchIncomingFRLogForReject);
        }
        if(settings.send_message_when_someone_accept_new_friend_request){
          fetchSentFRLogForAccept = fetchSentFRLog.filter(el => el 
            && el.friendRequestStatus.toLocaleLowerCase().trim() === "accepted" 
            && el.is_incoming !== true
            && (el.message_sending_status !== "Send" 
            || el.message_sending_setting_type !== settingsType.whenAcceptedByMember));
          console.log("fetchSentFRLogForAccept ::: ", fetchSentFRLogForAccept);
        }
        if(settings.send_message_when_reject_friend_request){
          fetchSentFRLogForReject = fetchSentFRLog.filter(el => el 
            && el.friendRequestStatus.toLocaleLowerCase().trim() === "rejected" 
            && el.is_incoming !== true
            && (el.message_sending_status !== "Send" 
            || el.message_sending_setting_type !== settingsType.whenRejectedByMember));
          console.log("fetchSentFRLogForReject ::: ", fetchSentFRLogForReject);
          // console.log("settings.send_message_when_reject_friend_request && settings.send_message_when_someone_accept_new_friend_request : ",
          // settings.send_message_when_reject_friend_request, settings.send_message_when_someone_accept_new_friend_request);
          // if(settings.send_message_when_reject_friend_request  && settings.send_message_when_someone_accept_new_friend_request)
          //   InitiateSendMessages(fbDtsg, userId, fetchSentFRLogForAccept, fetchSentFRLogForReject);
          // else if(settings.send_message_when_someone_accept_new_friend_request && !settings.send_message_when_reject_friend_request)
          //   InitiateSendMessages(fbDtsg, userId, fetchSentFRLogForAccept);
          // else if(!settings.send_message_when_someone_accept_new_friend_request && settings.send_message_when_reject_friend_request)
          //   InitiateSendMessages(fbDtsg, userId, [], fetchSentFRLogForReject);
        }
        InitiateSendMessages(fbDtsg, userId, fetchSentFRLogForAccept, fetchSentFRLogForReject, fetchIncomingLog, fetchIncomingFRLogForAccept, fetchIncomingFRLogForReject);
      }
  })
}

const InitiateSendMessages = async(fbDtsg, userId, sentFRLogForAccept = [], sentFRLogForReject = [], fetchIncomingLog = [], fetchIncomingFRLogForAccept = [], fetchIncomingFRLogForReject = []) => {
  console.log(sentFRLogForAccept, sentFRLogForReject, fetchIncomingLog, fetchIncomingFRLogForAccept, fetchIncomingFRLogForReject);
  chrome.alarms.clear("InitiateSendMessages");
  // console.log(fbDtsg, userId,sentFRLogForAccept, sentFRLogForAccept[0] && sentFRLogForAccept[0].friendFbId, sentFRLogForReject, sentFRLogForReject[0] && sentFRLogForReject[0].friendFbId)
  sendMessageToPortalScript({action: "fr_update", content: "Sending Messages..."});
  sendMessageToPortalScript({action: "fr_isSyncing", content: "active", type: "cookie"});
  if(sentFRLogForAccept && sentFRLogForAccept.length > 0){
    const fr_token = await helper.getDatafromStorage("fr_token");
    const body = {
      "fbUserId":userId,
      "friendFbId": sentFRLogForAccept[0].friendFbId,
      "settingsType": settingsType.whenAcceptedByMember
    };
    const messageContent = await common.getMessageContent(fr_token, body);
    // console.log("messageContent ::: ", messageContent);
    if(messageContent.status){
      sendMessage(fbDtsg, userId, sentFRLogForAccept[0].friendFbId, sentFRLogForAccept[0].friendName,  messageContent.content, settingsType.whenAcceptedByMember );
    }
    sentFRLogForAccept.shift();
    payload = {
      fbDtsg : fbDtsg,
      userId : userId,
      sentFRLogForAccept : sentFRLogForAccept,
      sentFRLogForReject : sentFRLogForReject,
      fetchIncomingLog : fetchIncomingLog,
      fetchIncomingFRLogForAccept : fetchIncomingFRLogForAccept,
      fetchIncomingFRLogForReject : fetchIncomingFRLogForReject
    }
    await helper.saveDatainStorage("payload", payload);
    const time = helper.getRandomInteger(1000 * 60, 1000 * 60 * 5)
    chrome.alarms.create("InitiateSendMessages", {when: Date.now() + time});
  }else if(sentFRLogForReject && sentFRLogForReject.length > 0){
    const fr_token = await helper.getDatafromStorage("fr_token");
    const body = {
      "fbUserId":userId,
      "friendFbId": sentFRLogForReject[0].friendFbId,
      "settingsType": settingsType.whenRejectedByMember
    };
    const messageContent = await common.getMessageContent(fr_token, body);
    // console.log("messageContent ::: ", messageContent);
    if(messageContent.status){
      sendMessage(fbDtsg, userId, sentFRLogForReject[0].friendFbId, sentFRLogForReject[0].friendName, messageContent.content, settingsType.whenRejectedByMember );
    }
    sentFRLogForReject.shift();
    payload = {
      fbDtsg : fbDtsg,
      userId : userId,
      sentFRLogForAccept : sentFRLogForAccept,
      sentFRLogForReject : sentFRLogForReject,
      fetchIncomingLog : fetchIncomingLog,
      fetchIncomingFRLogForAccept : fetchIncomingFRLogForAccept,
      fetchIncomingFRLogForReject : fetchIncomingFRLogForReject
    }
    await helper.saveDatainStorage("payload", payload)
    const time = helper.getRandomInteger(1000 * 60, 1000 * 60 * 5)
    chrome.alarms.create("InitiateSendMessages", {when: Date.now() + time});
  }else if(fetchIncomingLog && fetchIncomingLog.length > 0){
    const fr_token = await helper.getDatafromStorage("fr_token");
    const body = {
      "fbUserId":userId,
      "friendFbId": fetchIncomingLog[0].friendFbId,
      "settingsType": settingsType.    whenRecievesRequest
    };
    const messageContent = await common.getMessageContent(fr_token, body);
    // console.log("messageContent ::: ", messageContent);
    if(messageContent.status){
      sendMessage(fbDtsg, userId, fetchIncomingLog[0].friendFbId, fetchIncomingLog[0].friendName, messageContent.content, settingsType.    whenRecievesRequest );
    }
    fetchIncomingLog.shift();
    payload = {
      fbDtsg : fbDtsg,
      userId : userId,
      sentFRLogForAccept : sentFRLogForAccept,
      sentFRLogForReject : sentFRLogForReject,
      fetchIncomingLog : fetchIncomingLog,
      fetchIncomingFRLogForAccept : fetchIncomingFRLogForAccept,
      fetchIncomingFRLogForReject : fetchIncomingFRLogForReject
    }
    await helper.saveDatainStorage("payload", payload)
    const time = helper.getRandomInteger(1000 * 60, 1000 * 60 * 5)
    chrome.alarms.create("InitiateSendMessages", {when: Date.now() + time});
  }else if(fetchIncomingFRLogForAccept && fetchIncomingFRLogForAccept.length > 0){
    const fr_token = await helper.getDatafromStorage("fr_token");
    const body = {
      "fbUserId":userId,
      "friendFbId": fetchIncomingFRLogForAccept[0].friendFbId,
      "settingsType": settingsType.whenAcceptedByUser
    };
    const messageContent = await common.getMessageContent(fr_token, body);
    // console.log("messageContent ::: ", messageContent);
    if(messageContent.status){
      sendMessage(fbDtsg, userId, fetchIncomingFRLogForAccept[0].friendFbId, fetchIncomingFRLogForAccept[0].friendName, messageContent.content, settingsType.whenAcceptedByUser );
    }
    fetchIncomingFRLogForAccept.shift();
    payload = {
      fbDtsg : fbDtsg,
      userId : userId,
      sentFRLogForAccept : sentFRLogForAccept,
      sentFRLogForReject : sentFRLogForReject,
      fetchIncomingLog : fetchIncomingLog,
      fetchIncomingFRLogForAccept : fetchIncomingFRLogForAccept,
      fetchIncomingFRLogForReject : fetchIncomingFRLogForReject
    }
    await helper.saveDatainStorage("payload", payload)
    const time = helper.getRandomInteger(1000 * 60, 1000 * 60 * 5)
    chrome.alarms.create("InitiateSendMessages", {when: Date.now() + time});
  }else if(fetchIncomingFRLogForReject && fetchIncomingFRLogForReject.length > 0){
    const fr_token = await helper.getDatafromStorage("fr_token");
    const body = {
      "fbUserId":userId,
      "friendFbId": fetchIncomingFRLogForReject[0].friendFbId,
      "settingsType": settingsType.whenRejectedByUser
    };
    const messageContent = await common.getMessageContent(fr_token, body);
    // console.log("messageContent ::: ", messageContent);
    if(messageContent.status){
      sendMessage(fbDtsg, userId, fetchIncomingFRLogForReject[0].friendFbId, fetchIncomingFRLogForReject[0].friendName, messageContent.content, settingsType.whenRejectedByUser );
    }
    fetchIncomingFRLogForReject.shift();
    payload = {
      fbDtsg : fbDtsg,
      userId : userId,
      sentFRLogForAccept : sentFRLogForAccept,
      sentFRLogForReject : sentFRLogForReject,
      fetchIncomingLog : fetchIncomingLog,
      fetchIncomingFRLogForAccept : fetchIncomingFRLogForAccept,
      fetchIncomingFRLogForReject : fetchIncomingFRLogForReject
    }
    await helper.saveDatainStorage("payload", payload)
    const time = helper.getRandomInteger(1000 * 60, 1000 * 60 * 5)
    chrome.alarms.create("InitiateSendMessages", {when: Date.now() + time});
  }else{
    chrome.storage.local.remove("payload");
    sendMessageToPortalScript({action: "fr_update", content: "Done"});
    sendMessageToPortalScript({action: "fr_isSyncing", content: "", type: "cookie"});
  }
}