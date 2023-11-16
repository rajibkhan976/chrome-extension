
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
  console.log("SLEEP for ", ms / 1000 + " Second(s)")
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

const fetchSendFriendRequests = (userID) => {
  return new Promise(async (resolve, reject) => {
    let outgoingPendingReqPayload =
    {
      "fbUserId": userID
    }
    HEADERS.authorization = await helper.getDatafromStorage("fr_token");

    let outgoingPendingRequestSerive = await fetch(process.env.REACT_APP_PENDING_FR_REQUEST_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(outgoingPendingReqPayload)
    })
    let outgoingPendingRequestDefinition = await outgoingPendingRequestSerive.json();
    outgoingPendingRequestDefinition = outgoingPendingRequestDefinition.data
    // console.log("outgoingPendingRequestSerive :::: ", outgoingPendingRequestDefinition)
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
/**
 * 
 * @param {String} str 
* @return String 
 */
const trimSpecialCharacters=(str)=>{
  // Use a regular expression to match and replace special characters
  return str.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
}

const fetchExFriends = async ( userID, friend_uid ) => {
  return new Promise(async (resolve, reject) => {
      const reqBody = {
        "fbUserId": userID
      }
      HEADERS.authorization = await helper.getDatafromStorage("fr_token");

      let exFriends = await fetch(process.env.REACT_APP_FETCH_EX_FRIENDS, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(reqBody)
      })

      exFriends = await exFriends.json();
      exFriends = exFriends && exFriends.data && exFriends.data.length && exFriends.data[0] && exFriends.data[0].friend_details
      if (exFriends && exFriends.length){
        exFriends = exFriends.filter((el) => {return el.friendStatus === "Lost" || (el.deleted_status && el.deleted_status === 1)})
        exFriends = exFriends.filter(el => el.friendFbId === friend_uid)
        // console.log("exFriends ::: ", exFriends)
        if(exFriends.length > 0)
          resolve(true)
        else resolve(false)
        }
      else resolve(false)
  })
}

const fetchRejectedFriends = async ( userID, friend_uid ) => {
  return new Promise(async (resolve, reject) => {

      HEADERS.authorization = await helper.getDatafromStorage("fr_token");

      let rejectedFriends = await fetch(process.env.REACT_APP_FETCH_REJECTED_FRIENDS + userID, {
        method: 'GET',
        headers: HEADERS
      })
      console.log("rejectedFriends::: ", rejectedFriends)
      rejectedFriends = await rejectedFriends.json();
      rejectedFriends = rejectedFriends && rejectedFriends.data
      console.log("rejectedFriends 1 :::: ", rejectedFriends)
      if(rejectedFriends && rejectedFriends.length > 0)
      {
        rejectedFriends = rejectedFriends.filter(el => el.friendFbId === friend_uid)
        console.log("rejectedFriends 2 :::: ", rejectedFriends)
        if(rejectedFriends.length > 0)
          resolve({isRejected : true, is_incoming : rejectedFriends.is_incoming ? rejectedFriends.is_incoming : false})
        else resolve({isRejected : false})
      }
      else
        resolve({isRejected : false})
  })
}
const sendRequest = async (url, method, data, callback = () => {}, headersObj) => {

  return new Promise(function (resolve, reject) {
      var xhttp = new XMLHttpRequest();
      xhttp.open(method, url, true);
      // xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhttp.setRequestHeader("Accept", "text/html,application/json");

      if (headersObj) {
          for (const header in headersObj) {
              xhttp.setRequestHeader(header, headersObj[header])
          }
      }
      xhttp.onload = function () {
          callback(xhttp.responseText);
          resolve(xhttp.responseText);
      };
      xhttp.onerror = function () {
          callback("");
          reject();
      };
      xhttp.send(data);
  });
}

const fetchSentFRLog = async ( userID ) => {
  return new Promise(async (resolve, reject) => {
      HEADERS.authorization = await helper.getDatafromStorage("fr_token");

      let sentFRLog = await fetch(process.env.REACT_APP_FETCH_SEND_FRIEND_REQUEST_LOG + userID, {
        method: 'GET',
        headers: HEADERS
      })

      sentFRLog = await sentFRLog.json();
      sentFRLog = sentFRLog && sentFRLog.data
      // console.log("sentFRLog ::: ", sentFRLog)
      if (sentFRLog && sentFRLog.length){
        if(sentFRLog.length > 0)
          resolve(sentFRLog)
        else resolve([])
      }
      else resolve([])
  })
}

/**
 * Custom function to handle the console.log events
 * @param {*} msg 
 * @param {*} arr 
 */
console.log = function (msg, arr) {
updateLog(msg, arr);
console.warn(msg, arr);
};
/**
 * Custom function to handle the console.info events
 * @param {*} msg 
 * @param {*} arr 
 */
console.info = function (msg, arr) {
updateLog(msg, arr);
console.warn(msg, arr);
};
/**
 * Custom function to handle the console.error events
 * @param {*} msg 
 * @param {*} arr 
 */
console.error = function (msg, arr) {
updateLog(msg, arr);
console.warn(msg, arr);
};

/**
 * Function to update the log for a user 
 * @param {*} msg 
 * @param {*} arr 
 * @returns 
 */
const updateLog = (msg, arr) => {
  // need to check debug flag 
  return new Promise(async (resolve, reject) => {
    let fbUserId = await helper.getDatafromStorage("fbTokenAndId");
    let logPermission = await helper.getDatafromStorage("fr_debug_mode");
    if(logPermission == 0){
      resolve([])
      return
    }
    let reqPayload =
    {
      "fbUserId": fbUserId.userID,
      "logMessage": msg + JSON.stringify(arr)
    }
    HEADERS.authorization = await helper.getDatafromStorage("fr_token");
    let updateLog = await fetch(process.env.REACT_APP_UPDATE_LOG, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(reqPayload)
    })
    updateLog = await updateLog.json();
    
    if(updateLog){
      resolve(updateLog);
    } else {
      resolve([])
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
  fetchSendFriendRequests : fetchSendFriendRequests,
  deleteFRFromFriender: deleteFRFromFriender,
  trimSpecialCharacters:trimSpecialCharacters,
  fetchExFriends:fetchExFriends,
  fetchRejectedFriends:fetchRejectedFriends,
  fetchSentFRLog:fetchSentFRLog,
  sendRequest:sendRequest
};

export default helper
