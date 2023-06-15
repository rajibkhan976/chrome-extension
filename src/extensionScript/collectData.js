
import selectors from "./selector";
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log("ACTION", request)
    switch(request.action) {
        case "profileData" :
            getProfileData(sendResponse);
            break;
        
        default : break;
    }
});

const getProfileData = (sendResponse) => {
    let fbDetails = document.querySelector('head').querySelector(selectors.script_contet);
    fbDetails = JSON.parse(fbDetails.innerHTML);
    // console.log("fbDetails : ", fbDetails);
    let userData = {
        profileUrl: window.location.href,
        fbDtsg: fbDetails.f,
        profilePicture: document.querySelector(selectors.profilePicture).querySelector('image').getAttribute('xlink:href'),
        name: document.querySelector(selectors.userName).textContent,
        userId: fbDetails.u.split("__user=")[1].split("&")[0],
    };
    // console.log("userData ::: ", userData);
    sendResponse(userData)


}