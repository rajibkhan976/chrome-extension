// import { io } from "socket.io-client";
import helper from "./helper";
import common from "./commonScript";
import { settingsType } from "../config/config";
import { ChromeStorageQueue } from './ChromeStorageQueue.js';
import generateMessage from "./generateMessage.js";
const APPURL = process.env.REACT_APP_APP_URL
const settingApi = process.env.REACT_APP_SETTING_API;
// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
const unfriendApi = "https://www.facebook.com/ajax/profile/removefriendconfirm.php?dpr=1";
const action_url = "https://www.facebook.com/friends/list?opener=fr_sync";
chrome.storage.local.set({
  sendMessageOnSomeOneAccptMyFR_EvenHasConversation: false,
  sendMessageOnIAccptFR_EvenHasConversation: false
});
let successColor = "color:green; font-size:16px;"
const HEADERS = {
  "Content-Type": "application/json",
};
let gapBetweenTwoDays = 0;
// let socket = io(process.env.REACT_APP_SOCKET_URL, {
//   transports: ["websocket", "polling"], // use WebSocket first, if available
// });

// * initialize the Queue for friend request 
const fRQueue = new ChromeStorageQueue('friendRequestQueue');
const fRFinishedQueue = new ChromeStorageQueue('friendRequestFinishedQueue')


const schedulerIntvTime = 10;
const pendingFRIntvTime = 120;
const reFRIntvTime = 240;
const campaignIntvTime = 60;

const campaignExpTime = 2 * 60 * 60 * 1000;
const settingExpTime = 2 * 60 * 60 * 1000;

let frToken = "";
let tabsId;
let payload;

chrome.runtime.onInstalled.addListener(async (res) => {
  chrome.storage.local.remove(['lastAutoSyncFriendListDate']);
  chrome.storage.local.remove(['lastAutoSyncFriendListId']);
  await helper.removeDatafromStorage("postPopupId");
  reloadPortal();

  fbDtsg(async (fbDtsg, userID) => {
    console.log("fbTokenAndId", { fbDtsg: fbDtsg, userID: userID });
    await helper.saveDatainStorage("fbTokenAndId", { fbDtsg: fbDtsg, userID: userID })
    chrome.alarms.clear("scheduler")
    chrome.alarms.create("scheduler", { periodInMinutes: schedulerIntvTime })
    chrome.alarms.clear("pendingFR")
    chrome.alarms.create("pendingFR", { periodInMinutes: pendingFRIntvTime })
    chrome.alarms.clear("reFriending")
    chrome.alarms.create("reFriending", { periodInMinutes: reFRIntvTime })
    startCampaignScheduler();
  });
  if (res && res.reason === "install") {
    chrome.tabs.create({
      url: APPURL + "/extension-success",
      active: true,
    });
  }
  return false;
});
chrome.windows.onRemoved.addListener(async (windowId) => {
  console.log('res on removed a window ::::::: ', windowId);
  const postPopupWindowId = await helper.getDatafromStorage("windowId");
  console.log("Post popup Id ::: ", postPopupWindowId, windowId,);
  if (parseInt(postPopupWindowId) === windowId) {
    const postTabId = await helper.getDatafromStorage("PostTabId");
    console.log("postTabId : ", postTabId);
    chrome.tabs.sendMessage(parseInt(postTabId), { action: "stop", source: "post" })
  }
}, { active: true, currentWindow: true }
)

chrome.windows.onCreated.addListener(function (windows) {
  console.log(windows);
  if (windows.type !== "popup") {
    chrome.storage.local.remove(['lastAutoSyncFriendListDate']);
    chrome.storage.local.remove(['lastAutoSyncFriendListId']);

    fbDtsg(async (fbDtsg, userID) => {
      await helper.saveDatainStorage("fbTokenAndId", { fbDtsg: fbDtsg, userID: userID })
      chrome.alarms.clear("scheduler")
      chrome.alarms.create("scheduler", { periodInMinutes: schedulerIntvTime })
      chrome.alarms.clear("pendingFR")
      chrome.alarms.create("pendingFR", { periodInMinutes: pendingFRIntvTime })
      chrome.alarms.clear("reFriending")
      chrome.alarms.create("reFriending", { periodInMinutes: reFRIntvTime })
      startCampaignScheduler();
    });
  }
})

chrome.action.onClicked.addListener(async function (activeInfo) {
  // console.log("activeInfo on clicked ::::: ", activeInfo)
  const fr_token = await helper.getDatafromStorage("fr_token")
  // console.log("fr_token ::: ", fr_token)
  if (!helper.isEmptyObj(fr_token)) {
    // setPopup(activeInfo.url);
    chrome.action.setPopup({ popup: "popup.html" });
  }
  else {
    chrome.tabs.create({ url: process.env.REACT_APP_APP_URL });
  }
});

const setPopup = async () => {
  const fr_token = await helper.getDatafromStorage("fr_token")
  // console.log("fr_token ::: ", fr_token)
  if (!helper.isEmptyObj(fr_token)) {
    chrome.action.setPopup({ popup: "popup.html" });
  }
  else {
    chrome.tabs.create({ url: process.env.REACT_APP_APP_URL });
  }
};

const fbDtsg = (callback = null) => {
  const headers = {
    Accept: 'text/html,application/xhtml+xml,application/xml'
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
      userProfileData = userProfileData[0];
      userProfileData = JSON.parse(userProfileData);
      if (userProfileData && userProfileData.f && userProfileData.u) {
        const fbDtsg = userProfileData.f;
        const userId = userProfileData.u.split("__user=")[1].split("&")[0];
        if (callback) {
          callback(fbDtsg, userId);
        }
      } else {
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
          const profileData = await chrome.tabs.sendMessage(tab.id, { action: "profileData" });
          tab && tab.id && chrome.tabs.remove(tab.id);
          // console.log("profileData :: ", profileData)
          if (profileData && !helper.isEmptyObj(profileData)) {
            if (callback) {
              if (profileData.status && profileData.isFbLoggedin) {
                if (connectProfile) {
                  callback({
                    "text": profileData.name,
                    "path": profileData.profileUrl,
                    "uid": profileData.userId,
                    "photo": profileData.profilePicture,
                    "isFbLoggedin": true
                  },
                  )
                }
                else
                  callback(profileData.fbDtsg, profileData.userId);
              } else
                callback(profileData)
            }
          } else {
            if (callback)
              callback({ "status": false });
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
    sendMessageToPortalScript({ action: "fr_isSyncing", content: "active", type: "cookie" });
  });
  syncFriendLength(
    (request) => {
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
    }
  );

}

const checkTabsActivation = async (opener) => {
  const tab = await chrome.tabs.query({ url: "https://www.facebook.com/*?opener=" + opener });
  // console.log("tab ::: ", tab)
  if (tab.length > 0)
    for (let i = 0; i < tab.length; ++i) {
      chrome.tabs.remove(parseInt(tab[i].id));
    }
}

chrome.runtime.onMessageExternal.addListener(async function (
  request,
  sender,
  sendResponseExternal
) {
  // console.log("request ::::::-> ", request)
  chrome.storage.local.set({ senExternalResponse: sendResponseExternal });
  switch (request.action) {
    case "frienderLogin":
      //console.log("frienderLogin_+_+_+_+_+_+_+_+_+_+_+_+", request.userPlan, request);
      await helper.saveDatainStorage("fr_token", request.frLoginToken)
      await helper.saveDatainStorage("user_plan", Number(request.userPlan));
      fbDtsg(async (fbDtsg, userID) => {
        await helper.saveDatainStorage("fbTokenAndId", { fbDtsg: fbDtsg, userID: userID })
        // getCampaignList()
        chrome.alarms.clear("scheduler")
        chrome.alarms.create("scheduler", { periodInMinutes: schedulerIntvTime })
        chrome.alarms.clear("pendingFR")
        chrome.alarms.create("pendingFR", { periodInMinutes: pendingFRIntvTime })
        chrome.alarms.clear("reFriending")
        chrome.alarms.create("reFriending", { periodInMinutes: reFRIntvTime })
        chrome.alarms.clear("InitiateSendMessages")
        // chrome.alarms.create("campaignScheduler", {periodInMinutes: campaignIntvTime})
        startCampaignScheduler();
        manageSendingLoop();
      })
      break;
    case "extensionInstallation":
      // Function to start MSQS alarm
      let alarms = await chrome.alarms.getAll();
      // console.log("alarms 1 ::: ", alarms);
      const alarmScheduler = alarms && alarms.filter(el => el.name === 'scheduler')
      // console.log("alarmScheduler ::: ", alarmScheduler);
      if (!alarmScheduler || (alarmScheduler && alarmScheduler.length === 0)) {
        chrome.alarms.create("scheduler", { periodInMinutes: schedulerIntvTime })
      }
      const alarmPendingFR = alarms && alarms.filter(el => el.name === 'pendingFR')
      // console.log("alarmPendingFR ::: ", alarmPendingFR);
      if (!alarmPendingFR || (alarmPendingFR && alarmPendingFR.length === 0)) {
        chrome.alarms.create("pendingFR", { periodInMinutes: pendingFRIntvTime })
      }
      const alarmReFriending = alarms && alarms.filter(el => el.name === 'reFriending')
      // console.log("alarmReFriending ::: ", alarmReFriending);
      if (!alarmReFriending || (alarmReFriending && alarmReFriending.length === 0)) {
        chrome.alarms.create("reFriending", { periodInMinutes: reFRIntvTime })
      }
      const alarmCampaignScheduler = alarms && alarms.filter(el => el.name === 'campaignScheduler')
      // console.log("alarmCampaignScheduler ::: ", alarmCampaignScheduler);
      if (!alarmCampaignScheduler || (alarmCampaignScheduler && alarmCampaignScheduler.length === 0)) {
        chrome.alarms.create("campaignScheduler", { periodInMinutes: campaignIntvTime })
      }
      manageSendingLoop()
      await helper.saveDatainStorage("fr_token", request.frLoginToken)
      await helper.saveDatainStorage("fr_debug_mode", request.frDebugMode)
      sendResponseExternal(true);
      break;
    case "syncprofile":
      if (request.frLoginToken !== null) {
        await helper.saveDatainStorage("fr_token", request.frLoginToken)
        getProfileInfo((userProfileData) =>
          sendResponseExternal(userProfileData)
        );
      } else {
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
          // console.log("Syncing tab ::::::::::::", tab)
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
      chrome.storage.local.remove("fr_debug_mode")
      stopRunningScript("sendFR", "all");
      removeTab("tabsId")
      break;
    case "unfriend":
      let resp = await unfriend(request.payload);
      sendResponseExternal(resp);
      break;
    case "logout":

      // Function to clear MSQS alarm
      stopSendingLoop();
      // KIll FRQUE 
      frQue_Kill();


      chrome.alarms.clear("scheduler");
      chrome.alarms.clear("pendingFR");
      chrome.alarms.clear("reFriending");
      chrome.alarms.clear("InitiateSendMessages");
      console.log('logggggggggggggggggggggggggggggggg out        :')
      chrome.action.setPopup({ popup: "" });
      chrome.storage.local.remove('fr_token');
      chrome.storage.local.remove('fr_debug_mode');
      chrome.storage.local.remove('messageQueue');
      chrome.tabs.query({ currentWindow: false, active: true }, async (tab) => {
        // console.log(tab);
        const postPopupId = await helper.getDatafromStorage("postPopupId");
        console.log("postPopupId ::: ", postPopupId);
        if (postPopupId !== 0) {
          const tabId = tab.filter(el => el.id === postPopupId);
          console.log("tabId array ::: ", tabId);
          if (tabId && tabId.length > 0)
            chrome.tabs.remove(parseInt(postPopupId));
          else
            await helper.removeDatafromStorage("postPopupId")
          // stopRunningScript("sendFR", "post")
          // const CurrentTabId = await helper.getDatafromStorage("PostTabId");
          // chrome.tabs.sendMessage(Number(CurrentTabId), {action: "stop", source: "post"})
        }
      })
      const campaignListFromStore = await helper.getAllKeysFromStorage('Campaign_');
      // console.log("campaignListFromStore ::: ", campaignListFromStore)
      if (campaignListFromStore.length > 0) {
        for (let i = 0; i < campaignListFromStore.length; ++i) {
          // console.log("campaignListFromStore :: ", campaignListFromStore[i])
          helper.removeDatafromStorage(campaignListFromStore[i])
        }
      }
      let alarm = await chrome.alarms.getAll();
      alarm = alarm && alarm.filter(el => el.name.includes('Campaign_'))
      // console.log("alarm ::: ", alarm)
      if (alarm && alarm.length > 0) {
        for (let i = 0; i < alarm.length; ++i) {
          // console.log("alarm :: ", alarm[i])
          chrome.alarms.clear(alarm[i].name);
        }
      }
      const runAction_group = await helper.getDatafromStorage("runAction_group");
      const runAction_post = await helper.getDatafromStorage("runAction_post");
      const runAction_friend = await helper.getDatafromStorage("runAction_friend");
      const runAction_suggestions = await helper.getDatafromStorage("runAction_suggestions");
      if (runAction_group === "running" || runAction_group === "pause") {
        const gFBTabId = await helper.getDatafromStorage("groupTabId");
        if (gFBTabId)
          chrome.tabs.reload(parseInt(gFBTabId));
      }
      if (runAction_post === "running" || runAction_post === "pause") {
        const pFBTabId = await helper.getDatafromStorage("PostTabId");
        if (pFBTabId)
          chrome.tabs.reload(parseInt(pFBTabId));
      }
      if (runAction_friend === "running" || runAction_friend === "pause") {
        const fFBTabId = await helper.getDatafromStorage("FriendTabId");
        if (fFBTabId)
          chrome.tabs.reload(parseInt(fFBTabId));
      }
      if (runAction_suggestions === "running" || runAction_suggestions === "pause") {
        const sFBTabId = await helper.getDatafromStorage("suggestedTabId");
        if (sFBTabId)
          chrome.tabs.reload(parseInt(sFBTabId));
      }
      break;
    case "deletePendingFR":
      // console.log("Delete All.................", request)
      fbDtsg(async (fbDtsg, userID) => {
        if (!userID)
          return;
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
        if (userID === request.fbUserId) {
          const outgoingPendingRequestDefinition = await helper.getOutgoingPendingRequestList(userID, false)
          if (!outgoingPendingRequestDefinition || outgoingPendingRequestDefinition.length === 0) {
            sendMessageToPortalScript({ type: "cookie", content: "Empty", action: "deleteAllPendingFR" })
            return;
          }
          cancelPendingFriendRequest(outgoingPendingRequestDefinition, fbDtsg, userID)
        }
        else {
          sendMessageToPortalScript({ type: "cookie", content: "Done", action: "deleteAllPendingFR" })
          sendMessageToPortalScript({ type: "alert", content: "Please login to selected profile in facebook to delete all." })
        }
      });
      break;

    case "getUidForThisUrl":
      if (request && request.url)
        getprofileDataofURL(request.url, sendResponseExternal)
      break;

    case "update_schedules":
      console.log("update_schedules invoked");
      startCampaignScheduler();
      break;

    case "fRqueSettingUpdate":
      if (request && request.payload) {
        // console.log("frQueSettingUpdate", request.frQueSetting)
        let resData = request.payload;
        console.log("frQueSettingUpdate", resData);
        let frQueSettings = {
          "runningStatus": resData.frQueueRunning,
          "requestLimited": resData.requestLimited,
          "requestLimitValue": resData.requestLimitValue,
          "timeDelay": 3,
        }

        FrQueue_Manager();


      }
      sendResponseExternal({
        status: true,
        message: "345 satus updated",
      });
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
    Accept: 'text/html,application/xhtml+xml,application/xml'
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
      if (userProfileData) {
        userProfileData = userProfileData[0];
        userProfileData = JSON.parse(userProfileData);
        if (userProfileData && userProfileData.f && userProfileData.u) {
          // console.log("inside if block......................")
          const userId = userProfileData.u.split("__user=")[1].split("&")[0];
          let profileUrls = e.split(`"profile_picture":{"uri":"`)
          profileUrls = profileUrls && profileUrls.length > 1 && profileUrls[1];
          profileUrls = profileUrls && profileUrls.split(`"},`)[0]
          profileUrls = profileUrls && profileUrls.replaceAll("\\", "")
          // console.log("profile pic :3333333333333333333333:: ", profileUrls);
          if (callback) {
            // console.log("callback is here")
            let profileUpdate = {
              uid: userId.toString(),
              path: "/" + userId,
              text: e.split('"NAME":"') && e.split('"NAME":"').length > 1 ? e.split('"NAME":"')[1].split('",')[0] : "",
              photo: profileUrls && profileUrls.length > 0 ? profileUrls : '',
              isFbLoggedin: true,
              status: true
            };
            // console.log("profileUpdate ::: ", profileUpdate)
            callback(profileUpdate);
          }
        } else {
          if (e.indexOf(`Log in`) > -1)
            callback({ status: true, isFbLoggedin: false })
          else
            getFBUserData(callback, true);
        }
      } else {
        if (e.indexOf(`Log in`) < -1)
          callback({ status: true, isFbLoggedin: false })
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
  const [...tabs] = await chrome.tabs.query({ title: "Friender", url: process.env.REACT_APP_APP_URL + "/*" });
  for (let t = 0; t < tabs.length; t++) {
    chrome.tabs.sendMessage(tabs[t].id, request);
  }
}

// This function is called to reload portal after reloading the extension
const reloadPortal = async () => {
  const [...tab] = await chrome.tabs.query({ title: "Friender", url: process.env.REACT_APP_APP_URL + "/*" });
  // console.log("tab", tab)
  for (let i = 0; i < tab.length; ++i) {
    chrome.tabs.update(tab[i].id, { url: tab[i].url });
  }
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
      // ConnectToSocket(request);
      sendMessageToPortalScript({ action: "fr_countBadge", content: request.count.toString() })
      break;

    case "facebookLoggedOut":
      helper.removeDatafromStorage("fbTokenAndId");
      // ConnectToSocket(request);
      checkTabsActivation("fr_sync");
      removeTab("tabsId");
      chrome.action.setBadgeText({ text: "" });
      break;

    case "finalFriendList":
      // ConnectToSocket(request);
      chrome.action.setBadgeText({ text: "Done" });
      break;

    case "sendUpdate":
      console.log("request.isSyncing ::: ", request.isSyncing, request.tabClose);
      if (request.tabClose !== undefined && request.tabClose) {
        checkTabsActivation("fr_sync");
        removeTab("tabsId");
      }
      // ConnectToSocket(request);
      sendMessageToPortalScript({ action: "fr_update", content: request.update });
      sendMessageToPortalScript({ action: "fr_isSyncing", content: request.isSyncing, type: "cookie" });
      break;

    case "resetFbdtsg":
      fbDtsg((fbDtsg, userID) => {
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
      });
      break;

    case "sendFriendRequestInGroup":
      // console.log("request ::::::::::::::::: ", request)
      chrome.tabs.query({ currentWindow: true, active: true }, async (tab) => {
        // console.log("tabInfo ::: ", tab[0].url, tab[0].url.includes("https://www.facebook.com/groups/"), tab[0].url.includes("people"));
        if (
          tab &&
          tab.length &&
          tab[0].url.includes("https://www.facebook.com/groups/") &&
          (tab[0].url.includes("members") || tab[0].url.includes("people"))
        ) {
          // console.log("its matched");
          await helper.saveDatainStorage("groupTabId", tab[0].id)
          injectScript(tab[0].id, ["helper.js", "storeFR.js"]);
          setTimeout(() => {
            chrome.tabs.sendMessage(tab[0].id, { action: "start", source: "groups", response: request.response });
          }, 1000);
        }

        console.log("tabInfo ::: ", tab, tab[0]);
        if (
          tab &&
          tab.length &&
          tab[0].url.includes("https://www.facebook.com/friends/") &&
          (tab[0].url.includes("suggestions"))
        ) {
          console.log("its matched suggested friends");
          await helper.saveDatainStorage("suggestedTabId", tab[0].id)
          injectScript(tab[0].id, ["helper.js", "storeFR.js"]);
          setTimeout(() => {
            chrome.tabs.sendMessage(tab[0].id, { action: "start", source: "suggestions", response: request.response });
          }, 1000);
        }

        if (
          tab &&
          tab.length &&
          tab[0].url.includes("https://www.facebook.com/") &&
          (tab[0].url.includes("friends") && !tab[0].url.includes("suggestions"))
        ) {
          console.log("its matched for friend of friends");
          await helper.saveDatainStorage("FriendTabId", tab[0].id)
          injectScript(tab[0].id, ["helper.js", "storeFR.js"]);
          setTimeout(() => {
            chrome.tabs.sendMessage(tab[0].id, { action: "start", source: "friends", response: request.response });
          }, 1000);
        }
      });
      chrome.tabs.query({ currentWindow: false, active: true }, async (tab) => {
        // console.log("=============================================", tab)
        if (request.source === "post") {
          let tabb = tab[0]
          if (tab[0].favIconUrl === undefined)
            tabb = tab[1];
          const postUrl = await helper.getDatafromStorage('postUrl');
          const isSponsored = await helper.getDatafromStorage('isSponsored')
          console.log("postUrl ::: ", postUrl, isSponsored)
          if (!isSponsored) {
            chrome.tabs.create(
              { url: postUrl, active: false, pinned: true, selected: false },
              (tabs) => {
                // console.log("Syncing tab ::::::::::::", tab)
                chrome.tabs.onUpdated.addListener(async function listener(
                  tabId,
                  info
                ) {
                  if (info.status === "complete" && tabId === tabs.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    // chrome.storage.local.set({ postTabId: tabs.id });
                    injectScript(tabs.id, ["helper.js", "storeFR.js"]);
                    setTimeout(async () => {
                      const feedbackTargetID = await chrome.tabs.sendMessage(tabs.id, { action: "getFeedbackTargetID", source: "post" });
                      console.log("FeedbackTargetID :::::::::::: ", feedbackTargetID)
                      chrome.tabs.remove(parseInt(tabs.id));
                      const isContentAvailable = await chrome.tabs.sendMessage(tabb.id, { action: "contentAvailibility" })
                      console.log("isContentAvailable :::: ", isContentAvailable);
                      const PostTabId = await helper.getDatafromStorage("PostTabId");
                      console.log("PostTabId ::: ", PostTabId);
                      await helper.saveDatainStorage("PostTabId", tabb.id);
                      console.log("----------------------------", tabb.id)
                      console.log("----------------------------", Number(PostTabId) !== tabb.id)
                      if (Number(PostTabId) !== tabb.id || !isContentAvailable)
                        injectScript(tabb.id, ["helper.js", "storeFR.js"]);
                      setTimeout(() => {
                        chrome.tabs.sendMessage(tabb.id, { action: "start", source: "post", feedbackTargetID: feedbackTargetID, response: request.response });
                      }, 1000);
                    }, 1000);
                  }
                });
              }
            );
          }
          if (isSponsored) {
            await helper.saveDatainStorage("PostTabId", tabb.id);
            console.log("isSponsored : ", isSponsored);
            chrome.tabs.sendMessage(tabb.id, { action: "startForSponsored", source: "post", response: request.response });
          }
        }
      })
      break;
    case "shouldfrienderRun":
      // console.log("request ::::::::::: ", request, sender);
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        // console.log("tabs ::::::::::: ", tabs);
        if (request.source === "groups") {
          if (tabs[0].url.includes("groups") && (tabs[0].url.includes("members") || tabs[0].url.includes("people"))) {
            // console.log("url [groups] ::: ", tabs[0].url);
            chrome.runtime.sendMessage({ ...request, res: true });
          }
          else
            chrome.runtime.sendMessage({ ...request, res: false });
        }
        if (request.source === "suggestions") {
          if (tabs && tabs.length && tabs[0].url.includes("https://www.facebook.com/friends/") &&
            (tabs[0].url.includes("suggestions"))) {
            console.log("url [suggestions] ::: ", tabs[0].url);
            chrome.runtime.sendMessage({ ...request, res: true });
          }
          else
            chrome.runtime.sendMessage({ ...request, res: false });
        }
        if (request.source === "friends") {
          if (tabs && tabs.length && tabs[0].url.includes("https://www.facebook.com/") &&
            (tabs[0].url.includes("friends") && !tabs[0].url.includes("suggestions"))) {
            console.log("url [friends] ::: ", tabs[0].url);
            chrome.runtime.sendMessage({ ...request, res: true });
          }
          else
            chrome.runtime.sendMessage({ ...request, res: false });
        }
      })
      chrome.tabs.query({ currentWindow: false, active: true }, (tabs) => {
        if (tabs[0] && tabs[0].favIconUrl && tabs[0].favIconUrl === "")
          tabs.shift()
        if (request.source === "post") {
          if (tabs && tabs.length && tabs[0].url.includes("https://www.facebook.com") && !tabs[0].url.includes("suggestions")
            && !tabs[0].url.includes("friends") && !(tabs[0].url.includes("groups") && (tabs[0].url.includes("members") || tabs[0].url.includes("people")))) {
            console.log("url [post] ::: ", tabs[0].url);
            chrome.runtime.sendMessage({ ...request, res: true });
          }
          else
            chrome.runtime.sendMessage({ ...request, res: false });
        }
      })
      break;

    case "FetchEssentials":
      chrome.tabs.create(
        { url: request.url, active: false, pinned: true, selected: false },
        (tabs) => {
          // console.log("Syncing tab ::::::::::::", tab)
          chrome.tabs.onUpdated.addListener(async function listener(
            tabId,
            info
          ) {
            if (info.status === "complete" && tabId === tabs.id) {
              chrome.tabs.onUpdated.removeListener(listener);
              const responseEssentials = await chrome.tabs.sendMessage(tabs.id, request);
              console.log("responseEssentials :::::::::::: ", responseEssentials)
              chrome.tabs.remove(parseInt(tabs.id));
              let activetab;
              if (request.source === "friends")
                activetab = await helper.getDatafromStorage("FriendTabId");
              chrome.tabs.sendMessage(parseInt(activetab), { ...request, responseEssentials: responseEssentials });
            }
          });
        }
      );
      break;

    case "checkTabUrl":
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        // console.log("tabs ::::::::::: ", tabs);
        if (tabs[0].url.includes("groups") && (tabs[0].url.includes("members") || tabs[0].url.includes("people"))) {
          // console.log("url ::: ", tabs[0].url);
          // chrome.alarms.create("setSettingsForGroup", { when: Date.now() })
          setTimeout(() => {
            chrome.runtime.sendMessage({ action: "setSettingsForGroup" });
          }, 200)
        }
        else if (
          tabs && tabs.length && tabs[0].url.includes("https://www.facebook.com/friends/") &&
          (tabs[0].url.includes("suggestions"))) {
          setTimeout(() => {
            chrome.runtime.sendMessage({ action: "setSettingsForSuggested" });
          }, 200)
        }
        else if (
          tabs && tabs.length && tabs[0].url.includes("https://www.facebook.com/") &&
          (tabs[0].url.includes("friends") && !tabs[0].url.includes("suggestions"))) {
          setTimeout(() => {
            chrome.runtime.sendMessage({ action: "setSettingsForFriendsOfFriend" });
          }, 200);
        }
        else if (tabs && tabs.length && tabs[0].url === "https://www.facebook.com/") {
          // setTimeout(()=>{
          //   chrome.runtime.sendMessage({ action: "setPostPopup" });
          // },200);
        }
        else {
          if (!tabs[0].url.includes("chrome-extension://"))
            chrome.tabs.create({ url: process.env.REACT_APP_APP_URL });
        }
      })
      break;

    case "reSendFriendRequestInGroup":
      let currentTabId;
      if (request.source === "post") {
        currentTabId = await helper.getDatafromStorage("PostTabId");
      }
      if (request.source === "suggestions") {
        currentTabId = await helper.getDatafromStorage("suggestedTabId");
      }
      if (request.source === "groups") {
        currentTabId = await helper.getDatafromStorage("groupTabId");
      }
      if (request.source === "friends") {
        currentTabId = await helper.getDatafromStorage("FriendTabId");
      }
      chrome.tabs.sendMessage(Number(currentTabId), request);
      break;

    case "stop":
      let currentFBTabId;
      if (request.source === "post") {
        currentFBTabId = await helper.getDatafromStorage("PostTabId");
      }
      if (request.source === "suggestions") {
        currentFBTabId = await helper.getDatafromStorage("suggestedTabId");
      }
      if (request.source === "groups") {
        currentFBTabId = await helper.getDatafromStorage("groupTabId");
      }
      if (request.source === "friends") {
        currentFBTabId = await helper.getDatafromStorage("FriendTabId");
      }
      chrome.tabs.sendMessage(Number(currentFBTabId), request);
      if (request.source) { FrQueue_Manager() }
      break;

    case "pause":
      // console.log("Paused.................. ", request)
      let currentFBTabIdIs;
      if (request.source === "post") {
        currentFBTabIdIs = await helper.getDatafromStorage("PostTabId");
      }
      if (request.source === "suggestions") {
        currentFBTabIdIs = await helper.getDatafromStorage("suggestedTabId");
      }
      if (request.source === "groups") {
        currentFBTabIdIs = await helper.getDatafromStorage("groupTabId");
      }
      if (request.source === "friends") {
        currentFBTabIdIs = await helper.getDatafromStorage("FriendTabId");
      }
      chrome.tabs.sendMessage(Number(currentFBTabIdIs), request);
      if (request.source) { FrQueue_Manager() }
      break;
    
    case "getfriendId":
      console.log("request ::: ", request);
      let paylaod = {};
      if(request.memberContact.friendFbId === ""){
        chrome.tabs.create(
          { url: request.memberContact.friendProfileUrl, active: false, pinned: true, selected: false },
          (tabs) => {
            // console.log("getId tab ::::::::::::", tabs)
            chrome.tabs.onUpdated.addListener(async function listener(
              tabId,
              info
            ) {
              if (info.status === "complete" && tabId === tabs.id) {
                chrome.tabs.onUpdated.removeListener(listener);
                setTimeout(async () => {
                const {contactId} = await chrome.tabs.sendMessage(Number(tabs.id), {action : "getUserId"});
                chrome.tabs.remove(tabs.id)
                const gTabId = await helper.getDatafromStorage("PostTabId");
                if(request.filter){
                  const genderCountryTier = await getGenderCountryAndTiers(request.memberContact.friendName);
                  payload = { ...request, memberContact: {...request.memberContact, friendFbId : contactId ? contactId : "", gender: genderCountryTier.gender, country: genderCountryTier.countryName, tier: genderCountryTier.Tiers} }
                }
                chrome.tabs.sendMessage(Number(gTabId), payload);
              }, 1000);
              }
            });
          }
        );
      } else{
        const gTabId = await helper.getDatafromStorage("PostTabId");
        if(request.filter){
          const genderCountryTier = await getGenderCountryAndTiers(request.memberContact.friendName);
          payload = { ...request, memberContact: {...request.memberContact, gender: genderCountryTier.gender, country: genderCountryTier.countryName, tier: genderCountryTier.Tiers} }
        }
        chrome.tabs.sendMessage(Number(gTabId), payload);
      }
      break;
    case "getGenderCountryAndTier":
      // console.log("request ::: ", request);
      // const resp = {...request}
      // console.log("resp ::: ", resp);
      const genderCountryAndTier = await getGenderCountryAndTiers(request.name);
      // console.log("genderCountryAndTier ::: ", genderCountryAndTier);
      let genderTabId;
      if (request.source === "post") {
        genderTabId = await helper.getDatafromStorage("PostTabId");
      }
      if (request.source === "suggestions") {
        genderTabId = await helper.getDatafromStorage("suggestedTabId");
      }
      if (request.source === "groups") {
        genderTabId = await helper.getDatafromStorage("groupTabId");
      }
      if (request.source === "friends") {
        genderTabId = await helper.getDatafromStorage("FriendTabId");
      }
      // console.log("tabsID :: ", genderTabId, Number(genderTabId))
      chrome.tabs.sendMessage(Number(genderTabId), { ...request, "responsePayload": genderCountryAndTier });
      break;

    case "getGenderCountryAndTierForIncoming":
      // console.log("request ::: ", request);
      const list = [...{ ...request }.incomingPendingList]
      console.log("list ::: ", list);
      list.forEach(async (el, i) => {
        const getGenderCountryAndTierForIncoming = await getGenderCountryAndTiers(el.friendName);
        console.log("getGenderCountryAndTierForIncoming ::: ", getGenderCountryAndTierForIncoming)
        list[i] = {
          ...list[i],
          "gender": getGenderCountryAndTierForIncoming.gender ? getGenderCountryAndTierForIncoming.gender : "N/A",
          "country": getGenderCountryAndTierForIncoming.countryName ? getGenderCountryAndTierForIncoming.countryName : "N/A",
          "tier": getGenderCountryAndTierForIncoming.Tiers ? getGenderCountryAndTierForIncoming.Tiers : "N/A"
        };
        // console.log("i ::: ", i)
        if (list.length - 1 === i)
          await common.storeIncomingPendingReq(request.userId, list)
      });
      break;


    case "updateCountryAndTier":
      // console.log(" UPDATE GENDER COUNTRY AND TIER CALLED",request)
      updateGenderCountryAndTier(request);
      break;

    case "sendMessage":
      let campaign_send_date = helper.getCurrentDayAndTimein();
      campaign_send_date = campaign_send_date.search_date
      let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
      const exp_time = search_date + "T" + currentTime;
      console.log("exp_time", exp_time)
      storeInMsqs(request.userId, request.recieverId, request.name, request.message, request.settingsType, exp_time, campaign_send_date)
      break;

    case "sendMessageAcceptOrReject":
      sendMessageAcceptOrReject()
      break;

    case "openPostSetting":
      chrome.tabs.query({ currentWindow: false, active: true }, async (tab) => {
        console.log(tab);
        const postPopupId = await helper.getDatafromStorage("postPopupId");
        console.log("postPopupId ::: ", postPopupId);
        if (postPopupId !== 0) {
          const tabId = tab.filter(el => el.id === postPopupId);
          console.log("tabId array ::: ", tabId);
          if (tabId && tabId.length > 0)
            chrome.tabs.remove(parseInt(postPopupId));
          else
            await helper.removeDatafromStorage("postPopupId")
          stopRunningScript("sendFR", "post")
          const CurrentTabId = await helper.getDatafromStorage("PostTabId");
          await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: "post" })
          chrome.tabs.sendMessage(Number(CurrentTabId), { action: "stop", source: "post" })
        }
        console.log("request.postUrl :: ", request.postUrl)
        if (request.postUrl)
          await helper.saveDatainStorage('postUrl', request.postUrl)
        else
          await helper.saveDatainStorage('isSponsored', request.isSponsored)
        chrome.windows.create({ url: 'popup.html', type: 'popup', width: 799, height: 600 }, async res => {
          console.log("res", res.tabs[0]);
          await helper.saveDatainStorage('postPopupId', res.tabs[0].id)
          await helper.saveDatainStorage('windowId', res.tabs[0].windowId)
          setTimeout(() => {
            chrome.runtime.sendMessage({ action: "setPostPopup", source: "post" });
          }, 500);
        });
      })
      // chrome.action.setPopup({ popup: "popup.html" });
      // chrome.action.openPopup({'url' : 'popup.html', 'type' : 'popup'}); 
      break;
    case "fr_queue_success":
      console.log("postmessage in fr_queue_success in bg");
      sendMessageToPortalScript({ type: "postmessage", content: "fr_queue_success" });
      break;
    default: break;
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
const unfriend = async (friends) => {

  // console.log("Inside unfriend ()")
  let deletedFriends = [];

  for (let i = 0; i < friends.length; i++) {
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
  console.log("scheduleFromTime ::: ", scheduleFromTime);
  console.log("scheduleToTime ::: ", scheduleToTime);
  scheduleFromTime = Number((scheduleFromTime && scheduleFromTime.split(":"))[0]);
  scheduleToTime = Number((scheduleToTime && scheduleToTime.split(":"))[0]);

  console.log("scheduleFromTime ::: ", scheduleFromTime);
  console.log("scheduleToTime ::: ", scheduleToTime);

  // Run auto sync if its enable, scheduled now and not already running
  let todayDate = new Date();
  let lastSyncDate = await helper.getDatafromStorage(
    "lastAutoSyncFriendListDate"
  );
  let isAlreadySyncedToday = false;
  let lastSyncId = [];
  if (lastSyncDate && !helper.isEmptyObj(lastSyncDate)) {
    lastSyncDate = new Date(lastSyncDate)
    isAlreadySyncedToday = todayDate.setHours(0, 0, 0, 0) === lastSyncDate.setHours(0, 0, 0, 0);
    if (isAlreadySyncedToday) {
      lastSyncId = await helper.getDatafromStorage(
        "lastAutoSyncFriendListId"
      );
      console.log("lastSyncId ::: ", lastSyncId, fbuserId);
      if (lastSyncId && !helper.isEmptyObj(lastSyncId) && lastSyncId.length > 0) {
        if (lastSyncId.indexOf(fbuserId) < 0) {
          isAlreadySyncedToday = false;
        }
      }
      else {
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


chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log("alarm in add listener ::: ", alarm)
  let alarmName = alarm.name;
  if (alarmName.includes('_')) {
    alarmName = alarmName && alarmName.split('_')[0];
  }
  switch (alarmName) {
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

    case "reFriending":
      getRefriendingList()
      break;

    case "campaignScheduler":
      // getCampaignList();
      break;

    case "InitiateSendMessages":
      const payload = await helper.getDatafromStorage("payload");
      // console.log("payload ::: ", payload)
      // let fbUserId = await helper.getDatafromStorage("fbTokenAndId");
      InitiateSendMessages(payload.fbDtsg, payload.userId, payload.sentFRLogForAccept, payload.sentFRLogForReject, payload.fetchIncomingLog, payload.fetchIncomingFRLogForAccept, payload.fetchIncomingFRLogForReject);
      break;

    case "Campaign":
      console.log("-----------------Campaign Scheduler------------------", alarm, alarm.name)
      const campaignId = alarm && alarm.name && alarm.name.split('_')[1];
      const indx = alarm && alarm.name && alarm.name.split('_')[2];
      console.log("Campaign Id ::: ", campaignId)
      const nextCampaign = await helper.getDatafromStorage('Campaign_' + campaignId);
      console.log("next campaign :::: ", nextCampaign)
      satrtHourlyScheduler(nextCampaign, indx);
      break;
    case "frQueueFetchAlarm":
      console.log("-----------------Friend Request Queue Scheduler------------------", alarm, alarm.name);
      FrQueue_Manager();
      break;
    case "frQueueRunnerAlarm":
      console.log("-----------------Friend Request Queue Runner Scheduler------------------", alarm, alarm.name);
      runFriendRequestQueue();
      break;
    case "CampaignMin":
      console.log("-----------------Campaign Min Scheduler------------------", alarm, alarm.name)
      const campaignIdd = alarm && alarm.name && alarm.name.split('_')[1];
      const indxx = alarm && alarm.name && alarm.name.split('_')[2];
      console.log("Campaign Id ::: ", campaignIdd)
      const next_campaign = await helper.getDatafromStorage('Campaign_' + campaignIdd);
      console.log("next campaign :::: ", next_campaign)
      campaignToMsqs(next_campaign, indxx);
      break;
    default: break;
  }

});

chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
  // console.log("ONUPDATE A [[[[[tab]]]]] --->>> ",  tab);
  let CurrentTabId, source = "all";
  if (tab.url.includes("https://www.facebook.com/")) {
    CurrentTabId = await helper.getDatafromStorage("PostTabId");
    source = "post";
  }
  if (tab.url.includes("https://www.facebook.com/friends/") && tab.url.includes("suggestions")) {
    CurrentTabId = await helper.getDatafromStorage("suggestedTabId");
    source = "suggestions";
  }
  if (tab.url.includes("https://www.facebook.com/groups/") && (tab.url.includes("members") || tab.url.includes("people"))) {
    CurrentTabId = await helper.getDatafromStorage("groupTabId");
    source = "groups";
  }
  if (tab.url.includes("https://www.facebook.com/") && (tab.url.includes("friends") && !tab.url.includes("suggestions"))) {
    CurrentTabId = await helper.getDatafromStorage("FriendTabId");
    source = "friends";
  }
  const CurrentTabsId = await helper.getDatafromStorage("tabsId");
  markFriendRequestList(tabID, changeInfo, tab);
  // console.log("------------tabID-------------", tabID);
  // console.log("------------Number(CurrentTabId)---------------", Number(CurrentTabId));
  if (tabID === Number(CurrentTabId)) {
    if (changeInfo && changeInfo.status && changeInfo.status === "loading") {
      chrome.tabs.sendMessage(Number(CurrentTabId), { action: "stop" })
      stopRunningScript("sendFR", source);
    }
  }
  if (tabID === Number(CurrentTabsId)) {
    stopRunningScript("syncFriends");
  }
}
)

const markFriendRequestList = (tabID, changeInfo, tab) => {
  if (tab.url && tab.url.startsWith("https://www.facebook.com/friends/requests") &&
    (changeInfo && changeInfo.status !== undefined
      && changeInfo.status.toLocaleLowerCase().trim() === "complete")) {
    // Log the entire changeInfo object in a readable format
    // console.log("tabidd",tabID)
    // console.log("chanage info:",changeInfo.url);

    // Inject your content script into the updated tab
    injectScript(tabID, ["frListMarkingScript.js"]);

  }
}


chrome.tabs.onRemoved.addListener(async (tabID, removeInfo) => {
  // console.log("on close tab", removeInfo);
  // let CurrentTabId = await helper.getDatafromStorage("tabId");
  const groupTabId = await helper.getDatafromStorage("groupTabId");
  const postTabId = await helper.getDatafromStorage("PostTabId");
  const friendTabId = await helper.getDatafromStorage("FriendTabId");
  const suggestedTabId = await helper.getDatafromStorage("suggestedTabId");

  if (tabID === Number(groupTabId)) {
    stopRunningScript("sendFR", "groups")
  }
  if (tabID === Number(postTabId) || tabID === Number(friendTabId)) {
    stopRunningScript("sendFR", "post")
  }
  if (tabID === Number(friendTabId)) {
    stopRunningScript("sendFR", "friends")
  }
  if (tabID === Number(suggestedTabId)) {
    stopRunningScript("sendFR", "suggestions")
  }
})

const stopRunningScript = async (action = "sendFR", source) => {
  chrome.runtime.sendMessage({ action: "close" })
  if (action === "sendFR") {
    switch (source) {
      case "groups":
        await helper.removeDatafromStorage("runAction_group");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: source })
        break;
      case "post":
        await helper.removeDatafromStorage("runAction_post");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: source })
        break;
      case "friends":
        await helper.removeDatafromStorage("runAction_friend");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: source })
        break;
      case "suggestions":
        await helper.removeDatafromStorage("runAction_suggestions");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: source })
        break;
      case "all":
        await helper.removeDatafromStorage("runAction_group");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: "groups" })
        await helper.removeDatafromStorage("runAction_post");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: "post" })
        await helper.removeDatafromStorage("runAction_friend");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: "friends" })
        await helper.removeDatafromStorage("runAction_suggestions");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: "suggestions" })
        // }
        break;
      default:
        break;
    }
  }
  if (action === "syncFriends") {
    // await helper.removeDatafromStorage("friendLength");
  }
}

// Test scheduler func
// chrome.storage.local.remove(['lastAutoSyncFriendListDate']);
// checkScheduledSync();

const updateGenderCountryAndTier = async (request) => {

  async function proceedToUpdateGenderCountryAndTier(exFriendList = []) {
    /**
     * 
     * @param {
     * *0 : no match and no data found (P.S :  currentData field always comes empty in this state)
     * *1 : both match and data found (P.S : currentData field has all the required info hence we can use this and skip calling gender API)
     * *2 : perfect match not found but data found (P.S : you can use the currentData field here as per your need, if required) 
     * } status 
     * @returns 
     */
    async function checkExsistingData(currFriend) {
      return new Promise(async (resolve, reject) => {
        // console.log("inside check exsisting data",exFriendList)
        if (exFriendList.length) {
          const foundFriend = await exFriendList.find(exFriendList => exFriendList.friendFbId == currFriend.id);
          // console.log("foundFriend",foundFriend)
          if (foundFriend) {
            if (foundFriend.tier != undefined && foundFriend.tier != "NA" && foundFriend.country != undefined && foundFriend.country != "NA" && foundFriend.friendGender != undefined && foundFriend.friendGender != "NA" && foundFriend.friendGender != "UNKNOWN") {
              // console.log("** Local match found - No gender API call required",foundFriend)
              resolve({
                status: 1,
                currentData: foundFriend
              })
            } else {
              // console.log("** Data found but didnt match with criteria, hence API call is required",foundFriend)
              resolve({
                status: 2,
                currentData: foundFriend
              })
            }
          } else {
            // console.log("** No match and no data found, hence API call is required")
            resolve({
              status: 0,
              currentData: []
            })
          }
        } else {
          // console.log("** No match and no data found, hence API call is required")
          resolve({
            status: 0,
            currentData: []
          })
        }
      })
    }
    async function fetchGenderCountryTier(friend) {
      return new Promise((resolve, reject) => {
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
                status: true,
                country: res.body.countryName,
                tier: res.body.Tiers,
                gender: res.body.gender
              })
            }
          })
          .catch((err) => {
            resolve({
              status: false,
              country: "",
              tier: "",
              gender: ""
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
        await helper.sleep(1000 * 5)
      }

      let exFriendData = await checkExsistingData(friend)
      if (exFriendData.status != 1) {
        let fetchGenderAPI = await fetchGenderCountryTier(friend)
        if (fetchGenderAPI.status) {
          console.log("actual friend object", JSON.stringify(friend))
          console.log("GENDER from gender API", JSON.stringify(fetchGenderAPI.gender))
          console.log("conditioned final gender", friend.gender != undefined && friend.gender != "UNKNOWN" ? friend.gender : fetchGenderAPI.gender)
          friendPayload.country = fetchGenderAPI.country
          friendPayload.tier = fetchGenderAPI.tier
          friendPayload["friendGender"] = friend.gender != undefined && friend.gender != "UNKNOWN" ? friend.gender : fetchGenderAPI.gender
          totalGenderAPIHits++
          console.log("payload from Gender API", JSON.stringify(friendPayload))
          updateFriendPayload.push(friendPayload);
        }

      } else {
        totalLocalfetchs++
        friendPayload.country = exFriendData.currentData.country;
        friendPayload.tier = exFriendData.currentData.tier
        // friendPayload.friendGender = exFriendData.friendGender
        console.log("payload from local data", JSON.stringify(friendPayload))
        updateFriendPayload.push(friendPayload);
      }

      if (i + 1 === listLen) {
        // console.log("Country List", updateFriendPayload);
        setTimeout(() => {
          console.log("totalGenderAPIhits ::", JSON.stringify(totalGenderAPIHits))
          console.log("totalLocalfetchs ::", JSON.stringify(totalLocalfetchs))
          console.log("Update country and Tier", JSON.stringify(updateFriendPayload))
          updateFriendList(updateFriendPayload, fbUserId)
        }, 2000)
      }
    }
  }


  let fr_token = await helper.getDatafromStorage("fr_token");
  fetch(process.env.REACT_APP_FETCH_EX_FRIENDS, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "authorization": fr_token,
    },
    body: JSON.stringify({
      fbUserId: request.fbUserId
    })
  })
    .then((response) => response.json())
    .then((res) => {
      if (res && res.data != undefined && res.data.length && res.data[0].friend_details != undefined && res.data[0].friend_details.length) {
        console.log("friend list present***", JSON.stringify(res.data[0].friend_details))
        proceedToUpdateGenderCountryAndTier(res.data[0].friend_details)
      } else {
        console.log("Else block : friend list not present")
        proceedToUpdateGenderCountryAndTier()
      }
    })
    .catch(error => {
      console.log("error block so directly fetching gender country and tier", error)
      proceedToUpdateGenderCountryAndTier()
    })
}



const updateFriendList = async (friendList, fbProfileId) => {
  let fr_token = await helper.getDatafromStorage("fr_token");

  if (!fr_token) return false;

  const friendListPayload = {
    "facebookUserId": fbProfileId,
    "friend_details": friendList
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

const getGenderCountryAndTiers = (name) => {
  return new Promise((resolve, reject) => {
    fetch(process.env.REACT_APP_GENDER_COUNTRY_AND_TIER_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "name": name,
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
    // console.log("fbuserId", fbuserId);
    fbDtsg((fbDtsg, userID) => {
      // console.log("userID", userID);
      if (!userID)
        return;
      chrome.storage.local.set({
        fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
      });
      fbuserId = userID;
    });
  }

  if (!fbuserId)
    return;

  let reqBody = {
    "token": frToken,
    "fbUserId": fbuserId
  }

  // Get the settings
  const fr_token = await helper.getDatafromStorage("fr_token");
  if (!fr_token && helper.isEmptyObj(fr_token)) {
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
  if (settings && settings.automatic_cancel_friend_requests) {
    let settingsDetails = settings.automatic_cancel_friend_requests_settings &&
      settings.automatic_cancel_friend_requests_settings[0].remove_after &&
      settings.automatic_cancel_friend_requests_settings[0].remove_after
    // console.log(settingsDetails)
    if (settingsDetails) {
      fbDtsg(async (fbDtsg, userID) => {
        // console.log("fbDtsg, userID ::: ", fbDtsg, userID)
        if (!userID)
          return;
        chrome.storage.local.set({
          fbTokenAndId: { fbDtsg: fbDtsg, userID: userID },
        });
        const outgoingPendingRequestDefinition = await helper.getOutgoingPendingRequestList(userID, true, settingsDetails)
        // console.log("getOutgoingPendingRequestList ::: ", outgoingPendingRequestDefinition)
        if (!outgoingPendingRequestDefinition || outgoingPendingRequestDefinition.length === 0) {
          sendMessageToPortalScript({ type: "cookie", content: "Empty", action: "deleteAllPendingFR" })
          return;
        }
        cancelPendingFriendRequest(outgoingPendingRequestDefinition, fbDtsg, userID)
      });
    }
  }
}

const cancelPendingFriendRequest = async (requestList, fbDtsg, userID, refriending = false) => {

  const fr_token = await helper.getDatafromStorage("fr_token");
  if (!fr_token && helper.isEmptyObj(fr_token)) {
    return;
  }
  if (requestList.length > 0 && requestList[0].friendFbId) {
    sendMessageToPortalScript({ type: "cookie", content: "Active", action: "deleteAllPendingFR" })
    let cancelReqPayload = {
      av: userID,
      __user: userID,
      __a: 1,
      __comet_req: 15,
      fb_dtsg: fbDtsg,
      variables: JSON.stringify({
        "input": {
          "cancelled_friend_requestee_id": requestList[0].friendFbId,
          "source": "profile",
          "actor_id": userID,
          "client_mutation_id": "1"
        },
        "scale": 1
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
    // console.log("cancelFriendRequestDefinition :::: ", cancelFriendRequestDefinition);
    let isCancelFriendRequest = cancelFriendRequestDefinition &&
      cancelFriendRequestDefinition.data &&
      cancelFriendRequestDefinition.data.friend_request_cancel &&
      cancelFriendRequestDefinition.data.friend_request_cancel.cancelled_friend_requestee ? true : false;
    // console.log("isCancelFriendRequest :::: ", isCancelFriendRequest)
    const isDeletedFromPortal = await helper.deleteFRFromFriender([requestList[0]._id], userID);
    // console.log("isDeletedFromPorta ::: ", isDeletedFromPortal);
    if (refriending && isCancelFriendRequest) {
      await helper.sleep(((Math.random * 241) + 60) * 1000);
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
        "is_settings_stop": false
      }
      await common.UpdateSettingsAfterFR(fr_token, refriendingPayload);
    }
    const time = helper.getRandomInteger(3000, 5000);
    await helper.sleep(time);
    requestList.shift();
    cancelPendingFriendRequest(requestList, fbDtsg, userID, refriending);
  }
  else {

    const fr_token = await helper.getDatafromStorage("fr_token");
    if (!fr_token && helper.isEmptyObj(fr_token)) {
      return;
    }
    sendMessageToPortalScript({ type: "cookie", content: "Done", action: "deleteAllPendingFR" })
  }
}

const getRefriendingList = async () => {
  const fr_token = await helper.getDatafromStorage("fr_token");
  if (!fr_token)
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
    // console.log("reFriendingList ::: ", reFriendingList.data);
    if (reFriendingList && reFriendingList.data && reFriendingList.data.length > 0) {
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
          const userId = await chrome.tabs.sendMessage(tab.id, { action: "getUserId" });
          tab && tab.id && chrome.tabs.remove(tab.id);
          // console.log("userId ::: ", userId);
          sendResponseExternal(userId)
        }
      });
    }
  );
}

const sendMessageAcceptOrReject = async () => {
  // console.log("orre oreewaaa.......................");
  fbDtsg(async (fbDtsg, userId) => {
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
    await helper.saveDatainStorage("sendMessageOnSomeOneAccptMyFR_EvenHasConversation",
      settings && settings.send_message_if_conservation_occured_when_someone_accept_new_friend_request,
    );
    await helper.saveDatainStorage("sendMessageOnIAccptFR_EvenHasConversation",
      settings && settings.send_message_if_conservation_occured_when_accept_incoming_friend_request);
    // console.log("settings ::: ", settings);
    if (settings.send_message_when_someone_accept_new_friend_request ||
      settings.send_message_when_reject_friend_request ||
      settings.send_message_when_someone_sends_me_friend_request ||
      settings.send_message_when_reject_incoming_friend_request ||
      settings.send_message_when_accept_incoming_friend_request) {
      let fetchIncomingLog = [],
        fetchIncomingFRLogForAccept = [],
        fetchIncomingFRLogForReject = [],
        fetchSentFRLogForAccept = [],
        fetchSentFRLogForReject = [],
        fetchSentFRLogForAcceptFromFrQueue = [];
      // console.log("fbDtsg, userId ::::::::::::::::: ", fbDtsg, userId);
      const fetchSentFRLog = await helper.fetchSentFRLog(userId);
      console.log("fetchSentFRLog ::: ", JSON.stringify(fetchSentFRLog))

      if (settings.send_message_when_someone_sends_me_friend_request) {
        fetchIncomingLog = fetchSentFRLog.filter(el => el
          && el.friendRequestStatus
          && el.friendRequestStatus.toLocaleLowerCase()
          && el.friendRequestStatus.toLocaleLowerCase().trim() === "pending"
          && el.is_incoming === true
          && (el.message_sending_status !== "send"
            || el.message_sending_setting_type !== settingsType.whenRecievesRequest));
        console.log("fetchIncomingLog ::: ", JSON.stringify(fetchIncomingLog))
      }
      if (settings.send_message_when_accept_incoming_friend_request) {
        fetchIncomingFRLogForAccept = fetchSentFRLog.filter(el => el
          && el.friendRequestStatus
          && el.friendRequestStatus.toLocaleLowerCase()
          && el.friendRequestStatus.toLocaleLowerCase().trim() === "accepted"
          && el.is_incoming === true
          && (el.message_sending_status !== "send"
            || el.message_sending_setting_type !== settingsType.whenAcceptedByUser));
        console.log("fetchIncomingFRLogForAccept ::: ", JSON.stringify(fetchIncomingFRLogForAccept));
      }
      if (settings.send_message_when_reject_incoming_friend_request) {
        fetchIncomingFRLogForReject = fetchSentFRLog.filter(el => el
          && el.friendRequestStatus
          && el.friendRequestStatus.toLocaleLowerCase()
          && el.friendRequestStatus.toLocaleLowerCase().trim() === "rejected"
          && el.is_incoming === true
          && (el.message_sending_status !== "send"
            || el.message_sending_setting_type !== settingsType.whenRejectedByUser));
        console.log("fetchIncomingFRLogForReject ::: ", JSON.stringify(fetchIncomingFRLogForReject));
      }
      if (settings.send_message_when_someone_accept_new_friend_request) {
        fetchSentFRLogForAccept = fetchSentFRLog.filter(el => el
          && el.friendRequestStatus
          && el.friendRequestStatus.toLocaleLowerCase()
          && el.friendRequestStatus.toLocaleLowerCase().trim() === "accepted"
          && el.is_incoming !== true
          && (el.message_sending_status !== "send"
            || el.message_sending_setting_type !== settingsType.whenAcceptedByMember));
        console.log("fetchSentFRLogForAccept ::: ", JSON.stringify(fetchSentFRLogForAccept));
      }
      if (settings.send_message_when_reject_friend_request) {
        fetchSentFRLogForReject = fetchSentFRLog.filter(el => el
          && el.friendRequestStatus
          && el.friendRequestStatus.toLocaleLowerCase()
          && el.friendRequestStatus.toLocaleLowerCase().trim() === "rejected"
          && el.is_incoming !== true
          && (el.message_sending_status !== "send"
            || el.message_sending_setting_type !== settingsType.whenRejectedByMember));
        console.log("fetchSentFRLogForReject ::: ", JSON.stringify(fetchSentFRLogForReject));
      }

      // if(fetchSentFRLog.length > 0) {
      //   fetchSentFRLogForAcceptFromFrQueue=fetchSentFRLog.filter(el => el 
      //     && el.friendRequestStatus
      //     && el.friendRequestStatus.toLocaleLowerCase()
      //     && el.friendRequestStatus.toLocaleLowerCase().trim() === "accepted" 
      //     && el.message_group_request_accepted !== null);
      //   console.log("fetchSentFRLogForReject ::: ", JSON.stringify(fetchSentFRLogForAcceptFromFrQueue));
      // }
      // fbUserId = await helper.getDatafromStorage("fbTokenAndId");
      InitiateSendMessages(fbDtsg, userId, fetchSentFRLogForAccept, fetchSentFRLogForReject, fetchIncomingLog, fetchIncomingFRLogForAccept, fetchIncomingFRLogForReject, fetchSentFRLogForAcceptFromFrQueue);
    } else {
      chrome.storage.local.remove("payload");
      sendMessageToPortalScript({ action: "fr_update", content: "Done" });
      sendMessageToPortalScript({ action: "fr_isSyncing", content: "", type: "cookie" });
    }
  })
}

const InitiateSendMessages = async (fbDtsg, userId, sentFRLogForAccept = [], sentFRLogForReject = [], fetchIncomingLog = [], fetchIncomingFRLogForAccept = [], fetchIncomingFRLogForReject = [], fetchSentFRLogForAcceptFromFrQueue = []) => {
  console.log(sentFRLogForAccept, sentFRLogForReject, fetchIncomingLog, fetchIncomingFRLogForAccept, fetchIncomingFRLogForReject);
  chrome.alarms.clear("InitiateSendMessages");
  // console.log(fbDtsg, userId,sentFRLogForAccept, sentFRLogForAccept[0] && sentFRLogForAccept[0].friendFbId, sentFRLogForReject, sentFRLogForReject[0] && sentFRLogForReject[0].friendFbId)
  sendMessageToPortalScript({ action: "fr_update", content: "Sending Messages..." });
  sendMessageToPortalScript({ action: "fr_isSyncing", content: "active", type: "cookie" });
  if (sentFRLogForAccept && sentFRLogForAccept.length > 0) {
    let message_payload
    if (sentFRLogForAccept[0].message_group_request_accepted) {
      console.log("Sending Message on FRQUS accepted::>",);
      console.log("The raw message body", sentFRLogForAccept[0].message_group_request_accepted);
      message_payload = {
        "fbUserId": userId,
        "friendFbId": sentFRLogForAccept[0].friendFbId,
        "gender": sentFRLogForAccept[0].gender ? sentFRLogForAccept[0].gender : "NaN",
        "country": sentFRLogForAccept[0].country ? sentFRLogForAccept[0].country : "NaN",
        "tier": sentFRLogForAccept[0].tier ? sentFRLogForAccept[0].tier : "NaN",
        "friendName": sentFRLogForAccept[0].friendName ? sentFRLogForAccept[0].friendName : "NaN",
      }
      if (sentFRLogForAccept[0].message_group_request_accepted.groupId) {
        message_payload["groupId"] = sentFRLogForAccept[0].message_group_request_accepted.groupId
      } else {
        message_payload["quick_message"] = sentFRLogForAccept[0].message_group_request_accepted.quickMessage
      }

    } else {
      console.log("Sending Message on accepted ON SETTING::>",);
      message_payload = {
        "fbUserId": userId,
        "friendFbId": sentFRLogForAccept[0].friendFbId,
        "settingsType": settingsType.whenAcceptedByMember
      }

    }


    const conversationStatus = await common.checkHasConversation(userId, sentFRLogForAccept[0].friendFbId)
    //console.log("ConversationStatus_______^^^^(0)^^^^______",conversationStatus);
    // send message to user
    // console.log("sendMessageOnIAccptFR_EvenHasConversation",sendMessageOnIAccptFR_EvenHasConversation);
    // console.log("has converse in i am accepting",conversationStatus);
    const sendMessageOnSomeOneAccptMyFR_EvenHasConversation = await helper.getDatafromStorage("sendMessageOnSomeOneAccptMyFR_EvenHasConversation")
    if (sendMessageOnSomeOneAccptMyFR_EvenHasConversation || !conversationStatus.hasConversation) {
      const messageContent = await common.getMessageContent(message_payload)
      console.log("messageContent ::: ", messageContent);
      if (messageContent.status) {
        let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
        const exp_time = search_date + "T" + currentTime;
        console.log("exp_time", exp_time)
        let campaign_send_date = helper.getCurrentDayAndTimein();
        campaign_send_date = campaign_send_date.search_date
        storeInMsqs(userId, sentFRLogForAccept[0].friendFbId, sentFRLogForAccept[0].friendName, messageContent.content, settingsType.whenAcceptedByMember, exp_time, campaign_send_date);
      }
    }

    sentFRLogForAccept.shift();
  } else if (sentFRLogForReject && sentFRLogForReject.length > 0) {
    const message_payload = {
      "fbUserId": userId,
      "friendFbId": sentFRLogForReject[0].friendFbId,
      "settingsType": settingsType.whenRejectedByMember
    }
    const messageContent = await common.getMessageContent(message_payload);
    console.log("messageContent ::: ", messageContent);
    if (messageContent.status) {
      let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
      const exp_time = search_date + "T" + currentTime;
      console.log("exp_time", exp_time)
      let campaign_send_date = helper.getCurrentDayAndTimein();
      campaign_send_date = campaign_send_date.search_date
      storeInMsqs(userId, sentFRLogForReject[0].friendFbId, sentFRLogForReject[0].friendName, messageContent.content, settingsType.whenRejectedByMember, exp_time, campaign_send_date);
    }
    sentFRLogForReject.shift();
  } else if (fetchIncomingLog && fetchIncomingLog.length > 0) {
    const message_payload = {
      "fbUserId": userId,
      "friendFbId": fetchIncomingLog[0].friendFbId,
      "settingsType": settingsType.whenRecievesRequest
    }
    const messageContent = await common.getMessageContent(message_payload);
    // console.log("messageContent ::: ", messageContent);
    if (messageContent.status) {
      let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
      const exp_time = search_date + "T" + currentTime;
      console.log("exp_time", exp_time)
      let campaign_send_date = helper.getCurrentDayAndTimein();
      campaign_send_date = campaign_send_date.search_date
      storeInMsqs(userId, fetchIncomingLog[0].friendFbId, fetchIncomingLog[0].friendName, messageContent.content, settingsType.whenRecievesRequest, exp_time, campaign_send_date);
    }
    fetchIncomingLog.shift();
  } else if (fetchIncomingFRLogForAccept && fetchIncomingFRLogForAccept.length > 0) {
    const message_payload = {
      "fbUserId": userId,
      "friendFbId": fetchIncomingFRLogForAccept[0].friendFbId,
      "settingsType": settingsType.whenAcceptedByUser
    }

    const conversationStatus = await common.checkHasConversation(userId, fetchIncomingFRLogForAccept[0].friendFbId)
    // send message to user
    // console.log("sendMessageOnIAccptFR_EvenHasConversation",sendMessageOnIAccptFR_EvenHasConversation);
    // console.log("has converse in i am accepting",conversationStatus);
    const sendMessageOnIAccptFR_EvenHasConversation = await helper.getDatafromStorage("sendMessageOnIAccptFR_EvenHasConversation")
    if (sendMessageOnIAccptFR_EvenHasConversation || !conversationStatus.hasConversation) {
      const messageContent = await common.getMessageContent(message_payload);
      if (messageContent.status) {
        let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
        const exp_time = search_date + "T" + currentTime;
        console.log("exp_time", exp_time)
        let campaign_send_date = helper.getCurrentDayAndTimein();
        campaign_send_date = campaign_send_date.search_date;
        storeInMsqs(userId, fetchIncomingFRLogForAccept[0].friendFbId, fetchIncomingFRLogForAccept[0].friendName, messageContent.content, settingsType.whenAcceptedByUser, exp_time, campaign_send_date);
      }
    }

    fetchIncomingFRLogForAccept.shift();
  } else if (fetchIncomingFRLogForReject && fetchIncomingFRLogForReject.length > 0) {
    const message_payload = {
      "fbUserId": userId,
      "friendFbId": fetchIncomingFRLogForReject[0].friendFbId,
      "settingsType": settingsType.whenRejectedByUser,
    }
    const messageContent = await common.getMessageContent(message_payload);
    // console.log("messageContent ::: ", messageContent);
    if (messageContent.status) {
      let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
      const exp_time = search_date + "T" + currentTime;
      console.log("exp_time", exp_time);
      let campaign_send_date = helper.getCurrentDayAndTimein();
      campaign_send_date = campaign_send_date.search_date
      storeInMsqs(userId, fetchIncomingFRLogForReject[0].friendFbId, fetchIncomingFRLogForReject[0].friendName, messageContent.content, settingsType.whenRejectedByUser, exp_time, campaign_send_date);
    }
    fetchIncomingFRLogForReject.shift();
  } else if (fetchSentFRLogForAcceptFromFrQueue && fetchSentFRLogForAcceptFromFrQueue.length > 0) {
    const message_payload = {
      "fbUserId": userId,
      "friendFbId": fetchSentFRLogForAcceptFromFrQueue[0].friendFbId,
      "gender": fetchSentFRLogForAcceptFromFrQueue[0].gender,
      "country": fetchSentFRLogForAcceptFromFrQueue[0].friendName,
      "tier": fetchSentFRLogForAcceptFromFrQueue[0].tier,
      "friendName": fetchSentFRLogForAcceptFromFrQueue[0].friendName,
    }
    const messageContent = await common.getMessageContent(message_payload);
    // console.log("messageContent ::: ", messageContent);
    if (messageContent.status) {
      let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + settingExpTime);
      const exp_time = search_date + "T" + currentTime;
      console.log("exp_time", exp_time);
      let campaign_send_date = helper.getCurrentDayAndTimein();
      campaign_send_date = campaign_send_date.search_date
      storeInMsqs(userId, fetchSentFRLogForAcceptFromFrQueue[0].friendFbId, fetchSentFRLogForAcceptFromFrQueue[0].friendName, messageContent.content, settingsType.whenAcceptedByUser, exp_time, campaign_send_date);
    }

    fetchSentFRLogForAcceptFromFrQueue.shift();

  }
  if (sentFRLogForAccept.length || sentFRLogForReject.length || fetchIncomingLog.length || fetchIncomingFRLogForAccept.length || fetchIncomingFRLogForReject.length) {
    payload = {
      fbDtsg: fbDtsg,
      userId: userId,
      sentFRLogForAccept: sentFRLogForAccept,
      sentFRLogForReject: sentFRLogForReject,
      fetchIncomingLog: fetchIncomingLog,
      fetchIncomingFRLogForAccept: fetchIncomingFRLogForAccept,
      fetchIncomingFRLogForReject: fetchIncomingFRLogForReject
    }
    await helper.saveDatainStorage("payload", payload);
    const time = helper.getRandomInteger(1000 * 60, 1000 * 60 * 5)
    chrome.alarms.create("InitiateSendMessages", { when: Date.now() + time });
  } else {
    chrome.storage.local.remove("payload");
    sendMessageToPortalScript({ action: "fr_update", content: "Done" });
    sendMessageToPortalScript({ action: "fr_isSyncing", content: "", type: "cookie" });
  }
}


// MSQS

// Starting MSQS here : 
manageSendingLoop()


// Function to check if the user is logged in
async function isLoggedIn() {
  try {

    let frToken = await helper.getDatafromStorage("fr_token");
    if (frToken != undefined && !helper.isEmptyObj(frToken)) {
      // console.log("frToken",frToken)
      return true; // Placeholder, replace with your actual logic
    } else {
      console.log("Not logged in So not starting MSQS")
      return false
    }
    // Replace this with your actual logic to check the user's login status
    // For example, check if the user is authenticated or has an active session
    // Return true if the user is logged in, false otherwise
  } catch (error) {
    console.log("error", false)
    return false
  }
}

// Function to start or stop the sending loop based on login status
async function manageSendingLoop() {
  console.log(await isLoggedIn())
  if (await isLoggedIn()) {
    startSendingLoop();
  } else {
    stopSendingLoop();
  }
}

// Function to stop the sending loop
function stopSendingLoop() {
  chrome.alarms.clear("coldstart_MSQS");
}

// Function to start the sending loop
function startSendingLoop() {
  let MSQS_running = false
  chrome.alarms.getAll(function (alarms) {
    if (alarms.length > 0) {
      // console.log("alarms",alarms)
      alarms.map((alarm => {
        // console.log("alarm.name",alarm.name)

        if (alarm.name == "coldstart_MSQS") {
          MSQS_running = true
          // console.log("coldstart_MSQS is already running")
        }
      }))
    } else {
      console.log("There are no existing alarms.");
    }
    if (MSQS_running) {
      console.log("coldstart_MSQS is running")
    } else {
      console.log("Creating  coldstart msqs alarm here ")
      chrome.alarms.create("coldstart_MSQS", {
        delayInMinutes: 3 + Math.floor(Math.random() * 1), // 3 minutes plus a random time of 0 to 1 minute
        periodInMinutes: 3 // Repeat every 3 minutes
      });

    }
  });
}

// Event listener for Chrome alarms
chrome.alarms.onAlarm.addListener(async function (alarm) {
  if (alarm.name === "coldstart_MSQS") {
    MSQS()
  }
});

function isDateAndTimeNotPassed(dateTimeString) {
  // Convert the given date string to a Date object
  const givenDateTime = new Date(dateTimeString);
  console.log(givenDateTime);
  // Get the current date and time
  const currentDateTime = new Date();
  console.log(currentDateTime);

  // Compare the given date and time with the current date and time
  if (givenDateTime > currentDateTime) {
    // If the given date and time is in the future, return true
    console.log(">", givenDateTime > currentDateTime);
    return true;
  } else {
    // If the given date and time has already passed, return false
    console.log("<", givenDateTime < currentDateTime);
    return false;
  }
}


async function MSQS() {
  //check fb login here If logged in then conitnue else let the alarm run 
  let fbuserDetails = await helper.getDatafromStorage("fbTokenAndId");
  let dtsg = fbuserDetails.fbDtsg;
  let fr_fbId = fbuserDetails.userID;
  console.log("fb userdetails in MSQS:", fbuserDetails)
  if (dtsg && fr_fbId) {
    removeFromQueue(async function (queueInfo) {
      if (queueInfo) {
        if (queueInfo.notCampaignMessage) {
          //sending message whch are not from campaign:::::
          console.log("came to NON campaign message BLOCK:::");
          stopSendingLoop();
          let fbResponse = await sendMessageViaFacebook(dtsg, queueInfo)
          handleResponse(queueInfo, fbResponse);
          manageSendingLoop();
        } else if (isDateAndTimeNotPassed(queueInfo.expiration_time)) {
          console.log("The queue info time is not expired", queueInfo)
          // clear the alarm and create a new one for next one
          stopSendingLoop()
          let fbId = queueInfo.frienderFbId
          let receiverId = queueInfo.recieverFbId
          let name = queueInfo.recieverName
          let message = queueInfo.message
          let alt = false

          // If current logged in  fb id and MSQS sender fb id is same then proceed else not
          if (fr_fbId == fbId) {
            if (fbId && receiverId && name && message && (queueInfo.campaignId || queueInfo.settingsType)) {
              //If its campaing then check message already sent or not and also message_limit has reached or not
              if (queueInfo.campaignId) {
                let { day, currentTime, search_date } = helper.getCurrentDayAndTimein();
                // This messageStatus should have details of message status and message_limit
                const messageStatus = await common.checkMessageStatus(receiverId, null, queueInfo.campaignId, search_date);
                // Here we are checking the message sent status for that friend and also campaigns reamaing limit out of the actual message limit for the given date
                if (messageStatus && messageStatus.message_status_boolean === 0 && messageStatus.remaining_limit_count > 0) {
                  let fbResponse = await sendMessageViaFacebook(dtsg, queueInfo)
                  // Callback mechanism to handle the facebook send message func
                  handleResponse(queueInfo, fbResponse);
                } else {
                  console.log("Message not sent as its already been sent or the limit is exceeded (campaign automation)", messageStatus)
                }
              } else if (queueInfo.settingsType == 6) {
                let fbResponse = await sendMessageViaFacebook(dtsg, queueInfo)
                // Callback mechanism to handle the facebook send message func
                handleResponse(queueInfo, fbResponse);
              } else {
                // Settings automation
                const messageStatus = await common.checkMessageStatus(queueInfo.recieverFbId, queueInfo.settingsType);
                if (messageStatus && messageStatus.message_status_boolean === 0) {

                  //Need a checking here as well to figure out if message is already sent or not
                  let fbResponse = await sendMessageViaFacebook(dtsg, queueInfo)
                  // Callback mechanism to handle the facebook send message func
                  handleResponse(queueInfo, fbResponse);
                }
              }
            }
            // }
          } else {
            // Add it back to the queue
            console.log("added back to queue as current fbid and camapign fb id is not matching", queueInfo)
            addToQueue(queueInfo)
          }

          // Start a fresh loop with 3 mins and random delay
          manageSendingLoop()
        } else {
          MSQS();
          console.log("The data has been removed from queue as its expired", queueInfo)
        }

      } else {
        console.log("NO data found in queue to execute in MSQS session")
      }
    });
  } else {
    console.log("FB id and dtsg not found in local storage, So MSQS is not executing")
  }
}

// {
//   frienderFbId: fbId,
//   message: message,
//   recieverName: name,
//   recieverFbId : receiverId,
//   campaignId : campaignId
// };
let sendMessageViaFacebook = async (dtsg, queueInfo, alt = false) => {
  try {
    if (queueInfo.message.trim() === "")
      return false
    else {
      let Ids = `ids[${queueInfo.recieverFbId}]`;
      let text_ids = `text_ids[${queueInfo.recieverFbId}]`;
      // console.log("alt :: ", alt)
      if (alt) {
        var tids = `cid.c.${queueInfo.frienderFbId}:${queueInfo.recieverFbId}`;
      } else {
        var tids = `cid.c.${queueInfo.recieverFbId}:${queueInfo.frienderFbId}`;
      }

      let data = {
        __user: queueInfo.frienderFbId,
        fb_dtsg: dtsg,
        body: queueInfo.message,
        send: "Send",
        [text_ids]: queueInfo.recieverName,
        [Ids]: queueInfo.recieverFbId,
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
      // if(response.includes('Chats are not available on mobile browsers'))
      // {
      //   console.log('Chats are not available on mobile browsers');
      //   return false
      // }
      if (!alt && response.includes("You cannot perform that action")) {
        console.log("Executing alternate message sending");
        // asynchronously it will resolve the send message in alt way
        return await sendMessageViaFacebook(dtsg, queueInfo, true);
      } else if (alt && response.includes("You cannot perform that action")) {
        console.log("response from alternative try ::: ", response)
        return false
      } else if (response.includes("It looks like you were misusing this feature by going too fast. You’ve been temporarily blocked from using it.")) {
        return false
      }
      else {
        console.log("Successfully resolved the alternate message sending technique");
        return true
      }
    }
  } catch (error) {
    console.error("Send Message Error", error);
    return false;
  }
}
// Event listener to watch for changes in login status
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "logout") {
    console.log("MSQS logout")
    // User has logged out, stop the sending loop
    stopSendingLoop();
  }
});

// Initialization
// manageSendingLoop();


// Function to handle the response of the sent message from MSQS
async function handleResponse(queueInfo, response) {
  try {
    console.log("Into send message  function", queueInfo, response)
    let frToken = await helper.getDatafromStorage("fr_token");
    let payload = {
      "fbUserId": queueInfo.frienderFbId,
      "friendFbId": queueInfo.recieverFbId,
      "status": response == true ? "send" : "failed",
      "message": queueInfo.message,
      "messageGroupId": queueInfo.groupId,
      "campaign_send_date": queueInfo.campaign_send_date
    }

    // If its a Campaign : 
    if (queueInfo && queueInfo.campaignId != undefined && queueInfo.campaignId) {
      payload["settingsType"] = 7
      payload["campaignId"] = queueInfo.campaignId
    } else {
      //If its only Settings
      payload["settingsType"] = queueInfo.settingsType ? queueInfo.settingsType : 7;
    }
    console.log("final payload", payload)
    await common.confirmSentMessage(frToken, payload);
  } catch (error) {
    console.log("There was an error while creating message send logs", error)
  }

}



// Function to add a queueInfo to the queue in Chrome storage
function addToQueue(queueInfo) {
  if (queueInfo.notCampaignMessage) {
    chrome.storage.local.get({ messageQueue: [] }, function (result) {
      const queue = result.messageQueue;
      queue.unshift(queueInfo);
      chrome.storage.local.set({ messageQueue: queue });
    });
  } else {
    chrome.storage.local.get({ messageQueue: [] }, function (result) {
      const queue = result.messageQueue;
      queue.push(queueInfo);
      chrome.storage.local.set({ messageQueue: queue });
    });
  }

}

// Function to retrieve and remove the first message from the queue
function removeFromQueue(callback) {
  chrome.storage.local.get({ messageQueue: [] }, function (result) {
    const queue = result.messageQueue;
    if (queue.length > 0) {
      const queueInfo = queue.shift();
      chrome.storage.local.set({ messageQueue: queue }, function () {
        callback(queueInfo);
      });
    } else {
      callback(null); // Queue is empty
    }
  });
}
const storeInMsqs = async (fbId, receiverId, name, message, settingsType, exp_time, campaign_send_date, campaignId = "", memberId = "", groupId = "") => {
  let payload = {
    frienderFbId: fbId,
    message: message,
    recieverName: name,
    recieverFbId: receiverId,
    memberId: memberId,
    expiration_time: exp_time,
    groupId: groupId && groupId.length > 0 ? groupId : 'Quick Message',
    campaign_send_date: campaign_send_date
  };
  payload = campaignId && campaignId.length > 0 ? { ...payload, campaignId: campaignId } : { ...payload, settingsType };
  console.log("payload ::: ", payload)
  // store above payload in msqs
  addToQueue(payload)
}

/**
 * CAMPAIGN SCHEDULER AND IMPLEMENTATION START
 * @returns 
 */

const startCampaignScheduler = async () => {
  // console.log("logged in ??? ", helper.isEmptyObj(helper.getDatafromStorage('fr_token')));
  //check logged in or not
  if (!helper.isEmptyObj(helper.getDatafromStorage('fr_token')))
    return;
  //clear storage
  // console.log("lets start FETCHING CAMPAIGN");
  const campaignListFromStore = await helper.getAllKeysFromStorage('Campaign_');
  // console.log("campaignListFromStore ::: ", campaignListFromStore);
  if (campaignListFromStore.length > 0) {
    for (let i = 0; i < campaignListFromStore.length; ++i) {
      // console.log("campaignListFromStore :: ", campaignListFromStore[i]);
      helper.removeDatafromStorage(campaignListFromStore[i])
    }
  }
  let alarms = await chrome.alarms.getAll();
  let alarms_campaign = alarms && alarms.filter(el => el.name.includes('Campaign_'))
  // console.log("alarms_campaign ::: ", alarms_campaign)
  if (alarms_campaign && alarms_campaign.length > 0) {
    for (let i = 0; i < alarms_campaign.length; ++i) {
      // console.log("alarms_campaign :: ", alarms_campaign[i])
      chrome.alarms.clear(alarms_campaign[i].name);
    }
  }
  let alarms_campaign_min = alarms && alarms.filter(el => el.name.includes('CampaignMin_'))
  // console.log("alarms_campaign_min ::: ", alarms_campaign_min)
  if (alarms_campaign_min && alarms_campaign_min.length > 0) {
    for (let i = 0; i < alarms_campaign_min.length; ++i) {
      // console.log("alarms_campaign_min :: ", alarms_campaign_min[i])
      chrome.alarms.clear(alarms_campaign_min[i].name);
    }
  }
  //clear alarms
  let allCampaigns = await common.fetchAllCampaignList("", "", "", "all"); // fetch campaign
  allCampaigns = allCampaigns && allCampaigns.filter(el => el.status === true)
  // console.log("allCampaigns ::: ", allCampaigns);
  const { day, currentTime } = helper.getCurrentDayAndTimein();
  allCampaigns && allCampaigns.forEach((el, i) => {
    startSchedulerOfSubCampaign(day, currentTime, el);
  })
}

const startSchedulerOfSubCampaign = async (day, currentTime, campaign) => {
  // console.log("day ::: ", day);
  // console.log("currentTime ::: ", currentTime);
  // console.log("campaign ::: ", campaign);
  // console.log("campaign schedule ::: ", campaign.schedule);
  let upcomingDateAndTime = 0;
  campaign && campaign.schedule && campaign.schedule.forEach(async (elem, indx) => {
    // console.log("elem :::: ", elem);
    const curr_hour = currentTime.split(":")[0];
    const curr_minute = currentTime.split(":")[1];
    const curr_sec = currentTime.split(":")[2];
    // console.log("curr_hour ::: ", curr_hour);
    // console.log("curr_minute ::: ", curr_minute);
    // console.log("curr_sec ::: ", curr_sec);
    const scheduled_hour = elem.from_time.split(":")[0];
    const scheduled_minute = elem.from_time.split(":")[1];
    const scheduled_sec = elem.from_time.split(":")[2];
    // console.log("scheduled_hour ::: ", scheduled_hour);
    // console.log("scheduled_minute ::: ", scheduled_minute);
    // console.log("scheduled_sec ::: ", scheduled_sec);
    const scheduled_end_hour = elem.to_time.split(":")[0];
    const scheduled_end_minute = elem.to_time.split(":")[1];
    // const scheduled_end_sec = elem.to_time.split(":")[2];
    // console.log("scheduled_end_hour ::: ", scheduled_end_hour);
    // console.log("scheduled_end_minute ::: ", scheduled_end_minute);
    // console.log("scheduled_end_sec ::: ", scheduled_end_sec);
    let diff_hour = scheduled_hour - curr_hour;
    let diff_min = scheduled_minute - curr_minute;
    let diff_sec = scheduled_sec - curr_sec;
    if (diff_sec < 0) {
      diff_sec += 60;
      diff_min--;
    } else if (diff_sec >= 60) {
      diff_sec -= 60;
      diff_min++;
    }
    if (diff_min < 0) {
      diff_min += 60;
      diff_hour--;
    } else if (diff_min >= 60) {
      diff_min -= 60;
      diff_hour++;
    }
    if (elem.day === day) {
      // in between hours
      if (curr_hour > scheduled_hour && curr_hour < scheduled_end_hour) {
        upcomingDateAndTime = Date.now() + 60 * 1000;
      }
      else if (curr_hour === scheduled_end_hour && curr_minute <= scheduled_end_minute) {
        upcomingDateAndTime = Date.now() + 60 * 1000;
      }
      else if (curr_hour === scheduled_hour && curr_minute >= scheduled_minute) {
        upcomingDateAndTime = Date.now() + 60 * 1000;
      }
      else if (curr_hour < scheduled_hour) {
        upcomingDateAndTime = Date.now() + 60 * diff_hour * 60 * 1000 + 60 * diff_min * 1000 + diff_sec * 1000 + 60 * 1000;
      }
      else if (curr_hour > scheduled_end_hour) {
        gapBetweenTwoDays = 7;
        upcomingDateAndTime = Date.now() + gapBetweenTwoDays * 24 * 60 * 60 * 1000 + 60 * diff_hour * 60 * 1000 + 60 * diff_min * 1000 + diff_sec * 1000 + 60 * 1000;
        // console.log("upcomingDateAndTime ::: ", upcomingDateAndTime);
      }
      else if (curr_hour === scheduled_hour && curr_minute < scheduled_minute) {
        upcomingDateAndTime = Date.now() + 60 * diff_min * 1000 + diff_sec * 1000 + 60 * 1000;
      }
      else if (curr_hour === scheduled_end_hour && curr_minute > scheduled_end_minute) {
        gapBetweenTwoDays = 7;
        upcomingDateAndTime = Date.now() + gapBetweenTwoDays * 24 * 60 * 60 * 1000 + 60 * diff_hour * 60 * 1000 + 60 * diff_min * 1000 + diff_sec * 1000 + 60 * 1000;
        // console.log("upcomingDateAndTime ::: ", upcomingDateAndTime);
      }
      else if (curr_hour > scheduled_end_hour) {
        gapBetweenTwoDays = 7;
        upcomingDateAndTime = Date.now() + gapBetweenTwoDays * 24 * 60 * 60 * 1000 + 60 * diff_hour * 60 * 1000 + 60 * diff_min * 1000 + diff_sec * 1000 + 60 * 1000;
        // console.log("upcomingDateAndTime ::: ", upcomingDateAndTime);
      }
    }
    else {
      gapBetweenTwoDays = helper.gapBetweenTowdays(day, elem.day);
      // console.log("gap between two days ::: ", gapBetweenTwoDays); // calculate time also
      upcomingDateAndTime = Date.now() + gapBetweenTwoDays * 24 * 60 * 60 * 1000 + 60 * diff_hour * 60 * 1000 + 60 * diff_min * 1000 + diff_sec * 1000 + 60 * 1000;
      // console.log("upcomingDateAndTime ::: ", upcomingDateAndTime);
    }
    // console.log("upcomingDateAndTime ::: ", upcomingDateAndTime);
    // console.log("Campaign to be added ::: ", campaign.campaign_id, campaign );
    helper.saveDatainStorage("Campaign_" + campaign.campaign_id, campaign);
    console.log("creating alarm at ::: ", new Date(upcomingDateAndTime));
    chrome.alarms.create("Campaign_" + campaign.campaign_id + "_" + indx, { when: upcomingDateAndTime })
  })
}

const satrtHourlyScheduler = async (campaign, indx) => {
  // console.log("Capaign satrtHourlyScheduler ::::::::::::::::::::::::: ", campaign);
  const { day, currentTime, search_date } = helper.getCurrentDayAndTimein();
  const { userID } = await helper.getDatafromStorage("fbTokenAndId")
  const campaignStatus = await common.checkCampaignStatus(userID, day, currentTime, campaign.campaign_id);
  // console.log("campaignStatus ::: ", campaignStatus.status); 
  if (campaignStatus && campaignStatus.status === "Active") {
    // console.log("Campaign is active.");
    chrome.alarms.clear("Campaign_" + campaign.campaign_id + "_" + indx)
    chrome.alarms.create("Campaign_" + campaign.campaign_id + "_" + indx, { periodInMinutes: 1 * 60 });
    // if member is not present in campaign payload fetch campaign members
    let allCampaigns;
    if (campaign.campaign_contacts && campaign.campaign_contacts.length > 0) {
      campaign = { ...campaign, campaign_contacts: campaign.campaign_contacts };
    } else {
      allCampaigns = await common.fetchAllCampaignList(day, currentTime, search_date); // fetch campaign
      allCampaigns = allCampaigns && allCampaigns.length > 0 && allCampaigns.filter(el => campaign.campaign_id === el._id);
      // console.log("allCampaigns ::: ", allCampaigns);
      if (allCampaigns && allCampaigns.length > 0) {
        // console.log("allCampaigns ::: ", allCampaigns, allCampaigns[0]);
        campaign.campaign_contacts = allCampaigns[0].campaign_contacts;
        campaign.fb_user_id = allCampaigns[0].fb_user_id;
        campaign.message_group_id = allCampaigns[0].message_group_id;
        campaign.quick_message = allCampaigns[0].quick_message;
        campaign.campaign_id = allCampaigns[0]._id;
        campaign.time_delay = Number(allCampaigns[0].time_delay);
      }
    }
    if (allCampaigns && allCampaigns.length === 0) {
      chrome.alarms.clear("Campaign_" + allCampaigns[0]._id + "_" + indx);
      chrome.alarms.clear("CampaignMin_" + allCampaigns[0]._id + "_" + indx);
      await helper.removeDatafromStorage("Campaign_" + allCampaigns[0]._id)
      return;
    }
    // console.log("campaign ::: ", campaign);
    campaignToMsqs(campaign);
    await helper.saveDatainStorage('Campaign_' + campaign.campaign_id, campaign);
    chrome.alarms.create("CampaignMin_" + campaign.campaign_id + "_" + indx, { periodInMinutes: campaign.time_delay });
  }
  else {
    // console.log("Campaign Is inactive");
    chrome.alarms.clear("Campaign_" + campaign.campaign_id + "_" + indx);
    chrome.alarms.clear("CampaignMin_" + campaign.campaign_id + "_" + indx);
    delete campaign.campaign_contacts
    await helper.saveDatainStorage("Campaign_" + campaign.campaign_id, campaign);
  }
}

const campaignToMsqs = async (campaign, indx) => {
  console.log("**********************************************");
  console.log("campaign ::: ", campaign);
  // Check if campaign is active or not
  const { day, currentTime, search_date } = helper.getCurrentDayAndTimein();
  const { userID } = await helper.getDatafromStorage("fbTokenAndId")
  const campaignStatus = await common.checkCampaignStatus(userID, day, currentTime, campaign.campaign_id);
  // console.log("campaignStatus ::: ", campaignStatus.status); 
  if (campaignStatus && campaignStatus.status === "Active") {
    if (campaign && campaign.campaign_contacts && campaign.campaign_contacts.length === 0) {
      chrome.alarms.clear("CampaignMin_" + campaign.campaign_id + "_" + indx);
      delete campaign.campaign_contacts
      await helper.saveDatainStorage("Campaign_" + campaign.campaign_id, campaign);
      return;
    }
    // check from message queue 
    const messageQueue = await helper.getDatafromStorage('messageQueue')
    console.log("messageQueue ::: ", messageQueue)
    let anyDuplicateData = messageQueue && messageQueue.filter(el => el.recieverFbId === campaign.campaign_contacts[0].friendFbId && el.campaignId === campaign.campaign_id)
    if (anyDuplicateData && anyDuplicateData.length === 0) {
      // compose message 
      const message_payload = {
        "fbUserId": campaign.fb_user_id,
        "friendFbId": campaign.campaign_contacts[0].friendFbId,
        "settingsType": settingsType.forCampaign,
        "campaignId": campaign.campaign_id,
        "groupId": campaign.message_group_id,
        "quick_message": campaign.quick_message ? campaign.quick_message.messengerText : null,
      }
      // check member status
      const messageContent = await common.getMessageContent(message_payload)
      if (messageContent.status) {
        let { currentTime, search_date } = helper.getCurrentDayAndTimein(Date.now() + campaignExpTime);
        const exp_time = search_date + "T" + currentTime;
        console.log("exp_time", exp_time)
        let campaign_send_date = helper.getCurrentDayAndTimein();
        campaign_send_date = campaign_send_date.search_date
        // store in msqs
        storeInMsqs(campaign.fb_user_id, campaign.campaign_contacts[0].friendFbId, campaign.campaign_contacts[0].friendName, messageContent.content, 7, exp_time, campaign_send_date, campaign.campaign_id, campaign.campaign_contacts[0]._id, message_payload.groupId);
      }
    }
    // shift array
    campaign.campaign_contacts.shift();
    // console.log("Campaign after shifting the contacts --------------------------> ", campaign);
    // store array in storage
    await helper.saveDatainStorage('Campaign_' + campaign.campaign_id, campaign);
  }
  else {
    console.log("Campaign Is inactive");
    chrome.alarms.clear("Campaign_" + campaign.campaign_id + indx);
    chrome.alarms.clear("CampaignMin_" + campaign.campaign_id + "_" + indx);
    delete campaign.campaign_contacts
    await helper.saveDatainStorage("Campaign_" + campaign.campaign_id, campaign);
  }
}

//*Friend request queue: START :::::::::
async function frQueueSettingSetter(frQueSettings) {
  console.log("frQueueSettingSetter setting before ::::: ", frQueSettings);
  let settting = {
    "runningStatus": frQueSettings.run_friend_queue,
    "requestLimited": frQueSettings.request_limited,
    "requestLimitValue": frQueSettings.request_limit_value,
    "timeDelay": frQueSettings.timeDelay,
  }
  console.log("New FRQUE setting set ::::: ", settting);
  const resp = await helper.saveDatainStorage('frQueueSetting', settting);
  return resp;
}

async function frQueueSentCountInit(userFbId, frQueSettings) {
  let frCurrQueueCount = await helper.getDatafromStorage('frQueueSentCount');
  let frQueLocalSettings = await helper.getDatafromStorage('frQueueSetting');
  let resp;
  if (frCurrQueueCount && frQueLocalSettings) {
    console.log("Init count::: ", frCurrQueueCount);
    console.log("Local old Setting::: ", frQueLocalSettings);
    console.log("Queue new seeting from api", frQueSettings);
    if ((!frQueLocalSettings.runningStatus && frQueSettings.run_friend_queue) || frCurrQueueCount.userFbId !== userFbId) {
      let countObj = {
        "count": 0,
        "dateString": helper.getTodayDate(),
        "userFbId": userFbId
      }
      console.log("RE init count::: ", countObj);
      resp = await helper.saveDatainStorage('frQueueSentCount', countObj);
    }

  } else {
    let countObj = {
      "count": 0,
      "dateString": helper.getTodayDate(),
      "userFbId": userFbId
    }
    resp = await helper.saveDatainStorage('frQueueSentCount', countObj);
  }
  return resp;
}

//function to increment frQueueSentCount
async function frQueSentCountIncrement(userFbId) {
  let frCurrQueueCount = await helper.getDatafromStorage('frQueueSentCount');
  console.log('Increment count call::::::', frCurrQueueCount);
  if (frCurrQueueCount) {
    frCurrQueueCount["count"] = frCurrQueueCount.count + 1
    console.log('AFTER Increment count ::::::', frCurrQueueCount);
    await helper.saveDatainStorage('frQueueSentCount', frCurrQueueCount);

  } else {
    let countObj = {
      "count": 0,
      "dateString": helper.getTodayDate(),
      "userFbId": userFbId
    }
    await helper.saveDatainStorage('frQueueSentCount', countObj);

  }
}

// Function to create an alarm that fires every 1 hour
function frQueFetchAlarm_Start() {
  chrome.alarms.create("frQueueFetchAlarm", { periodInMinutes: 60 });
}

// Function to stop the alarm
function frQueFetchAlarm_Stop() {
  chrome.alarms.clear("frQueueFetchAlarm");
}
function frQueueRunnerAlarm_Start(timeDelay) {
  chrome.alarms.create("frQueueRunnerAlarm", { periodInMinutes: timeDelay });
}

function frQueueRunnerAlarm_Stop() {
  chrome.alarms.clear("frQueueRunnerAlarm");

}


//Kill function
function frQue_Kill() {
  frQueueRunnerAlarm_Stop();
  frQueFetchAlarm_Stop()
}


const FrQueue_Manager = async (callFromFetchAlarm = false) => {
  const userPlan = await helper.getDatafromStorage('user_plan')
  if (userPlan < 2) {
    console.log("Free user can't use FRQUE feature");
    frQue_Kill();
    return;
  }
  console.log("%c The FRQueueManager STARTED it's process", successColor);
  const userFBDetails = await helper.getDatafromStorage('fbTokenAndId');
  //fetch api call to get the FRQUEUE Settings
  const settingResp = await common.fetchFrQueueSetting(userFBDetails.userID);
  const frQueSettings = settingResp.data[0];
  console.log("FR QueUE Settings", frQueSettings);
  if (frQueSettings && frQueSettings.run_friend_queue) { // * if the Run true:>
    //Init run counter
    let countInitRes = await frQueueSentCountInit(userFBDetails.userID, frQueSettings);
    //save FR queue setting in local storage
    console.log("Count", countInitRes);
    await frQueueSettingSetter(frQueSettings);
    //then fetch first 100 data from api:
    const frQueueResp = await common.fetchTopPriorityFrQueueRecords(userFBDetails.userID);
    console.log("fr array api RESPONSE:>> ", frQueueResp);
    const frQueArray = frQueueResp.data;
    console.log("fr array api");
    console.log("frque array", frQueArray);
    if (frQueArray.length > 0) {
      console.log(`${frQueArray.length} Items Added to FR queue storage`, frQueArray);
      //RESET FR queue storage:
      //delete all in FR queue storage
      await fRQueue.removeAll();
      //Store data in FR queue:
      let add = await fRQueue.addBulk(frQueArray);
      const fr_token = await helper.getDatafromStorage("fr_token")
      console.log("after add", add);
      //start FR queue Runner alarm start:
      console.log("frQueueRunnerAlarm  started DELAY::: ", frQueSettings.time_delay);
      frQueueRunnerAlarm_Start(frQueSettings.time_delay);
      //start FR queue fetch alarm start:
      console.log("frQueueFetchAlarm  started:::");
      frQueFetchAlarm_Start();
      // runFriendRequestQueue();

    } else {
      console.log("No data in FR queue STOPPING ALARMS!!!!!");
      frQue_Kill();
      return;
    }
  } else { //! if the Run false:>
    //Kill the FR queue runner
    console.log("Before kill settings ", frQueSettings)
    await frQueueSettingSetter(frQueSettings);
    console.log("KILLING FR queue AS the FR queue runner is OFF!!!!!")
    frQue_Kill();
  }
}


//function to check the current FR queue is eligible to run or not
async function isFrQueueEligibleToRun(userFbID, friendFbId) {
  let frQueCount = await helper.getDatafromStorage('frQueueSentCount');
  let frQueSettings = await helper.getDatafromStorage('frQueueSetting');
  console.log("::::::::::Is  Eligible Check ::::::::::::");
  console.log("frq count:", frQueCount);
  console.log("frq settings", frQueSettings);
  if (!frQueSettings.requestLimited) {
    return true;
  } else if (frQueSettings.requestLimited && frQueCount) {
    if (frQueCount.count < frQueSettings.requestLimitValue) {
      return true;
    }
  }
  console.log(":::::::::: FRQ LIMIT END  ::::::::::::");
  const frQueuePayload = {
    "fb_user_id": userFbID,
    "run_friend_queue": false,
    "request_limited": frQueSettings.requestLimited,
    "request_limit_value": frQueSettings.requestLimitValue,
    "time_delay": frQueSettings.timeDelay
  }
  console.log("new frQueue setting after end LIMIT", frQueuePayload);
  await common.storeFrQueueSetting(frQueuePayload);
  await frQueueSettingSetter({...frQueuePayload,"timeDelay":frQueSettings.timeDelay});
  return false;
}
/**
 * 
 * @param {*} fbId 
 * @param {*} message 
 * @param {*} name 
 * @param {*} receiverId 
 * @param {*} memberId 
 */
const storeInMsqsFront = (fbId, message, name, receiverId, memberId = "") => {
  const payload = {
    frienderFbId: fbId,
    message: message,
    recieverName: name,
    recieverFbId: receiverId,
    memberId: memberId,
    notCampaignMessage: true
  }
  addToQueue(payload)
}

const createAndinjectScript = (profileUrl) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: profileUrl, active: false, pinned: true, selected: false }, (tab) => {
      // Close the tab after a delay (adjust as needed)
      setTimeout(() => {
        // For demonstration, let's call your function


        injectScript(tab.id, ["helper.js", "collectData.js"]);
        if (tab) {
          resolve({ tabId: tab.id })
        } else {
          reject({ status: false });
        }
      }, 10000);
    })
  })
}


/**
 * function to check setting eligibility
 * @param {*} userID 
 * @param {*} memberId 
 * @returns 
 */
const profileSettingCheck = async (userID, memberId) => {
  let profileMysettings = await common.getProfileSettings();
  profileMysettings = profileMysettings && profileMysettings.data ? profileMysettings.data[0] : {};
  console.log("profile setting", profileMysettings);
  if (profileMysettings && profileMysettings.dont_send_friend_requests_prople_ive_been_friends_with_before) {
    const isExFriends = await helper.fetchExFriends(userID, memberId)
    console.log("isExFriends ::: ", isExFriends)
    if (isExFriends) { return false }
  }


  if (profileMysettings &&
    (profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected
      || profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected)) {
    const isRejectedFriends = await helper.fetchRejectedFriends(userID, memberId)
    console.log("isRejectedFriends ::: ", isRejectedFriends)
    // console.log("isRejectedFriends isRejected ::: ", isRejectedFriends.isRejected)
    // console.log("isRejectedFriends is_incoming ::: ", isRejectedFriends.is_incoming)
    if (profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected) {
      if (isRejectedFriends && isRejectedFriends.isRejected && !isRejectedFriends.is_incoming) { return false; }
    }
    if (profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected) {
      if (isRejectedFriends && isRejectedFriends.isRejected && isRejectedFriends.is_incoming) { return false; }
    }
  }

  if (profileMysettings && profileMysettings.avoid_sending_friend_request_to_restricted_people) {
    const isRestricted = await common.fetchRestrictedFbProfile({ "facebookUserId": userID, "peopleFbId": memberId });
    console.log("isRestricted ::: ", isRestricted)
    if (isRestricted) return false;
  }
  return true;
}
/** 
* Function to send friend request by queue
*/
const runFriendRequestQueue = async () => {
  const userFBDetails = await helper.getDatafromStorage('fbTokenAndId');
  let first = await fRQueue.pullFromQueue();
  let isEligible = await isFrQueueEligibleToRun(userFBDetails.userID, first.friendFbId);
  console.log("Is eligible to run", isEligible);
  let updatePayload = {
    "q_id": first._id,
    "friendName": "NaN",
    "status": 0,
    "gender": "NaN",
    "fbUserId": userFBDetails.userID > 0 ? userFBDetails.userID : "NaN",
    "friendProfileUrl": first.friendProfileUrl.length > 0 ? first.friendProfileUrl : `https://www.facebook.com/profile.php?id=${first.friendFbId}`,
  };
  if (first && isEligible) {
    console.log("user's details sending fr request from QUE PULL", first);
    console.log("userFBDetails: ", userFBDetails);
    try {
      let profileInfo;
      // await helper.sleep(10000);
      let sentFrReqResponse = { status: false };
      if (first.friendFbId.length > 0) {
        console.log(":::FR WITH GRAPH API:::")
        const friendShipStatus = await common.fetchFriendshipStatus({
          "queueId": first._id,
          "fbUserId": userFBDetails.userID,
          "friendFbId": first.friendFbId
        });
        const settingEligibility = await profileSettingCheck(userFBDetails.userID, first.friendFbId);
        if (friendShipStatus.is_data_found || !settingEligibility) {
          console.log("USER IS ALREADY PRESENT IN YOUR FR LIST ::");
          throw new Error("The user is already present in Feind list");
        }
        profileInfo = await common.getProfileInfo(first.friendFbId, userFBDetails.fbDtsg, userFBDetails.userID);
        await helper.sleep(7000);
        if (profileInfo) sentFrReqResponse = await common.sentFriendRequest(userFBDetails.userID, userFBDetails.fbDtsg, first.friendFbId, "profile_button", "7920515821315043");
      } else if (first.friendProfileUrl.length > 0) {
        console.log(":::::DOM::::::");
        // const sendFrReqDomParseResp= await common.sendFriendRequestByDOMparsing(first.friendProfileUrl);
        const create = await createAndinjectScript(first.friendProfileUrl);
        console.log(":::::DOM DATA::::::", create);
        await helper.sleep(6000);
        const userData = await chrome.tabs.sendMessage(create.tabId, { action: "getUserFbId", tabId: create.tabId });
        const friendFBId = helper.removeExtraQuotes(userData.fbUserId);
        const friendShipStatus = await common.fetchFriendshipStatus({
          "queueId": first._id,
          "fbUserId": userFBDetails.userID,
          "friendFbId": friendFBId
        });
        const settingEligibility = await profileSettingCheck(userFBDetails.userID, friendFBId);
        if (friendShipStatus.is_data_found || !settingEligibility) {
          console.log("USER IS ALREADY PRESENT IN YOUR FR LIST ::");
          chrome.tabs.remove(create.tabId);
          throw new Error("The user is already present in Feind list");
        }
        await helper.sleep(500);
        const sendFrReqDomParseResp = await chrome.tabs.sendMessage(create.tabId, { action: "clickAddFriend", tabId: create.tabId });
        console.log("dom parse response", sendFrReqDomParseResp);
        await helper.sleep(5000);
        const cancleBtn = await chrome.tabs.sendMessage(create.tabId, { action: "checkCancelBtn", tabId: create.tabId });
        console.log("cancleBtn", cancleBtn);
        if (cancleBtn) {
          console.log("cancleBtn.status ON removing The tab", cancleBtn.status);
          chrome.tabs.remove(create.tabId);
        }
        await chrome.tabs.sendMessage(create.tabId, { action: "closeTab", tabId: create.tabId });
        console.log(":::::DOM parse END::::::");
        if (!cancleBtn.status) {
          console.log("dom parse response error")
          throw new Error("With the current url we can't send FriendRequest by DOM parsing");
        }
        sentFrReqResponse.status = sendFrReqDomParseResp.status
        console.log("sent DOM response: ::::::>>>>>", sendFrReqDomParseResp);;
        profileInfo = {
          fbUserId: helper.removeExtraQuotes(sendFrReqDomParseResp.fbUserId ? sendFrReqDomParseResp.fbUserId : ""),
          name: sendFrReqDomParseResp.name,
          profilePictureUrl: sendFrReqDomParseResp.profilePicUrl
        }
      }
      console.log("user FB details nameeeeee:::::", profileInfo);
      let updateResp;
      if (!sentFrReqResponse.status) {
        console.log("ADD Friend Button is not There________________::");
        updatePayload["status"] = 0;
      } else {
        await frQueSentCountIncrement(userFBDetails.userID);
        const friendGenderCountrytier = await common.getGenderCountryTierWithName(profileInfo.name);
        console.log("friendGenderCountrytier***************", friendGenderCountrytier);
        console.log("friend request sending done for userID: ", first.friendProfileUrl);
        updatePayload["status"] = 1;
        updatePayload["friendName"] = profileInfo.name;
        updatePayload["profilePictureUrl"] = profileInfo.profilePictureUrl
        updatePayload["gender"] = friendGenderCountrytier.gender;
        updatePayload["country"] = friendGenderCountrytier.country;
        updatePayload["tier"] = friendGenderCountrytier.tier;
        updatePayload["friendFbId"] = first.friendFbId.length > 0 ? first.friendFbId : profileInfo.fbUserId;
        //await helper.sleep(15000);
        //Sending message on send request
        if (first.message_group_request_sent) {
          console.log("Sending message BLOCK Started///");
          const friendDetails = {
            "fbUserId": first.friendFbId && first.friendFbId.length > 0 ? first.friendFbId : profileInfo.fbUserId,
            "gender": friendGenderCountrytier.gender,
            "country": friendGenderCountrytier.country,
            "tier": friendGenderCountrytier.tier,
            "friendName": profileInfo.name
          }
          if (first.message_group_request_sent.groupId.length > 0) {
            friendDetails["groupId"] = first.message_group_request_sent.groupId
          } else if (first.message_group_request_sent.quickMessage.length > 0) {
            friendDetails["quick_message"] = first.message_group_request_sent.quickMessage
          }
          console.log("Friend detaa for compose message api", friendDetails);
          const finalMsg = await common.getMessageContent(friendDetails);
          console.log("!!!!!!ADDED MESSAGE IN MSQS FROM FR QUEUE!!!!");
          console.log("final message after generating[[[[[[", finalMsg);
          storeInMsqsFront(userFBDetails.userID, finalMsg.content, profileInfo.name, first.friendFbId.length > 0 ? first.friendFbId : profileInfo.fbUserId);
        }
      }
      console.log("UPDATE FR QUEUE status update payload", updatePayload);
      updateResp = await common.updateFrQueueStatus(updatePayload);
      console.log("updating response of fr que sent success", updateResp);
    } catch (error) {
      //update friend request send satus to rejected
      const updateResp = await common.updateFrQueueStatus(updatePayload);
      console.log("updating response of fr que sent rejected", updateResp);
      console.log("Friend request sent error::::" + error);
    }

  } else {
    console.log(":::KILLING the fr queue AS there is No data  OR NOT ELIGIBLE in local QUEUE !!!!!");
    frQue_Kill();
    //stop the process
  }
}
//*Calling FrQueue_Manager ON serviceworker load: START :::::::::
//FrQueue_Manager();

// !Friend request queue: END  :::::::::
