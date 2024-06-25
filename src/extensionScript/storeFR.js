// import selectors from "./selector";
import selectors from "./selector";
import common from "./commonScript";
import helper from "./helper";
// import { sendMessageToPortalScript } from "./background";

let fb_api_req_friendly_name, variables, doc_id, fbDtsg, userID, id, contactId;
let Dynamiccontacts = [],
    contacts = [],
    page_info = { has_next_page: true },
    memberCount = 0,
    queueCount = 0,
    shoudIstop = false,
    sessionToken = "",
    feedbackTargetID = "",
    groupSettings = {},
    groupName = "",
    sourceUrl = "",
    contactLength = 0,
    genderCounter = 0,
    counter = 0,
    alternativeForComment = false,
    contactsWithGenderDetails = [];

const reactions = {
    like: "1635855486666999",
    love: "1678524932434102",
    care: "613557422527858",
    haha: "115940658764963",
    angry: "444813342392137",
    wow: "478547315650144",
    sad: "908563459236466",
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // console.log("----------------------------***************-----------------------------------------", request);
    switch (request.action) {
        case "reSendFriendRequestInGroup":
            console.log("Lest resume -----------------");
            shoudIstop = false;
            getEssentialsForGraphApi(request.source, request.action, request.response)
            break;
        case "start":
            console.log("Lest start -----------------");
            alternativeForComment = false;
            if (request.source === "post") {
                shoudIstop = false;
                queueCount = 0;
                memberCount = 0;
            }
            getEssentialsForGraphApi(request.source, request.action, request.response, request.feedbackTargetID)
            break;
        case "getGenderCountryAndTier":
            if (shoudIstop) return;
            genderCounter = genderCounter + 1;
            // console.log("genderCounter ::: ", genderCounter)
            // console.log("member contact ::: ", request.memberContact)
            const memberContact = { ...{ ...request }.memberContact, gender: request.responsePayload.gender, country: request.responsePayload.countryName, tier: request.responsePayload.Tiers }
            // console.log("member contact ::: ", memberContact)
            contactsWithGenderDetails = [...contactsWithGenderDetails, memberContact];
            console.log("contactsWithGenderDetails ::: ", contactsWithGenderDetails);
            if (contactLength === contactsWithGenderDetails.length) {
                genderCounter = 0
                contactLength = contactLength - contactsWithGenderDetails.length;
                storeWouldbeFriends(contactsWithGenderDetails, request.source, contactsWithGenderDetails.length);
            }
            else if (genderCounter === 10) {
                contactLength = contactLength - genderCounter;
                storeWouldbeFriends(contactsWithGenderDetails, request.source, 10);
                genderCounter = 0
            }
            break;
        case "getFeedbackTargetID":
            if (request.source === "post") {
                const content = document.body.innerHTML;
                let match_token = content.match(/{"__typename":"DefaultCometUFISummaryAndActionsRenderer"\,"feedback":{"id":"[^,]*,/);
                console.log(match_token);
                if (match_token == null) {
                    // console.log("-----------------",match_token);
                    match_token = content.match(/,"feedback":{"id":"[^,]*,/);
                    match_token = match_token[0].replaceAll(",", "")
                    match_token = `{${match_token}}}`
                    match_token = JSON.parse(match_token);
                    // console.log(match_token);
                    feedbackTargetID = match_token.feedback.id;
                    console.log("feedbackTargetID : ", feedbackTargetID);
                }
                else {
                    // console.log("55555555555555555555",match_token);
                    console.log(match_token[0]);
                    match_token = match_token[0].slice(0, match_token.length - 2);
                    match_token = `${match_token}}}`
                    // console.log(match_token);
                    match_token = match_token;
                    match_token = JSON.parse(match_token);
                    // console.log(match_token);
                    feedbackTargetID = match_token.feedback.id;
                    // console.log(feedbackTargetID);
                }
                sendResponse(feedbackTargetID)
            }
            break;
        case "stop":
            console.log("************************************STOP**********************************************");
            page_info = { has_next_page: true }
            await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: request.source })
            shoudIstop = true;
            if (request.source !== "post")
                window.location.reload();
            else
                chrome.runtime.sendMessage({ action: "close" })
            break;
        case "pause":
            shoudIstop = true;
            break;
        case "FetchEssentials":
            console.log("request from FetchEssentials :::: ", request);
            if (request.source === "friends") {
                contactId = request.responseEssentials.contactId;
                sessionToken = request.responseEssentials.sessionToken;
            }
            await startStoringContactInfo(request.source, checkAndSaveAllData)
            break;
        case "contentAvailibility":
            sendResponse(true)
            break;
        default:
            break;
    }
});

const getEssentialsForGraphApi = async (source, action, settings, targetId = null) => {
    let fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    fbDtsg = fbTokenAndId.fbDtsg
    userID = fbTokenAndId.userID
    // console.log("fbTokenAndId ::: ", fbTokenAndId)
    groupSettings = settings
    if (action === "start") {
        console.log("starting-----------------------------------------------------------------");
        await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: source })
        // get important info from DOM SCRIPT
        if (source === "friends") {
            chrome.runtime.sendMessage({ action: "FetchEssentials", source: source, url: window.location.href });
            return;
        }
        if (source === "groups") {
            const groupNameInterval = setInterval(async () => {
                let groupNameDiv = document.querySelector(selectors.main_component).querySelector(selectors.group_name)
                console.log("groupNameDiv ::: ", groupNameDiv);
                if(groupNameDiv === null){
                    groupNameDiv = document.querySelector(selectors.groupHeader).querySelector(selectors.main_component).querySelector(selectors.group_name)
                }
                console.log("groupNameDiv ::: ", groupNameDiv);
                if(groupNameDiv === null){
                    groupNameDiv = document.querySelector(selectors.groupHeader).querySelector(selectors.group_name)
                }
                console.log("groupNameDiv ::: ", groupNameDiv);
                if (groupNameDiv !== null) {
                    clearInterval(groupNameInterval)
                    groupName = groupNameDiv.textContent;
                    console.log("group name ::: ", groupName);
                    let countSection = document.querySelector((['div[aria-label="Group navigation"][role="navigation"]']));
                    console.log("count Section in left side ----> ", countSection)
                    if (!countSection)
                        countSection = document.querySelector(selectors.groupHeader);
                    if (!countSection)
                        countSection = document.querySelector('div[role="main"]')
                    console.log("count Section in upper side ----> ", countSection)
                    let groupLeft = countSection.querySelector('div:not([class])').querySelector('span:not([dir="auto"])')
                    if (groupLeft)
                        groupLeft = groupLeft.querySelector('a').getAttribute('href')
                    else
                        groupLeft = countSection.querySelectorAll('div:not([class])')[1].querySelector('span:not([dir="auto"])').querySelector('a').getAttribute('href');
                    sourceUrl = "https://www.facebook.com" + groupLeft;
                    console.log("sourceUrl : ", sourceUrl);
                    await startStoringContactInfo(source, checkAndSaveAllData);
                }
            }, 500)
            return;
        }
        if (targetId)
            if (source === "post") {
                feedbackTargetID = targetId
                sourceUrl = await helper.getDatafromStorage('postUrl');
            }
    }

    // start fetching
    await startStoringContactInfo(source, checkAndSaveAllData)
}

const startStoringContactInfo = async (source, callback) => {
    if (shoudIstop) return;
    if (source === "post") {
        // console.log("post and contacts ::::::::::: ", contacts);
        if (contacts.length === 0) {
            if (groupSettings.comment && !groupSettings.reaction) {
                if (page_info && page_info.has_next_page === false) {
                    // chrome.runtime.sendMessage({ action: "close" })
                    const runningStatus = await helper.getDatafromStorage("runAction_post");
                    if (runningStatus === "running")
                        await helper.saveDatainStorage("runAction_post", "");
                    return;
                }
            }
            if (groupSettings.reaction) {
                if (page_info && page_info.has_next_page === false) {
                    if (groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length > 0) {
                        console.log("shifting of react type.................");
                        groupSettings.reaction_type.shift();
                        if (groupSettings.reaction_type.length === 0) {
                            groupSettings.reaction = false;
                            // if (groupSettings.comment) page_info = { has_next_page: true }
                            if (groupSettings.comment) {
                                console.log("reactions are finished run comment");
                                page_info = { has_next_page: true }
                            }
                            else {
                                // chrome.runtime.sendMessage({ action: "close" })
                                return;
                            }
                        }
                        else {
                            console.log("next reactions ::::: ", groupSettings.reaction_type);
                            page_info = { has_next_page: true }
                        }
                    }
                    else if (groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length === 0) {
                        groupSettings.reaction = false;
                        if (groupSettings.comment) page_info = { has_next_page: true }
                        if (groupSettings.comment) {
                            console.log("reactions are finished run comment");
                        }
                        else {
                            // chrome.runtime.sendMessage({ action: "close" })
                            const runningStatus = await helper.getDatafromStorage("runAction_post");
                            if (runningStatus === "running")
                                await helper.saveDatainStorage("runAction_post", "");
                            return;
                        };
                    }
                }
            }
        }
        // console.log("groupSettings.reaction ::: ", groupSettings.reaction);
        // console.log("groupSettings.reaction_type ::: ", groupSettings.reaction_type);
        if (!groupSettings.comment && !groupSettings.reaction) {
            // chrome.runtime.sendMessage({ action: "close" })
            const runningStatus = await helper.getDatafromStorage("runAction_post");
            if (runningStatus === "running")
                await helper.saveDatainStorage("runAction_post", "");
            return;
        }
    }
    if (page_info && page_info.has_next_page) {
        console.log("startStoringContactInfo");
        // console.log("contacts ::: ", contacts);
        if (!Dynamiccontacts || Dynamiccontacts.length === 0) {
            Dynamiccontacts = await getContactList(source, page_info ? (page_info.end_cursor ? page_info.end_cursor : null) : null, alternativeForComment);
            console.log("Dynamiccontacts :::---::: ", Dynamiccontacts);
            Dynamiccontacts = await arrangeArray(Dynamiccontacts, source);
            if (Dynamiccontacts && Dynamiccontacts.length === 0) {
                if (source !== "post") { }
                // window.location.reload();
                else
                    startStoringContactInfo(source, checkAndSaveAllData)
                // const runningStatus = await helper.getDatafromStorage("runAction_" + source);
                // if (runningStatus === "running")
                //     await helper.saveDatainStorage("runAction_" + source, "");
            }
            // console.log("Dynamiccontacts ::: ",  Dynamiccontacts);
            if (Dynamiccontacts && Dynamiccontacts.length > 0) contacts = [...contacts, ...Dynamiccontacts]
            else if (source !== "post" && Dynamiccontacts === undefined) chrome.runtime.sendMessage({ action: "close" })
            if (Dynamiccontacts) Dynamiccontacts.length = 0;
        }
    }
    else
        if (source !== "post") {
            window.location.reload();
        }
    console.log("contacts ::: ", contacts);
    if (contacts && contacts.length) {
        counter = 0;
        console.log("calling from from startStoringContactInfo");
        contactLength = contactLength + contacts.length;
        callback(source)
    }
    else {
        if (source !== "post") {
            counter = counter++;
            if (counter > 10)
                window.location.reload();
        }
        else {
            if (!groupSettings.comment && !groupSettings.reaction)
                chrome.runtime.sendMessage({ action: "close" })
        }
    }
}

const makePayload = async (source, cursor = null, alternative) => {
    if (shoudIstop) return;
    switch (source) {
        case "suggestions":
            fb_api_req_friendly_name = "FriendingCometSuggestionsRootQuery"
            if (cursor) {
                variables = { "count": 30, "cursor": cursor, "location": "FRIENDS_HOME_MAIN", "scale": 1.5 }
                doc_id = 7092620694160277
            }
            else {
                variables = { "scale": 1.5 };
                doc_id = 7176500739131881
            }
            break;
        case "groups":
            // console.log("sourceUrl ", sourceUrl);
            const groupID = sourceUrl.split('/')[4];
            // console.log("groupId ", groupID);
            fb_api_req_friendly_name = "GroupsCometMembersRootQuery"
            if (cursor) {
                variables = { "count": 10, "cursor": cursor, "groupID": groupID, "recruitingGroupFilterNonCompliant": false, "scale": 1.5, "id": groupID }
                doc_id = 7078313838944548
            }
            else {
                variables = { "groupID": groupID, "recruitingGroupFilterNonCompliant": false, "scale": 1.5 };
                doc_id = 7272763029445606
            }
            break;
        case "friends":
            fb_api_req_friendly_name = "ProfileCometAppCollectionListRendererPaginationQuery"
            if (cursor) {
                variables = { "count": 8, "cursor": cursor, "scale": 1, "search": null, "id": id }
                doc_id = 8023840227643650
            }
            else {
                doc_id = "25289405424040498"
                variables = { "collectionToken": null, "feedbackSource": 65, "feedLocation": "COMET_MEDIA_VIEWER", "scale": 1, "sectionToken": sessionToken, "userID": contactId, "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false }
            }
            break;
        case "post":
            fb_api_req_friendly_name = "CometUFIReactionsDialogTabContentRefetchQuery"
            console.log("cursor in make payload ::: ", cursor);
            if (cursor) {
                if (groupSettings.reaction) {
                    variables = { "count": 10, "cursor": cursor, "feedbackTargetID": feedbackTargetID, "reactionID": reactions[groupSettings.reaction_type[0]], "scale": 1, "id": feedbackTargetID }
                }
                if (groupSettings.comment && !groupSettings.reaction) {
                    if (alternativeForComment) {
                        doc_id = "8249779101722878"
                        variables = {
                            "commentsAfterCount": -1,
                            "commentsAfterCursor": page_info.end_cursor,
                            "commentsBeforeCount": null,
                            "commentsBeforeCursor": null,
                            "commentsIntentToken": "CHRONOLOGICAL_FILTERED_INTENT_V1",
                            "feedLocation": "PERMALINK",
                            "focusCommentID": null,
                            "scale": 1,
                            "useDefaultActor": false,
                            "id": feedbackTargetID
                        };
                    } else {
                        doc_id = "25897526923194259"
                        variables = {
                            "commentsAfterCount": -1,
                            "commentsAfterCursor": page_info.end_cursor,
                            "commentsBeforeCount": null,
                            "commentsBeforeCursor": null,
                            "commentsIntentToken": "RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1",
                            "feedLocation": "DEDICATED_COMMENTING_SURFACE",
                            "focusCommentID": null,
                            "scale": 1,
                            "useDefaultActor": false,
                            "id": feedbackTargetID
                        };
                    }
                }
            }
            else {
                if (groupSettings.reaction) {
                    doc_id = 7311826188912908
                    variables = { "count": 10, "cursor": null, "feedbackTargetID": feedbackTargetID, "reactionID": reactions[groupSettings.reaction_type[0]], "scale": 1, "id": feedbackTargetID }
                }
                if (groupSettings.comment && !groupSettings.reaction) {
                    if (alternativeForComment) {
                        doc_id = 8040492259346602;
                        variables = {
                            "commentsIntentToken": "CHRONOLOGICAL_FILTERED_INTENT_V1",
                            "feedLocation": "PERMALINK",
                            "feedbackSource": 110,
                            "focusCommentID": null,
                            "scale": 1,
                            "useDefaultActor": false,
                            "id": feedbackTargetID
                        }
                    } else {
                        doc_id = 7473574026083162;
                        variables = {
                            "commentsIntentToken": "RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1",
                            "feedLocation": "DEDICATED_COMMENTING_SURFACE",
                            "feedbackSource": 2,
                            "focusCommentID": null,
                            "scale": 1,
                            "useDefaultActor": false,
                            "id": feedbackTargetID
                        }
                    }
                }
            }
            break;
        default:
            break;
    }
    if (shoudIstop) return;
    const payload = {
        av: userID,
        __user: userID,
        __a: 1,
        __comet_req: 15,
        fb_dtsg: fbDtsg,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: fb_api_req_friendly_name,
        variables: JSON.stringify(variables),
        server_timestamps: true,
        doc_id: doc_id
    }

    // let getList = await getContactList(payload, source);
    // console.log(getList);
    return payload;
};

const getContactList = async (source, cursor = null, alternative = false) => {
    // console.log("cursor in get contact list ::: ", cursor);
    if (shoudIstop) return;
    const payload = await makePayload(source, cursor, alternative)
    if (shoudIstop) return;
    let memberlist = await fetch(
        "https://www.facebook.com/api/graphql/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "text/html,application/json",
                "x-fb-friendly-name": payload.fb_api_req_friendly_name,
            },
            body: helper.serialize(payload),
        }
    );
    memberlist = await memberlist.text();
    if (source === "post" && !groupSettings.reaction && groupSettings.comment) {
        if (memberlist.includes('{"label":'))
            memberlist = memberlist.split('{"label":')[0]
    }
    memberlist = await helper.makeParsable(memberlist)
    // console.log(memberlist);
    if (source === "suggestions") {
        memberlist = memberlist && memberlist.data && memberlist.data.viewer
        page_info = memberlist && memberlist.people_you_may_know && memberlist.people_you_may_know.page_info;
        memberlist = memberlist && memberlist.people_you_may_know && memberlist.people_you_may_know.edges;
        // console.log("memberlist ::: ", memberlist);
        // console.log("page_info ::: ", page_info);
    }
    if (source === "friends") {
        if (cursor) {
            memberlist = memberlist && memberlist.data && memberlist.data.node && memberlist.data.node;
            id = memberlist && memberlist.id
            memberlist = memberlist && memberlist.pageItems;
            page_info = memberlist && memberlist.page_info;
            memberlist = memberlist && memberlist.edges
        }
        else {
            memberlist = memberlist &&
                memberlist.data &&
                memberlist.data.node &&
                memberlist.data.node.all_collections &&
                memberlist.data.node.all_collections.nodes[0];
            id = memberlist && memberlist.id
            memberlist = memberlist &&
                memberlist.style_renderer &&
                memberlist.style_renderer.collection &&
                memberlist.style_renderer.collection.pageItems;
            page_info = memberlist && memberlist.page_info;
            memberlist = memberlist && memberlist.edges
        }
    }
    if (source === "groups") {
        if (cursor) {
            memberlist = memberlist &&
                memberlist.data &&
                memberlist.data.node &&
                memberlist.data.node.new_members

            page_info = memberlist &&
                memberlist.page_info;
            memberlist = memberlist &&
                memberlist.edges;
        }
        else {
            let memberArr = [];
            memberlist = memberlist &&
                memberlist.data &&
                memberlist.data.group
            page_info = memberlist &&
                memberlist.new_members &&
                memberlist.new_members.page_info;
            let member_edges = memberlist.group_admin_profiles.edges;
            if (!groupSettings.skip_admin) {
                memberArr = [...memberArr, ...member_edges]
            }
            memberArr = [...memberArr, ...memberlist.new_members.edges]
            if (memberlist.paginated_member_sections[0] && memberlist.paginated_member_sections[0].__typename === "GroupContributorsSection")
                memberArr = [...memberArr, ...memberlist.paginated_member_sections[0].group.contributors.edges]
            if (memberlist.paginated_member_sections[1] && memberlist.paginated_member_sections[1].__typename === "GroupThingsInCommonSection")
                memberArr = [...memberArr, ...memberlist.paginated_member_sections[1].group.group_member_discovery.edges]
            if (memberlist.paginated_member_sections[2] && memberlist.paginated_member_sections[2].__typename === "GroupThingsInCommonSection")
                memberArr = [...memberArr, ...memberlist.paginated_member_sections[2].group.group_member_discovery.edges]
            memberlist = memberArr
        }
    }
    if (source === "post") {
        if (!groupSettings.reaction && groupSettings.comment) {
            console.log("Comment is running");
            memberlist = memberlist && memberlist.data && memberlist.data.node &&
                memberlist.data.node.comment_rendering_instance_for_feed_location &&
                memberlist.data.node.comment_rendering_instance_for_feed_location.comments
            // console.log("memberlist ::: ", memberlist);
            page_info = memberlist && memberlist.page_info;
            console.log("page_info ::: ", page_info.end_cursor);
            memberlist = memberlist.edges;
            console.log("cursor ::: ", cursor);
            if (memberlist.length === 0) {
                alternativeForComment = true;
                await getContactList(source, cursor, true)
            }
        }
        if (groupSettings.reaction && !groupSettings.comment) {
            memberlist = memberlist && memberlist.data && memberlist.data.node;
            if (memberlist !== null) {
                memberlist = memberlist && memberlist.reactors;
                page_info = memberlist && memberlist.page_info;
                memberlist = memberlist.edges;
            } else {
                console.log("*is node = null ?????????????????");
                groupSettings.reaction_type.shift();
                page_info = { has_next_page: false };
                return;
            }
        }
        if (groupSettings.reaction && groupSettings.comment) {
            if (groupSettings.reaction_type.length === 0 && groupSettings.comment) {
                groupSettings.reaction = false;
                page_info = { has_next_page: true };
                return;
            } else {
                memberlist = memberlist && memberlist.data && memberlist.data.node;
                if (memberlist !== null) {
                    memberlist = memberlist && memberlist.reactors;
                    page_info = memberlist && memberlist.page_info;
                    memberlist = memberlist.edges;
                } else {
                    console.log(":is node = null ?????????????????");
                    groupSettings.reaction_type.shift();
                    page_info = { has_next_page: true };
                    return;
                }
            }
        }
    }
    // if (shoudIstop) return;
    // console.log("memberlist ::: ", memberlist);
    return memberlist;
};

const arrangeArray = async (response, source) => {
    if (shoudIstop) return;
    let arr = [], can_request = "";
    // console.log("response  --------------> ", response);
    if (!response || response.length === 0)
        return arr;
    for (let el in response) {
        if (shoudIstop) return;
        memberCount++;
        if (source === "suggestions") {
            can_request = response[el] && response[el].node && response[el].node.friendship_status;
        }
        if (source === "friends") {
            can_request = response[el] &&
                response[el].node &&
                response[el].node.actions_renderer &&
                response[el].node.actions_renderer.action &&
                response[el].node.actions_renderer.action.profile_owner &&
                response[el].node.actions_renderer.action.profile_owner.friendship_status;
        }
        if (source === "groups") {
            can_request = response[el] &&
                response[el].node &&
                response[el].node.user_type_renderer &&
                response[el].node.user_type_renderer.user &&
                response[el].node.user_type_renderer.user.friendship_status;
        }
        if (source === "post") {
            // console.log("here---------", groupSettings);
            // console.log("response[el] :::::::::: ", response[el].node);
            if (!groupSettings.reaction && groupSettings.comment) {
                can_request = response[el] &&
                    response[el].node &&
                    response[el].node.author.subscribe_status === "CAN_SUBSCRIBE" ? "CAN_REQUEST" : "CAN_SUBSCRIBE"
            }
            if (groupSettings.reaction) {
                can_request = response[el] &&
                    response[el].node &&
                    response[el].node.friendship_status
            }
        }
        if (can_request === "CAN_REQUEST") {
            if (source === "suggestions") {
                arr = [...arr, {
                    "friendFbId": response[el].node.id,
                    "friendName": response[el].node.name,
                    "friendProfileUrl": response[el].node.url,
                    "friendProfilePicture": response[el].node.profile_picture.uri,
                    "mutual_friend": response[el].node.social_context.text.split(" mutual ")[0] === "" ? 0 : response[el].node.social_context.text.split(" mutual ")[0],
                    "sourceUrl": window.location.href,
                    "sourceName": "Request from suggested friends.",
                    "profile_viewed": memberCount,
                    "finalSource": source
                }]
            }
            if (source === "friends") {
                arr = [...arr, {
                    "friendFbId": response[el].node.node.id,
                    "friendName": response[el].node.title.text,
                    "friendProfileUrl": response[el].node.url,
                    "friendProfilePicture": response[el].node.image.uri,
                    "mutual_friend": response[el].node.subtitle_text.text.split(" mutual ")[0] === "" ? 0 : response[el].node.subtitle_text.text.split(" mutual ")[0],
                    "sourceUrl": window.location.href,
                    "sourceName": "Request from friends of friend.",
                    "SourceName": "Friends of friends",
                    "time_saved": "",
                    "finalSource": source,
                    "profile_viewed": memberCount
                }]
            }
            if (source === "groups") {
                arr = [...arr, {
                    "friendFbId": response[el].node.id,
                    "friendName": response[el].node.name,
                    "friendProfileUrl": response[el].node.url,
                    "friendProfilePicture": response[el].node.profile_picture.uri,
                    "time_saved": "",
                    "sourceUrl": sourceUrl,
                    "sourceName": groupName,
                    "profile_viewed": memberCount,
                    "finalSource": source,
                    "groupKeywords": [response[el].node.name,
                    response[el].join_status_text ? response[el].join_status_text.text : "",
                    response[el].node.bio_text ? response[el].node.bio_text.text : "",
                    response[el].node.timeline_context_items ?
                        (response[el].node.timeline_context_items.edges ?
                            (response[el].node.timeline_context_items.edges[0] ?
                                (response[el].node.timeline_context_items.edges[0].node ? response[el].node.timeline_context_items.edges[0].node.title.text
                                    : "")
                                : "")
                            : "")
                        : ""
                    ]
                    // "mutual_friend" : response[el].node.social_context.text.split(" mutual ")[0] === "" ? 0 :  response[el].node.social_context.text.split(" mutual ")[0]
                }]
            }
            // console.log("source ----------- > ", source);
            if (source === "post") {
                // console.log(groupSettings);
                if (!groupSettings.reaction && groupSettings.comment) {
                    console.log("comment is on");
                    arr = [...arr, {
                        "friendFbId": response[el].node.author.id,
                        "friendName": response[el].node.author.name,
                        "friendProfileUrl": response[el].node.author.url,
                        "friendProfilePicture": response[el].node.author.profile_picture_depth_0.uri,
                        "groupKeywords": [response[el].node.author.name, response[el].node.body ? response[el].node.body.text : ""],
                        "sourceUrl": sourceUrl,
                        "profile_viewed": memberCount,
                        "time_saved": "",
                        "finalSource": source,
                        "sourceName": "Request from post comments"
                    }]
                }
                if (groupSettings.reaction) {
                    arr = [...arr, {
                        "friendFbId": response[el].node.id,
                        "friendName": response[el].node.name,
                        "friendProfileUrl": response[el].node.url,
                        "friendProfilePicture": response[el].node.profile_picture.uri,
                        "mutual_friend": response[el].node.mutual_friends.count,
                        "profile_viewed": memberCount,
                        "sourceUrl": sourceUrl,
                        "time_saved": "",
                        "finalSource": source,
                        "sourceName": "Request from post reaction"
                    }]
                }
            }
        }
        if (response.length - 1 == el) {
            setTimeout(() => {
                console.log("calling from from getContact List setTimeOut");
                startStoringContactInfo(source, checkAndSaveAllData)
            }, helper.getRandomInteger(1, 3) * 1000)
            return arr;
        }
    }
}

const checkAndSaveAllData = async (source) => {
    chrome.runtime.sendMessage({
        action: "showCount",
        paylaod: {
            queueCount: queueCount,
            memberCount: memberCount,
            source: source,
        },
    });
    await helper.saveDatainStorage("showCount", {
        queueCount: queueCount,
        memberCount: memberCount,
        source: source,
    });
    if (!groupSettings.gender_filter && !groupSettings.country_filter_enabled) {
        storeWouldbeFriends(contacts, source);
    } else {
        if (contacts.length > 0) {
            // console.log("memberContact ::: ", contacts[0]);
            await chrome.runtime.sendMessage({
                action: "getGenderCountryAndTier",
                name: contacts[0].friendName,
                source: source,
                memberContact: contacts[0],
            });
            contacts.shift();
            await checkAndSaveAllData(source);
        }
    }
};

const storeWouldbeFriends = async (facebook_contacts, source, contactNumber = null) => {
    console.log("contactNumber ::: ", contactNumber);
    const paylaod = {
        fb_user_id: userID,
        settingsId: groupSettings.settingsId,
        settingsType: groupSettings.settings_type,
        facebook_contacts: [...facebook_contacts],
    };

    console.log("paylaod fpr req to store it in FRQS ------> ", paylaod);
    if (contactNumber) {
        contacts.splice(0, contactNumber)
        contactsWithGenderDetails.splice(0, contactNumber)
    } else {
        contacts.length = 0;
        contactsWithGenderDetails.length = 0;
    }
    const respOfFRQS = await common.storeInFRQS(paylaod);
    console.log("queue count <<<<<<<<<<<<<<<<<<<<<<<<<<<---------------------------- ", queueCount, typeof queueCount)

    console.log("respOfFRQS ::: ", respOfFRQS, respOfFRQS.record_count, typeof respOfFRQS.record_count)
    const recordCount = respOfFRQS ? (respOfFRQS.record_count !== undefined || respOfFRQS.record_count !== null ? respOfFRQS.record_count : 0) : 0;
    queueCount = queueCount + recordCount;
    console.log("queue count ---------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>> ", queueCount, typeof queueCount)
    if (respOfFRQS.record_count > 0) {
        chrome.runtime.sendMessage({ action: "fr_queue_success" })
        chrome.runtime.sendMessage({
            action: "showCount",
            paylaod: {
                queueCount: queueCount,
                memberCount: memberCount,
                source: source,
            },
        });

        await helper.saveDatainStorage("showCount", {
            queueCount: queueCount,
            memberCount: memberCount,
            source: source,
        });
    }

    if (!contacts || contacts.length === 0) {
        if (!page_info || !page_info.has_next_page) {
            if (source !== "post") {
                // if (!page_info || !page_info.has_next_page) {
                await helper.saveDatainStorage("showCount", { queueCount: 0, memberCount: 0, source: source })
                shoudIstop = true;
                window.location.reload();
            }
            else {
                console.log("post and contacts ::::::::::: ", contacts, contactsWithGenderDetails);
                if (contactsWithGenderDetails.length === 0) {
                    if (contacts.length === 0 && Dynamiccontacts.length === 0) {
                        if (groupSettings.comment && !groupSettings.reaction) {
                            if (page_info && page_info.has_next_page === false) {
                                chrome.runtime.sendMessage({ action: "close" })
                                const runningStatus = await helper.getDatafromStorage("runAction_post");
                                if (runningStatus === "running")
                                    await helper.saveDatainStorage("runAction_post", "");
                                return;
                            }
                        }
                        if (groupSettings.reaction) {
                            if (page_info && page_info.has_next_page === false) {
                                if (groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length > 0) {
                                    console.log("shifting of react type.................");
                                    groupSettings.reaction_type.shift();
                                    if (groupSettings.reaction_type.length === 0) {
                                        groupSettings.reaction = false;
                                        // if (groupSettings.comment) page_info = { has_next_page: true }
                                        if (groupSettings.comment) {
                                            console.log("reactions are finished run comment");
                                            page_info = { has_next_page: true }
                                        }
                                        else {
                                            chrome.runtime.sendMessage({ action: "close" })
                                            return;
                                        }
                                    }
                                    else {
                                        console.log("next reactions ::::: ", groupSettings.reaction_type);
                                        page_info = { has_next_page: true }
                                    }
                                }
                                else if (groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length === 0) {
                                    groupSettings.reaction = false;
                                    if (groupSettings.comment) page_info = { has_next_page: true }
                                    if (groupSettings.comment) {
                                        console.log("reactions are finished run comment");
                                    }
                                    else {
                                        chrome.runtime.sendMessage({ action: "close" })
                                        const runningStatus = await helper.getDatafromStorage("runAction_post");
                                        if (runningStatus === "running")
                                            await helper.saveDatainStorage("runAction_post", "");
                                        return;
                                    };
                                }
                            }

                        }
                        console.log("groupSettings.reaction ::: ", groupSettings.reaction);
                        console.log("groupSettings.reaction_type ::: ", groupSettings.reaction_type);
                        if (!groupSettings.comment && !groupSettings.reaction) {
                            chrome.runtime.sendMessage({ action: "close" })
                            const runningStatus = await helper.getDatafromStorage("runAction_post");
                            if (runningStatus === "running")
                                await helper.saveDatainStorage("runAction_post", "");
                            return;
                        }
                    }
                }
            }
        }
    }
};






// { "commentsIntentToken": "RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1",
// "feedLocation": "DEDICATED_COMMENTING_SURFACE",
// "feedbackSource": 110,
// "focusCommentID": null,
// "scale": 1,
// "useDefaultActor": false,
// "id": "ZmVlZGJhY2s6Nzg3NDU3NTUzOTI1OTM1NA==" }
// 7473574026083162

// data.node.comment_rendering_instance_for_feed_location.comments.edges
// [0].author.name
// [0].author.subscribe_status
// [0].author.profile_picture_depth_0.uri
// [0].author.url
// [0].author.id
// [0].body.text


// {
// "commentsAfterCount":-1,
// "commentsAfterCursor":"AQHR5oNvJC59hMxpMqaiAyC9pEc4s8bf17vzDkGp6QzrwJTotHUYMnZTxuJwqTPkk10p8E4cl0qunXvQAVnmI14qrQ",
// "commentsBeforeCount":null,
// "commentsBeforeCursor":null,
// "commentsIntentToken":"RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1",
// "feedLocation":"DEDICATED_COMMENTING_SURFACE",
// "focusCommentID":null,
// "scale":1,
// "useDefaultActor":false,
// "id":"ZmVlZGJhY2s6MTEzODI5NzgzMDYyNTY3OQ=="
// }

// data.node.comment_rendering_instance_for_feed_location.comments.edges[0].author.profile_picture_depth_0.uri


//aria-label="Embed Post"