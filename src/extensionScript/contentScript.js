console.log("content script")

const makeParsable = (html) => {
    let withoutForLoop = html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "");
    return JSON.parse(withoutForLoop);
  }

  const serialize = (obj) => {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
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

  const getAllfriend = async (fbDtsg, userID) => {
    console.log("fbDtsg :::::::::: ", fbDtsg)
    console.log("userID :::::::::: ", userID)
    const data = {
    fb_dtsg: fbDtsg,
    __user: userID,
    variables: JSON.stringify({"count":30,"scale":1,"name":null, "cursor":"AQHR--OtnuFHRPHwHSAwexmyb_bTJuAeR1dw1A5QbMIz0JegiaQwxdAarC_hyKOqmPEfoMUlrsBqbnuCNOVq9WeH9w"}),
    doc_id: 4268740419836267,
    server_timestamps: true,
    av: userID,
    dpr: 1,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "FriendingCometFriendsListPaginationQuery"
    }
    console.log("data ::: ", data);
    console.log("data ::: ", serialize(data));

    let getAllFriendSerive  = await fetch("https://www.facebook.com/api/graphql/", {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "FriendingCometFriendsListPaginationQuery"
        },
        body: serialize(data),
    });
    let routeDefination = await getAllFriendSerive.text();
    routeDefination = makeParsable(routeDefination);
    console.log("routeDefination ::::::::: ", routeDefination.data.viewer.all_friends.edges)
    chrome.runtime.sendMessage({friendList: routeDefination.data.viewer.all_friends.edges});
  }

chrome.storage.local.get('fbTokenAndId', (res)=>{
    console.log("res", res.fbTokenAndId);
    getAllfriend(res.fbTokenAndId.fbDtsg, res.fbTokenAndId.userID)
})



