
import selectors from "./selector";
import helper from "./helper";
import common from "./commonScript";
import { settingsType } from "../config/config"
const $ = require("jquery");

let groupSettings = {};
let profileMysettings={}
let countMember = 0,
  profile_viewed = 0,
  timeSaved = 0,
  skipCounter = 0,
  previous_memberId = "",
  shoudIstop = false,
  groupName = "",
  memberBlockForPause,
  timeOut,
  msgPayload,
 // requestInfo,
  friendProfilePicture,
  fr_token;

  
  const groupNameInterval = setInterval(() => {
    const groupNameDiv = document.querySelector(selectors.main_component).querySelector(selectors.group_name)
    // console.log("groupNameDiv ::: ", groupNameDiv);
    if(groupNameDiv !== null){
      clearInterval(groupNameInterval)
      groupName = groupNameDiv.textContent;
      // console.log("group name ::: ", groupName);
    }
  },500)

  const sendFriendrequest=(request)=>{
    groupSettings = request.dataPayload.friendReqSettings;
    // console.log("groupSettings :::>>> ", groupSettings);
    profileMysettings=request.dataPayload.profileSettings;
    //  console.log("profile settingss::::>>",profileMysettings);
    if (groupSettings.resume_last_search) {
      const startedViewedMember = document.querySelector(selectors.start_checking);
      if (startedViewedMember) {
        const startCountBadge = startedViewedMember.getElementsByClassName("count-badge");
        if (startCountBadge.length > 0) {
          startCountBadge[0].remove();
        }
      }

      const alreadyViewedMember = document.querySelectorAll(selectors.viewed_group_member_div);
      if (alreadyViewedMember.length > 0) {
        for (let i = 0; i < alreadyViewedMember.length; i++) {
          const countBadge = alreadyViewedMember[i].getElementsByClassName("count-badge");
          if (countBadge.length) {
            countBadge[0].remove();
          }
          alreadyViewedMember[i].removeAttribute("sentfr")
        }
      }
    }
    startSearchingEligibleGroupMembers();
  }

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // console.log("group ext req", request)
  switch (request.action) {
    case "reSendFriendRequestInGroup":
      skipCounter = 0;
      shoudIstop = false;
      sendFriendrequest(request)
      break;
    case "sendFriendRequestInGroup":
      sendFriendrequest(request)
      break;
    case "stop":
      shoudIstop = true;
      await helper.saveDatainStorage("updated_Profile_data", { "profile_viewed": profile_viewed, "friend_request_send": countMember, "time_saved": timeSaved })
      fr_token = await helper.getDatafromStorage("fr_token");
      await common.UpdateSettingsAfterFR(fr_token, { "settingsId" : groupSettings.settingsId, "profile_viewed": profile_viewed, "friend_request_send": countMember, "time_saved": timeSaved, is_settings_stop: true });
      window.location.reload();
      break;

    case "pause":
      shoudIstop = true;
      let runningSettings = await helper.getDatafromStorage(
        "curr_reqSettings"
      );
      runningSettings = JSON.parse(runningSettings)
      runningSettings = {...runningSettings, resume_last_search_position : skipCounter}
      chrome.runtime.sendMessage({"action" :  "curr_reqSettings", "curr_reqSettings" : JSON.stringify(runningSettings)})
      await helper.saveDatainStorage("curr_reqSettings", JSON.stringify(runningSettings));
      await helper.saveDatainStorage("updated_Profile_data", { "profile_viewed": profile_viewed, "friend_request_send": countMember, "time_saved": timeSaved })
      // console.log("runningSettings ::: ", runningSettings);
      fr_token = await helper.getDatafromStorage("fr_token");
      await common.UpdateSettingsAfterFR(fr_token, { "settingsId" : groupSettings.settingsId, "profile_viewed": profile_viewed, "friend_request_send": countMember, "time_saved": timeSaved, "resume_last_search_position": skipCounter, is_settings_stop : false });
      clearTimeout(timeOut)
      if (memberBlockForPause.classList.contains("fr-list-loader"))
        memberBlockForPause.classList.remove("fr-list-loader")
      break;

    case "getGenderCountryAndTier":
      fetchOtherInfosOfMember(msgPayload.groupMemberInfo,
        msgPayload.memberBlock,
        msgPayload.eachMemberBlock,
        msgPayload.fbDtsg,
        msgPayload.userID,
        msgPayload.groupId,
        request.responsePayload)
      break;

    default: break;
  }
});

const startSearchingEligibleGroupMembers = (iscontinuing = false) => {
  if (shoudIstop) return;
  const eachMemberInterval = setInterval(() => {
    const eachMemberBlock = document.querySelectorAll(selectors.group_member_div);
    if (eachMemberBlock.length > 0) {
      clearInterval(eachMemberInterval);
        //counter = 0;
        if (iscontinuing)
          fetchMemberInfo(Object.values(eachMemberBlock));
        else
          countGroupMembers(Object.values(eachMemberBlock));
    } else {
    }
  }, 2000);
}

const countGroupMembers = async (eachMemberBlock, last_search = parseInt(groupSettings.resume_last_search_position), startFrom = 0) => {
  // console.log("countGroupMembers  ", eachMemberBlock.length, last_search, startFrom)
  if (shoudIstop)
    return;

  if (groupSettings.resume_last_search && last_search > 0) {
    const parser = new DOMParser();
    if (last_search < eachMemberBlock.length) {
      for (let i = 0; i < last_search - 1; ++i) {
        eachMemberBlock[i].setAttribute("sentFR", true);
        const doc = parser.parseFromString(`<span class="count-badge">${i + 1 + startFrom}</span>`, "text/html");
        eachMemberBlock[i].querySelector(selectors.add_friend_span).querySelector(selectors.tab_index_0).parentNode.append(doc.body.firstChild); 
        skipCounter = skipCounter + 1;
      }
      scrollToPos(eachMemberBlock[last_search - 1]);
      const doc = parser.parseFromString(`<span class="count-badge">${groupSettings.resume_last_search_position}</span>`, "text/html");
      eachMemberBlock[last_search - 1].querySelector(selectors.add_friend_span).querySelector(selectors.tab_index_0).parentNode.append(doc.body.firstChild);
      eachMemberBlock[last_search - 1].setAttribute("startChecking", true);
      const eachMemberBlockPos = document.querySelectorAll(selectors.group_member_div);
      fetchMemberInfo(Object.values(eachMemberBlockPos));
    }
    else {
      // console.log("last_search > eachMemberBlock.length");
      for (let i = 0; i < eachMemberBlock.length; ++i) {
        if (i % 5 === 0)
          await wait(3000)
        scrollToPos(eachMemberBlock[i]);
        eachMemberBlock[i].setAttribute("sentFR", true);
        const doc = parser.parseFromString(`<span class="count-badge">${i + 1 + startFrom}</span>`, "text/html");
        eachMemberBlock[i].querySelector(selectors.add_friend_span).querySelector(selectors.tab_index_0).parentNode.append(doc.body.firstChild);
        skipCounter = skipCounter + 1;
      }
      scrollToPos(eachMemberBlock[eachMemberBlock.length - 1]);
      const eachMemberBlockPos = document.querySelectorAll(selectors.group_member_div);
      await wait(5000)
      countGroupMembers(eachMemberBlockPos, last_search - eachMemberBlock.length, skipCounter)
    }
  }
  else {
    fetchMemberInfo(Object.values(eachMemberBlock));
  }
}

const fetchMemberInfo = async (eachMemberBlock) => {
  if (shoudIstop)
    return;
  if (groupSettings.request_limit_type === "Limited" && parseInt(groupSettings.request_limit) <= 0) {
    // console.log("returning back", groupSettings.request_limit, groupSettings.request_limit)
    return;
  }

  if (eachMemberBlock.length > 0) {
    
    let memberBlock = eachMemberBlock[0].querySelector(selectors.add_friend_btn)
    // console.log("eachMemberBlock[0] ::: ", eachMemberBlock[0])
    // console.log("memberBlock ::: ", memberBlock)
    if (memberBlock === null) {
      if(eachMemberBlock.length === 1){
        scrollToPos(eachMemberBlock[0])
      }
      eachMemberBlock[0].setAttribute("sentFR", true);
      skipCounter = skipCounter + 1;
      eachMemberBlock.shift();
      fetchMemberInfo(eachMemberBlock);
    } else {
      eachMemberBlock[0] && scrollToPos(eachMemberBlock[0]);
      const memberAnchor = eachMemberBlock[0].querySelector(selectors.member_anchor);
      const memberInfo = {
        memberName: memberAnchor && memberAnchor.getAttribute("aria-label"),
        memberId: memberAnchor && memberAnchor.getAttribute("href") ? 
                    memberAnchor.getAttribute("href").split("user/")[1]
                    ? 
                      memberAnchor.getAttribute("href").split("user/")[1].split("/")[0]
                    : "" 
                  : "",
        isEligible: true,
      };
      // console.log("memberInfo ::: ", memberInfo);

      chrome.runtime.sendMessage({ action: "resetFbdtsg" });
      const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
      fetchOtherInfosOfMember(
        memberInfo,
        eachMemberBlock[0],
        eachMemberBlock,
        fbTokenAndId.fbDtsg,
        fbTokenAndId.userID,
        window.location.href.split("groups/")[1].split("/members")[0]
      );
    }
  } else {
    startSearchingEligibleGroupMembers(true);
  }
};

/**
 * Fetch some information and send friend request according to the settings
 * @param {payload} groupMemberInfo 
 * @param {Object} memberBlock 
 * @param {Array} eachMemberBlock 
 * @param {string} fbDtsg 
 * @param {string} userID 
 * @param {string} groupId 
 * @param {object} responsePayload
 * @returns 
 */
const fetchOtherInfosOfMember = async (
  groupMemberInfo,
  memberBlock,
  eachMemberBlock,
  fbDtsg,
  userID,
  groupId,
  responsePayload = null
) => {
  let otherFeatureOn = false;

  if (shoudIstop)
    return;

  if (responsePayload === null) {

    if (groupSettings) {
      msgPayload = {
        "groupMemberInfo": groupMemberInfo,
        "memberBlock": memberBlock,
        "eachMemberBlock": eachMemberBlock,
        "fbDtsg": fbDtsg,
        "userID": userID,
        "groupId": groupId
      }
      // console.log("msgPayload ::: ", msgPayload)
      chrome.runtime.sendMessage({
        "action": "getGenderCountryAndTier",
        "name": groupMemberInfo.memberName,
        "from": "sendFR"
      });
    } else {
      otherFeatureOn = true;
      // console.log("otherFiterOn ::: ", otherFeatureOn)
    }

  };
  // console.log("otherFeatureOn ::: ", otherFeatureOn)

  if (responsePayload !== null || otherFeatureOn) {
    // console.log("responsePayload ::: ", responsePayload);
    friendProfilePicture = memberBlock.querySelector('a[aria-label="' + groupMemberInfo.memberName + '"]').querySelector('image').getAttribute("xlink:href");
    // console.log("friendProfilePicture ::: ", friendProfilePicture);
    let requestInfo={};
    requestInfo = {
      ...requestInfo,
      "settingsId": groupSettings.settingsId,
      "fb_user_id": userID,
      "matchedKeyword": "",
      "finalSource": "group"
    }
    if (responsePayload === false)
      groupMemberInfo = { ...groupMemberInfo, isEligible: false };

    if (groupMemberInfo.isEligible && groupSettings.gender_filter) {

      if (
        responsePayload.gender.toLocaleLowerCase() !==
        groupSettings.gender_filter_value.toLocaleLowerCase()
      ) {
        groupMemberInfo = { ...groupMemberInfo, isEligible: false };
      }
    }

    if (shoudIstop)
      return;
    // console.log("groupMemberInfo 3 ::: ", groupMemberInfo);
    if (groupMemberInfo.isEligible && groupSettings.country_filter_enabled) {
      if (groupSettings.country_filter) {
        if (!groupSettings.country_filter_value.includes(responsePayload.countryName))
          groupMemberInfo = { ...groupMemberInfo, isEligible: false };
      }
      if (groupSettings.tier_filter) {
        if (!groupSettings.tier_filter_value.includes(responsePayload.Tiers)) {
          groupMemberInfo = { ...groupMemberInfo, isEligible: false };
        }
      }
    }

    if (responsePayload && groupMemberInfo.isEligible) {
      // console.log("frineds gender........>>>", responsePayload)
      if (responsePayload.gender) {
        groupMemberInfo.gender = responsePayload.gender;
      }
      if (responsePayload.countryName) {
        groupMemberInfo.country = responsePayload.countryName
      }
      if (responsePayload.Tiers) {
        groupMemberInfo.tier = responsePayload.Tiers

      }

    }


    if (shoudIstop)
      return;

    if (
      groupMemberInfo.isEligible &&
      (groupSettings.keyword || groupSettings.negative_keyword)
    ) {

      let memberWorkDesc = [];
      // const groupMemberBio = memberBlock.querySelectorAll('span[dir="auto"]');
      const groupMemberBio = memberBlock.querySelectorAll(selectors.add_friend_span);
      // console.log("groupMemberBio ::: ", groupMemberBio);
      if (groupMemberBio.length > 0) {
        for (let i = 0; i < groupMemberBio.length; ++i) {
          // console.log("groupMemberBio[i].textContent ::: ", groupMemberBio[i].textContent)
          if (groupMemberBio[i].textContent.toLocaleLowerCase().trim() !== "add friend");
            memberWorkDesc = [...memberWorkDesc, groupMemberBio[i].textContent]
        }
      }
      //groupMemberInfo.refriending=false;
      let isNegetivekeyWordMatched = false,
        iskeyWordMatched = false;
      if (memberWorkDesc.length > 0) {
        //let keywordCounter = 0
        requestInfo.matchedKeyword=""
        memberWorkDesc.forEach((elem, i) => {
          let changedText = ``;
          if (groupSettings.negative_keyword) {
            groupSettings.selected_negative_keywords.forEach((el) => {
              // console.log("NegetiveKeywordsParam ::: ", el)
              if (elem.toLocaleLowerCase().includes(el.toLocaleLowerCase().trim())) {
                isNegetivekeyWordMatched = true;
                // console.log(groupMemberInfo.memberName + "'s work decription is matching with negetive keyword.")
                groupMemberInfo = { ...groupMemberInfo, isEligible: false };
              }
            });
          }
          if (groupSettings.keyword && !isNegetivekeyWordMatched) {
            groupSettings.selected_keywords.forEach((el) => {
              if (elem.toLocaleLowerCase().includes(el.toLocaleLowerCase().trim())) {
                iskeyWordMatched = true;
                changedText = changedText === `` ? elem : changedText;
                const theHighlightedSentences = changedText.toLocaleLowerCase().indexOf(el.toLocaleLowerCase())
                if (theHighlightedSentences !== -1) {
                  const matchedSubstring =  changedText.substr(theHighlightedSentences, el.length);
                  changedText = changedText.replace(new RegExp(matchedSubstring, 'i'), `<span class="fr-highlight">${matchedSubstring}</span>`) 
                  // console.log("changedText ::: 2 ::: ", changedText);
                  
                  if(groupMemberBio[i].querySelector('div'))
                    groupMemberBio[i].querySelector('div').innerHTML =  changedText;
                  else if(groupMemberBio[i].querySelector('a'))
                    groupMemberBio[i].querySelector('a').innerHTML = changedText
                  else
                    groupMemberBio[i].innerHTML = changedText;

                  requestInfo.matchedKeyword = requestInfo.matchedKeyword.length===0 ? el.trim() : requestInfo.matchedKeyword + "," + el.trim();
                }
              }
            });
          }
        });
        if (groupSettings.keyword && !iskeyWordMatched) {
          groupMemberInfo = { ...groupMemberInfo, isEligible: false };
        }
      } else {
        groupMemberInfo = { ...groupMemberInfo, isEligible: false };
      }
    }

    // console.log("profileMysettings ::: ", profileMysettings.dont_send_friend_requests_prople_ive_been_friends_with_before)

    if (groupMemberInfo.isEligible && profileMysettings && profileMysettings.dont_send_friend_requests_prople_ive_been_friends_with_before){
      const isExFriends = await helper.fetchExFriends(userID, groupMemberInfo.memberId)
      // console.log("isExFriends ::: ", isExFriends)
      if(isExFriends)
        groupMemberInfo = { ...groupMemberInfo, isEligible: false };
    }
    // console.log("profileMysettings they rejected ::: ", profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected)
    // console.log("profileMysettings I rejected ::: ", profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected)

    if (groupMemberInfo.isEligible && profileMysettings && 
      (profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected 
      || profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected)){
        const isRejectedFriends = await helper.fetchRejectedFriends(userID, groupMemberInfo.memberId)
        // console.log("isRejectedFriends ::: ", isRejectedFriends)
        // console.log("isRejectedFriends isRejected ::: ", isRejectedFriends.isRejected)
        // console.log("isRejectedFriends is_incoming ::: ", isRejectedFriends.is_incoming)
      if(profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected ){
        if(isRejectedFriends && isRejectedFriends.isRejected && !isRejectedFriends.is_incoming)
          groupMemberInfo = { ...groupMemberInfo, isEligible: false };
      }
      if(profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected ){
        if(isRejectedFriends && isRejectedFriends.isRejected && isRejectedFriends.is_incoming)
          groupMemberInfo = { ...groupMemberInfo, isEligible: false };
      }
    }

    if (groupMemberInfo.isEligible && profileMysettings && profileMysettings.avoid_sending_friend_request_to_restricted_people){
      const isRestricted = await common.fetchRestrictedFbProfile({ "facebookUserId":userID, "peopleFbId":groupMemberInfo.memberId});
      console.log("isRestricted ::: ", isRestricted)
      if(isRestricted)
        groupMemberInfo = { ...groupMemberInfo, isEligible: false };
    }
      
    //check for user re-friending  
    if (groupMemberInfo.isEligible) {
      groupMemberInfo.refriending = false;
      if (profileMysettings && profileMysettings.re_friending) {
        //console.log("came to matyereddd");
        if (requestInfo.matchedKeyword && requestInfo.matchedKeyword.length > 0) { //case: if matched keyword is not empty then check for re-friending
          if ((profileMysettings.re_friending_settings[0] && 
                profileMysettings.re_friending_settings[0].use_keyword) 
                && profileMysettings.re_friending_settings[0].keywords.length > 0) {
            //case: matched keyword is not empty and re_friending_keywords is not empty then check for key match
            //console.log("started checking of keys for re-fr status:")
            for (const keyw of profileMysettings.re_friending_settings[0].keywords.split(",")) {
              // console.log("keyw ::: ", keyw)
              if (keyw.trim().length > 0)
                if (requestInfo.matchedKeyword.toLocaleLowerCase().includes(helper.trimSpecialCharacters(keyw.toLocaleLowerCase()))) {
                  groupMemberInfo.refriending = true;
                  break;
                }
            }
          } else { //case: matched keyword is not empty and re_friending_keywords is empty then check for re-friending
            groupMemberInfo.refriending = true;
          }
        } else { // case: if matched keyword is empty then check for re-friending
          if ((profileMysettings.re_friending_settings[0] && 
                profileMysettings.re_friending_settings[0].use_keyword) 
                && profileMysettings.re_friending_settings[0].keywords.length > 0) {
            //case: if matched keyword is empty but re_friending_keywords is there
            groupMemberInfo.refriending = false;
          } else { //case: if matched keyword is empty and re_friending_keywords is empty
            groupMemberInfo.refriending = true;
          }
        }
      }
    }
    //console.log("re fr status after check",groupMemberInfo.refriending);
    ///////////////////:end of re-friending check:///////////////////////////
      
    if (shoudIstop)
      return;

    // if current member is not previous member then only incease the count og profile viewed
    if (groupMemberInfo.memberId !== previous_memberId) {
      profile_viewed = profile_viewed + 1;
      skipCounter = skipCounter + 1;
      previous_memberId = groupMemberInfo.memberId
      await helper.saveDatainStorage("profile_viewed", profile_viewed)
      chrome.runtime.sendMessage({ "action": "profile_viewed", "profile_viewed": profile_viewed });
    }

    //if this person fitted in settings then send friend request

    if (groupMemberInfo.isEligible && (groupMemberInfo.memberId !== "" || groupMemberInfo.memberId !== undefined)) {
      requestInfo = {
        ...requestInfo,
        "friendFbId": groupMemberInfo.memberId,
        "friendProfileUrl": "https://www.facebook.com/profile.php?id=" + groupMemberInfo.memberId,
        "friendName": groupMemberInfo.memberName,
        "friendProfilePicture": friendProfilePicture,
        "groupUrl" : window.location.href.replace("/members", ""),
        "groupName" : groupName,
        "gender":groupMemberInfo.gender ,
        "country": groupMemberInfo.country,
        "tier": groupMemberInfo.tier,
        "refriending":groupMemberInfo.refriending,
      }
      if(groupMemberInfo.refriending&&(profileMysettings&&profileMysettings.re_friending_settings[0])){
        requestInfo = {
          ...requestInfo,
        "refriending_pending_days":profileMysettings.re_friending_settings[0].remove_pending_friend_request_after,
        "refriending_max_attempts":profileMysettings.re_friending_settings[0].instantly_resend_friend_request,
        "refriending_attempt":1,
        }

      }
      // console.log("requestInfo ::: ", requestInfo);
      memberBlock.classList.add("fr-list-loader");
      // console.log("memberBlock ::: ", memberBlock)
      memberBlockForPause = memberBlock;

      if (shoudIstop) {
        if (memberBlock.classList.contains("fr-list-loader"))
          memberBlock.classList.remove("fr-list-loader")
        return;
      }
      // Halt
      // console.log("//halt//")
      let time;
      if (groupSettings.look_up_interval === "auto") {
        time = generateRandomNumber(15, 18)
      } else {
        time =
          Number(groupSettings.look_up_interval) * 60 * 1000 + generateRandomNumber(-30, 30);
        time = time < 30000 ? 30000 : time;
      }
      timeSaved = timeSaved + (time / 1000);
      // console.log("timeSaved ::: ", timeSaved, " hours")
      await wait(time);
      const sentFriendRequest = await common.sentFriendRequest(userID, fbDtsg, groupMemberInfo.memberId)
      console.log("sentFriendRequest.status ::: ", sentFriendRequest.status)
      console.log("sentFriendRequest.description ::: ", sentFriendRequest.description)
      if(sentFriendRequest.status === false && (sentFriendRequest.description && sentFriendRequest.description.length > 0 && 
        (sentFriendRequest.description.includes('It looks like you may not know this person.') || sentFriendRequest.description.includes("Only send friend requests to people you know personally.")))){
        console.log("Checking facebook tupulu tupulu.");
        await common.storeRestrictedFbProfile({
          "facebookUserId": userID,
          "peopleFbId": groupMemberInfo.memberId 
        })
      }
      if (sentFriendRequest.status) {
        countMember = countMember + 1;
        fr_token = await helper.getDatafromStorage("fr_token");
        await helper.saveDatainStorage("updated_Profile_data", { "profile_viewed": profile_viewed, "friend_request_send": countMember, "time_saved": timeSaved })
        await common.UpdateSettingsAfterFR(fr_token, { ...requestInfo, "profile_viewed": profile_viewed, "friend_request_send": countMember, "time_saved": timeSaved, is_settings_stop : false });
        await helper.saveDatainStorage("FRSendCount", countMember);
        // console.log("groupSettings.send_message ::: ", groupSettings, groupSettings.send_message);
        if(groupSettings.send_message){

          await helper.sleep(3000);
          // console.log('settingsType :::: ', settingsType)
          const body = {
            "fbUserId":userID,
            "friendFbId": groupMemberInfo.memberId,
            "settingsType": settingsType.whenFRSendToMember,
            "settings_id" : groupSettings.settingsId,
            // "groupId" : groupSettings && groupSettings.send_message_when_reject_friend_request_groupSettings &&
            //   groupSettings.send_message_when_reject_friend_request_groupSettings.length > 0 &&
            //   groupSettings.send_message_when_reject_friend_request_groupSettings[0].message_group_id,
            // "quick_message" : groupSettings && groupSettings.send_message_when_reject_friend_request_groupSettings &&
            //   groupSettings.send_message_when_reject_friend_request_groupSettings.length ?
            //   groupSettings.send_message_when_reject_friend_request_settings[0].messengerText : null
          };
          fr_token = await helper.getDatafromStorage("fr_token");
          const messageContent = await common.getMessageContent(fr_token, body);
          // console.log("messageContent in content ::: ", messageContent);
          if(messageContent.status){
            chrome.runtime.sendMessage({ "action": "sendMessage","fbDtsg" : fbDtsg, "userId" : userID,  "recieverId": groupMemberInfo.memberId, "name" :  groupMemberInfo.memberName, "message": messageContent.content, "settingsType": settingsType.whenFRSendToMember});
          }
        }
        chrome.runtime.sendMessage({ "action": "FRSendCount", "FriendRequestCount": countMember });

        memberBlock
        .querySelector(selectors.add_friend_btn)
        .querySelector(selectors.add_friend_span).textContent = "Cancel Request";
      }
    }

    if (shoudIstop)
      return;

    if (memberBlock.classList.contains("fr-list-loader"))
      memberBlock.classList.remove("fr-list-loader")
    memberBlock.setAttribute("sentFR", true);
    eachMemberBlock.shift();

    if (
      groupSettings.request_limit_type === "Limited"
    ) {
      if (countMember < parseInt(groupSettings.request_limit))
        fetchMemberInfo(eachMemberBlock);
      else {
        chrome.runtime.sendMessage({ "action": "stop"});
        window.location.reload();
      }
    } else fetchMemberInfo(eachMemberBlock);
  }

};

/**
 * Find a number between two Number values
 * @param {Number} min 
 * @param {Number} max 
 * @returns 
 */
function generateRandomNumber(min, max) {
  return (Math.random() * (max - min + 1) + min) * 1000;
}

/**
 * It will wait till provided time(milliseconds)
 * @param {Number} ms 
 * @returns 
 */
const wait = (ms) => {
  // console.log("Halt for (secs) ", ms / 1000);
  return new Promise((resolve) => timeOut = setTimeout(resolve, ms));
}

/**
 * It will scroll upto given element in the web page
 * @param {Object} el 
 */
const scrollToPos = (el) => {
  if (shoudIstop)
    return;
  $("html,body").animate({
    scrollTop: $(el).offset().top - 200,
  });
}

