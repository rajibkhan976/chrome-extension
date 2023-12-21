import selectors from "./selector";
import helper from "./helper";




///////NEW::::
let processed_friendReqst_count = 0, friendReqst_blocks = null, scrollTarget1 = null, scrollTarget2 = null;
let profileLinkSet = new Set();
let notSyncedIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="18" fill="#A8A8A8"/>
    <path d="M17.8824 10.9693C16.6645 10.9915 15.4525 11.3278 14.3771 11.9783L13.1553 10.7565C14.4083 9.91457 15.8317 9.43281 17.2787 9.31133L16.6196 8.65228C16.2901 8.32278 16.2901 7.78855 16.6196 7.45904C16.9491 7.12954 17.4834 7.12954 17.8129 7.45904L20.1994 9.84552C20.5289 10.175 20.5289 10.7093 20.1994 11.0388L17.8129 13.4253C17.4834 13.7548 16.9491 13.7548 16.6196 13.4253C16.2901 13.0958 16.2901 12.5615 16.6196 12.232L17.8824 10.9693ZM11.4615 12.2447C8.44699 15.6692 8.57538 20.8932 11.8466 24.1644C12.1451 24.4629 12.4602 24.7354 12.789 24.982C13.1619 25.2615 13.6907 25.1859 13.9702 24.8131C14.2498 24.4402 14.1741 23.9114 13.8013 23.6318C13.5362 23.4331 13.2816 23.213 13.0399 22.9712C10.4279 20.3592 10.3005 16.2035 12.6578 13.441L22.5701 23.3533C21.2946 24.4419 19.7227 25.0005 18.1411 25.0294L19.4038 23.7666C19.7333 23.4372 19.7333 22.9029 19.4038 22.5734C19.0743 22.2439 18.54 22.2439 18.2106 22.5734L15.8241 24.9599C15.4946 25.2894 15.4946 25.8237 15.8241 26.1532L18.2106 28.5396C18.54 28.8691 19.0743 28.8691 19.4038 28.5396C19.7333 28.2101 19.7333 27.6759 19.4038 27.3463L18.7448 26.6873C20.5505 26.5358 22.3195 25.8231 23.7663 24.5496L26.0514 26.8347C26.2711 27.0543 26.6273 27.0543 26.847 26.8347C27.0666 26.615 27.0666 26.2588 26.847 26.0391L9.97197 9.16415C9.7523 8.94447 9.39615 8.94447 9.17648 9.16415C8.9568 9.38381 8.9568 9.73997 9.17648 9.95963L11.4615 12.2447ZM24.0327 21.6338L25.2546 22.8558C27.5327 19.4662 27.1735 14.8309 24.1768 11.8342C23.8784 11.5358 23.5633 11.2632 23.2344 11.0166C22.8616 10.7371 22.3327 10.8128 22.0532 11.1856C21.7737 11.5584 21.8493 12.0873 22.2221 12.3668C22.4872 12.5656 22.7418 12.7857 22.9835 13.0275C25.3181 15.362 25.6678 18.9298 24.0327 21.6338Z" fill="white"/>
  </svg>
`;
let syncedIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="none">
   <rect x="0" y="0" width="30" height="30" rx="15" fill="rgb(25, 195, 125)" />
  <path d="M8.67188 5.5625L7.23223 6.8C6.13018 7.84926 5.25315 9.11178 4.6545 10.5107C4.05585 11.9097 3.74811 13.4158 3.75001 14.9375C3.75001 21.1484 8.78907 26.1875 15 26.1875C21.2109 26.1875 26.25 21.1484 26.25 14.9375C26.2498 12.6107 25.5286 10.3412 24.1855 8.44123C22.8424 6.54126 20.9434 5.10424 18.75 4.32793" stroke="white" stroke-width="1.875" stroke-miterlimit="10" stroke-linecap="round"/>
  <path d="M10 14.6667L13.5714 18L20 12" stroke="white" stroke-width="1.5"/>
  <path d="M6.45004 4L9.55128 4C9.67029 4 9.78442 4.04728 9.86857 4.13144C9.95272 4.21559 10 4.32973 10 4.44875L10 7.55018C10 7.95013 9.51678 8.15038 9.23409 7.86767L6.13257 4.76596C5.84932 4.48325 6.05012 4 6.45004 4Z" fill="white"/>
</svg>
`
async function initMarkingFunction() {
    try {
        const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
        //console.log("facebook user ID::", fbTokenAndId.userID);
        if (!(fbTokenAndId && fbTokenAndId.userID)) return;
        const pendingList = await helper.fetchSendFriendRequests(fbTokenAndId.userID);
        //console.log("pending list:::", pendingList);
        pendingList.forEach((item) => {
            if (item.friendProfileUrl) {
                profileLinkSet.add(item.friendProfileUrl.trim())
            }
        });
        initMarking()
        setTimeout(() => {
            attachScrollEventToFRList();
        }, 400);
        // onElementHeightChange(
        //     document.querySelector(
        //       'div[aria-label="Friend requests"][role="navigation"] > div'
        //     ).children[1],
        //     function () {
        //       // console.log("Body height changes");
        //       initMarking();
        //     }
        //   );

    } catch (error) {
        console.error("ERROR FETCHING PENDING LIST IN FR MARKING::", error);
    }
}

initMarkingFunction();

function attachScrollEventToFRList() {
    scrollTarget1 = document.querySelector(
        'div[aria-label="Friend requests"][role="navigation"] > div'
    ).children[1];
    scrollTarget2 = document.querySelector(
        'div[aria-label="Friend requests"][role="navigation"] > div'
    ).children[2];
    const debouncedScrollHandler = helper.debounce(trackHieghtChange, 200);
    if (scrollTarget1) scrollTarget1.addEventListener('scroll', debouncedScrollHandler);
    if (scrollTarget2) scrollTarget2.addEventListener('scroll', debouncedScrollHandler);
}


function trackHieghtChange() {
    //console.log("Tracking height change on scroll");
    let ele = document
        .querySelector('div[aria-label="Friend requests"][role="navigation"]')
        .querySelectorAll(
            'div[data-visualcompletion="ignore-dynamic"]:not([role="row"]'
        )
    if (ele.length > processed_friendReqst_count) {
        initMarking();
    }
}


function initMarking() {
    let friendReqst_count = document
        .querySelector('div[aria-label="Friend requests"][role="navigation"]')
        .querySelectorAll(
            'div[data-visualcompletion="ignore-dynamic"]:not([role="row"])'
        ).length;

    //console.log("fr count ::: ", friendReqst_count);
    if (!friendReqst_count) {
        processed_friendReqst_count = 0;
        // console.log("Intitial has been paused because post are " + post_count);
        setTimeout(initMarking, 500);
        return;
    }

    if (friendReqst_count > processed_friendReqst_count) {
        //console.log("Now fr are = " + friendReqst_count);
        let FRItemInterval = setInterval(function () {
            friendReqst_blocks = document
                .querySelector('div[aria-label="Friend requests"][role="navigation"]')
                .querySelectorAll(
                    'div[data-visualcompletion="ignore-dynamic"]:not([role="row"]'
                );
            //console.log("friendReqst_blocks ::: ", friendReqst_blocks);

            if (friendReqst_blocks.length) {
                clearInterval(FRItemInterval);
                //console.log("Calling a function");
                attchMarkToFrList(() => {
                    processed_friendReqst_count = friendReqst_count;
                    //console.log("precess count:", processed_friendReqst_count);
                });
            }
        }, 400);

    }

}

function attchMarkToFrList(callback) {
    friendReqst_blocks = document
        .querySelector('div[aria-label="Friend requests"][role="navigation"]')
        .querySelectorAll(
            'div[data-visualcompletion="ignore-dynamic"]:not([role="row"]'
        );

    friendReqst_blocks.forEach((item, idx) => {
        if (idx >= processed_friendReqst_count) {
            let fbProfilelink = item.firstChild.href;
            //console.log("fb profile link", fbProfilelink);
            const nameSpan = item.querySelector(
                'span[dir="auto"] > div > div > span > span'
            ); // > span > span')
            //console.log("name span ::: ", nameSpan);
            let parser = new DOMParser();
            let syncedTag = null;
            if (fbProfilelink && profileLinkSet.has(fbProfilelink.trim())) {
                syncedTag = parser.parseFromString(
                    `<span class=incoming_fr_synced>
                    ${syncedIcon}
                    </span>`,
                    "text/html"
                );
            } else {
                syncedTag = parser.parseFromString(
                    `<span class=incoming_fr_synced>
                    ${notSyncedIcon}
                    </span>`,
                    "text/html"
                );
            }


            nameSpan.append(syncedTag.body.firstChild);
        }
    });
    callback();

}


// function onElementHeightChange(elm, callback) {
//     var lastHeight = elm.clientHeight,
//         newHeight;
//     (function run() {
//         newHeight = elm.clientHeight;
//         console.log("newHeight", newHeight);
//         console.log("lastHeight", lastHeight);
//         if (lastHeight != newHeight) callback();
//         lastHeight = newHeight;

//         if (elm.onElementHeightChangeTimer)
//             clearTimeout(elm.onElementHeightChangeTimer);

//         elm.onElementHeightChangeTimer = setTimeout(run, 200);
//     })();
// }