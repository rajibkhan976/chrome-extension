import helper from "./helper";
let finalFriendList = [], countInterval;
let finalFriendListWithMsg = [], commentREactionThread = [];
let dayBackCount = 7;
let allPendingFriendReqList = [], commenters = [], reactors = [];
let allPendingFriendReqListFromDB = []
let dayBack = new Date(Date.now() - dayBackCount * 24 * 60 * 60 * 1000);
dayBack.setHours(0);
dayBack.setHours(0);

// Overlay
let overlay = `<div className="overlay-wraper" style="width: 100%;height: 100vh;position: absolute;top:0;left:0;background: rgb(9 124 207 / 64%);pointer-events: none;">
<p style=" position: absolute; left: 50%;top: 50%;transform: translate(-50%, -50%);color: #fff;font-weight: 700;font-size: 35px; text-align: center;">Friender is using this page.<br/> Please don't reload.</p>
</div>`;

chrome.runtime.sendMessage({ action: "msgFormExt", content: "hello" });

let fbBody = document.getElementsByTagName("body")[0];
fbBody.innerHTML += overlay;
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
    msgEngRes = msgEngRes && msgEngRes.o0.data.message_thread;
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
    saveFriendList(
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
    console.log("pendingList :::: ", pendingList)
    if (pendingList.length > 0) {
      allPendingFriendReqListFromDB = pendingList;
      syncSendFriendRequestStatus(fbDtsg, userID, null);
    } else {
      saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "syncCompleted");
    }
  } catch (error) {
    console.log("ERROR IN FETCHING PENDING REQUEST LIST", error)
    saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "syncCompleted");
  }
}

/**
 * function fetch all pending friend request list from facebook
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
    syncSendFriendRequestStatus(fbDtsg, userID, cursorId)
  } else {
    // console.log("data got all going to compare", allPendingFriendReqListFromDB)
    comparePendingfFrReqList(userID, fbDtsg, allPendingFriendReqList, allPendingFriendReqListFromDB)
  }
}

/**
 * function to check the for DB are in Facebook request list or not if not then send then for soft delete
 * @param {*} userID 
 * @param {*} fbDtsg 
 * @param {Array} arrFromFb 
 * @param {Array} arrFrmDb 
 */
const comparePendingfFrReqList = async (userID, fbDtsg, arrFromFb, arrFrmDb) => {
  // console.log("all data from fb", arrFromFb);
  // console.log("all adata from db", arrFrmDb);
  let currentFbPendingFRlist = [];
  for (let item of arrFromFb) {
    currentFbPendingFRlist = [...currentFbPendingFRlist, item.cursor];
  }
  // console.log("all ids from fb", currentFbPendingFRlist);
  const currentFbPendingFrSet = new Set(currentFbPendingFRlist);
  let allFrIDList = [];
  for (let item of finalFriendListWithMsg) {
    if (item.id) {
      allFrIDList = [...allFrIDList, item.id];
    }
  }
  let allFrIdSet = new Set(allFrIDList);
  let allFrRejectList = [];
  for (let item of arrFrmDb) {
    if (!currentFbPendingFrSet.has(item.friendFbId) && !allFrIdSet.has(item.friendFbId)) {
      allFrRejectList = [...allFrRejectList, item._id];
    }
  }
  //  console.log("all rejexted list", allFrRejectList);
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
      saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "syncCompleted");
    }
  } else {
    saveFriendList(finalFriendListWithMsg, userID, fbDtsg, "syncCompleted");
  }


};

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
        }
        eachFriendinfo.commentThread = el.commentThread ? el.commentThread : 0;
        eachFriendinfo.reactionThread = el.reactionThread ? el.reactionThread : 0;
        eachFriendinfo.message_thread = el.message_thread ? el.message_thread : 0;
        break;
      case "messageEngagement": // List with comment and reactions
        if (shouldISaveData) {
          if(el.last_engagement_date){
            resultFormat = el.last_engagement_date.toISOString().slice(0, 19).replace("T", " ");
            console.log("resultFormat ::: ", resultFormat);
            if(resultFormat) 
              eachFriendinfo.last_engagement_date = resultFormat
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
        getReactionComment(fbDtsg, userID, finalFriendList);
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
          action: "sendUpdate",
          isSyncing: "",
          update: "Done",
          friendlist: friendListPayload.friend_details,
        });
        break;

      default: break;

    }
  }
}

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
  console.log("nextPage ::: ", nextPage)
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
      console.log("Beak fast")
      const commentThread = commentReactionCount(commenters);
      const reactionThread = commentReactionCount(reactors)
      const PayloadWithReactionComment = getPayloadWithReactionComment(commentThread, reactionThread, finalFriendListWithMsg);
      // console.log("PayloadWithReactionComment ::: ", PayloadWithReactionComment)
      saveFriendList(PayloadWithReactionComment, userID, fbDtsg, "messageEngagement")
    }
  }, 1000);
}


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