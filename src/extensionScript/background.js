console.log("service worker")
const token = false;

chrome.action.onClicked.addListener(function (activeInfo) {
    console.log("activeInfo on activated ::::: ", activeInfo)
    setPopup();
  });

  const setPopup = () => {
    // console.log("set popup ta hoilo ::::: ", chrome.action)
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

  const injectScript = (tabId) => {
    console.log('tabId ', parseInt(tabId));
  
    chrome.scripting.executeScript(
      {
        target: { tabId: parseInt(tabId) },
        files: ['contentScript.js'],
      },
      () => {
        console.log('injected script');
      }
    );
  };

  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponseExternal) {
      console.log("request ::::::: ",request)
      let tabsId;
      const action_url = "https://www.facebook.com/friends/list"
        console.log("action_url : ", action_url)
        fbDtsg((fbDtsg, userID) => {
          chrome.storage.local.set({fbTokenAndId : {fbDtsg : fbDtsg, userID : userID}})
          // getAllfriend(fbDtsg, userID)
        });
        chrome.tabs.create({ url: action_url, active : false, pinned : true, selected : false }, (tab)=>{
          chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
            if (info.status === 'complete' && tabId === tab.id) {
              chrome.tabs.onUpdated.removeListener(listener);
              tabsId = tab.id
              injectScript(tab.id)
              
            }
          });
        })
        chrome.runtime.onMessage.addListener(
          function(request, sender, sendResponse) {
            console.log("request:::::::::::::::::::", decodeURIComponent(request.friendList[0].node.id));
            chrome.tabs.remove(parseInt(tabsId))
            sendResponseExternal(request)
          }
        );
    });