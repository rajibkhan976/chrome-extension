/**
 * Through this script extension will communicate
 * with web portal using localstorage, cookie, etc.
 */
import helper from "./helper"
console.log("****************************Portal content script is injected******************************************")

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log("ACTION", request)
    if (!request.hasOwnProperty("content")) return false

    // Storage type
    let type = request.type === "cookie" ? "cookie" : "localstorage"

    if (request.content) {
        if (type === "cookie") {
            helper.setCookie(request.action, request.content);
        } else if(request.type === "alert"){
            window.alert(request.content);
        } else {
            localStorage.setItem(request.action, request.content);
        }
    } else {
        if (type === "cookie") {
            helper.deleteCookie(request.action)
        } else {
            localStorage.removeItem(request.action)
        }
    }
    return true;
});