// const io = require("socket.io")

const timer = setInterval(()=>{
    const noOfMyFriends = document.querySelectorAll('h2[dir="auto"]')
    console.log("noOfMyFriends : ", noOfMyFriends, noOfMyFriends.length)
    if(noOfMyFriends.length > 0){
        clearInterval(timer)
        console.log(noOfMyFriends[noOfMyFriends.length - 1].innerText.split(" friends")[0])
        chrome.runtime.sendMessage({action : "friendCount", friendLength: noOfMyFriends[noOfMyFriends.length - 1].innerText.split(" friends")[0]});
    }
}, 1000)