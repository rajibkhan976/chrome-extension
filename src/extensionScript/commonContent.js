// console.log("************************************commonContent************************************");
import selectors from "./selector"
import helper from "./helper"
let count = 0;

const logoutButtonInterval = setInterval(async () => {
    const accountControls = document.querySelector(selectors.account_controls);
    // console.log("account controls ::: ", accountControls);
    if(accountControls !== null){
        clearInterval(logoutButtonInterval);
        const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
        // console.log("fbTokenAndId ::: ", fbTokenAndId);
        if(helper.isEmptyObj(fbTokenAndId)){
            chrome.runtime.sendMessage({ action: "facebookLogin" });
        }
        const profileBtn = accountControls.querySelector(selectors.profile_btn);
        profileBtn.addEventListener("click", ()=>{
            // console.log("profileBtn ::: ", profileBtn)
            const profileMenueSubtree = accountControls.parentNode.childNodes[1]
            // console.log("profileMenueSubtree ::: ", profileMenueSubtree);
            if(profileMenueSubtree.addEventListener){
                
                const OnSubtreeModified = () => {
                    // console.log("yahoooooooooooooooooooooooo");
                    const profileMenu = profileMenueSubtree.querySelector(selectors.profile_menu);
                    // console.log("profileMenu ::: ", profileMenu);
                    if(profileMenu){
                        const logout = profileMenu.querySelector(selectors.logout);
                        // console.log("logout btn ::: ", logout);
                        logout.addEventListener("click", ()=>{
                            // console.log("facebookLoggedOut");
                            chrome.runtime.sendMessage({ action: "facebookLoggedOut" });
                        })
                        
                    }
                }
                profileMenueSubtree.addEventListener ('DOMSubtreeModified', OnSubtreeModified, false); 
            }
        });
    }
    else{
        count = count + 1;
        if(count > 10){
            clearInterval(logoutButtonInterval);
            const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
            // console.log("fbTokenAndId ::: ", fbTokenAndId);
            if(!helper.isEmptyObj(fbTokenAndId)){
                // console.log("Logged Out");
                chrome.runtime.sendMessage({ action: "facebookLoggedOut" });
            }
        }
    }
}, 500);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("----------------------------***************-----------------------------------------", request);
    if(request.action === "FetchEssentials"){
    switch (request.source) {
        case "friends":   
            const content = document.body.innerHTML;
            const match = content.match(/"userID":"(\d+)"/);
            let contactId = "", sessionToken = "";
            if (match) {
                contactId = match[0].split(':')[1];
                contactId = contactId.length > 0 ? contactId.replaceAll(`"`, "") : "NA";
                console.log("contactId ::: ", contactId);
            }
            let match_token = content.match(/"collection":{"app_section":{"id":"[^},]*\}/);
            console.log(match_token)
            if (match_token) {
                // console.log(match_token[0]);
                sessionToken = match_token[0];
                sessionToken = `{${sessionToken}}}`;
                sessionToken = JSON.parse(sessionToken);
                sessionToken = sessionToken.collection.app_section.id
                console.log("sessionToken ::: ", sessionToken);
            }
            sendResponse({ contactId : contactId, sessionToken : sessionToken})
            break;
        default:
            break;
    }
    }
});