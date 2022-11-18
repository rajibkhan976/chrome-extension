import { isArray } from "jquery";

const resolve = require("resolve");
const HEADERS = {
  "Content-Type": "application/json",
};
// console.log("I am a helper");

const getDatafromStorage = (key) => {
  // console.log("key ::::::::::::::::::::::: ", key)
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([key], function (res) {
        // console.log("res :::", key, res, res[key])
        if (!isEmptyObj(res)) {
          // console.log(res);
          // console.log(key);
          if (res[key] != undefined && res[key] != null) {
            // console.log(key + " : " + res[key]);
            // console.log("type of " + key + " : " + typeof res[key]);
            resolve(res[key]);
          } else {
            if (key == "FRSendCount" || key == "profile_viewed") resolve(0);
            else resolve({});
          }
        } else {
          if (key == "FRSendCount" || key == "profile_viewed") resolve(0);
          else resolve({});
        }
      });
    } catch (e) {
      if (key == "FRSendCount" || key == "profile_viewed") resolve(0);
      else resolve({});
    }
  });
};

const saveDatainStorage = async (key, data) => {
  return new Promise((resolve, reject) => {
    // console.log("key ::::::::: ", key, data)
    try {
      const saveObj = {}
      saveObj[key] = data
      // console.log("saveObj ::: ", saveObj)
      chrome.storage.local.set(saveObj, function (res) {
        // console.log("res ::: ", res)
        resolve(true);
      });
    } catch (e) {
      // console.log("error ::::::::::::: ", e)
      resolve(false);
    }
  });
};

const removeDatafromStorage = async (key) => {
  return new Promise((resolve, reject) => {
    try {
      // console.log("KEY ::: REMOVE ::: ", key)
      chrome.storage.local.remove(key, function (res) {
        resolve(true);
      });
    } catch (e) {
      resolve(false);
    }
  });
};

const isEmptyObj = function (obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

const makeParsable = (html) => {
  let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "");
  return JSON.parse(withoutForLoop);
};

const sleep = (ms) => {
  // console.log("SLEEP for ", ms / 1000 + " Second(s)")
  return new Promise(resolve => setTimeout(resolve, ms));
}
const getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const sendDataToPorat = (action, content) => {
  chrome.runtime.sendMessage({ action: action, content: content });
}

const defaultExpiryMinutes = 10;

const setCookie = (name, value, minutes = defaultExpiryMinutes) => {
  var expires = "";
  if (minutes) {
    var date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
const getCookie = (name) => {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
const deleteCookie = (name) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const serialize = (obj) => {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
};

const getOutgoingPendingRequestList = (userID, isInterval = false, settingsDetails = 0) => {
  return new Promise(async (resolve, reject) => {
    let outgoingPendingReqPayload =
    {
      "fbUserId": userID
    }
    if (isInterval) {
      outgoingPendingReqPayload["deleteDelayDay"] = settingsDetails
    }
    HEADERS.authorization = await helper.getDatafromStorage("fr_token");

    let outgoingPendingRequestSerive = await fetch(process.env.REACT_APP_FETCH_DELETE_PENDING_FR, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(outgoingPendingReqPayload)
    })
    let outgoingPendingRequestDefinition = await outgoingPendingRequestSerive.json();
    outgoingPendingRequestDefinition = outgoingPendingRequestDefinition.data
    //console.log("outgoingPendingRequestSerive :::: ", outgoingPendingRequestDefinition)
    if(outgoingPendingRequestDefinition && outgoingPendingRequestDefinition.length > 0){
      resolve(outgoingPendingRequestDefinition);
    } else {
      resolve([])
    }
  })
}

const deleteFRFromFriender = async (deletedPendingFR, userID) => {
  return new Promise(async (resolve, reject) => {
    if (deletedPendingFR.length > 0) {
      console.log("deletedPendingFR ::: ", deletedPendingFR)
      const reqBody = {
        "fbUserId": userID,
        "sendFriendRequestLogId": deletedPendingFR
      }
      HEADERS.authorization = await helper.getDatafromStorage("fr_token");

      let deleteFR = await fetch(process.env.REACT_APP_FETCH_DELETE_PENDING_FR_log, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(reqBody)
      })

      deleteFR = await deleteFR.json();
      console.log("deleteFR ::: ", deleteFR)
      if (deleteFR && deleteFR.data)
        resolve(true)
      else resolve(false)
    } else {
      resolve("Reject List is empty")
    }
  })
}

const helper =
{
  getDatafromStorage: getDatafromStorage,
  saveDatainStorage: saveDatainStorage,
  removeDatafromStorage: removeDatafromStorage,
  serialize: serialize,
  makeParsable: makeParsable,
  isEmptyObj: isEmptyObj,
  sleep: sleep,
  getRandomInteger: getRandomInteger,
  sendDataToPorat: sendDataToPorat,
  setCookie: setCookie,
  getCookie: getCookie,
  deleteCookie: deleteCookie,
  getOutgoingPendingRequestList: getOutgoingPendingRequestList,
  deleteFRFromFriender: deleteFRFromFriender
};

export default helper
