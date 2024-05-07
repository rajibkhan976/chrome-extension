
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
        case "clickAddFriend" :
            addFriendBtnClick(sendResponse);
            break
        case "checkCancelBtn" :
            checkCancleRequest(sendResponse);
            break;
        case "getUserFbId" :
            getFbUserId(sendResponse);
            break;
        case "closeTab":
            if(request.tabId){
                chrome.tabs.remove(request.tabId);
            }
            break;
        default : break;
    }
});

const getProfileData = (sendResponse, getUID = false) => {
    let userData = {};
    let fbDetails = document.querySelector('head').querySelector(selectors.script_contet);
    // console.log("fbDetails :::: ", fbDetails)
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
        const loginBtn = document.querySelector(selectors.loginBtn);
        // console.log("loginBtn ::: ", loginBtn)
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
    // console.log("userData ::: ", userData);
    sendResponse(userData)


}

const getprofileDataofURL = (sendResponse) => {
    const loginBtn = document.querySelector(selectors.loginBtn);
    console.log("loginBtn ::: ", loginBtn)
    if(loginBtn){
        sendResponse({ isFbLoggedin : false })
    }
    else{
        
        let allScripts = document.querySelectorAll(selectors.fbScripts)
        if(allScripts && allScripts.length > 0){
            allScripts = Object.values(allScripts);
            // console.log("all scripts ::: ", allScripts)
            const profileOwnerScripts = allScripts.filter((el)=>{
                return (el.innerHTML.indexOf(`{"require":[["ScheduledServerJS",`) > -1 && el.innerHTML.indexOf(`"profile_owner"`) > -1)
            })
            // console.log("profileOwnerScripts ::: ", profileOwnerScripts);
            if(profileOwnerScripts && profileOwnerScripts.length > 0){
                const profileOwner  = profileOwnerScripts[0].innerHTML.split(`"profile_owner":`)[1].split('}')[0].split(`"id":"`)[1].split(`"`)[0];
                // console.log("profileOwner ::: ", profileOwner);
                const userId = getProfileData(sendResponse, true)
                // console.log("userId ::: ", userId)
                if(userId === profileOwner)
                    sendResponse({"uid" : profileOwner, status : true, isFbLoggedin : true});
                else
                    sendResponse({status : false,  isFbLoggedin : true});
            }else
                sendResponse({status : false,  isFbLoggedin : true}); 
        }else
            sendResponse({status : false,  isFbLoggedin : true}); 
    }
}


function addFriendBtnClick(sendResponse) {
    const button = document.querySelector('[aria-label="Add friend"][role="button"]');
    const name = document.querySelectorAll('h1:not([dir="auto"]');
    let res = { status: false,};
    if(name){
        res["name"]=name[0].innerText?name[0].innerText!=='Notifications'?name[0].innerText:name[1].innerText:name[0].textContent;
    }
    const profilePicUrl = document.querySelectorAll('svg[data-visualcompletion="ignore-dynamic"][role="img"]');
    if(profilePicUrl && 
        profilePicUrl[1].querySelector('image') &&
         profilePicUrl[1].querySelector('image').getAttribute('xlink:href')){
        res["profilePicUrl"]=profilePicUrl[1].querySelector('image').getAttribute('xlink:href');
    }
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
    sendResponse(res);
  }

  const checkCancleRequest = (sendResponse)=>{
    const button = document.querySelector('[aria-label="Cancel request"][role="button"]');
    let res={
        status:false
    };
    if(button){
        res.status = true;
    }
    sendResponse(res);
  }


  function getFbUserId(sendResponse) {
    let res = { status: false,};
    let content = document.body.innerHTML;
    let match = content.match(/"userID":"(\d+)"/);
    if (match) { 
      let userID= match[0].split(':')[1];
      res["fbUserId"]= userID.length > 0? userID:"NA";
     }
    sendResponse(res);
  }