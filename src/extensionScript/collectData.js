
import selectors from "./selector";
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    // console.log("ACTION", request)
    switch(request.action) {
        case "profileData" :
            getProfileData(sendResponse);
            break;

        case "getUserId" : 
            getprofileDataofURL(sendResponse);
            break;
        
        default : break;
    }
});

const getProfileData = (sendResponse, getUID = false) => {
    let userData = {};
    let fbDetails = document.querySelector('head').querySelector(selectors.script_contet);
    console.log("fbDetails :::: ", fbDetails)
    if(fbDetails){
        fbDetails = JSON.parse(fbDetails.innerHTML);
        // console.log("fbDetails : ", fbDetails);
        if(getUID){
            return fbDetails.u.split("__user=")[1].split("&")[0];
        }
        userData = {
            profileUrl: window.location.href,
            fbDtsg: fbDetails.f,
            profilePicture: document.querySelector(selectors.profilePicture).querySelector('image').getAttribute('xlink:href'),
            name: document.querySelector(selectors.userName).textContent,
            userId: fbDetails.u.split("__user=")[1].split("&")[0],
            isFbLoggedin : true,
            status : true
        };
    }else{
        const loginBtn = document.querySelector('button[data-testid="royal_login_button"][name="login"]');
        console.log("loginBtn ::: ", loginBtn)
        if(loginBtn){
            userData = {
                isFbLoggedin : false,
                status : true
            }
        }
        else{
            userData = {
                status : false
            }
        }
    }
    console.log("userData ::: ", userData);
    sendResponse(userData)


}

const getprofileDataofURL = (sendResponse) => {
    let allScripts = document.querySelectorAll('script[type="application/json"][data-sjs]')
    if(allScripts && allScripts.length > 0){
        allScripts = Object.values(allScripts);
        // console.log("all scripts ::: ", allScripts)
        const profileOwnerScripts = allScripts.filter((el)=>{
            return (el.innerHTML.indexOf(`{"require":[["ScheduledServerJS",`) > -1 && el.innerHTML.indexOf(`"profile_owner"`) > -1)
        })
        // console.log("profileOwnerScripts ::: ", profileOwnerScripts);
        if(profileOwnerScripts && profileOwnerScripts.length > 0){
            const profileOwner  = profileOwnerScripts[0].innerHTML.split(`"profile_owner":`)[1].split('}')[0].split(`"id":"`)[1].split(`"`)[0];
            console.log("profileOwner ::: ", profileOwner);
            const userId = getProfileData(sendResponse, true)
            console.log("userId ::: ", userId)
            if(userId === profileOwner)
                sendResponse({"uid" : profileOwner, status : true});
            else
                sendResponse({status : false});
        }else
            sendResponse({status : false}); 
    }else
        sendResponse({status : false}); 
}