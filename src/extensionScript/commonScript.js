import { param } from "jquery";
import helper from "./helper";
const HEADERS = {
  "Content-Type": "application/json",
};
let incomingPendingList = [];
const getAboutInfo = async (memberId, fbDtsg, userID) => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "ProfileCometAboutAppSectionQuery",
    variables: JSON.stringify({
      UFI2CommentsProvider_commentsKey: "ProfileCometAboutAppSectionQuery",
      // "collectionToken": null,
      pageID: memberId,
      scale: 2,
      // "showReactions":true,
      userID: memberId,
      // "__relay_internal__pv__FBReelsDisableBackgroundrelayprovider": false
    }),
    server_timestamps: true,
    doc_id: 8843904325634561,
  };

  const getGroupMemberAbout = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "ProfileCometAboutAppSectionQuery",
      },
      body: helper.serialize(payload),
    }
  );
  //console.log("api resppppp", getGroupMemberAbout)
  let getGroupMemberAboutResponse = await getGroupMemberAbout.text();
  getGroupMemberAboutResponse = getGroupMemberAboutResponse.split(`}{`)[0];
  // console.log("About API caL TEXTS_______________________________",getGroupMemberAboutResponse);
  // getGroupMemberAboutResponse=getGroupMemberAboutResponse+'}';
  // getGroupMemberAboutResponse=helper.makeParsable(
  //   getGroupMemberAboutResponse
  // );
  // console.log("About API ca;;;;;;;;;;;;");
  // console.log("getGroupMemberAboutResponse ::: in api callll ", getGroupMemberAboutResponse);

  const regex = /"Details About (.+?)"/;
  const match = regex.exec(getGroupMemberAboutResponse);
  let name;
  if (match) {
   // console.log(match);
    name = match[1];
  } else {
    console.log("Name not found");
    name = ""
  }
  return name;
};


const getProfileInfo = async (memberId, fbDtsg, userID) => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "ProfileCometHeaderQuery",
    variables: JSON.stringify({
      scale:2,
      selectedID:memberId,
      selectedSpaceType:"community",
      shouldUseFXIMProfilePicEditor:false,
      userID:memberId}),
    server_timestamps: true,
    doc_id: 7538113772922088,
  };

  const getGroupMemberAbout = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "ProfileCometAboutAppSectionQuery",
      },
      body: helper.serialize(payload),
    }
  );
  //console.log("api resppppp", getGroupMemberAbout)
  let getGroupMemberAboutResponse = await getGroupMemberAbout.text();
  getGroupMemberAboutResponse = getGroupMemberAboutResponse.split(`}{`)[0];
  // Extract name
const nameRegex = /"name":\s*"(.*?)"/;
const nameMatch = nameRegex.exec(getGroupMemberAboutResponse);
let name;
if (nameMatch) {
  name = nameMatch[1]; // Captured group (the name)
} else {
  name = "";
}

// Extract profile picture URL
const pictureRegex = /"uri":\s*"(.*?)"/g; // Use 'g' for all occurrences
const pictureMatch = pictureRegex.exec(getGroupMemberAboutResponse);
let profilePictureUrl;
if (pictureMatch) {
  profilePictureUrl = pictureMatch[1].replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, ""); // Captured group (the URL)
} else {
  profilePictureUrl = "";
} 
  return {
    name: name,
    profilePictureUrl: profilePictureUrl.replace(/\\/g, '')
  };
};
const getMemberGender = async (memberId, fbDtsg, userID, groupId) => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "ProfileCometContextualProfileRootQuery",
    variables: JSON.stringify({
      contextualProfileContext: {
        associated_context_id: groupId.toString(),
        render_location: "GROUP",
      },
      feedLocation: "GROUP_MEMBER_BIO_FEED",
      groupID: groupId.toString(),
      groupMemberActionSource: "COMET_GROUP_MEMBER_PROFILE",
      postsToLoad: 1,
      privacySelectorRenderLocation: "COMET_STREAM",
      profileID: memberId,
      renderLocation: "group_bio",
      scale: 2,
      shouldUseFXIMProfilePicEditor: false,
      useDefaultActor: false,
    }),
    server_timestamps: true,
    doc_id: "5695672553860501",
  };

  const getGroupMemberGender = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "ProfileCometAboutAppSectionQuery",
      },
      body: helper.serialize(payload),
    }
  );
  let getGroupMemberGenderResponse = await getGroupMemberGender.text();
  // console.log("getGroupMemberGenderResponse : 1", getGroupMemberGenderResponse);
  getGroupMemberGenderResponse = getGroupMemberGenderResponse.split(
    `{"label":"ProfileCometProfilePicture_user$defer$ProfileCometLockedProfilePopover_user"`
  )[0];
  // console.log("getGroupMemberGenderResponse : 2", getGroupMemberGenderResponse);
  getGroupMemberGenderResponse = helper.makeParsable(
    getGroupMemberGenderResponse
  );
  // console.log("getGroupMemberGenderResponse ***:::*** ", getGroupMemberGenderResponse);
  const genderProfile =
  getGroupMemberGenderResponse.data ? getGroupMemberGenderResponse.data.contextual_profile_view.profile : "N/A";
  // console.log("genderProfile : : : ", genderProfile);
  const mutualFriends =
  genderProfile === "N/A" ? "N/A" : genderProfile.contextual_profile_tiles.nodes[0].content_renderer === null ? 0 : genderProfile.contextual_profile_tiles.nodes[0].content_renderer
      .tile_content.timeline_context_items;
  // console.log("mutualFriends : 3 : ", mutualFriends);
  const getGroupMemberGenderResponsePayload = {
    name : genderProfile === "N/A" ? "N/A" : genderProfile.name,
    profilePicture : genderProfile === "N/A" ? "N/A" : genderProfile.profilePhoto ? genderProfile.profilePhoto.url :"" ,
    gender: genderProfile === "N/A" ? "N/A" : genderProfile.gender,
    mutualFriends: mutualFriends === "N/A" ? "0" : 
      mutualFriends && mutualFriends.nodes[0].target_type === "MUTUAL_FRIENDS"
        ? mutualFriends.nodes[0].plaintext_title.text.split(
          " mutual friends"
        )[0]
        : "0",
  };
  return getGroupMemberGenderResponsePayload;
};

const getMemberCountry = async (memberId, fbDtsg, userID) => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "ProfileCometAboutAppSectionQuery",
    variables: JSON.stringify({
      UFI2CommentsProvider_commentsKey: "ProfileCometAboutAppSectionQuery",
      collectionToken: null,
      pageID: memberId,
      scale: 1.5,
      showReactions: true,
      userID: memberId,
    }),
    server_timestamps: true,
    doc_id: 8843904325634561,
  };

  const getGroupMemberEntityId = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "ProfileCometAboutAppSectionQuery",
      },
      body: helper.serialize(payload),
    }
  );
  let getGroupMemberEntityIdResponse = await getGroupMemberEntityId.text();
  getGroupMemberEntityIdResponse = helper.makeParsable(
    getGroupMemberEntityIdResponse.split(
      `{"label":"ProfileCometAboutAppSectionQuery$defer$ProfileCometAppSectionFeed_user_`
    )[0]
  );
  getGroupMemberEntityIdResponse =
    getGroupMemberEntityIdResponse.data.user.about_app_sections.nodes[0]
      .activeCollections.nodes[0].style_renderer.profile_field_sections;
  getGroupMemberEntityIdResponse = getGroupMemberEntityIdResponse
    ? getGroupMemberEntityIdResponse[0].profile_fields.nodes
    : [];
  getGroupMemberEntityIdResponse =
    getGroupMemberEntityIdResponse.length > 0
      ? Object.values(getGroupMemberEntityIdResponse)
      : [];
  const homeTownOfMember =
    getGroupMemberEntityIdResponse &&
    getGroupMemberEntityIdResponse.filter((el) => el.field_type === "hometown");
  const currentCityOfMember =
    getGroupMemberEntityIdResponse &&
    getGroupMemberEntityIdResponse.filter(
      (el) => el.field_type === "current_city"
    );
  let countryArr = [];
  if (homeTownOfMember.length > 0) {
    countryArr = [
      ...countryArr,
      await getCountry(
        homeTownOfMember[0].renderer.field.title.ranges[0].entity.id,
        fbDtsg,
        userID
      ),
    ];
  }
  // console.log("countryArr[0] ::::::: ", countryArr)
  if (currentCityOfMember.length > 0) {
    const countryOfCorrentCity = await getCountry(
      currentCityOfMember[0].renderer.field.title.ranges[0].entity.id,
      fbDtsg,
      userID
    );
    if (
      countryArr.length === 0 ||
      (countryOfCorrentCity &&
        countryArr > 0 &&
        countryOfCorrentCity.toLocaleLowerCase().trim() !==
        countryArr[0].toLocaleLowerCase().trim())
    )
      countryArr = [...countryArr, countryOfCorrentCity];
  } else {
    countryArr = [...countryArr, "N/A"];
  }
  return countryArr;
};

const getCountry = async (entityID, fbDtsg, userID) => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "CometHovercardQueryRendererQuery",
    variables: JSON.stringify({
      actionBarRenderLocation: "WWW_COMET_HOVERCARD",
      context: "DEFAULT",
      entityID: entityID,
      includeTdaInfo: false,
      scale: 1.5,
    }),
    server_timestamps: true,
    doc_id: 5430171473776383,
  };

  const getGroupMemberCountry = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "CometHovercardQueryRendererQuery",
      },
      body: helper.serialize(payload),
    }
  );
  let getGroupMemberCountryResponse = await getGroupMemberCountry.text();
  getGroupMemberCountryResponse = helper.makeParsable(
    getGroupMemberCountryResponse
  );
  getGroupMemberCountryResponse =
    getGroupMemberCountryResponse.data.node.comet_hovercard_renderer.page
      .page_about_fields.address.full_address;
  getGroupMemberCountryResponse = getGroupMemberCountryResponse.split(",");
  getGroupMemberCountryResponse =
    getGroupMemberCountryResponse[
      getGroupMemberCountryResponse.length - 1
    ].trim();
  // console.log("getGroupMemberCountryResponse : 1", getGroupMemberCountryResponse);
  return getGroupMemberCountryResponse;
};

const getWorkDescription = async (memberId, fbDtsg, userID) => {
  const collectionToken = await getCollectionToken(
    memberId,
    fbDtsg,
    userID,
    "Work and education"
  );
  // console.log("collectionToken : ", collectionToken);
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "ProfileCometAboutAppSectionQuery",
    variables: JSON.stringify({
      UFI2CommentsProvider_commentsKey: "ProfileCometAboutAppSectionQuery",
      collectionToken: collectionToken,
      pageID: "100007260647023",
      scale: 1.5,
      userID: memberId,
    }),
    server_timestamps: true,
    doc_id: 6419142938116382,
  };

  const getGroupMemberWorkDesc = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "ProfileCometAboutAppSectionQuery",
      },
      body: helper.serialize(payload),
    }
  );
  let getGroupMemberWorkDescResponse = await getGroupMemberWorkDesc.text();
  getGroupMemberWorkDescResponse = helper.makeParsable(
    getGroupMemberWorkDescResponse.split(
      `{"label":"ProfileCometAboutAppSectionQuery$defer$ProfileCometAppSectionFeed_user_`
    )[0]
  );
  getGroupMemberWorkDescResponse =
    getGroupMemberWorkDescResponse.data.user.about_app_sections.nodes[0]
      .activeCollections.nodes[0].style_renderer.profile_field_sections;
  let aboutArray = [];
  getGroupMemberWorkDescResponse.forEach((element) => {
    const profile_fields = element.profile_fields.nodes;
    // console.log("profile_fields 1 ::: ", profile_fields);
    profile_fields.forEach((el) => {
      // console.log("profile_fields 2::: ", el && el.title.text);
      aboutArray = [...aboutArray, el && el.title.text];
    });
  });
  // console.log("aboutArray : ", aboutArray);
  return aboutArray;
};

const getCollectionToken = async (memberId, fbDtsg, userID, aboutKey = "") => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "ProfileCometAboutAppSectionQuery",
    variables: JSON.stringify({
      UFI2CommentsProvider_commentsKey: "ProfileCometAboutAppSectionQuery",
      // "collectionToken" : "YXBwX2NvbGxlY3Rpb246MTAwMDA3MjYwNjQ3MDIzOjIzMjcxNTgyMjc6MjAy",
      pageID: "100007260647023",
      scale: 1.5,
      userID: memberId,
    }),
    server_timestamps: true,
    doc_id: 6419142938116382,
  };

  const getGroupMemberWorkDesc = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "ProfileCometAboutAppSectionQuery",
      },
      body: helper.serialize(payload),
    }
  );
  let getGroupMemberWorkDescResponse = await getGroupMemberWorkDesc.text();
  getGroupMemberWorkDescResponse = helper.makeParsable(
    getGroupMemberWorkDescResponse.split(
      `{"label":"ProfileCometAboutAppSectionQuery$defer$ProfileCometAppSectionFeed_user_`
    )[0]
  );
  getGroupMemberWorkDescResponse =
    getGroupMemberWorkDescResponse.data.user.about_app_sections.nodes[0]
      .all_collections.nodes;
  getGroupMemberWorkDescResponse = getGroupMemberWorkDescResponse.filter(
    (el) =>
      el &&
      el.name.toLocaleLowerCase().trim() === aboutKey.toLocaleLowerCase().trim()
  );
  const collectionToken =
    getGroupMemberWorkDescResponse &&
    getGroupMemberWorkDescResponse.length > 0 &&
    getGroupMemberWorkDescResponse[0].id;
  // console.log("getGroupMemberWorkDescResponse : ", getGroupMemberWorkDescResponse);
  // console.log("collectionToken : ", collectionToken);
  return collectionToken;
};

const sentFriendRequest = async (userID, fbDtsg, memberId, source = "groups_member_list",docId="9086069781410775") => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "FriendingCometFriendRequestSendMutation",
    variables: JSON.stringify({
      "input": {
        "refs": [null],
        "friend_requestee_ids": [memberId],
        "warn_ack_for_ids": [],
        "source": source,
        "actor_id": userID,
        "client_mutation_id": "1"
      },
      "scale": 1
    }),
    server_timestamps: true,
    doc_id: docId
  };

  let getSentFriendReq = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "FriendingCometFriendRequestSendMutation",
      },
      body: helper.serialize(payload),
    }
  );
  getSentFriendReq = await getSentFriendReq.text();
  getSentFriendReq = helper.makeParsable(getSentFriendReq);
  console.log("getSentFriendReq ::: ", getSentFriendReq);
  if (getSentFriendReq &&
    getSentFriendReq.data &&
    getSentFriendReq.data &&
    getSentFriendReq.data.friend_request_send &&
    getSentFriendReq.data.friend_request_send.friend_requestees &&
    getSentFriendReq.data.friend_request_send.friend_requestees.length > 0) {
    return {status :  true};
  } else {
    console.log(getSentFriendReq && getSentFriendReq.errors && getSentFriendReq.errors[0] && getSentFriendReq.errors[0].description)
    return {status : false, description : getSentFriendReq && getSentFriendReq.errors && getSentFriendReq.errors[0] && getSentFriendReq.errors[0].description};
  }
}

const UpdateSettingsAfterFR = async (token, payload) => {

  let updateSettings = await fetch(
    process.env.REACT_APP_UPDATE_SETTINGS_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
      },
      body: JSON.stringify(payload),
    }
  );
  updateSettings = await updateSettings.text()
  updateSettings = helper.makeParsable(updateSettings);
  return updateSettings;
}

const getMessageContent = ( body) => {
  return new Promise(async (resolve, reject) => {
    try {
      HEADERS.authorization = await helper.getDatafromStorage("fr_token");
      let messageContent = await fetch(
        process.env.REACT_APP_FETCH_MESSAGE_CONTENT_LOG,
        {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(body),
        }
      );
      messageContent = await messageContent.json();
      if(messageContent && messageContent.data){
        resolve({status : true, content : messageContent.data});
      }else{
        resolve({status : false});
      }
      } catch (error) {
      console.error("Send Message Error", error);
      resolve({status : false});
    }
  });
}

const confirmSentMessage = async (token, payload) => {

  let updateSendMessageStatus = await fetch(
    process.env.REACT_APP_UPDATE_SEND_MESSAGE_STATUS,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
      },
      body: JSON.stringify(payload),
    }
  );
  updateSendMessageStatus = await updateSendMessageStatus.json();
  // console.log("updateSendMessageStatus :::  ", updateSendMessageStatus)
}



const getIncomingPendingList = async(userId, fbDTSG, cursor = "") => {
  const incomingFunction = new Promise(async(resolve, reject) => {

    const variables= cursor === "" ? {"scale":1} : {"count":20,"cursor":cursor,"scale":1} // from second time
    const payload = {
        "av" : userId,
        "__user" : userId,
        "__a" : 1,
        "dpr" : 1,
        "__ccg" : "EXCELLENT",
        "__comet_req ": 15,
        "fb_dtsg" : fbDTSG,
        "fb_api_caller_class" : "RelayModern",
        "fb_api_req_friendly_name" : "FriendingCometFriendRequestsRootQuery",
        "variables" : JSON.stringify(variables),
        "server_timestamps" : true,
        "doc_id" : cursor === "" ? 4851458921570237 : 4843321999100134 // second time
    }
  
    const getIncomingPendingRequests = await fetch(
      "https://www.facebook.com/api/graphql/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/html,application/json",
          "x-fb-friendly-name": "FriendingCometFriendRequestsRootQuery",
        },
        body: helper.serialize(payload),
      }
    );
    let getIncomingPendingListResponse = await getIncomingPendingRequests.text();
    // console.log("getIncomingPendingListResponse ::: ", getIncomingPendingListResponse)
    getIncomingPendingListResponse = helper.makeParsable(
      getIncomingPendingListResponse
    );
    getIncomingPendingListResponse = getIncomingPendingListResponse && 
                                    getIncomingPendingListResponse.data &&
                                    getIncomingPendingListResponse.data.viewer && 
                                    getIncomingPendingListResponse.data.viewer.friending_possibilities && 
                                    getIncomingPendingListResponse.data.viewer.friending_possibilities
    console.log("getIncomingPendingListResponse ::: ", getIncomingPendingListResponse);
    const pendingList = getIncomingPendingListResponse && getIncomingPendingListResponse.edges
    console.log("pendingList ::: ", pendingList);
    incomingPendingList = pendingList && pendingList.length > 0 ? [...incomingPendingList, ...pendingList] : incomingPendingList
    const hasNextPage = getIncomingPendingListResponse && 
                        getIncomingPendingListResponse.page_info && 
                        getIncomingPendingListResponse.page_info.has_next_page
    console.log("hasNextPage ::: ", hasNextPage);
    if(hasNextPage){
      cursor = getIncomingPendingListResponse && 
                getIncomingPendingListResponse.page_info && 
                getIncomingPendingListResponse.page_info.end_cursor
      console.log("cursor ::: ", cursor);
      const time = helper.getRandomInteger(1000 * 30, 1000 * 60 * 1);
      await helper.sleep(time)
      const list = getIncomingPendingList(userId, fbDTSG, cursor)
      // console.log("list ::: ", list)
      resolve(list)
    }
    else{
      if(incomingPendingList && incomingPendingList.length > 0){
        incomingPendingList = incomingPendingList.map((el)=>{
          const data = {
            "friendFbId": el.node.id,
            "friendProfileUrl": el.node.url,
            "friendName": el.node.name,
            "friendProfilePicture": el.node.profile_picture.uri
          }
          return data;
        })
        console.log("Incoming pending list 222222222 ::: ", incomingPendingList);
        //store in DB
        chrome.runtime.sendMessage({
          "action": "getGenderCountryAndTierForIncoming",
          "incomingPendingList": incomingPendingList,
          "userId": userId
        });
      }
      console.log("Incoming pending list ::: ", incomingPendingList);
      resolve(incomingPendingList);
    }
  });
  return incomingFunction
}

const storeIncomingPendingReq = async(userId, incomingPendingList) => {
  let payload = {
    "facebookUserId": userId,
    "friend_details": incomingPendingList
  }    
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  let getIncomingPendingRequests = await fetch(
    process.env.REACT_APP_STORE_INCOMING_PENDING_REQUEST,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    }
  );
  getIncomingPendingRequests = await getIncomingPendingRequests.json();
  // console.log("getIncomingPendingRequests ::: ", getIncomingPendingRequests);
}

const storeRestrictedFbProfile = async (payload) => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  let storeRestrictedProfiles = await fetch(
    process.env.REACT_APP_STORE_RESTRICTED_PEOPLE,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    }
  );
  storeRestrictedProfiles = await storeRestrictedProfiles.json();
  console.log("storeRestrictedProfiles ::: ", storeRestrictedProfiles)
}


const fetchRestrictedFbProfile = async (payload) => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  let fetchRestrictedProfiles = await fetch(
    process.env.REACT_APP_FETCH_RESTRICTED_PEOPLE,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    }
  );
  fetchRestrictedProfiles = await fetchRestrictedProfiles.json();
  console.log("fetchRestrictedProfiles ::: ", fetchRestrictedProfiles)
  return (fetchRestrictedProfiles && fetchRestrictedProfiles.data && fetchRestrictedProfiles.data.length > 0 ? true : false);
}

const fetchAllCampaignList = async ( day, current_time, search_date, status="active") => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  const url = status === "active" ? (process.env.REACT_APP_ACTIVE_CAMPAIGNS+"?status=" + status + "&day=" + day + "&start_time=" + current_time + "&search_date=" + search_date ) : 
                          process.env.REACT_APP_ACTIVE_CAMPAIGNS+"?status=" + status
  let campaignList = await fetch(
    url,
    {
      method: "GET",
      headers: HEADERS,
    }
  );
  campaignList = await campaignList.json();
  // console.log("campaignList ::: ", campaignList);
  return campaignList.data;
}

const checkCampaignStatus = async (userId, day, current_time, camaign_id) => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  let campaignStatus = await fetch(
    process.env.REACT_APP_CHECK_CAMPAIGN_STATUS+"?fb_user_id=" + userId +
     "&day=" + day + "&start_time=" + current_time + "&campaign_id=" + camaign_id,
    {
      method: "GET",
      headers: HEADERS,
    }
  );
  campaignStatus = await campaignStatus.json();
  // console.log("campaignStatus ::: ", campaignStatus);
  return campaignStatus;
}

const checkMessageStatus = async (friend_fb_id,settings_type =null, camaign_id = null, search_date =null) => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");

  let params = "?friend_fb_id=" + friend_fb_id 
  if(camaign_id!=null){
    params = params+"&campaign_id=" + camaign_id+ "&search_date=" +search_date
  }

  if(settings_type!=null){
    params = params+"&settings_type=" + settings_type
  }

  let messageStatus = await fetch(
    process.env.REACT_APP_CHECK_MESSAGE_STATUS+ params,
    {
      method: "GET",
      headers: HEADERS,
    }
  );
  messageStatus = await messageStatus.json();
  // console.log("messageStatus ::: ", messageStatus);
  return messageStatus;
}


const checkHasConversation= async(fb_user_id,friendFbId)=>{
  const apiurl=`${process.env.REACT_APP_HAS_CONVERSATION}?friendFbId=${friendFbId}&fb_user_id=${fb_user_id}`;
  const requestOptions={
    method:"GET",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    }
  }
  try{
      let res=await fetch(apiurl,requestOptions);
      const data= await res.json();
      return data;

  }catch(error){
    console.log("Has Conversation chekc Error:",error);
    return error;
  }     
}

const storeInFRQS = async (payload) => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  let frqsResponse = await fetch(
    process.env.REACT_APP_STORE_IN_FRIENDS_QUEUE,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    }
  );
  frqsResponse = await frqsResponse.json();
  // console.log("frqsResponse ::: ", frqsResponse);
  return frqsResponse;
}

const checkAvailability = async (userId, friend_fb_id) => {
  HEADERS.authorization = await helper.getDatafromStorage("fr_token");
  let isAvailable = await fetch(
    process.env.REACT_APP_AVAILIBILITY_OF_MEMBER + "?fb_user_id=" + userId + '&friendFbId=' + friend_fb_id,
    {
      method: "GET",
      headers: HEADERS,
    }
  );
  
  isAvailable = await isAvailable.json();
  // console.log("isAvailable ::: ", isAvailable);
  return isAvailable && isAvailable.userData;
}

const getFriendsOfFriends = async (userID, fbDtsg, memberId) => {
  const payload = {
    av: userID,
    __user: userID,
    __a: 1,
    __comet_req: 15,
    fb_dtsg: fbDtsg,
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "FriendingCometFriendRequestSendMutation",
    variables: JSON.stringify({
      "input": {
        "refs": [null],
        "friend_requestee_ids": [memberId],
        "warn_ack_for_ids": [],
        // "source": source,
        "actor_id": userID,
        "client_mutation_id": "1"
      },
      "scale": 1
    }),
    server_timestamps: true,
    doc_id: "9086069781410775"
  };

  let getSentFriendReq = await fetch(
    "https://www.facebook.com/api/graphql/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/json",
        "x-fb-friendly-name": "FriendingCometFriendRequestSendMutation",
      },
      body: helper.serialize(payload),
    }
  );
  getSentFriendReq = await getSentFriendReq.text();
  getSentFriendReq = helper.makeParsable(getSentFriendReq);
  console.log("getSentFriendReq ::: ", getSentFriendReq);
  if (getSentFriendReq &&
    getSentFriendReq.data &&
    getSentFriendReq.data &&
    getSentFriendReq.data.friend_request_send &&
    getSentFriendReq.data.friend_request_send.friend_requestees &&
    getSentFriendReq.data.friend_request_send.friend_requestees.length > 0) {
    return {status :  true};
  } else {
    console.log(getSentFriendReq && getSentFriendReq.errors && getSentFriendReq.errors[0] && getSentFriendReq.errors[0].description)
    return {status : false, description : getSentFriendReq && getSentFriendReq.errors && getSentFriendReq.errors[0] && getSentFriendReq.errors[0].description};
  }
}
const fetchTopPriorityFrQueueRecords = async (fbUserId)=>{
  console.log("called fetchTopPriorityFrQueueRecords")
  const apiurl=`${process.env.REACT_APP_FETCH_TOP_FR_QUEUE_RECORDS}?fbUserId=${fbUserId}`;
  const requestOptions={
    method:"GET",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    }
  }
  try{
    console.log("api url",apiurl);
      let res=await fetch(apiurl,requestOptions);
      if (!res.ok) {
        // If response is not ok, throw an error with the status text
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      }
      const data= await res.json();
      console.log("api response data",data)
      return data;

  }catch(error){
    console.error("API ERROR IN FETCING IN TOP 100 FR QUEUE RECORD:",error);
    return error;
  } 
}

const fetchFrQueueSetting= async (fb_user_id)=>{
  const apiurl=`${process.env.REACT_APP_FETCH_FR_QUEUE_SETTING}?fb_user_id=${fb_user_id}`;
  const requestOptions={
    method:"GET",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    }
  }
  try{
      let res=await fetch(apiurl,requestOptions);
      if (!res.ok) {
        // If response is not ok, throw an error with the status text
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      }
      const data= await res.json();
      return data;

  }catch(error){
    console.error("API ERROR IN FETCING FR QUEUE SETTING :",error);
    return error;
  } 

}
const storeFrQueueSetting= async (payload)=>{
  console.log("process.env.REACT_APP_APP_STORE_FR_QUEUE_SETTING ::: ", process.env.REACT_APP_APP_STORE_FR_QUEUE_SETTING);
  const apiurl=process.env.REACT_APP_APP_STORE_FR_QUEUE_SETTING;
  const requestOptions={
    method:"POST",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    },
    body:JSON.stringify(payload)
  }
  try{
      let res=await fetch(apiurl,requestOptions);
      if (!res.ok) {
        // If response is not ok, throw an error with the status text
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      }
      const data= await res.json();
      return data;

  }catch(error){
    console.error("API ERROR IN FETCING FR QUEUE SETTING :",error);
    return error;
  } 

}

const fetchFriendshipStatus = async (payload)=>{
  const apiurl=`${process.env.REACT_APP_FRIEND_DATA_PRESENT_URL}`;
  const requestOptions={
    method:"POST",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    },
    body:JSON.stringify(payload)
  }
  try{
      let res=await fetch(apiurl,requestOptions);
      if (!res.ok) {
        // If response is not ok, throw an error with the status text
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      }
      const data= await res.json();
      return data;
    }catch(error){
      console.error("API ERROR IN FETCING FR QUEUE SETTING :",error);
      return error;
    }
}


const updateFrQueueStatus = async (payload) => {
  const apiurl=`${process.env.REACT_APP_UPDATE_FR_QUEUE_STATUS}`;
  const requestOptions={
    method:"POST",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    },
    body:JSON.stringify(payload)
  }
  try{
      let res=await fetch(apiurl,requestOptions);
      if (!res.ok) {
        // If response is not ok, throw an error with the status text
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      }
      const data= await res.json();
      return data;
  }catch(error){
    console.error("API ERROR IN UPDATING FR QUE STATUS",error);
    return error;
  }
}

async function getGenderCountryTierWithName (friendName){
  return new Promise((resolve,reject)=>{
    fetch(process.env.REACT_APP_GENDER_COUNTRY_AND_TIER_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "name": friendName,
      }),
    })
    .then((response) => response.json())
    .then((res) => {
      const resp = res.data ? res.data : res;

      if (!resp.errorType) {
        
        resolve({
          status : true,
          country : res.body.countryName,
          tier : res.body.Tiers,
          gender : res.body.gender
        })
      }  
    })
    .catch((err) => {
      resolve({
        status : false,
        country : "",
        tier : "",
        gender : ""
      })
      console.log("err ::: ", err);
    });
  })
}

function addFriendBtnClick() {
  const button = document.querySelector('[aria-label="Add friend"][role="button"]');
  const name = document.querySelectorAll('h1:not([dir="auto"]')[1].textContent
  const profilePicUrl = document.querySelectorAll('svg[data-visualcompletion="ignore-dynamic"][role="img"]')[1].querySelector('image').getAttribute('xlink:href')
  let res = { status: false, name: name.length > 0 ? name : "", profilePicUrl: profilePicUrl ? profilePicUrl : ""};
  let content = document.body.innerHTML;
  let match = content.match(/"userID":"(\d+)"/);
  if (match) { 
    let userID= match[0].split(':')[1];
    res["fbUserId"]= userID.length > 0? userID:"NA";
   }
  if (button) {
    console.log("add friend btn: ", button);
    button.click();
    res.status = true
  } else {
    console.log("Add friend button not found.");// Reject promise with failure status
  }
  return res;
}

const sendFriendRequestByDOMparsing = (profileUrl) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: profileUrl,active: false, pinned: true, selected: false }, (tab) => {
      // Close the tab after a delay (adjust as needed)
      setTimeout(() => {
        // For demonstration, let's call your function
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          //files: ["contentScript.js"], // Inject the content script
          func: addFriendBtnClick
        }).then((injectResults) => { // Access result
          resolve(injectResults[0]);
          setTimeout(()=>{
            chrome.tabs.remove(tab.id);
          }, 25000)
        }).catch((err) => {
          reject({ status: false, error: err });
          setTimeout(()=>{
            chrome.tabs.remove(tab.id);
          }, 2500)
        })
       
      }, 25000);
    })
  })
}
 
const getProfileSettings = async ()=>{
  const apiurl=`${process.env.REACT_APP_SETTING_API}`;
  const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
  const requestOptions={
    method:"POST",
    headers:{
      'Content-Type': 'application/json',
      'Authorization': await helper.getDatafromStorage("fr_token")
    },
    body:JSON.stringify({ fbUserId: fbTokenAndId.userID})
  }
  try{
      let res=await fetch(apiurl,requestOptions);
      if (!res.ok) {
        // If response is not ok, throw an error with the status text
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
      }
      const data= await res.json();
      return data;
    }catch(error){
      console.error("API ERROR IN FETCING FR PROFILE SETTING :",error);
      return error;
    }
}  

const common = {
  getAboutInfo : getAboutInfo,
  getMemberGender : getMemberGender,
  getMemberCountry : getMemberCountry,
  getWorkDescription : getWorkDescription,
  sentFriendRequest : sentFriendRequest,
  UpdateSettingsAfterFR : UpdateSettingsAfterFR,
  getMessageContent : getMessageContent,
  confirmSentMessage : confirmSentMessage,
  getIncomingPendingList : getIncomingPendingList,
  storeIncomingPendingReq : storeIncomingPendingReq,
  fetchRestrictedFbProfile : fetchRestrictedFbProfile,
  storeRestrictedFbProfile : storeRestrictedFbProfile,
  checkHasConversation:checkHasConversation,
  fetchAllCampaignList : fetchAllCampaignList,
  checkCampaignStatus : checkCampaignStatus,
  checkMessageStatus : checkMessageStatus,
  storeInFRQS : storeInFRQS,
  checkAvailability : checkAvailability,
  fetchTopPriorityFrQueueRecords:fetchTopPriorityFrQueueRecords,
  fetchFrQueueSetting:fetchFrQueueSetting,
  updateFrQueueStatus:updateFrQueueStatus,
  getGenderCountryTierWithName:getGenderCountryTierWithName,
  getProfileInfo:getProfileInfo,
  sendFriendRequestByDOMparsing:sendFriendRequestByDOMparsing,
  storeFrQueueSetting:storeFrQueueSetting,
  fetchFriendshipStatus:fetchFriendshipStatus,
  getProfileSettings:getProfileSettings
};

export default common;
