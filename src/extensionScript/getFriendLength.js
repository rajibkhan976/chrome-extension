import selectors from "./selector";

const timer = setInterval(() => {
    const noOfMyFriends = document.querySelectorAll(selectors.friend_count)
    // const noOfMyFriends = document.querySelectorAll('h2[dir="auto"]')
    // console.log("noOfMyFriends : ", noOfMyFriends, noOfMyFriends.length)
    if(noOfMyFriends.length > 0){
        clearInterval(timer)
        let friendLength =  noOfMyFriends[noOfMyFriends.length - 1].innerText.replace(/[^\d]/g, "");
        
        // console.log("FR length", noOfMyFriends, noOfMyFriends[noOfMyFriends.length - 1].innerText.replace(/[^\d]/g, ""));
        
        chrome.runtime.sendMessage({action : "friendCount", friendLength: friendLength});
    }
}, 1000)