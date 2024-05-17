import selectors from "./selector";

const timer = setInterval(() => {
    const divv = document.querySelector(selectors.all_friends_div)
    if(divv){
        clearInterval(timer)
        let friend_h2 = divv.querySelector(selectors.friend_count);
        if(!friend_h2){
            const seperator = document.querySelector(selectors.seperator);
            const parent_div = seperator.parentElement
            friend_h2 = parent_div.children[2].querySelector(selectors.friend_count)
        }
        let friendLength = friend_h2.textContent.replace(/[^\d]/g, "")
        console.log(friendLength)
        chrome.runtime.sendMessage({action : "friendCount", friendLength: friendLength});
    }
}, 1000)