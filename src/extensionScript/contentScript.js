console.log("content script")
const friendLength = 60;
let finalFriendList = [];
let finalFriendListWithMsg = [];

let data = {
    // fb_dtsg: fbDtsg,
    // __user: userID,
    variables: {"count":30,"scale":1,"name":null, "cursor":"AQHR--OtnuFHRPHwHSAwexmyb_bTJuAeR1dw1A5QbMIz0JegiaQwxdAarC_hyKOqmPEfoMUlrsBqbnuCNOVq9WeH9w"},
    doc_id: 4268740419836267,
    server_timestamps: true,
    // av: userID,
    dpr: 1,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "FriendingCometFriendsListPaginationQuery"
    }
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

  const getAllfriend = async (fbDtsg, userID, count = 0, cursor = null) => {
    // console.log("fbDtsg :::::::::: ", fbDtsg)
    // console.log("userID :::::::::: ", userID)
   let graphPayload;
    if(count > 0){
        graphPayload = {...data, fb_dtsg: fbDtsg, __user: userID, av: userID}
        graphPayload.variables.cursor = cursor
        graphPayload.variables = JSON.stringify(graphPayload.variables)
    }else{
        graphPayload = {...data, fb_dtsg: fbDtsg, __user: userID, av: userID}
        graphPayload.variables = JSON.stringify(data.variables)
    }
    let getAllFriendSerive  = await fetch("https://www.facebook.com/api/graphql/", {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "FriendingCometFriendsListPaginationQuery"
        },
        body: serialize(graphPayload),
    });
    let routeDefination = await getAllFriendSerive.text();
    console.log("routeDefination :::::::: ", routeDefination);
    if(routeDefination.includes("<!DOCTYPE html>"))
    {
      console.log("yesssssss");
      chrome.runtime.sendMessage({action : "facebookLoggedOut",msg: "you have logged out from facebook. All friend's data got discarded."});
      return;
    }
    routeDefination = makeParsable(routeDefination);
    routeDefination = routeDefination.data.viewer.all_friends.edges;
    // console.log("routeDefination count ::::::::: " + count + count, routeDefination.length, routeDefination[routeDefination.length-1].cursor, routeDefination)
    if(count < friendLength){
        for(let i of routeDefination){
            finalFriendList = [...finalFriendList, i]
        }
        getAllfriend(fbDtsg, userID, count + routeDefination.length, routeDefination[routeDefination.length-1].cursor)
    }
    else{
        getMessageEngagement(fbDtsg, userID, finalFriendList)
    }
}

chrome.storage.local.get('fbTokenAndId', (res)=>{
    getAllfriend(res.fbTokenAndId.fbDtsg, res.fbTokenAndId.userID)
})

const getMessageEngagement = async (fbDtsg, userID, finalFriendList, count = 0) => {
  const friendId = [...finalFriendList].map((el)=>  el.node.id)
  // console.log("friendId   :  ", friendId)
  if(count < friendId.length)
  {
    const payloadMsg = {
      batch_name: "MessengerGraphQLThreadFetcher",
      __req: "1k",
      __a:   userID,
      __user: userID,
      fb_dtsg:fbDtsg,
      queries: JSON.stringify({
                  "o0": {
                      "doc_id":"3106009512862081",
                      "query_params": 
                          {
                              "id": friendId[count],
                              "message_limit":0,
                              "load_messages":true,
                              "is_work_teamwork_not_putting_muted_in_unreads":false
                          }
                      }
                })
      }
      const url = "https://www.facebook.com/api/graphqlbatch/";
      // console.log("serialize(payloadMsg) :::: ", serialize(payloadMsg));
      // return;
      let getAllFriendMsgSerivice  = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        },
        body: serialize(payloadMsg),
    });
    let msgEngRes = await getAllFriendMsgSerivice.text();
    console.log("msgEngResv 114 ::: ", msgEngRes)
    if(msgEngRes.includes("errorSummary"))
    {
      console.log("yesssssss");
      chrome.runtime.sendMessage({action : "facebookLoggedOut",msg: "you have logged out from facebook. All friend's data got discarded."});
      return;
    }
    msgEngRes = makeParsable(msgEngRes.split('{"successful_results":')[0].trim());
    console.log("msgEngRes.o0.data :::::::::: ", msgEngRes.o0.data.message_thread)
    msgEngRes = msgEngRes && msgEngRes.o0.data.message_thread;
    finalFriendListWithMsg = [...finalFriendListWithMsg, {...finalFriendList[count], message_thread  :  msgEngRes ? msgEngRes.messages_count : 0}];
    // console.log("finalFriendListWithMsg  :  :  : ", finalFriendListWithMsg)
    chrome.runtime.sendMessage({action : "countBadge", count: count + 1})
    await getMessageEngagement(fbDtsg, userID, finalFriendList, count+1)
  }
  else{
    // console.log("finalFriendListWithMsg ::::: ", finalFriendListWithMsg)
        chrome.runtime.sendMessage({action : "finalFriendList",friendList: finalFriendListWithMsg});
  }
}
