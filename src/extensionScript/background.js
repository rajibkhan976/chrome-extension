// console.log("service worker")
// const io = require("socket.io")
const token = false;
const action_url = "https://www.facebook.com/friends/list";
let tabsId;
// let socket = io.connect('http://localhost');
chrome.management.getSelf((result)=>{
  console.log("result of ext info : ", result.id)
})
chrome.runtime.onInstalled.addListener((res) => {
  console.log("res : ", res.reason)
  if(res && res.reason === "install"){
    chrome.tabs.create({
      url: 'https://www.facebook.com',
      active: true
    });
  // socket.emit('join', {action: "successPage"});
  }
  return false;
})
chrome.action.onClicked.addListener(function (activeInfo) {
    console.log("activeInfo on activated ::::: ", activeInfo)
    setPopup();
  });

  const setPopup = () => {
    if(token){
        chrome.action.setPopup({ popup: "popup.html" });
    }
    else{
       chrome.tabs.create({ url: "http://localhost:3000/"}) 
    }
  }

  const fbDtsg = (callback = null) => {
    fetch('https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed', {
      method: 'GET',
    })
      .then((e) => e.text())
      .then((e) => {
        // console.log(e.text().match(/{\\"dtsg\\":{\\"token\\":\\"(.*?)\\"/));
        let dtsgData = e.match(/{\\"dtsg\\":{\\"token\\":\\"(.*?)\\"/);
        let userIdData = e.match(/\\"USER_ID\\":\\"(.*?)\\"/);
        if (dtsgData.length > 1) {
          if (callback) {
            callback(dtsgData[1], userIdData[1]);
          }
        } else {
          if (callback) {
            callback(null);
          }
        }
      })
      .catch(() => {
        if (callback) {
          callback(null);
        }
      });
  };

  const injectScript = (tabId, contentScript) => {
    console.log('tabId ', parseInt(tabId));
  
    chrome.scripting.executeScript(
      {
        target: { tabId: parseInt(tabId) },
        files: [contentScript],
      },
      () => {
        // console.log('injected script');
      }
    );
  };

  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponseExternal) {
      // console.log("request ::::::: ",request)
        // console.log("action_url : ", action_url)
        switch(request.action){
          case "extensionInstallation" : console.log("kjsdfhk,ush   , ", request.frLoginToken) 
                                        chrome.storage.local.set({fr_token :request.frLoginToken})
                                        sendResponseExternal(true);
                                        break;
          case "syncprofile" :  
                              if(request.frLoginToken !== null){
                                  getProfileInfo((userProfileData)=>sendResponseExternal(userProfileData))
                               }
                               break;
          case "syncFriendLength" : if(request.frLoginToken == null){
                                      console.log("not logged in yet")
                                      chrome.action.setBadgeText({text: "Not loggedin yet in Friender"});
                                      // chrome.action.setBadgeBackgroundColor({color: "Red"});
                                      return;
                                    }else{
                                      console.log("I am logged in in Friender")

                                      chrome.action.setBadgeText({text: "loggedin"});
                                      chrome.action.setBadgeBackgroundColor({color: "blue"});
                                      syncFriendLength(sendResponseExternal);
                                    }
                                    break;
          case "syncFriendList" : fbDtsg((fbDtsg, userID) => {
                                  chrome.storage.local.set({fbTokenAndId : {fbDtsg : fbDtsg, userID : userID}})
                                  // getAllfriend(fbDtsg, userID)
                                });
                                chrome.tabs.create({ url: action_url, active : false, pinned : true, selected : false }, (tab)=>{
                                  chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                                    if (info.status === 'complete' && tabId === tab.id) {
                                      chrome.tabs.onUpdated.removeListener(listener);
                                      tabsId = tab.id
                                      injectScript(tab.id, 'contentScript.js')
                                      
                                    }
                                  });
                                })
                                chrome.runtime.onMessage.addListener(
                                  function(request, sender, sendResponse) {
                                      if(request.action === "finalFriendList"){
                                      chrome.action.setBadgeText({text: "Done"});
                                      // chrome.action.setBadgeBackgroundColor({color: "Green"});
                                      chrome.tabs.remove(parseInt(tabsId))
                                      console.log("request fr :::: ", request)
                                      sendResponseExternal(request)
                                      }
                                      else if(request.action === "countBadge"){
                                        chrome.action.setBadgeText({text: request.count.toString()})
                                      }else if(request.action === "facebookLoggedOut"){
                                        console.log("***************************facebookLoggedOut**********************", request)
                                        sendResponseExternal(request)
                                        chrome.tabs.remove(parseInt(tabsId))
                                        chrome.action.setBadgeText({text: ""});
                                      }
                                  }
                                );
                            break;
          case "frienderLogout" :
                                  chrome.tabs.remove(parseInt(tabsId));
                                  chrome.action.setBadgeText({
                                    'text': '' //an empty string displays nothing!
                                  })
                                  sendResponseExternal({msg : "You are logged out and all process hasbeen stopped."})
                                  break;
          default: break;
        }
    });

  const syncFriendLength = (sendResponseExternal) => {
    getProfileInfo((userProfileData)=>{
      console.log("userProfileData : ", userProfileData)
      if(userProfileData === null){
        sendResponseExternal({action : "noFBLoggedIn", warningMsg : "Please login in Facebook. To loging please open this https://www.facebook.com/", userProfileData : {profileUrl : "", profilePicture : "", Name : "", userId : ""}})
      }else{
        chrome.tabs.create({ url: action_url, active : false, pinned : true, selected : false }, (tab)=>{
          chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
            if (info.status === 'complete' && tabId === tab.id) {
              chrome.tabs.onUpdated.removeListener(listener);
              tabsId = tab.id
              injectScript(tab.id, 'getFriendLength.js')
              
            }
          });
        })
        chrome.runtime.onMessage.addListener(
          function(request, sender, sendResponse) {
              if(request.action === "friendCount"){
                const userData = {profileUrl : "https://www.facebook.com" + userProfileData.path, profilePicture : userProfileData.photo, name : userProfileData.text, userId : userProfileData.uid}
                request.userProfileData = userData;
                console.log("request ::: ", request)
                chrome.tabs.remove(parseInt(tabsId))
                // console.log(parseInt(request.friendLength));
                chrome.storage.local.set({"friendLength" : request.friendLength})
                sendResponseExternal(request)
              }
          }
        );
      }
    })
  }

const getProfileInfo = (callback = null) => {
  fetch('https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed', {
    method: 'GET',
  })
    .then((e) => e.text())
    .then((e) => {
      // console.log("e ::: ", e)
      let userProfileData = e.match(/\\"suggestions\\":\[\{[^}]*\}/gm);
      // console.log("userProfileData ::: ", userProfileData)
      if (userProfileData && userProfileData.length > 0) {
        userProfileData = "{" + userProfileData[0].replace(/[\\]/g, "") + "]}"
        console.log("userProfileData ::: ", JSON.parse(userProfileData).suggestions[0])
        if (callback) {
          callback({...JSON.parse(userProfileData).suggestions[0], isFbLoggedin : true});
        }
      } else {
        if (callback) {
          callback({isFbLoggedin : false});
        }
      }
    })
    .catch(() => {
      if (callback) {
        callback(null);
      }
    });
};

const socketConnection = () => {
  io.on('connection', socket => {
    socket.emit('request', /* … */); // emit an event to the socket
    io.emit('broadcast', /* … */); // emit an event to all connected sockets
    socket.on('reply', () => { /* … */ }); // listen to the event
  });
}