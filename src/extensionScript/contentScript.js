import helper from "./helper";
import common from "./commonScript";
let finalFriendList = [], countInterval;
let finalFriendListWithMsg = [], commentREactionThread = [];
let dayBackCount = 7;
let allPendingFriendReqList = [], commenters = [], reactors = [];
let allOutgoingPendingFriendReqListFromDB = []
let dayBack = new Date(Date.now() - dayBackCount * 24 * 60 * 60 * 1000);
let dayBackMonth = 120;
let scannedPostIds = {};
const graphQL = "https://www.facebook.com/api/graphql/";
dayBack.setHours(0);
dayBack.setHours(0);

// Overlay
let overlay = `<div className="overlay-wraper" style="width: 100%;height: 100vh;position: fixed;top:0;left:0;background: rgb(9 124 207 / 64%);pointer-events: none;">
<p style=" position: absolute; left: 50%;top: 50%;transform: translate(-50%, -50%);color: #fff;font-weight: 700;font-size: 35px; text-align: center;">Friender is using this page.<br/> Please don't reload.</p>
</div>`;

chrome.runtime.sendMessage({ action: "msgFormExt", content: "hello" });
let parser = new DOMParser();
let doc = parser.parseFromString(overlay, "text/html");
let fbBody = document.querySelector("body");
// console.log("fbBody ::: ", fbBody)
fbBody.append(doc.body.firstChild)
fbBody.style["pointer-events"] = "none";
let fr_token
let data = {
  variables: { "count": 30, "scale": 1, "name": null },
  doc_id: 4268740419836267,
  server_timestamps: true,
  dpr: 1,
  fb_api_caller_class: "RelayModern",
  fb_api_req_friendly_name: "FriendingCometFriendsListPaginationQuery"
}

const getAllfriend = async (
  fbDtsg,
  userID,
  friendLength,
  count = 0,
  cursor = null
) => {
  let graphPayload = { ...data, fb_dtsg: fbDtsg, __user: userID, av: userID };
  if (count > 0) {
    graphPayload.variables.cursor = cursor;
    graphPayload.variables = JSON.stringify(graphPayload.variables);
  } else {
    graphPayload.variables = JSON.stringify(data.variables);
    chrome.runtime.sendMessage({
      action: "sendUpdate",
      isSyncing: "active",
      update: "Syncing Friends...",
      content: "Syncing Friends...",
    });
    helper.sendDataToPorat("syncing_status", "Syncing Friends...");
  }
  let getAllFriendSerive = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "FriendingCometFriendsListPaginationQuery",
      },
      body: helper.serialize(graphPayload),
    });

  let routeDefination = await getAllFriendSerive.text();
  if (routeDefination.includes("<!DOCTYPE html>")) {
    chrome.runtime.sendMessage({
      action: "facebookLoggedOut",
      msg: "you have logged out from facebook. All friend's data got discarded.",
    });
    return;
  }
  routeDefination = helper.makeParsable(routeDefination);
  routeDefination = routeDefination.data.viewer.all_friends.edges;
  if (count < friendLength) {
    if (routeDefination.length > 0) {
      for (let i of routeDefination) {
        finalFriendList = [...finalFriendList, i.node];
      }
      chrome.runtime.sendMessage({
        action: "countBadge",
        count: count + routeDefination.length,
      });
      await helper.sleep(helper.getRandomInteger(200, 1000))
      getAllfriend(
        fbDtsg,
        userID,
        friendLength,
        count + routeDefination.length,
        routeDefination[routeDefination.length - 1].cursor
          ? routeDefination[routeDefination.length - 1].cursor
          : null
      );

    } else {
      saveFriendList(finalFriendList, userID, fbDtsg, "friendList");

      chrome.runtime.sendMessage({ action: "finalFriendList", friendList: finalFriendList });
      chrome.runtime.sendMessage({ action: "countBadge", count: count, content: count })
    }
  }
  else {
    chrome.runtime.sendMessage({ action: "finalFriendList", friendList: finalFriendList });
    chrome.runtime.sendMessage({ action: "countBadge", count: count, content: count })
    saveFriendList(finalFriendList, userID, fbDtsg, "friendList");
  }
};

const letsStart = async (callback = null) => {
  // console.log("lets start")
  fr_token = await helper.getDatafromStorage("fr_token");
  // console.log("fr_token ", fr_token);
  const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
  // console.log("fbTokenAndId ::: ", fbTokenAndId)
  let friendLength = await helper.getDatafromStorage("friendLength");
  // console.log("friend length", friendLength)
  friendLength = friendLength.replace(",", "").split(" ")[0];
  // console.log("fbTokenAndId.fbDtsg, fbTokenAndId.userID, Number(friendLength) :::: ", fbTokenAndId.fbDtsg, fbTokenAndId.userID, Number(friendLength))
  callback(fbTokenAndId.fbDtsg, fbTokenAndId.userID, Number(friendLength));
};

const getMessageEngagement = async (
  fbDtsg,
  userID,
  finalFriendList,
  count = 0
) => {
  helper.sendDataToPorat("syncing_status", "Syncing Messages...");
  // console.log("count ::: ", count)
  if (count % 50 === 0) {
    chrome.runtime.sendMessage({
      action: "sendUpdate",
      isSyncing: "active",
      update: "Syncing Messages...",
      content: "Syncing Messages..."
    });
  }
  if( finalFriendList[count].id && finalFriendList[count].id.length > 0 && isNaN(Number(finalFriendList[count].id)) ){
    await getMessageEngagement(fbDtsg, userID, finalFriendList, count + 1);
    finalFriendListWithMsg = [
      ...finalFriendListWithMsg,
      {
        ...finalFriendList[count],
        message_thread: 0,
      },]
    return;
  }
  if (count < finalFriendList.length) {
    const payloadMsg = {
      batch_name: "MessengerGraphQLThreadFetcher",
      __req: "1k",
      __a: userID,
      __user: userID,
      fb_dtsg: fbDtsg,
      queries: JSON.stringify({
        o0: {
          doc_id: "3106009512862081",
          query_params: {
            id: finalFriendList[count].id,
            message_limit: 0,
            load_messages: true,
            is_work_teamwork_not_putting_muted_in_unreads: false,
          },
        },
      }),
    };
    const url = "https://www.facebook.com/api/graphqlbatch/";
    let getAllFriendMsgSerivice = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
      },
      body: helper.serialize(payloadMsg),
    });
    let msgEngRes = await getAllFriendMsgSerivice.text();
    if (msgEngRes.includes("errorSummary")) {
      // console.log("yesssssss");
      chrome.runtime.sendMessage({
        action: "facebookLoggedOut",
        msg: "you have logged out from facebook. All friend's data got discarded.",
      });
      return;
    }
    msgEngRes = helper.makeParsable(
      msgEngRes.split('{"successful_results":')[0].trim()
    );
    msgEngRes = msgEngRes && msgEngRes.o0 && msgEngRes.o0.data!=undefined && msgEngRes.o0.data.message_thread!=undefined? msgEngRes.o0.data.message_thread:0 ;
    // console.log("msgEngResv 124 ::: ", msgEngRes)
    finalFriendListWithMsg = [
      ...finalFriendListWithMsg,
      {
        ...finalFriendList[count],
        message_thread: msgEngRes ? msgEngRes.messages_count : 0,
      },
    ];
    // console.log("count ::: ", count + 1)
    // console.log("finalFriendListWithMsg ::: ", finalFriendListWithMsg)
    await getMessageEngagement(fbDtsg, userID, finalFriendList, count + 1);
  } else {
    // Save the message count here 
    console.log("Final Friend list with mesage count",finalFriendListWithMsg)
    console.log("HIT sync Pending Fr Request")
    // Go to next process
    // initSyncSendFriendRequestStatus(fbDtsg, userID)
    // Uncomment it later
    saveFriendListEngagement(
      finalFriendListWithMsg,
      userID,
      fbDtsg,
      "syncPendingFrRequest"
    );

  }
};

/**
 * function to initiate pending fremd request syncing
 * @param {*} fbDtsg 
 * @param {*} userID 
 */
const initSyncSendFriendRequestStatus = async (fbDtsg, userID) => {
  try {
    const pendingList = await helper.fetchSendFriendRequests(userID);
    // console.log("all pendingList from DB :::: ", pendingList);
    const incomingPendingList = pendingList && pendingList.filter(el => el.is_incoming === true)
    const outgoingPendingList = pendingList && pendingList.filter(el => !el.is_incoming || el.is_incoming !== true);
    // console.log("incomingPendingList :::: ", incomingPendingList)
    // console.log("outgoingPendingList :::: ", outgoingPendingList)
    const allIncomingPendingFriendReqListFromFB = await common.getIncomingPendingList(userID, fbDtsg)
    console.log("allIncomingPendingFriendReqListFromFB ::: ", allIncomingPendingFriendReqListFromFB);
    // if(incomingPendingList.length === 0 && outgoingPendingList.length === 0){
    //   saveFriendListEngagement([], userID, fbDtsg, "syncCompleted");
    // }
    if (outgoingPendingList.length > 0) {
      await syncSendFriendRequestStatus(fbDtsg, userID, null);
      // console.log("outgoingPendingList ::: ", outgoingPendingList);
      await comparePendingfFrReqList(userID, allPendingFriendReqList, outgoingPendingList, true);
    } 
    if(incomingPendingList.length > 0){
      await comparePendingfFrReqList(userID, allIncomingPendingFriendReqListFromFB, incomingPendingList, false);
    }
    // saveFriendListEngagement([], userID, fbDtsg, "syncCompleted");
  } catch (error) {
    console.log("ERROR IN FETCHING PENDING REQUEST LIST", error)
    // saveFriendListEngagement([], userID, fbDtsg, "syncCompleted");
  } finally {
    saveFriendListEngagement([], userID, fbDtsg, "syncCompleted");
  }
}

/**
 * function fetch all outgoing pending friend request list from facebook
 * @param {*} fbDtsg 
 * @param {*} userID 
 * @param {String} cursor 
 */
const syncSendFriendRequestStatus = async (fbDtsg, userID, cursor = null) => {
  let outgoingPendingReqPayload = {
    av: userID,
    __user: userID,
    __a: 1,
    dpr: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    variables: JSON.stringify(cursor ? { "count": 10, "cursor": cursor, "scale": 1 } : { "scale": 1 }),
    server_timestamps: true,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: cursor ? "FriendingCometOutgoingRequestsDialogQuery" : "FriendingCometOutgoingRequestsDialogPaginationQuery",
    doc_id: cursor ? 4420916318007844 : 7114490868621087
  }
  const outgoingPendingRequestSerive = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": cursor ? "FriendingCometOutgoingRequestsDialogQuery" : "FriendingCometOutgoingRequestsDialogPaginationQuery",
      },
      body: helper.serialize(outgoingPendingReqPayload),
    });
  let outgoingPendingRequestDefinition = await outgoingPendingRequestSerive.text();
  outgoingPendingRequestDefinition = helper.makeParsable(outgoingPendingRequestDefinition);
  outgoingPendingRequestDefinition = outgoingPendingRequestDefinition &&
    outgoingPendingRequestDefinition.data &&
    outgoingPendingRequestDefinition.data.viewer &&
    outgoingPendingRequestDefinition.data.viewer.outgoing_friend_requests_connection &&
    outgoingPendingRequestDefinition.data.viewer.outgoing_friend_requests_connection.edges ?
    outgoingPendingRequestDefinition.data.viewer.outgoing_friend_requests_connection.edges : [];
  // console.log("outgoingPendingRequestDefinition :::: ", outgoingPendingRequestDefinition)
  if (outgoingPendingRequestDefinition.length > 0) {
    allPendingFriendReqList = [...allPendingFriendReqList, ...outgoingPendingRequestDefinition]
    const cursorId = outgoingPendingRequestDefinition[outgoingPendingRequestDefinition.length - 1].cursor;
    //console.log(cursorId)
    await helper.sleep(helper.getRandomInteger(1000, 10000));
    await syncSendFriendRequestStatus(fbDtsg, userID, cursorId)
  } else {
    // console.log("data got all going to compare", allOutgoingPendingFriendReqListFromDB)
    // comparePendingfFrReqList(userID, fbDtsg, allPendingFriendReqList, allOutgoingPendingFriendReqListFromDB)
  }
}

const comparePendingfFrReqList = async (userID, arrFromFb, arrFrmDb, isOutgoing) => {
  // console.log("finalFriendListWithMsg ::: ", finalFriendListWithMsg);
  // console.log("arrFromFb ::: ", arrFromFb);
  // console.log("arrFrmDb ::: ", arrFrmDb);
  return new Promise(async(resolve, reject) => {
    let currentFbPendingFRlist = [], allFrRejectList = [], allFrIDList = [];
    for (let item of arrFromFb) {
      if(isOutgoing){
        currentFbPendingFRlist = [...currentFbPendingFRlist, item.cursor];
      }else
        currentFbPendingFRlist = [...currentFbPendingFRlist, item.friendFbId];
    }
    // console.log("all ids from fb", currentFbPendingFRlist);
    const currentFbPendingFrSet = new Set(currentFbPendingFRlist);
    for (let item of finalFriendListWithMsg) {
      if (item.id) {
        allFrIDList = [...allFrIDList, item.id];
      }
    }
    const allFrIdSet = new Set(allFrIDList);
    for (let item of arrFrmDb) {
      if (!currentFbPendingFrSet.has(item.friendFbId) && !allFrIdSet.has(item.friendFbId)) {
        allFrRejectList = [...allFrRejectList, item._id];
      }
    }
    console.log("all rejexted list", allFrRejectList);
    if (allFrRejectList.length > 0) {
      try {
        let responseDelFr = await helper.deleteFRFromFriender(
          allFrRejectList,
          userID
        );
        console.log("REPONSE DELETING FR REQ", responseDelFr);
      } catch (error) {
        console.log("ERROR HAPPEND IN DELETE PENDINF FRIEND REQUEST", error);
      } finally {
        resolve(true)
        // saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "syncCompleted");
      }
    } else {
        resolve(true)
        // saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "syncCompleted");
    }
  })
}
 
const saveFriendListEngagement = async (
  data,
  userID,
  fbDtsg,
  action=null) => {
    let time = Date.now(),
    syncDate =
      (new Date().getMonth() + 1).toString() +
      "-" +
      new Date().getDate() +
      "-" +
      new Date().getFullYear(),
    syncId;
  const syncingDateNDTime = await helper.getDatafromStorage("syncingDateNDTime");

  if (syncingDateNDTime && syncingDateNDTime.syncDate) {
    if (syncingDateNDTime.syncDate === syncDate) {
      syncDate = syncingDateNDTime.syncDate;
      syncId = syncingDateNDTime.syncId;
    } else {
      // console.log("syncingDateNDTime 2::: ", syncingDateNDTime);
      syncDate = syncDate;
      syncId = "friender_" + time;
      await helper.saveDatainStorage("syncingDateNDTime", {
        syncDate: syncDate,
        syncId: syncId,
      });
    }
  } else {
    syncDate = syncDate;
    syncId = "friender_" + time;
    await helper.saveDatainStorage("syncingDateNDTime", {
      syncDate: syncDate,
      syncId: syncId,
    });
  }


    switch(action){
        case "triggerSyncMessage" :
          console.log("Send message is getting called here engagement scnanin done :::")
          chrome.runtime.sendMessage({
            action: "sendUpdate",
            isSyncing: "active",
            update: "Syncing Messages...",
          });
          getMessageEngagement(fbDtsg, userID, finalFriendList);
        break

        case "storeEngagementInDB" :
            
          let  friendsEngagementPayload = {
              "syncDate": syncDate,
              "syncingId": syncId,
              "facebookUserId": userID,
              "engagements_info": data,
              "action" : "saveEngagements"
            }
            // console.log("friendListPayload :::::::::::::::::: ", friendListPayload);
            let storeFriendsEngagement = await fetch(process.env.REACT_APP_STORE_FRIENDS_ENGAGEMENT, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "authorization": fr_token,
              },
              body: JSON.stringify(friendsEngagementPayload),
            });
        break

        case "syncPendingFrRequest":
          
          let  friendsMessagePayload = {
            "syncDate": syncDate,
            "syncingId": syncId,
            "facebookUserId": userID,
            "messages_info": data,
            "action" : "saveMessages"
          }
          // console.log("friendListPayload :::::::::::::::::: ", friendListPayload);
          let storeFriendsMessages = await fetch(process.env.REACT_APP_STORE_FRIENDS_ENGAGEMENT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "authorization": fr_token,
            },
            body: JSON.stringify(friendsMessagePayload),
          });

          console.error("Blocked the flow")
        
          chrome.runtime.sendMessage({
            action: "sendUpdate",
            isSyncing: "active",
            update: "Syncing Messages...",
          });
          initSyncSendFriendRequestStatus(fbDtsg, userID)
          break;

        case "syncCompleted":
          chrome.runtime.sendMessage({
            action: "sendMessageAcceptOrReject"
          });
          chrome.runtime.sendMessage({
            action: "sendUpdate",
            isSyncing: "active",
            update: "Sending Messages...",
            tabClose: true,
            friendlist: [],
          });
          break;
  
        default: break;


        } 
        
    }





const saveFriendList = async (
  finalFriendList,
  userID,
  fbDtsg,
  action,
  shouldISaveData = true
) => {
  let time = Date.now(),
    syncDate =
      (new Date().getMonth() + 1).toString() +
      "-" +
      new Date().getDate() +
      "-" +
      new Date().getFullYear(),
    syncId;
  const syncingDateNDTime = await helper.getDatafromStorage("syncingDateNDTime");

  if (syncingDateNDTime && syncingDateNDTime.syncDate) {
    if (syncingDateNDTime.syncDate === syncDate) {
      syncDate = syncingDateNDTime.syncDate;
      syncId = syncingDateNDTime.syncId;
    } else {
      // console.log("syncingDateNDTime 2::: ", syncingDateNDTime);
      syncDate = syncDate;
      syncId = "friender_" + time;
      await helper.saveDatainStorage("syncingDateNDTime", {
        syncDate: syncDate,
        syncId: syncId,
      });
    }
  } else {
    syncDate = syncDate;
    syncId = "friender_" + time;
    await helper.saveDatainStorage("syncingDateNDTime", {
      syncDate: syncDate,
      syncId: syncId,
    });
  }

  const friendlistData = finalFriendList.map((el) => {
    const eachFriendinfo = {
      "friendFbId": el.id,
      "friendProfileUrl": "https://www.facebook.com/profile.php?id=" + el.id,
      "friendMessageUrl": "https://www.facebook.com/messages/t/" + el.id,
      "friendName": el.name,
      "friendProfilePicture": el.profile_picture ? el.profile_picture.uri ? el.profile_picture.uri : "" : "",
      "friendShortName": el.short_name,
      "friendGender": el.gender ? el.gender : "N/A",
      "mutualFriend": el.social_context ? el.social_context.text.split(" mutual friends")[0] : "N/A",
      "friendStatus": el.id && el.id.length > 0 && !isNaN(Number(el.id)) ? "Activate" : "Deactivate",
      "finalSource": "Sync",

    }


    switch (action) {
      case "syncCompleted": // List with message count
        if(el.last_engagement_date){
          var resultFormat = el.last_engagement_date.toISOString().slice(0, 19).replace("T", " ");
          // console.log("resultFormat ::: ", resultFormat);
          if(resultFormat) 
            eachFriendinfo.last_engagement_date = resultFormat
        }  else {
          delete eachFriendinfo.last_engagement_date;
        }
        eachFriendinfo.commentThread = el.commentThread ? el.commentThread : 0;
        eachFriendinfo.reactionThread = el.reactionThread ? el.reactionThread : 0;
        eachFriendinfo.message_thread = el.message_thread ? el.message_thread : 0;
        break;
      case "messageEngagement": // List with comment and reactions
        if (shouldISaveData) {
          if(el.last_engagement_date && el.last_engagement_date.getFullYear() !== 1970) {
            resultFormat = el.last_engagement_date.toISOString().slice(0, 19).replace("T", " ");
            // console.log("resultFormat ::: ", resultFormat);
            if(resultFormat) 
              eachFriendinfo.last_engagement_date = resultFormat
          } else {
            delete eachFriendinfo.last_engagement_date;
          }
          eachFriendinfo.commentThread = el.commentThread ? el.commentThread : 0;
          eachFriendinfo.reactionThread = el.reactionThread ? el.reactionThread : 0;
        }
        break;
      default: break;
    }
    return eachFriendinfo;
  });
  // console.log("friendlistData ::: ", friendlistData)
  let getAllFriendSerive, friendListPayload;
  if (shouldISaveData) {
    friendListPayload = {
      "syncDate": syncDate,
      "syncingId": syncId,
      "facebookUserId": userID,
      "friend_details": friendlistData
    }
    // console.log("friendListPayload :::::::::::::::::: ", friendListPayload);
    getAllFriendSerive = await fetch(process.env.REACT_APP_SETTING_STORE_FRIEND_LIST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": fr_token,
      },
      body: JSON.stringify(friendListPayload),
    });
  }
  if (getAllFriendSerive || !shouldISaveData) {
    // console.log("Save fr list action= ", action)
    switch (action) {
      case "friendList":
        // console.log("finalFriendList ::: ", finalFriendList)
        chrome.runtime.sendMessage({
          action: "finalFriendList",
          friendListCount: friendlistData && friendlistData.length,
          content: friendlistData && friendlistData.length,
        });
        // getReactionComment(fbDtsg, userID, finalFriendList);

        // Reset scanned post to blank
        scannedPostIds = {};
        getEngagementsNew(fbDtsg, userID, finalFriendList);
        chrome.runtime.sendMessage({
          action: "sendUpdate",
          isSyncing: "active",
          update: "Syncing Engagements...",
          content: "Syncing Engagements..."
        });

        chrome.runtime.sendMessage({
          action: "updateCountryAndTier",
          friendList: finalFriendList,
          fbUserId: userID,
        });
        break;

      case "messageEngagement":
        chrome.runtime.sendMessage({
          action: "sendUpdate",
          isSyncing: "active",
          update: "Syncing Messages...",
        });
        getMessageEngagement(fbDtsg, userID, finalFriendList);
        break;
      case "syncPendingFrRequest":
        chrome.runtime.sendMessage({
          action: "sendUpdate",
          isSyncing: "active",
          update: "Syncing Messages...",
        });
        initSyncSendFriendRequestStatus(fbDtsg, userID)
        break;
      case "syncCompleted":
        chrome.runtime.sendMessage({
          action: "sendMessageAcceptOrReject"
        });
        chrome.runtime.sendMessage({
          action: "sendUpdate",
          isSyncing: "active",
          update: "Sending Messages...",
          tabClose: true,
          friendlist: friendListPayload.friend_details,
        });
        break;

      default: break;

    }
  }
}

/**
 * This method is deprecated as of 9-7-2023
 * 
 * @param {*} fbDtsg 
 * @param {*} userID 
 * @param {*} finalFriendListWithMsg 
 * @param {*} cursor 
 * @param {*} nextPage 
 * @param {*} amount 
 */
const getReactionComment = async (
  fbDtsg,
  userID,
  finalFriendListWithMsg,
  cursor = null,
  nextPage = true,
  amount = 500
) => {
  // console.log("countInterval ::: ", countInterval)
  if (countInterval)
    clearInterval(countInterval)
  let reactionCommentPayload;
  // console.log("nextPage ::: ", nextPage)
  // if (nextPage && nextPage === "default") {
  //   reactionCommentPayload = {
  //     fb_dtsg: fbDtsg,
  //     q: `node(${userID}){timeline_feed_units.first(500).after(){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id,name}},commenters{nodes{id,name}}}}}}}`,
  //   };
  // } else if(nextPage === true && nextPage != "default" ) {
    reactionCommentPayload = {
      fb_dtsg: fbDtsg,
      q: `node(${userID}){timeline_feed_units.first(${amount}).after(){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id,name}},commenters{nodes{id,name}}}}}}}`,
    };
  // }
  let getAllreactionComments = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
      },
      body: helper.serialize(reactionCommentPayload),
    }
  );
  let routeDefinationCR = await getAllreactionComments.text();
  let count = 0;
  if (routeDefinationCR.includes("Sorry, something went wrong.") || !nextPage) {
    if (commentREactionThread.length > 0) {
      commentREactionThread.forEach((element, i) => {
        getIndividualEngagements(element)
        count = i;
      });
    } else {
      saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "messageEngagement", false)
    }
  } else {
    routeDefinationCR = helper.makeParsable(routeDefinationCR);
    // console.log("routeDefinationCR :::: ", routeDefinationCR )
    if(routeDefinationCR && routeDefinationCR[userID] && routeDefinationCR[userID].timeline_feed_units){
      const end_cursor = routeDefinationCR[userID].timeline_feed_units.page_info.end_cursor;
      const nextPage = routeDefinationCR[userID].timeline_feed_units.page_info.has_next_page;
      routeDefinationCR = routeDefinationCR[userID].timeline_feed_units.edges;
 
        if (routeDefinationCR.length === amount) {
          commentREactionThread = routeDefinationCR;
          getReactionComment(fbDtsg, userID, finalFriendListWithMsg, end_cursor, nextPage, amount + 10);
        } else if (routeDefinationCR.length < amount) {
          commentREactionThread = routeDefinationCR;
          commentREactionThread.forEach((element, i) => {
            getIndividualEngagements(element)
            count = i;
          });
        }
    }else{
      if (commentREactionThread.length > 0) {
        commentREactionThread.forEach((element, i) => {
          getIndividualEngagements(element)
          count = i;
        });
      } else {
        saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "messageEngagement", false)
      }
    }
  }

  countInterval = setInterval(() => {
    // console.log("commentREactionThread len", commentREactionThread.length, count)
    if (commentREactionThread.length === count + 1) {

      clearInterval(countInterval);
      // console.log("Beak fast")
      const commentThread = commentReactionCount(commenters);
      const reactionThread = commentReactionCount(reactors)
      const PayloadWithReactionComment = getPayloadWithReactionComment(commentThread, reactionThread, finalFriendListWithMsg);
      // console.log("PayloadWithReactionComment ::: ", PayloadWithReactionComment)
      saveFriendList(PayloadWithReactionComment, userID, fbDtsg, "messageEngagement")
    }
  }, 1000);
}

/**
 * This method is deprecated as of 9-7-2-23
 * @param {*} arrayRactionComment 
 * @returns 
 */
const commentReactionCount = (arrayRactionComment) => {
  for (let i = 0; i < arrayRactionComment.length; ++i) {
    if (
      arrayRactionComment[i].isChecked === undefined ||
      arrayRactionComment[i].isChecked === false
    ) {
      arrayRactionComment[i].count = 1;
      for (let j = i + 1; j < arrayRactionComment.length; ++j) {
        if (arrayRactionComment[i].id === arrayRactionComment[j].id) {
          arrayRactionComment[i].count =
            { ...arrayRactionComment[i] }.count !== undefined
              ? { ...arrayRactionComment[i] }.count + 1
              : 2;
          let engagementDAte;
          if(arrayRactionComment){
            if(arrayRactionComment[i] && arrayRactionComment[j]){
              if(arrayRactionComment[i].engagementDAte && arrayRactionComment[j].engagementDAte){
                if(arrayRactionComment[i].engagementDAte[0] && arrayRactionComment[i].engagementDAte[0]){
                  if(arrayRactionComment[i].engagementDAte[0].setHours(0,0,0,0) === arrayRactionComment[j].engagementDAte[0].setHours(0,0,0,0)){
                    engagementDAte = arrayRactionComment[i].engagementDAte
                  }
                  else if(arrayRactionComment[i].engagementDAte[0].setHours(0,0,0,0) > arrayRactionComment[j].engagementDAte[0].setHours(0,0,0,0)){
                    engagementDAte = arrayRactionComment[i].engagementDAte
                  }
                  else{
                    engagementDAte = arrayRactionComment[j].engagementDAte
                  }
                }
                else if(arrayRactionComment[i].engagementDAte[0] && !arrayRactionComment[j].engagementDAte[0]){
                  engagementDAte = arrayRactionComment[i].engagementDAte
                }
                else if(!arrayRactionComment[i].engagementDAte[0] && arrayRactionComment[j].engagementDAte[0]){
                  engagementDAte = arrayRactionComment[j].engagementDAte
                }
                else{
                  engagementDAte = null
                }
              }
              else if(arrayRactionComment[i].engagementDAte && !arrayRactionComment[j].engagementDAte){
                if(arrayRactionComment[i].engagementDAte[0]){
                  engagementDAte = arrayRactionComment[i].engagementDAte
                }
                else{
                  engagementDAte = null
                }
              }
              else if(!arrayRactionComment[i].engagementDAte && arrayRactionComment[j].engagementDAte){
                if(arrayRactionComment[j].engagementDAte[0]){
                  engagementDAte = arrayRactionComment[j].engagementDAte
                }
                else{
                  engagementDAte = null
                }
              }
              else{
                engagementDAte = null
              }
            }
            else if(arrayRactionComment[i] && !arrayRactionComment[j]){
              if(arrayRactionComment[i].engagementDAte && arrayRactionComment[i].engagementDAte[0]){
                engagementDAte = arrayRactionComment[i].engagementDAte
              }
              else{
                engagementDAte = null
              }
            }
            else if(!arrayRactionComment[i] && arrayRactionComment[j]){
              if(arrayRactionComment[j].engagementDAte && arrayRactionComment[j].engagementDAte[0]){
                engagementDAte = arrayRactionComment[j].engagementDAte
              }
              else{
                engagementDAte = null
              }
            }
            else{
              engagementDAte = null
            }
          }else{
            engagementDAte = null
          }
          arrayRactionComment[i] = {...arrayRactionComment[i], engagementDAte : engagementDAte}
          arrayRactionComment[j].isChecked = true;
        } else {
          arrayRactionComment[i].count =
            { ...arrayRactionComment[i] }.count !== undefined
              ? { ...arrayRactionComment[i] }.count
              : 1;
          arrayRactionComment[j].isChecked = { ...arrayRactionComment[j] }
            .isChecked
            ? { ...arrayRactionComment[j] }.isChecked
            : false;
        }
      }
    }
  }
  return arrayRactionComment.filter(
    (el) => el.isChecked === undefined || el.isChecked === false
  );
};

/**
 * This method is deprecated as of 9-7-2023
 * @param {*} commentThread 
 * @param {*} reactionThread 
 * @param {*} finalFriendListWithMsg 
 * @returns 
 */
const getPayloadWithReactionComment = (
  commentThread,
  reactionThread,
  finalFriendListWithMsg
) => {
  const finalFriendLists = [...finalFriendListWithMsg];
  for (let indexI in finalFriendLists) {
    for (let indexJ in commentThread) {
      if (commentThread[indexJ].id === finalFriendLists[indexI].id) {
        if(finalFriendLists[indexI].last_engagement_date === undefined || finalFriendLists[indexI].last_engagement_date === null || 
          finalFriendLists[indexI].last_engagement_date === "N/A" || finalFriendLists[indexI].last_engagement_date == ""){
          finalFriendLists[indexI].last_engagement_date = commentThread[indexJ].engagementDAte[0] ? commentThread[indexJ].engagementDAte[0] : ""
        }
        else{
          finalFriendLists[indexI].last_engagement_date = commentThread[indexJ].engagementDAte[0] ? 
                                  commentThread[indexJ].engagementDAte[0].setHours(0, 0, 0, 0) > finalFriendLists[indexI].last_engagement_date.setHours(0, 0, 0, 0) ? 
                                    commentThread[indexJ].engagementDAte[0] : finalFriendLists[indexI].last_engagement_date
                                :
                                ""
        }

        finalFriendLists[indexI] = {
          ...finalFriendLists[indexI],
          commentThread: commentThread[indexJ].count,
        };
      } else {
        finalFriendLists[indexI] = {
          ...finalFriendLists[indexI],
          commentThread:
            { ...finalFriendLists[indexI] }.commentThread > 0
              ? { ...finalFriendLists[indexI] }.commentThread
              : 0,
        };
      }
    }
    for (let indexk in reactionThread) {
      
      if (reactionThread[indexk].id === finalFriendLists[indexI].id) {

        if(finalFriendLists[indexI].last_engagement_date === undefined || finalFriendLists[indexI].last_engagement_date === null || 
          finalFriendLists[indexI].last_engagement_date === "N/A" || finalFriendLists[indexI].last_engagement_date == ""){
          finalFriendLists[indexI].last_engagement_date = reactionThread[indexk].engagementDAte[0] ? 
                                                            reactionThread[indexk].engagementDAte[0] : 
                                                          "";
        }
        else{
          finalFriendLists[indexI].last_engagement_date = reactionThread[indexk].engagementDAte[0] ? 
                                                            reactionThread[indexk].engagementDAte[0].setHours(0, 0, 0, 0) > finalFriendLists[indexI].last_engagement_date.setHours(0, 0, 0, 0) ? 
                                                              reactionThread[indexk].engagementDAte[0] : finalFriendLists[indexI].last_engagement_date
                                                          :
                                                          ""
        }

        finalFriendLists[indexI] = {
          ...finalFriendLists[indexI],
          reactionThread: reactionThread[indexk].count,
        };
      } else {
        finalFriendLists[indexI] = {
          ...finalFriendLists[indexI],
          reactionThread:
            { ...finalFriendLists[indexI] }.reactionThread > 0
              ? { ...finalFriendLists[indexI] }.reactionThread
              : 0,
        };
      }
    }
    if (
      finalFriendLists[finalFriendLists.length - 1].id ===
      finalFriendLists[indexI].id
    ) {
      return finalFriendLists;
    }
  }
};

letsStart(async (fbDtsg, userID, friendLength) => {
  getAllfriend(fbDtsg, userID, Number(friendLength))
});

/**
 * This method is deprecated as of 9-7-2023
 * @param {*} element 
 */
const getIndividualEngagements = (element) => {
  const engagementTime = element.node.creation_time;
  var date = new Date(engagementTime*1000); 
  let resultFormat = date;
  let reactorsCommentorsArray = element.node.feedback;
  if(reactorsCommentorsArray){
    reactorsCommentorsArray = {...reactorsCommentorsArray,
      commenters : reactorsCommentorsArray.commenters.nodes.map((elem) => {
        return {...elem, engagementDAte : elem.engagementDAte ? [...elem.engagementDAte, resultFormat] : [resultFormat]}
      }),
      reactors : reactorsCommentorsArray.reactors.nodes.map((elem) => {
        return {...elem, engagementDAte : elem.engagementDAte ? [...elem.engagementDAte, resultFormat] : [resultFormat]}
      })
    }
  }
  commenters = commenters.concat(
    reactorsCommentorsArray
      ? reactorsCommentorsArray.commenters
        ? reactorsCommentorsArray.commenters
        : []
      : []
  );

  reactors = reactors.concat(
    reactorsCommentorsArray
      ? reactorsCommentorsArray.reactors
        ? reactorsCommentorsArray.reactors
        : []
      : []
  );
}


/************** This method is deprecated as of 11-07-2023  ****************/

/**
 * Get the reactions and comments stats
 * @param {*} callback 
 * @param {*} cursor 
 * @param {*} attempt 
 */
// const getEngagements = async (dtsg, userId, friendList, cursor = "", attempt = "", onErrorAttempt = 0) => {

//   console.log("Fetch timeline feed cursor=", cursor)

//   if (!cursor) cursor = "";
//   if (!attempt) attempt = 1;

//   let d = new Date();
//   d.setMonth(d.getMonth() - dayBackMonth);
//   let fromTime = d.getTime() / 1000; // ms to seconds

//   // Halt afer 25 attempt
//   if (attempt % 25 === 0) {
//       let halttime = .5

//       let resumeAt = new Date();
//       resumeAt.setMinutes(resumeAt.getMinutes() + halttime);
//       resumeAt = resumeAt.toLocaleString("en-GB", { "hourCycle": "h12", "timeStyle": "short" });

      
//       await helper.sleep(halttime * 60 * 1000);
//   }

//   console.log("Fetch time line feed #", attempt)

//   await helper.sleep(await helper.getRandomInteger(100, 700));

//   var data = new FormData();
  
//   var variables = {
//       "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
//       "count": 3,
//       "cursor": cursor,
//       "displayCommentsContextEnableComment": null,
//       "displayCommentsContextIsAdPreview": null,
//       "displayCommentsContextIsAggregatedShare": null,
//       "displayCommentsContextIsStorySet": null,
//       "displayCommentsFeedbackContext": null,
//       "feedLocation": "TIMELINE",
//       "feedbackSource": 0,
//       "focusCommentID": null,
//       "memorializedSplitTimeFilter": null,
//       "omitPinnedPost": true,
//       "postedBy": null,
//       "privacy": null,
//       "privacySelectorRenderLocation": "COMET_STREAM",
//       "renderLocation": "timeline",
//       "scale": 1,
//       "should_show_profile_pinned_post": true,
//       "stream_count": 1,
//       "taggedInOnly": null,
//       "useDefaultActor": false,
//       "id": userId
//   }
//   data.append('fb_dtsg', dtsg);
//   data.append("fb_api_caller_class", "RelayModern");
//   data.append("fb_api_req_friendly_name", "ProfileCometTimelineFeedRefetchQuery");
//   data.append("doc_id", "6628533110600769"); // 4775317502583547
//   data.append("__user", userId);
//   data.append("av", userId);
//   data.append("server_timestamps", true);
//   data.append("__comet_req", 1);
//   data.append("__a", 1);
//   data.append("__req", "2k");
//   data.append("dpr", 1);
//   data.append("__ccg:", "EXCELLENT");
//   data.append("server_timestamps", true);
//   data.append('variables', JSON.stringify(variables));

//   // console.log("Friends fetched prop", inactiveFriends.properties );
  
//   try {
//     let r = await helper.sendRequest(graphQL, 'POST', data);

//     try {
//       let respCheck = JSON.parse(r);

//       // If error found
//       if (respCheck.errors && onErrorAttempt < 3) {
//         console.error("POST Fetching error 1 =====")
//         onErrorAttempt++;
//         await helper.sleep( helper.getRandomInteger(60000, 120000)); // 30 to 60 secs
//         await getEngagements(dtsg, userId, friendList, cursor, attempt, onErrorAttempt);
//         return true;
//       } else if (respCheck.errors && onErrorAttempt > 3) {
//         saveFriendList(friendList, userId, dtsg, "messageEngagement")
//       }
//     } catch (e) {
//       // Nothing to do for now
//     }

//     let resp = r.split("\n").filter(Boolean).map((e=>JSON.parse(e)));

//     if (resp.errors) {
//       console.log("POST FETCHING Errors 2 ===========", resp.errors)
//     }

//     let feedbacks = [];
//     let pageInfo = {};

//     // Day back to limit to fetch post
//     let dayBackReached = false;
//     let feedbackId = null;
//     let consucetiveDuplicateCount = 0;

//     for (const item of resp) {
//       if (item.data && item.data.node) {
        
//         let creationTime = null;
//         let postId = null;
        
//         if (item.data.node.feedback) {
//           try {
//             creationTime = item.data.node.comet_sections.content.story.comet_sections.context_layout.story
//               .comet_sections.metadata[0].story.creation_time;
//           } catch (e) {
//             creationTime = null
//           }
//           feedbackId = item.data.node.feedback.id;
//           postId = item.data.node.post_id ? item.data.node.post_id : null;
          
//         }

//         if (item.data.node.timeline_list_feed_units && item.data.node.timeline_list_feed_units.edges) {
//           for (const edge of item.data.node.timeline_list_feed_units.edges) {
//             if (edge.node.feedback) {
//               try {
//                 creationTime = edge.node.comet_sections.content.story.comet_sections.context_layout.
//                 story.comet_sections.metadata[0].story.creation_time;
//               } catch (e) {
//                 creationTime = null;
//               }
//               feedbackId = edge.node.feedback.id;
//               postId = edge.node.post_id ? edge.node.post_id : null;
//             }
//           }
//         }
//         dayBackReached = !creationTime || creationTime > fromTime ? false : true;
        
//         if (postId && scannedPostIds[postId]) {
//           console.log("Duplicate - Already scanned post, continue  post id", postId);
//           ++consucetiveDuplicateCount;

//           // If 3 consecutive duplicate
//           if (consucetiveDuplicateCount >= 3) {
//             saveFriendList(friendList, userId, dtsg, "messageEngagement");
//             return;
//           }
//           continue;
//         } 
// // aa?
//         scannedPostIds[postId] = true;

//         if (!feedbackId) {
//           console.error("FeedbackId did not find, continue")
//           continue;
//         }

//         console.log("POST ID = ", postId)
//         console.log("Get comments for feedbackId=", feedbackId);
//         await getComments(dtsg, userId, friendList, feedbackId, "", creationTime);

//         console.log("Get reactions for feedbackId=", feedbackId);
//         await getReactions(dtsg, userId, friendList, feedbackId, "", creationTime);
        
//       }
//       if (item.data && item.data.page_info) {
//         pageInfo = item.data.page_info;
//       }
//     }

//     pageInfo = pageInfo ? pageInfo : false;
    
//     if ((!feedbackId || !pageInfo) && onErrorAttempt < 3) {
//       console.error("POST Fetching error 4 =====")
//       onErrorAttempt++;
//       await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
//       await getEngagements(dtsg, userId, friendList, cursor, attempt, onErrorAttempt);
//       return true;
//     } else if ((!feedbackId || !pageInfo) && onErrorAttempt < 3) {
//       saveFriendList(friendList, userId, dtsg, "messageEngagement")
//     }
    
//     if (dayBackReached) {
//       console.log("Day back limit reached, post is older than", fromTime)
//     }

//     if (pageInfo && pageInfo.has_next_page === true && !dayBackReached) {
//         attempt++;
//         chrome.runtime.sendMessage({
//           action: "sendUpdate",
//           isSyncing: "active",
//           update: "Syncing Engagements...",
//           content: "Syncing Engagements..."
//         });
//         await getEngagements(dtsg, userId, friendList, pageInfo.end_cursor, attempt);
//     } else {
//         console.log("No more post feed", pageInfo)
//         console.log("Call back from getEngagements", friendList);
//         saveFriendList(friendList, userId, dtsg, "messageEngagement")
//         return 0;
//     }

//     return true;
//   } catch (e) {
//     console.log(e);
//     console.log(e.message);
//     if (onErrorAttempt < 3) {
//       console.error("POST Fetching error 5 =====")
//       onErrorAttempt++;
//       await helper.sleep( helper.getRandomInteger(60000, 120000)); // 30 to 60 secs
//       await getEngagements(dtsg, userId, friendList, cursor, attempt, onErrorAttempt);
//     } else {
//       saveFriendList(friendList, userId, dtsg, "messageEngagement")
//     }
//   }
//   return true;
// }

/************** This method is deprecated as of 11-07-2023  ****************/
/**
 * Get comments of a post
 * 
 * @param {*} dtsg 
 * @param {*} userId 
 * @param {*} friendList 
 * @param {*} feedbackId 
 * @param {*} after 
 */
const getComments = async (dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt = 0) => {
  console.log("get comments");
  let variables = {
      "after": after,
      "reactionType": "NONE",
      "feedbackID": feedbackId,
      "scale": 1
  }
  let c = new FormData;
  c.append("fb_dtsg", dtsg);
  //c.append("fb_dtsg", "AQGr-8sbsS90u88: 2: 1626262944");
  c.append('__a', 1);
  c.append('__user', userId);
  c.append('av', userId);
  c.append('server_timestamps', true);
  c.append('fb_api_caller_class', "RelayModern");
  c.append('variables', JSON.stringify(variables));
  c.append('av', userId);
  c.append('doc_id', "4744443285570051");

  await helper.sleep(helper.getRandomInteger(200, 500));
  let e = null;


  await fetch("https://www.facebook.com/api/graphql/", { body: c, headers: { accept: "application/json, text/plain, */*" }, method: "POST" })
  .then(function (d) { return d.text() })
  .then(async function (d) {
      try {
          e = d;
          d = JSON.parse(e);

          // Error handling
          if (d.erros && onErrorAttempt < 3) {
            console.error("Comment Fetching error 1 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getComments(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
            return true;
          }

          d && d.data && d.data.feedback && d.data.feedback.display_comments.edges.forEach(function (h) {
             friendList.map( (friend) => {
                if (h.node.author.id === friend.id) {
                  if (!friend.commentThread) friend.commentThread = 0;
                  friend.commentThread++;
                  // Last engagement date update
                  let commentCreatedTime = new Date(h.node.created_time * 1000);
                  if (!friend.last_engagement_date) {
                    friend.last_engagement_date = commentCreatedTime;
                  } else {
                    let oldDate = new Date(friend.last_engagement_date)
                    friend.last_engagement_date = (commentCreatedTime > oldDate) ? commentCreatedTime : oldDate;
                  }
                  // console.log("ENG comment found", friend)
                }
             })
          });
          let k = 0;
          d = d.data.feedback.display_comments.page_info;
          k = d.has_next_page;
          after = d.end_cursor;

          // console.log("LOG ########################### 5")

          console.log("More comments page? ", k)
          if (k) {
              console.log("Recall get comments")
              await getComments(dtsg, userId, friendList, feedbackId, after, postCreationTime)
          }
          return true;
      } catch (e) {
          console.error("Error in get comment", e)
          if (onErrorAttempt < 3) {
            console.error("Comment Fetching error 2 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getComments(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
          }
      }
  })["catch"]( async function (d) {
    if (onErrorAttempt < 3) {
      console.error("Comments Fetching error 3 =====")
      onErrorAttempt++;
      await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
      await getComments(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
      return true;
    }

  })
  return true;
}

/************** This method is deprecated as of 11-07-2023  ****************/
/**
 * Get reactions of a post
 * 
 * @param {*} dtsg 
 * @param {*} userId 
 * @param {*} friendList 
 * @param {*} feedbackId 
 * @param {*} after 
 */
const getReactions = async  (dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt = 0) => {
  console.log("get reactions");

  let variables = {
      // "after": after,
      "reactionType": "NONE",
      "feedbackTargetID": feedbackId,
      "scale": 1,
      // "cursor": ""
  }
  if (after) variables.cursor = after;

  let c = new FormData;
  c.append("fb_dtsg", dtsg);
  c.append('__a', 1);
  c.append('__user', userId);
  c.append('fb_api_caller_class', "RelayModern");
  c.append('variables', JSON.stringify(variables));
  c.append('av', userId);
  c.append('doc_id', "3783547041750558");
  let e = null;

  console.time("SLEEP")
  await helper.sleep(helper.getRandomInteger(100, 500));
  console.timeEnd("SLEEP");

  await fetch("https://www.facebook.com/api/graphql/", { body: c, headers: { accept: "application/json, text/plain, */*" }, method: "POST" }).then(async function (d) { return d.text() }).then(async function (d) {
      try {
          e = d;
          d = JSON.parse(e);

          // Error handling
          if (d.erros && onErrorAttempt < 3) {
            console.error("Reaction Fetching error 1 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getReactions(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
            return true
          }

          d && d.data && d.data.node && d.data.node.reactors.edges.forEach(function (h) {
            friendList.map( (friend) => {
              if (h.node.id === friend.id) {
                if (!friend.reactionThread) friend.reactionThread = 0;

                friend.reactionThread++;
                // console.log("ENG reaction found", friend)

                // Last engagement date update
                if (postCreationTime) {
                  let postCreatedTime = new Date(parseInt( postCreationTime * 1000))
                  if (!friend.last_engagement_date) {
                    friend.last_engagement_date = postCreatedTime;
                  } else {
                    let oldDate = new Date(friend.last_engagement_date)
                    friend.last_engagement_date = (postCreatedTime > oldDate) ? postCreatedTime : oldDate;
                  }
                  // console.log("Reaction time ", postCreatedTime, friend.last_engagement_date)
                }
              }
           })

          });

          let np = 0;
          d = d.data.node.reactors.page_info;
          np = d.has_next_page;
          let cursor = d.end_cursor;
          if (np && cursor != after) {
              console.log("Recall get reactions")
              await getReactions(dtsg, userId, friendList, feedbackId, cursor, postCreationTime)
          } else {
              console.log("End of get reaction");
              return 0;
          }
          return true
      } catch (e) {
          console.log("Error in get reaction", e)
          if (onErrorAttempt < 3) {
            console.error("Reaction Fetching error 2 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getReactions(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
            return true
          }
      }
  })["catch"]( async function (d) {
      console.log(d)
      if (onErrorAttempt < 3) {
        console.error("Reactions Fetching error 3 =====")
        onErrorAttempt++;
        await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
        await getReactions(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
        return true
      }
      return 0;
  })

}








/************** Latest way to get engagements with backend processing  ****************/

/**
 * Get the reactions and comments stats
 * @param {*} callback 
 * @param {*} cursor 
 * @param {*} attempt 
 */
const getEngagementsNew = async (dtsg, userId, friendList, cursor = "", attempt = "", onErrorAttempt = 0) => {

  // console.log("Fetch timeline feed cursor=", cursor)

  if (!cursor) cursor = "";
  if (!attempt) attempt = 1;

  let d = new Date();
  d.setMonth(d.getMonth() - dayBackMonth);
  let fromTime = d.getTime() / 1000; // ms to seconds

  // Halt afer 25 attempt
  if (attempt % 25 === 0) {
      let halttime = .5

      let resumeAt = new Date();
      resumeAt.setMinutes(resumeAt.getMinutes() + halttime);
      resumeAt = resumeAt.toLocaleString("en-GB", { "hourCycle": "h12", "timeStyle": "short" });

      
      await helper.sleep(halttime * 60 * 1000);
  }

  console.log("Fetch time line feed #", attempt)

  await helper.sleep(await helper.getRandomInteger(100, 700));

  var data = new FormData();
  
  var variables = {
      "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
      "count": 3,
      "cursor": cursor,
      "displayCommentsContextEnableComment": null,
      "displayCommentsContextIsAdPreview": null,
      "displayCommentsContextIsAggregatedShare": null,
      "displayCommentsContextIsStorySet": null,
      "displayCommentsFeedbackContext": null,
      "feedLocation": "TIMELINE",
      "feedbackSource": 0,
      "focusCommentID": null,
      "memorializedSplitTimeFilter": null,
      "omitPinnedPost": true,
      "postedBy": null,
      "privacy": null,
      "privacySelectorRenderLocation": "COMET_STREAM",
      "renderLocation": "timeline",
      "scale": 1,
      "should_show_profile_pinned_post": true,
      "stream_count": 1,
      "taggedInOnly": null,
      "useDefaultActor": false,
      "id": userId
  }
  data.append('fb_dtsg', dtsg);
  data.append("fb_api_caller_class", "RelayModern");
  data.append("fb_api_req_friendly_name", "ProfileCometTimelineFeedRefetchQuery");
  data.append("doc_id", "6628533110600769"); // 4775317502583547
  data.append("__user", userId);
  data.append("av", userId);
  data.append("server_timestamps", true);
  data.append("__comet_req", 1);
  data.append("__a", 1);
  data.append("__req", "2k");
  data.append("dpr", 1);
  data.append("__ccg:", "EXCELLENT");
  data.append("server_timestamps", true);
  data.append('variables', JSON.stringify(variables));

  // console.log("Friends fetched prop", inactiveFriends.properties );
  
  try {
    let r = await helper.sendRequest(graphQL, 'POST', data);

    try {
      let respCheck = JSON.parse(r);

      // If error found
      if (respCheck.errors && onErrorAttempt < 3) {
        console.error("POST Fetching error 1 =====")
        onErrorAttempt++;
        await helper.sleep( helper.getRandomInteger(60000, 120000)); // 30 to 60 secs
        await getEngagementsNew(dtsg, userId, friendList, cursor, attempt, onErrorAttempt);
        return true;
      } else if (respCheck.errors && onErrorAttempt > 3) {
        saveFriendListEngagement(allPostEngagementInfo,userId,dtsg,"triggerSyncMessage")
      }
    } catch (e) {
      // Nothing to do for now
    }

    let resp = r.split("\n").filter(Boolean).map((e=>JSON.parse(e)));

    if (resp.errors) {
      console.log("POST FETCHING Errors 2 ===========", resp.errors)
    }

    let feedbacks = [];
    let pageInfo = {};

    // Day back to limit to fetch post
    let dayBackReached = false;
    let feedbackId = null;
    let consucetiveDuplicateCount = 0;

    // Final payload to backend : 

    /**
     * [{
     *    postId : "fb post id",
     *    postCreationTime : "",
     *    commentators : [
     *        {
     *          facebookId : fbId,
     *          commentedTime : "",
     *          commentText : ""
     *      }
     *    ],
     *    reactors : [
     *      {
     *        facebookId : fbId,
     *        reactionTime : ""
     *        reactionType : "" 
     *      }
     *    ]
     * }]
     */

    let allPostEngagementInfo = []

    for (const item of resp) {
      let postEngagementInfo = {
         postId : null,
         author : null,
         postText : null,
         postUrl : null,
         creationTime : null,
         comments : [],
         reactions : []
      }

      if (item.data && item.data.node) {
        
        let creationTime = null;
        let postId = null;
        let author = null
        let postText = null
        let postUrl = null

        if (item.data.node.feedback) {
          console.log("POST info",JSON.stringify(item.data.node))
          try {
            creationTime = item.data.node.comet_sections.content.story.comet_sections.context_layout.story
              .comet_sections.metadata[0].story.creation_time;
            author = item.data.node.comet_sections.content.story.actors[0].id
            postText = item.data.node.comet_sections.content.story.comet_sections.message.story.message.text
            postUrl =  item.data.node.comet_sections.content.story.wwwURL
          } catch (e) {
            creationTime = null
          }
          feedbackId = item.data.node.feedback.id;
          postId = item.data.node.post_id ? item.data.node.post_id : null;
          
        }

        if (item.data.node.timeline_list_feed_units && item.data.node.timeline_list_feed_units.edges) {
          for (const edge of item.data.node.timeline_list_feed_units.edges) {
            if (edge.node.feedback) {
              try {
                creationTime = edge.node.comet_sections.content.story.comet_sections.context_layout.
                story.comet_sections.metadata[0].story.creation_time;

                author = edge.node.comet_sections.content.story.actors[0].id
                postText = edge.node.comet_sections.content.story.comet_sections.message.story.message.text
                postUrl =  edge.node.comet_sections.content.story.wwwURL

              } catch (e) {
                creationTime = null;
              }
              feedbackId = edge.node.feedback.id;
              postId = edge.node.post_id ? edge.node.post_id : null;

            }
          }
        }
        dayBackReached = !creationTime || creationTime > fromTime ? false : true;
        
        if (postId && scannedPostIds[postId]) {
          console.log("Duplicate - Already scanned post, continue  post id", postId);
          ++consucetiveDuplicateCount;

          // If 3 consecutive duplicate
          if (consucetiveDuplicateCount >= 3) {
            saveFriendListEngagement(allPostEngagementInfo,userId,dtsg,"triggerSyncMessage")
            return;
          }
          continue;
        } 
// aa?
        scannedPostIds[postId] = true;

        if (!feedbackId) {
          console.error("FeedbackId did not find, continue")
          continue;
        }

        console.log("POST ID = ", postId)
        console.log("Get comments for feedbackId=", feedbackId);
        
        postEngagementInfo.postId = postId
        postEngagementInfo.creationTime = creationTime
        postEngagementInfo.author = author
        postEngagementInfo.postText = postText
        postEngagementInfo.postUrl = postUrl

        await getCommentsNew(dtsg, userId, friendList, feedbackId, "", creationTime,0,postEngagementInfo);

        console.log("Get reactions for feedbackId=", feedbackId);
        await getReactionsNew(dtsg, userId, friendList, feedbackId, "", creationTime,0,postEngagementInfo);

        
        allPostEngagementInfo.push(postEngagementInfo)
      }
      if (item.data && item.data.page_info) {
        pageInfo = item.data.page_info;
      }
    }

    // Save in DB after fetching 3 posts and their engagement: 
    console.log("3 POSTS PAYLOAD **STORE IN DB**",JSON.stringify(allPostEngagementInfo))
    if(allPostEngagementInfo.length > 0) {
    saveFriendListEngagement(allPostEngagementInfo,userId,dtsg,"storeEngagementInDB")
    }

    pageInfo = pageInfo ? pageInfo : false;
    
    if ((!feedbackId || !pageInfo) && onErrorAttempt < 3) {
      console.error("POST Fetching error 4 =====")
      onErrorAttempt++;
      await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
      await getEngagementsNew(dtsg, userId, friendList, cursor, attempt, onErrorAttempt);
      return true;
    } else if ((!feedbackId || !pageInfo) && onErrorAttempt < 3) {
      saveFriendListEngagement(allPostEngagementInfo,userId,dtsg,"triggerSyncMessage")
    }
    
    if (dayBackReached) {
      console.log("Day back limit reached, post is older than", JSON.stringify(fromTime))
    }

    if (pageInfo && pageInfo.has_next_page === true && !dayBackReached) {
        attempt++;
        chrome.runtime.sendMessage({
          action: "sendUpdate",
          isSyncing: "active",
          update: "Syncing Engagements...",
          content: "Syncing Engagements..."
        });
        await getEngagementsNew(dtsg, userId, friendList, pageInfo.end_cursor, attempt);
    } else {
        console.log("No more post feed", JSON.stringify(pageInfo))
        // console.log("Call back from getEngagements", friendList);
        saveFriendListEngagement(allPostEngagementInfo,userId,dtsg,"triggerSyncMessage")
        return 0;
    }

    return true;
  } catch (e) {
    console.error(e);
    console.error(e.message);
    if (onErrorAttempt < 3) {
      console.error("POST Fetching error 5 =====")
      onErrorAttempt++;
      await helper.sleep( helper.getRandomInteger(60000, 120000)); // 30 to 60 secs
      await getEngagementsNew(dtsg, userId, friendList, cursor, attempt, onErrorAttempt);
    } else {
      // saveFriendList(friendList, userId, dtsg, "messageEngagement")
      saveFriendListEngagement([],userId,dtsg,"triggerSyncMessage")
    }
  }
  return true;
}

/**
 * Get comments of a post
 * 
 * @param {*} dtsg 
 * @param {*} userId 
 * @param {*} friendList 
 * @param {*} feedbackId 
 * @param {*} after 
 */
const getCommentsNew = async (dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt = 0,postEngagementInfo) => {
  console.log("get comments");
  let variables = {
      "after": after,
      "reactionType": "NONE",
      "feedbackID": feedbackId,
      "scale": 1
  }
  let c = new FormData;
  c.append("fb_dtsg", dtsg);
  //c.append("fb_dtsg", "AQGr-8sbsS90u88: 2: 1626262944");
  c.append('__a', 1);
  c.append('__user', userId);
  c.append('av', userId);
  c.append('server_timestamps', true);
  c.append('fb_api_caller_class', "RelayModern");
  c.append('variables', JSON.stringify(variables));
  c.append('av', userId);
  c.append('doc_id', "4744443285570051");

  await helper.sleep(helper.getRandomInteger(200, 500));
  let e = null;


  await fetch("https://www.facebook.com/api/graphql/", { body: c, headers: { accept: "application/json, text/plain, */*" }, method: "POST" })
  .then(function (d) { return d.text() })
  .then(async function (d) {
      try {
          e = d;
          d = JSON.parse(e);

          // Error handling
          if (d.erros && onErrorAttempt < 3) {
            console.error("Comment Fetching error 1 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getCommentsNew(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt,postEngagementInfo);
            return true;
          }
          // postEngagementInfo.commentators.push(...d && d.data && d.data.feedback && d.data.feedback.display_comments.edges)
          d && d.data && d.data.feedback && d.data.feedback.display_comments.edges.forEach(function (h) {

             postEngagementInfo.comments.push({
               friend_fb_id : h.node.author.id,
               comment_text : h!=undefined && h.node!=undefined && h.node.body!= undefined? h.node.body.text:"",
               created_time : h.node.created_time,
               exact_comment_link : h.node.url
             })

            //  friendList.map( (friend) => {
            //     if (h.node.author.id === friend.id) {
            //       if (!friend.commentThread) friend.commentThread = 0;
            //       friend.commentThread++;
            //       // Last engagement date update
            //       let commentCreatedTime = new Date(h.node.created_time * 1000);
            //       if (!friend.last_engagement_date) {
            //         friend.last_engagement_date = commentCreatedTime;
            //       } else {
            //         let oldDate = new Date(friend.last_engagement_date)
            //         friend.last_engagement_date = (commentCreatedTime > oldDate) ? commentCreatedTime : oldDate;
            //       }
            //       // console.log("ENG comment found", friend)
            //     }
            //  })
          });
          let k = 0;
          d = d.data.feedback.display_comments.page_info;
          k = d.has_next_page;
          after = d.end_cursor;

          // console.log("LOG ########################### 5")

          console.log("More comments page? ", k)
          if (k) {
              console.log("Recall get comments")
              await getCommentsNew(dtsg, userId, friendList, feedbackId, after, postCreationTime,onErrorAttempt,postEngagementInfo)
          }

          return true;
      } catch (e) {
          console.error("Error in get comment", e)
          if (onErrorAttempt < 3) {
            console.error("Comment Fetching error 2 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getCommentsNew(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt,postEngagementInfo);
          }
      }
  })["catch"]( async function (d) {
    if (onErrorAttempt < 3) {
      console.error("Comments Fetching error 3 =====")
      onErrorAttempt++;
      await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
      await getCommentsNew(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt,postEngagementInfo);
      return true;
    }

  })
  return true;
}

/**
 * Get reactions of a post
 * 
 * @param {*} dtsg 
 * @param {*} userId 
 * @param {*} friendList 
 * @param {*} feedbackId 
 * @param {*} after 
 */
const getReactionsNew = async  (dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt = 0,postEngagementInfo) => {
  console.log("get reactions");

  let variables = {
      // "after": after,
      "reactionType": "NONE",
      "feedbackTargetID": feedbackId,
      "scale": 1,
      // "cursor": ""
  }
  if (after) variables.cursor = after;

  let c = new FormData;
  c.append("fb_dtsg", dtsg);
  c.append('__a', 1);
  c.append('__user', userId);
  c.append('fb_api_caller_class', "RelayModern");
  c.append('variables', JSON.stringify(variables));
  c.append('av', userId);
  c.append('doc_id', "3783547041750558");
  let e = null;

  console.time("SLEEP")
  await helper.sleep(helper.getRandomInteger(100, 500));
  console.timeEnd("SLEEP");

  await fetch("https://www.facebook.com/api/graphql/", { body: c, headers: { accept: "application/json, text/plain, */*" }, method: "POST" }).then(async function (d) { return d.text() }).then(async function (d) {
      try {
          e = d;
          d = JSON.parse(e);

          // Error handling
          if (d.erros && onErrorAttempt < 3) {
            console.error("Reaction Fetching error 1 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getReactions(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt);
            return true
          }
          
          // postEngagementInfo.reactors.push(...d && d.data && d.data.node && d.data.node.reactors.edges)
          d && d.data && d.data.node && d.data.node.reactors.edges.forEach(function (h) {
          postEngagementInfo.reactions.push({
              friend_fb_id : h.node.id,
              reaction_type : "",
              creation_time : postCreationTime
          })
            
            
          //   friendList.map( (friend) => {
          //     if (h.node.id === friend.id) {
          //       if (!friend.reactionThread) friend.reactionThread = 0;

          //       friend.reactionThread++;
          //       // console.log("ENG reaction found", friend)

          //       // Last engagement date update
          //       if (postCreationTime) {
          //         let postCreatedTime = new Date(parseInt( postCreationTime * 1000))
          //         if (!friend.last_engagement_date) {
          //           friend.last_engagement_date = postCreatedTime;
          //         } else {
          //           let oldDate = new Date(friend.last_engagement_date)
          //           friend.last_engagement_date = (postCreatedTime > oldDate) ? postCreatedTime : oldDate;
          //         }
          //         // console.log("Reaction time ", postCreatedTime, friend.last_engagement_date)
          //       }
          //     }
          //  })

          });

          let np = 0;
          d = d.data.node.reactors.page_info;
          np = d.has_next_page;
          let cursor = d.end_cursor;
          if (np && cursor != after) {
              console.log("Recall get reactions")
              await getReactionsNew(dtsg, userId, friendList, feedbackId, cursor, postCreationTime,onErrorAttempt,postEngagementInfo)
          } else {
              console.log("End of get reaction");
              return 0;
          }
          return true
      } catch (e) {
          console.log("Error in get reaction", e)
          if (onErrorAttempt < 3) {
            console.error("Reaction Fetching error 2 =====")
            onErrorAttempt++;
            await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
            await getReactionsNew(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt,postEngagementInfo);
            return true
          }
      }
  })["catch"]( async function (d) {
      console.log(d)
      if (onErrorAttempt < 3) {
        console.error("Reactions Fetching error 3 =====")
        onErrorAttempt++;
        await helper.sleep( helper.getRandomInteger(30000, 60000)); // 30 to 60 secs
        await getReactionsNew(dtsg, userId, friendList, feedbackId, after, postCreationTime, onErrorAttempt,postEngagementInfo);
        return true
      }
      return 0;
  })

}