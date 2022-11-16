console.log("content script")
// const friendLength = chrome.storage.local.get("friendLength");
let finalFriendList = [];
let finalFriendListWithMsg = [];
let fr_token;
chrome.storage.local.get('fr_token',(res)=>{
  console.log("fr_token ", res.fr_token);
  fr_token = res.fr_token;
})
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

  const getAllfriend = async (fbDtsg, userID, friendLength, count = 0, cursor = null) => {
    // console.log("fbDtsg :::::::::: ", fbDtsg)
    // console.log("userID :::::::::: ", userID)
    console.log("friendLength :::::::::: ", friendLength)
   let graphPayload;
    if(count > 0){
        graphPayload = {...data, fb_dtsg: fbDtsg, __user: userID, av: userID}
        graphPayload.variables.cursor = cursor
        graphPayload.variables = JSON.stringify(graphPayload.variables)
    }else{
        graphPayload = {...data, fb_dtsg: fbDtsg, __user: userID, av: userID}
        graphPayload.variables = JSON.stringify(data.variables)
    }
    console.log("graphPayload ::: ", graphPayload);
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
    if(routeDefination.includes("<!DOCTYPE html>"))
    {
      console.log("yesssssss");
      chrome.runtime.sendMessage({action : "facebookLoggedOut",msg: "you have logged out from facebook. All friend's data got discarded."});
      return;
    }
    routeDefination = makeParsable(routeDefination);
    console.log("routeDefination :::::::: ", routeDefination);
    routeDefination = routeDefination.data.viewer.all_friends.edges;
    // console.log("routeDefination count ::::::::: " , count + routeDefination.length, routeDefination.length, routeDefination[routeDefination.length-1].cursor, routeDefination)
    if(count < friendLength){
      if(routeDefination.length > 0){
          for(let i of routeDefination){
              finalFriendList = [...finalFriendList, i]
          }
          console.log("count%900 ", count%900)
          // if(count%900 == 0)
          //   setTimeout(()=>{
          //     getAllfriend(fbDtsg, userID, friendLength, count + routeDefination.length, routeDefination[routeDefination.length-1].cursor ? routeDefination[routeDefination.length-1].cursor : null)
          //     chrome.runtime.sendMessage({action : "countBadge",count : count + routeDefination.length});
          //   }, 60000)
          // else
            // setTimeout(()=>{
              getAllfriend(fbDtsg, userID, friendLength, count + routeDefination.length, routeDefination[routeDefination.length-1].cursor ? routeDefination[routeDefination.length-1].cursor : null)
              chrome.runtime.sendMessage({action : "countBadge",count : count + routeDefination.length});
            // }, (Math.random() * (5 - 3 + 1) + 3) * 1000)
            
      }
      else{
        saveFriendList(finalFriendList, userID)
        // chrome.runtime.sendMessage({action : "finalFriendList",friendList: finalFriendList});
        // getMessageEngagement(fbDtsg, userID, finalFriendList)
      }
    }
    else{
      saveFriendList(finalFriendList, userID)
        // chrome.runtime.sendMessage({action : "finalFriendList",friendList: finalFriendList});
        // getMessageEngagement(fbDtsg, userID, finalFriendList)
    }
}

chrome.storage.local.get('fbTokenAndId', (res)=>{
  chrome.storage.local.get("friendLength", (resp) => {
    const friendLength = resp.friendLength.replace(",", "");
    console.log("resp.friendLength ::: ", friendLength, parseInt(friendLength))
    getAllfriend(res.fbTokenAndId.fbDtsg, res.fbTokenAndId.userID, Number(friendLength))
  })
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

 const saveFriendList = async(finalFriendList, userID) => {
  const time = Date.now();
  const friendlistData = finalFriendList.map((el)=>{
    const eachFriendinfo = {
        "friendFbId" : el.node.id,
        "friendProfileUrl" : "https://www.facebook.com/profile.php?id=" + el.node.id,
        "friendMessageUrl" : "https://www.facebook.com/messages/t/" + el.node.id,
        "friendName" : el.node.name,
        "friendProfilePicture": el.node.profile_picture ? el.node.profile_picture.uri ? el.node.profile_picture.uri : "" : "",
        "friendShortName" : el.node.short_name,
        "friendGender" : el.node.gender ? el.node.gender : "N/A",
        "mutualFriend" : el.node.social_context ? el.node.social_context.text.split(" mutual friends")[0] : "N/A",
        "friendStatus" : el.node.id.length === 15 ? "Activate" : "Deactivate",
        "finalSource" : "Sync",
    }
    return eachFriendinfo;
  })
  const friendListPayload = {
    "token": fr_token,
    "syncDate": time,
    "syncingId": "friender_" + time,
    "facebookUserId": userID,
    "friend_details" : friendlistData
  }
  console.log("friendListPayload :::::::::::::::::: ", friendListPayload);
  let getAllFriendSerive  = await fetch("https://3pqc39mfr1.execute-api.us-east-1.amazonaws.com/dev/store-user-friendlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(friendListPayload),
    });
  if(getAllFriendSerive){
    console.log("LaWrA")
    chrome.runtime.sendMessage({action : "finalFriendList", friendListCount : friendlistData.length});
  }
 }
