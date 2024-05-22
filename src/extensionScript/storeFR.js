// import selectors from "./selector";
import selectors from "./selector";
import common from "./commonScript";
import helper from "./helper";
// import common from "./commonScript";
// import { settingsType } from "../config/config"
// const $ = require("jquery");
let fb_api_req_friendly_name, variables, doc_id, fbDtsg, userID, id, contactId;
let memberContact = {}, 
    contacts = [], 
    page_info={}, 
    memberCount = 0, 
    queueCount = 0, 
    shoudIstop = false,
    sessionToken = "",
    feedbackTargetID = "",
    groupSettings = {},
    groupName ="",
    profileMysettings = {};
const reactions = {
        "like":"1635855486666999", 
        "love":"1678524932434102", 
        "care":"613557422527858", 
        "haha":"115940658764963", 
        "angry":"444813342392137",
        "wow":"478547315650144",
        "sad":"908563459236466"
    };
    const HEADERS = {
        "Content-Type": "application/json",
    };

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("----------------------------***************-----------------------------------------", request);
    switch (request.action) {
        case "reSendFriendRequestInGroup":
            shoudIstop = false;
        case "start" : 
            console.log("Lest start -----------------");
            if(request.action === "start"){
                console.log("starting-----------------------------------------------------------------");
                await helper.saveDatainStorage("showCount", {queueCount : 0, memberCount : 0, source: request.source })
            }
            // set dtsg userid
            const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
            fbDtsg = fbTokenAndId.fbDtsg;
            userID = fbTokenAndId.userID;

            // group setting assigned
            groupSettings = request.response;
            console.log("groupSettings ::: ", groupSettings);

            // get advance settings
            HEADERS.authorization = await helper.getDatafromStorage("fr_token"); 
            let reqBody = {
                "token": HEADERS.authorization,
                "fbUserId": userID
            }
            let settingResp = await fetch(process.env.REACT_APP_SETTING_API, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(reqBody)
            })
            profileMysettings = await settingResp.json();
            profileMysettings = profileMysettings && profileMysettings.data ? profileMysettings.data[0] : {};
            console.log("profileMysettings ::: ", profileMysettings);

            // get important info from DOM SCRIPT
            if(request.source === "friends"){
                const content = document.body.innerHTML;
                const match = content.match(/"userID":"(\d+)"/);
                if (match) {
                    contactId = match[0].split(':')[1];
                    contactId = contactId.length > 0 ? contactId.replaceAll(`"`, "") : "NA";
                    console.log(contactId);
                }
                let match_token = content.match(/"collection":{"app_section":{"id":"[^},]*\}/);
                console.log(match_token)
                if (match_token) {
                    // console.log(match_token[0]);
                    sessionToken = match_token[0];
                    sessionToken = `{${sessionToken}}}`;
                    sessionToken = JSON.parse(sessionToken);
                    sessionToken = sessionToken.collection.app_section.id
                    // console.log(sessionToken);
                }
            }
            if(request.source === "groups"){
                const groupNameInterval = setInterval(() => {
                    const groupNameDiv = document.querySelector(selectors.main_component).querySelector(selectors.group_name)
                    // console.log("groupNameDiv ::: ", groupNameDiv);
                    if(groupNameDiv !== null){
                    clearInterval(groupNameInterval)
                    groupName = groupNameDiv.textContent;
                    // console.log("group name ::: ", groupName);
                    }
                },500)
            }
            if(request.feedbackTargetID)
                if(request.source === "post"){
                    feedbackTargetID = request.feedbackTargetID
                }

            // start fetching
            startStoringContactInfo( request.source)
            break;
        case "getGenderCountryAndTier" : 
            memberContact = {...memberContact, gender : request.responsePayload.gender, country : request.responsePayload.countryName, tier : request.responsePayload.Tiers}
            // console.log("memberContact ::: ", memberContact);
            validatePayload(memberContact, request.source);
            break;
        case "getFeedbackTargetID" : 
            if(request.source === "post"){
                const content = document.body.innerHTML;
                let match_token = content.match(/{"__typename":"DefaultCometUFISummaryAndActionsRenderer"\,"feedback":{"id":"[^,]*,/);
                console.log(match_token);
                if(match_token == null){
                    // console.log("-----------------",match_token);
                    match_token = content.match(/,"feedback":{"id":"[^,]*,/);
                                match_token = match_token[0].replaceAll(",", "")
                                match_token = `{${match_token}}}`
                                match_token = JSON.parse(match_token);
                                console.log(match_token);
                                feedbackTargetID = match_token.feedback.id;
                                console.log(feedbackTargetID);
                }
                else{
                    // console.log("55555555555555555555",match_token);
                        console.log(match_token[0]);
                        match_token = match_token[0].slice(0, match_token.length - 2 );
                        match_token = `${match_token}}}`
                        console.log(match_token);
                        match_token = match_token
                        match_token = JSON.parse(match_token);
                        console.log(match_token);
                        feedbackTargetID = match_token.feedback.id;
                        console.log(feedbackTargetID);
                }
                sendResponse(feedbackTargetID)
            }
            break;
        case "stop":
            await helper.saveDatainStorage("showCount", {queueCount : 0, memberCount : 0, source: request.source })
            shoudIstop = true;
            if(request.source !== "post")
                window.location.reload();
            break;
        case "pause":
            shoudIstop = true;
            break;
        default : 
            break;
    }
});

const startStoringContactInfo = async ( source ) => {
    if(shoudIstop) return;
    if(source === "post"){
        console.log("post and contacts ::::::::::: ", contacts);
        if(contacts.length === 0){
            if(groupSettings.comment && !groupSettings.reaction){
                if(page_info && page_info.has_next_page === false) return;
            }
            if(groupSettings.reaction){
                if(page_info && page_info.has_next_page === false) {
                    if(groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length > 0){
                        console.log("shifting og react type.................");
                        groupSettings.reaction_type.shift();
                        if(groupSettings.reaction_type.length === 0){
                            groupSettings.reaction = false;
                            page_info = {};
                            if(groupSettings.comment){
                                console.log("reactions are finished run comment");
                                startStoringContactInfo(source);
                                return
                            }
                            else return;
                        }
                    }
                    else if(groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length === 0){
                        groupSettings.reaction = false;
                        page_info = {};
                        if(groupSettings.comment){
                            console.log("reactions are finished run comment");
                            startStoringContactInfo(source);
                            return
                        }
                        else return;
                    }
                }
            }
        }
        console.log("groupSettings.reaction ::: ", groupSettings.reaction);
        console.log("groupSettings.reaction_type ::: ", groupSettings.reaction_type);
        if(!groupSettings.comment && !groupSettings.reaction)
            return;
        // if(!groupSettings.reaction)
        //     return;
        // else if(groupSettings.reaction && groupSettings.reaction_type && groupSettings.reaction_type.length === 0)
        //     return;
    }
    console.log("groupSettings.reaction ::: ", groupSettings.reaction);
    console.log("groupSettings.comment ::: ", groupSettings.comment);
    console.log("groupSettings.reaction_type ::: ", groupSettings.reaction_type);
    console.log("startStoringContactInfo");
    console.log("contacts ::: ", contacts);
    if(contacts.length === 0){
        contacts = await getContactList( source, page_info ? (page_info.end_cursor ? page_info.end_cursor : null) : null );
        console.log("contacts :::---::: ", contacts);
        contacts = await arrangeArray(contacts, source);
    }
    // console.log("contacts ::: ", contacts);
    if(page_info && !page_info.has_next_page && contacts && !contacts.length)
        return;
    proceedOneByOne( source )
}

const makePayload = async ( source, cursor = null) => {
    if(shoudIstop) return;
    switch (source){
        case "suggestions" : 
            fb_api_req_friendly_name = "FriendingCometSuggestionsRootQuery"
            if(cursor){
                variables = {"count":30, "cursor":cursor, "location":"FRIENDS_HOME_MAIN", "scale":1.5}
                doc_id = 7092620694160277
            }
            else{
                variables = {"scale":1.5};
                doc_id = 7176500739131881
            }
            break;
        case "groups" : 
            const groupID = window.location.href.split('/')[4];
            fb_api_req_friendly_name = "GroupsCometMembersRootQuery"
            if(cursor){
                variables = {"count":10,"cursor":cursor,"groupID":groupID,"recruitingGroupFilterNonCompliant":false,"scale":1.5,"id":groupID}
                doc_id = 7078313838944548
            }
            else{
                variables = {"groupID":groupID,"recruitingGroupFilterNonCompliant":false,"scale":1.5};
                doc_id = 7272763029445606
            }
            break ;
        case "friends" : 
            fb_api_req_friendly_name = "ProfileCometAppCollectionListRendererPaginationQuery"
            if(cursor){
                variables = {"count":8,"cursor":cursor,"scale":1,"search":null,"id":id}
                doc_id = 8023840227643650
            }
            else{
                doc_id = "25289405424040498"
                variables = {"collectionToken":null,"feedbackSource":65,"feedLocation":"COMET_MEDIA_VIEWER","scale":1,"sectionToken":sessionToken,"userID":contactId,"__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider":false}
            }
            break;
            case "post" : 
                fb_api_req_friendly_name = "CometUFIReactionsDialogTabContentRefetchQuery"
                if(cursor){
                    if(groupSettings.reaction){
                        variables = {"count":10,"cursor":cursor,"feedbackTargetID":feedbackTargetID,"reactionID":reactions[groupSettings.reaction_type[0]],"scale":1,"id":feedbackTargetID}
                    }
                }
                else{
                    if(groupSettings.reaction){
                        doc_id = 7311826188912908
                        variables = {"count":10,"cursor":null,"feedbackTargetID":feedbackTargetID,"reactionID":reactions[groupSettings.reaction_type[0]],"scale":1,"id":feedbackTargetID}
                    }
                    if(groupSettings.comment && !groupSettings.reaction){
                        doc_id = 7126796424099232;
                        variables = {"commentsAfterCount":-1,"commentsBeforeCount":null,"commentsBeforeCursor":null,"commentsIntentToken":null,"feedLocation":"COMET_MEDIA_VIEWER","focusCommentID":null,"scale":1,"useDefaultActor":false,"id":feedbackTargetID};
                    }
                }
                break;
        default : 
            break;
    }
    if(shoudIstop) return;
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

const getContactList = async( source, cursor = null ) => {
    if(shoudIstop) return;
    const payload = await makePayload( source, cursor)
    if(shoudIstop) return;
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
    // console.log(memberlist);
    // if(memberlist.includes(""))
    if(shoudIstop) return;
    memberlist = await helper.makeParsable(memberlist)
    console.log(memberlist);
    if (source === "suggestions"){
        memberlist = memberlist && memberlist.data && memberlist.data.viewer
        page_info = memberlist && memberlist.people_you_may_know && memberlist.people_you_may_know.page_info;
        memberlist = memberlist && memberlist.people_you_may_know && memberlist.people_you_may_know.edges;
        // console.log("memberlist ::: ", memberlist);
    }
    if(source === "friends"){
        if(cursor){
            memberlist = memberlist && memberlist.data && memberlist.data.node && memberlist.data.node;
            id = memberlist && memberlist.id
            memberlist = memberlist && memberlist.pageItems;
            page_info = memberlist && memberlist.page_info;
            memberlist = memberlist && memberlist.edges
        }
        else{
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
    if(source === "groups"){
        if(cursor){
            memberlist = memberlist && 
                        memberlist.data && 
                        memberlist.data.node &&
                        memberlist.data.node.new_members
                        
            page_info = memberlist && 
                memberlist.page_info;
            memberlist = memberlist && 
                memberlist.edges;
        }
        else{
            let memberArr = [];
            memberlist = memberlist && 
                        memberlist.data && 
                        memberlist.data.group
            page_info = memberlist && 
                        memberlist.new_members && 
                        memberlist.new_members.page_info;
            if(!groupSettings.skip_admin){
                memberArr = [...memberArr, memberlist.group_admin_profiles.edges]
            }
            memberArr = [...memberArr, ...memberlist.new_members.edges]
            if(memberlist.paginated_member_sections[0] && memberlist.paginated_member_sections[0].__typename === "GroupContributorsSection")
                memberArr = [...memberArr, ...memberlist.paginated_member_sections[0].group.contributors.edges]            
            if(memberlist.paginated_member_sections[1] && memberlist.paginated_member_sections[1].__typename === "GroupThingsInCommonSection")
                memberArr = [...memberArr, ...memberlist.paginated_member_sections[1].group.group_member_discovery.edges]
            if(memberlist.paginated_member_sections[2] && memberlist.paginated_member_sections[2].__typename === "GroupThingsInCommonSection")
                memberArr = [...memberArr, ...memberlist.paginated_member_sections[2].group.group_member_discovery.edges]
            memberlist = memberArr
        }
    }
    if(source === "post"){
        if(!groupSettings.reaction && groupSettings.comment){
            memberlist = memberlist && memberlist.data && memberlist.data.node &&
                        memberlist.data.node.comment_rendering_instance_for_feed_location && 
                        memberlist.data.node.comment_rendering_instance_for_feed_location.comments
            
            page_info = memberlist && memberlist.page_info;
            memberlist = memberlist.edges
        }
        if(groupSettings.reaction && !groupSettings.comment){
            memberlist = memberlist && memberlist.data && memberlist.data.node 
            if(memberlist !== null){
                memberlist = memberlist && memberlist.reactors;
                page_info = memberlist && memberlist.page_info;
                memberlist = memberlist.edges
            }
            else{
                console.log("*is node = null ?????????????????");
                groupSettings.reaction_type.shift();
                startStoringContactInfo( source );
                return;
            }
        }
        if(groupSettings.reaction && groupSettings.comment){
            if(groupSettings.reaction_type.length === 0  && groupSettings.comment){
                groupSettings.reaction = false;
                startStoringContactInfo( source );
                return;
            }else{
                memberlist = memberlist && memberlist.data && memberlist.data.node 
                if(memberlist !== null){
                    memberlist = memberlist && memberlist.reactors;
                    page_info = memberlist && memberlist.page_info;
                    memberlist = memberlist.edges
                }
                else{
                    console.log(":is node = null ?????????????????");
                    groupSettings.reaction_type.shift();
                    startStoringContactInfo( source );
                    return;
                }
            }
        }
    }
    if(shoudIstop) return;
    console.log("memberlist ::: ", memberlist);
    return memberlist;
}

const arrangeArray = async (response, source) => {
    if(shoudIstop) return;
    let arr = [], can_request = "";
    console.log("response  --------------> ", response);
    for(let el in response){
        if(shoudIstop) return;
        memberCount++;
        if(source === "suggestions"){
            can_request = response[el] && response[el].node && response[el].node.friendship_status;
        }
        if(source === "friends"){
            can_request = response[el] && 
                        response[el].node && 
                        response[el].node.actions_renderer && 
                        response[el].node.actions_renderer.action && 
                        response[el].node.actions_renderer.action.profile_owner && 
                        response[el].node.actions_renderer.action.profile_owner.friendship_status;
        }
        if(source === "groups"){
            can_request = response[el] && 
                        response[el].node && 
                        response[el].node.user_type_renderer && 
                        response[el].node.user_type_renderer.user && 
                        response[el].node.user_type_renderer.user.friendship_status;
        }
        if(source === "post"){
            // console.log("here---------", groupSettings);
            // console.log("response[el] :::::::::: ", response[el].node);
            if(!groupSettings.reaction && groupSettings.comment){
                can_request = response[el] && 
                            response[el].node && 
                            response[el].node.author.subscribe_status === "CAN_SUBSCRIBE" ? "CAN_REQUEST" : "CAN_SUBSCRIBE"
            }
            if(groupSettings.reaction){
            can_request = response[el] && 
                        response[el].node && 
                        response[el].node.friendship_status
            }
        }
        if(can_request === "CAN_REQUEST"){
            if(source === "suggestions"){
                arr = [...arr, {
                    "friendFbId": response[el].node.id,
                    "friendName": response[el].node.name,
                    "friendProfileUrl": response[el].node.url,
                    "friendProfilePicture": response[el].node.profile_picture.uri,
                    "mutual_friend" : response[el].node.social_context.text.split(" mutual ")[0] === "" ? 0 :  response[el].node.social_context.text.split(" mutual ")[0]
                    }]
            }
            if(source === "friends"){
                arr = [...arr, {
                    "friendFbId": response[el].node.node.id,
                    "friendName": response[el].node.title.text,
                    "friendProfileUrl": response[el].node.url,
                    "friendProfilePicture": response[el].node.image.uri,
                    "mutual_friend" : response[el].node.subtitle_text.text.split(" mutual ")[0] === "" ? 0 :  response[el].node.subtitle_text.text.split(" mutual ")[0]
                }]
            }
            if(source === "groups"){
                arr = [...arr, {
                    "friendFbId": response[el].node.id,
                    "friendName": response[el].node.name,
                    "friendProfileUrl": response[el].node.url,
                    "friendProfilePicture": response[el].node.profile_picture.uri,
                    "groupKeywords":[response[el].node.name, 
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
            if(source === "post"){
                // console.log(groupSettings);
                if(!groupSettings.reaction && groupSettings.comment){
                    console.log("comment is on");
                    arr = [...arr, {
                        "friendFbId": response[el].node.author.id,
                        "friendName": response[el].node.author.name,
                        "friendProfileUrl": response[el].node.author.url,
                        "friendProfilePicture": response[el].node.author.profile_picture_depth_0.uri,
                        "groupKeywords":[response[el].node.author.name, response[el].node.body.text]
                    }]
                }
                if(groupSettings.reaction){
                    arr = [...arr, {
                        "friendFbId": response[el].node.id,
                        "friendName": response[el].node.name,
                        "friendProfileUrl": response[el].node.url,
                        "friendProfilePicture": response[el].node.profile_picture.uri,
                        "mutual_friend" : response[el].node.mutual_friends.count
                    }]
                }
            }
        }
        if(response.length - 1 == el){
            return arr;
        }
    }
}

const proceedOneByOne = async ( source ) => {
    if(shoudIstop) return;
    if(contacts.length === 0) startStoringContactInfo( source )
    else{
        console.log("contacts ::::::::::::::::::::::: ", contacts[0]);
        const isAvailable = await common.checkAvailability(userID, contacts[0].friendFbId)
        chrome.runtime.sendMessage({action : "showCount", paylaod : {queueCount : queueCount, memberCount : memberCount, source: source }})
        await helper.saveDatainStorage("showCount", {queueCount : queueCount, memberCount : memberCount, source: source })
        // console.log("isAvailable :::: ", isAvailable);
        if(contacts.length > 0){
            if(isAvailable){
                contacts.shift();
                console.log("shifted contacts : ", contacts, page_info);
                startStoringContactInfo( source );
            }
            else{
                memberContact = contacts[0];
                memberContact = {...memberContact, "fb_user_id": userID, "finalSource": source}
                await chrome.runtime.sendMessage({action: "getGenderCountryAndTier", name: contacts[0].friendName, source : source});
                contacts.shift();
            }
        }
    }
}

const validatePayload = async ( payload, source ) => {
    // console.log(payload);
    if(shoudIstop) return;
    let isEligible = true
    if (isEligible && groupSettings.gender_filter) {
        if (
            payload.gender.toLocaleLowerCase() !==
          groupSettings.gender_filter_value.toLocaleLowerCase()
        ) {
          isEligible = false;
        }
    }
    console.log("isEligible after gender checking::: ", isEligible);
    if(shoudIstop) return;
    if (isEligible && groupSettings.country_filter_enabled) {
        if (groupSettings.country_filter) {
          if (!groupSettings.country_filter_value.includes(payload.country))
            isEligible = false;
          // groupMemberInfo = { ...groupMemberInfo, isEligible: false };
        }
        if (groupSettings.tier_filter) {
            console.log("payload.tier :::::::::::::::: ", payload.tier.toLocaleLowerCase());
          if (groupSettings.tier_filter_value.toLocaleLowerCase() !== payload.tier.toLocaleLowerCase()) {
            console.log("payload.tier :::::::::::::::: ", payload.tier.toLocaleLowerCase());
            isEligible = false;
          }
        }
    }
    console.log("isEligible after country tier checking::: ", isEligible);
    if(shoudIstop) return;
    if(isEligible){
        if(groupSettings.lookup_for_mutual_friend){
            if(groupSettings.lookup_for_mutual_friend_condition === "<"){
                if(payload.mutual_friend > groupSettings.mutual_friend_value){
                    isEligible = false;
                }
            }else{
                if(payload.mutual_friend < groupSettings.mutual_friend_value){
                    isEligible = false;
                }
            }
        }
    }


    if(shoudIstop) return;
    console.log("isEligible after mutual friend checking::: ", isEligible);
    if(isEligible && (groupSettings.keyword || groupSettings.negative_keyword)){
        let isNegetivekeyWordMatched = false,
        iskeyWordMatched = false
        if(payload.groupKeywords.length > 0){
            payload.matchedKeyword = ""
            payload.groupKeywords && payload.groupKeywords.forEach((elem, i) => {
                if (groupSettings.negative_keyword) {
                    groupSettings.selected_negative_keywords.forEach((el) => {
                    // console.log("NegetiveKeywordsParam ::: ", el)
                    if (elem.toLocaleLowerCase().includes(el.toLocaleLowerCase().trim())) {
                        isNegetivekeyWordMatched = true;
                        // console.log(groupMemberInfo.memberName + "'s work decription is matching with negetive keyword.")
                        isEligible = false;
                    }
                    });
                }
                
                if (groupSettings.keyword && !isNegetivekeyWordMatched) {
                groupSettings.selected_keywords.forEach((el) => {
                    if (elem.toLocaleLowerCase().includes(el.toLocaleLowerCase().trim())) {
                    iskeyWordMatched = true;
                        payload.matchedKeyword = payload.matchedKeyword.length===0 ? el.trim() : payload.matchedKeyword + "," + el.trim();
                    }
                });
                }
            })
            
            if (groupSettings.keyword && !iskeyWordMatched) {
                isEligible = false;
            }
        }
        else{
            isEligible = false;
        }
    }
    console.log("isEligible after keyword checking::: ", isEligible);
    
    // ----------------- START CHECKING ADVANCE SETTINGS-------------------------
    if(shoudIstop) return;
    if (isEligible && profileMysettings && profileMysettings.dont_send_friend_requests_prople_ive_been_friends_with_before){
        const isExFriends = await helper.fetchExFriends(userID, payload.friendFbId)
        // console.log("isExFriends ::: ", isExFriends)
        if(isExFriends)
          isEligible = false;
    }
    console.log("isEligible after ex friend checking::: ", isEligible);


    if(shoudIstop) return;
    if (isEligible && profileMysettings && 
        (profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected 
        || profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected)){
          const isRejectedFriends = await helper.fetchRejectedFriends(userID, payload.friendFbId)
        if(profileMysettings.dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected ){
          if(isRejectedFriends && isRejectedFriends.isRejected && !isRejectedFriends.is_incoming)
            isEligible = false;
        }
        if(profileMysettings.dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected ){
          if(isRejectedFriends && isRejectedFriends.isRejected && isRejectedFriends.is_incoming)
            isEligible = false;
        }
    }
    console.log("isEligible after rejected checking::: ", isEligible);


    if(shoudIstop) return;
    if (isEligible && profileMysettings && profileMysettings.avoid_sending_friend_request_to_restricted_people){
        const isRestricted = await common.fetchRestrictedFbProfile({ "facebookUserId":userID, "peopleFbId":payload.friendFbId});
        console.log("isRestricted ::: ", isRestricted)
        if(isRestricted)
          isEligible = false;
    }
    console.log("isEligible after restrcted checking::: ", isEligible);
        
      //check for user re-friending  
    if(shoudIstop) return;
    if (isEligible) {
        payload.refriending = false;
        if (profileMysettings && profileMysettings.re_friending) {
          //console.log("came to matyereddd");
          if (payload.matchedKeyword && payload.matchedKeyword.length > 0) { //case: if matched keyword is not empty then check for re-friending
            if ((profileMysettings.re_friending_settings[0] && 
                  profileMysettings.re_friending_settings[0].use_keyword) 
                  && profileMysettings.re_friending_settings[0].keywords.length > 0) {
              //case: matched keyword is not empty and re_friending_keywords is not empty then check for key match
              //console.log("started checking of keys for re-fr status:")
              for (const keyw of profileMysettings.re_friending_settings[0].keywords.split(",")) {
                // console.log("keyw ::: ", keyw)
                if (keyw.trim().length > 0)
                  if (payload.matchedKeyword.toLocaleLowerCase().includes(helper.trimSpecialCharacters(keyw.toLocaleLowerCase()))) {
                    payload.refriending = true;
                    break;
                  }
              }
            } else { //case: matched keyword is not empty and re_friending_keywords is empty then check for re-friending
              payload.refriending = true;
            }
          } else { // case: if matched keyword is empty then check for re-friending
            if ((profileMysettings.re_friending_settings[0] && 
                  profileMysettings.re_friending_settings[0].use_keyword) 
                  && profileMysettings.re_friending_settings[0].keywords.length > 0) {
              //case: if matched keyword is empty but re_friending_keywords is there
              payload.refriending = false;
            } else { //case: if matched keyword is empty and re_friending_keywords is empty
              payload.refriending = true;
            }
          }
        }
        if(payload.refriending && (profileMysettings && profileMysettings.re_friending_settings[0])){
            payload = {
              ...payload,
                "refriending_pending_days":profileMysettings.re_friending_settings[0].remove_pending_friend_request_after,
                "refriending_max_attempts":profileMysettings.re_friending_settings[0].instantly_resend_friend_request,
                "refriending_attempt":1,
            }
          }
    }
    console.log("isEligible after refriending checking::: ", isEligible);
    
    if(shoudIstop) return;
    if(isEligible){
        payload = {
            ...payload,
            "settingsId": groupSettings.settingsId,
            "sourceUrl": window.location.href,
            "sourceName": source,
            "refriending_used_keyword" :"",
            "profile_viewed" :memberCount,
            "added-to-friend-queue": queueCount,
            "time_saved": "",
            "send_message_when_friend_request_sent": groupSettings.send_message_when_friend_request_sent,
            "send_message_when_friend_request_sent_message_group_id": groupSettings.send_message_when_friend_request_sent_message_group_id,
            "send_message_when_friend_request_accepted": groupSettings.send_message_when_friend_request_accepted,
            "send_message_when_friend_request_accepted_message_group_id": groupSettings.send_message_when_friend_request_accepted_message_group_id,
            "settings_type" : groupSettings.settings_type
        }
        if(source === "post"){
            const postUrl = await helper.getDatafromStorage('postUrl');
            payload.sourceUrl = postUrl;
            payload.sourceName = "Request from post."
        }
        if(source === "suggestions"){
            payload.sourceName = "Request from suggested friends."
        }
        if(source === "friends"){
            payload.sourceName = "Request from friends of friend."
        }
        if(source === "groups"){
            payload.sourceName = groupName
        }
        // console.log(payload);
        const response = await common.storeInFRQS(payload);
        queueCount++;
        chrome.runtime.sendMessage({action : "showCount", paylaod : {queueCount : queueCount, memberCount : memberCount, source: source }})
        await helper.saveDatainStorage("showCount", {queueCount : queueCount, memberCount : memberCount, source: source })
    }
    // console.log("response ::: ", response);
    if(shoudIstop) return;
    await helper.sleep(15*1000)
    console.log("----------------------------------------------------------------------------------------");
    if(page_info.has_next_page)
        startStoringContactInfo( source );
}



// {"count":10,"cursor":null,"feedbackTargetID":"ZmVlZGJhY2s6MjczODkyNDgyMjU0MzAz","reactionID":"1678524932434102","scale":1,"id":"ZmVlZGJhY2s6MjczODkyNDgyMjU0MzAz"}
// {"count":10,"cursor":null,"feedbackTargetID":"ZmVlZGJhY2s6MjczODkyNDgyMjU0MzAz","reactionID":"1635855486666999","scale":1,"id":"ZmVlZGJhY2s6MjczODkyNDgyMjU0MzAz"}
// {"feedbackTargetID":"ZmVlZGJhY2s6MjM4OTM5ODEyNDE2MjM3","scale":1}
// doc_id = 7346782002075872 // all


// comments
// {"commentsAfterCount":-1,"commentsAfterCursor":"AQHR935ZrGGYfj0y7BcO8upy7SGFKdF33BhfeaulM662mTLjl2Vi3WQ8AM2eX7R4m4OdJNX2PBBkV_Zzo2ruftE0xg","commentsBeforeCount":null,"commentsBeforeCursor":null,"commentsIntentToken":null,"feedLocation":"COMET_MEDIA_VIEWER","focusCommentID":null,"scale":1,"useDefaultActor":false,"id":"ZmVlZGJhY2s6MTYwNTExMTE2MzY2ODQ5MQ=="}
// doc_id = 7126796424099232


//post
// "feedbackSource":65,"feedLocation":"COMET_MEDIA_VIEWER","focusCommentID":null,"isMediaset":true,"mediasetToken":"a.209864858148346","nodeID":"457450496723113","privacySelectorRenderLocation":"COMET_MEDIA_VIEWER","renderLocation":"permalink","scale":1,"useDefaultActor":false,"useHScroll":false,"__relay_internal__pv__CometIsAdaptiveUFIEnabledrelayprovider":false,"__relay_internal__pv__CometUFIShareActionMigrationrelayprovider":true,"__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider":false,"__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider":false}
// split(`{"label"`)[0]
// post_url_div = document.querySelectorAll(`div.html-div[id^=":r"]`) ----> a

// ,"feedback":{"id":

// 6744097142294862
// {"feedbackTargetID":"ZmVlZGJhY2s6ODIyMjc5MTIwMTA4MjA2NA=="}
