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