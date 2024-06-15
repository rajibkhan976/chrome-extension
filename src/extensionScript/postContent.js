import selectors from "./selector";
import helper from "./helper";
const $ = require("jquery");
// const selectors = require("./selector.js");
// const ariaLabel = selectors.ariaLabel;
// var status = false;
let clickedObj = null,
  status = false,
  processed_posts_count = 0,
  post_count = 0,
  menueButton = "",
  PPInterval = 0,
  MenuItemInterval,
  popUpmenuBox = "",
  PopupMenuBox_children,
  isEmptyObj = false;
let savePostMenuItem =
  `<div class="friender savePost schedulerTrigger x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou xe8uvvx x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz xjyslct x9f619 x1ypdohk x78zum5 x1q0g3np x2lah0s x1w4qvff x13mpval xdj266r xat24cr x1n2onr6 x16tdsg8 x1ja2u2z x6s0dn4 x1y1aw1k x1sxyh0" role="menuitem" tabindex="-1">
                        <div class="x6s0dn4 xoi2r2e x78zum5 xl56j7k xq8finb xcrj56b x1ua1ozc">
                        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5911 16.7618C12.2493 15.5392 11.496 14.4588 10.4481 13.6882C9.40026 12.9177 8.11636 12.5 6.79556 12.5C5.47475 12.5 4.19085 12.9177 3.14299 13.6882C2.09512 14.4588 1.34185 15.5391 1 16.7618M15.7956 6.75L15.7956 12.5M18.7956 9.625L12.7956 9.625M10.7956 4.83333C10.7956 6.95042 9.00469 8.66667 6.79555 8.66667C4.58642 8.66667 2.79555 6.95042 2.79555 4.83333C2.79555 2.71624 4.58642 1 6.79555 1C9.00469 1 10.7956 2.71624 10.7956 4.83333Z" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                        </svg>                        
                        </div>
                        <div class="x6s0dn4 x78zum5 x1q0g3np x1iyjqo2 x1qughib xeuugli">
                            <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                <div class="xu06os2 x1ok221b">
                                    <span class="friender_savePost  x193iq5w xeuugli x13faqbe x1vvkbs x10flsy6 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x41vudc x6prxxf xvq8zen xk50ysn xzsf02u x1yc453h" dir="auto">
                                        Run Friender
                                    </span>
                                    <p class="postPara">Add to friend queue.</p>
                                </div>
                        </div>
                        <div class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h" data-visualcompletion="ignore">
                        </div>
                      </div>
                      <hr class="x14nfmen x1e56ztr xktsk01 x1d52u69 x1xmf6yo">`;

// post_count = document.querySelectorAll(selectors.ariaLabel).length;

async function doInit() {
  const frToken = await helper.getDatafromStorage("fr_token")
  if (helper.isEmptyObj(frToken)) return;
  // console.log("frToken ::: ", frToken);
  //To Intial the post added checking and our menu button as well.
  post_count = $(selectors.ariaLabel.toString()).length;
  // console.log("post count ::: ", post_count);
  if (!post_count) {
    processed_posts_count = 0;
    // console.log("Intitial has been paused because post are " + post_count);
    setTimeout(doInit, 300);
    return;
  }
  if (post_count > processed_posts_count) {
    // console.log("Now posts are = " + post_count);
    MenuItemInterval = setInterval(function () {
      menueButton = $(selectors.ariaLabel.toString());
      if (menueButton.length) {
        clearInterval(MenuItemInterval);
        // console.log("Calling a function", menueButton);
        attachClickEvent(menueButton);
      }
    }, 300);
    processed_posts_count = post_count;
  }
}

function attachClickEvent(menueButton) {
  // console.log("fist funvtion work", menueButton);
  menueButton.click(function (e) {
    e.preventDefault();
    //   console.log("Listnening to this click event. :: ", $(this));
    // console.log("PopupOpened ::: ",PopupOpened)

    // const postObjElArr = $(this).closest('div[aria-labelledby^="jsc_c_"]');//(".x1ja2u2z.x1n2onr6"); // immeiate post of the clicked three dots

    let postObjElArr = $(this).closest('div[role="article"]');
    if (postObjElArr.length === 0)
      postObjElArr = $(this).closest('div[class="x1a2a7pz"]');
    if (postObjElArr.length === 0)
      postObjElArr = $(this).parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .parent();

    // console.log("postObjElArr : ", postObjElArr);
    if (PPInterval) {
      clearInterval(PPInterval);
    }

    PPInterval = setInterval(function () {
      // popUpmenuBox = $('div[role="menu"][class="x1n2onr6 x1fayt1i xcxhlts"]');
      popUpmenuBox = $('div[role="menu"][aria-label="Feed story menu"]');
      PopupMenuBox_children = $(
        popUpmenuBox
          .children()
          .children()
          .children()
          .children()
          .children()
          .children()
          .eq(0)
      );
      // console.log("PopupMenuBox_children :: ", PopupMenuBox_children);
      if (PopupMenuBox_children.children().eq(0).length) {
        clearInterval(PPInterval);
        // console.log("I'm inside this : ",$(this));

        const postBodyEl = postObjElArr[0];
        //console.log("postBodyEl : ", postBodyEl, PopupMenuBox_children.children());
        //   console.log("postBodyEl : ", postBodyEl);

        addCFmenuLink(postBodyEl, PopupMenuBox_children.children());
      }
    }, 500);
  });
}

function addCFmenuLink(postBodyEl, menueItems) {
  var already_exists;
  // console.log("menueItems ::: ", menueItems);
  Array.prototype.forEach.call(menueItems, (child, i) => {
    // console.log("child ::: ", child);
    if ($(child).hasClass("friender")) {
      already_exists = true;
    }
  });
  let canDelete;
  var isThisAds = false, isSponsored = false;

  Array.prototype.forEach.call(menueItems, (child) => {
    // console.log("child ::: ", child);
    // console.log("child [0] ::: ", child[0]);
    // console.log("child text ::: ", child.textContent);
    // console.log("child small text ::: ", child.textContent.toLowerCase());
    // console.log("child trimed ::: ", child.textContent.toLowerCase().trim());
    if (
      $(child)[0].textContent.toLowerCase().trim() ===
      "why am i seeing this ad?".toLowerCase().trim()) {
      isSponsored = true;
    }
    if (
      // $(child)[0].textContent.toLowerCase().trim() ===
      // "why am i seeing this ad?".toLowerCase().trim() || 
      $(child)[0].textContent.toLowerCase().trim() === "hidesee fewer posts like this." ||
      $(child)[0].textContent.toLowerCase().trim().includes("why am i seeing these friend suggestions?".toLowerCase().trim()) ||
      $(child)[0].textContent.toLowerCase().trim() === "view profile".toLowerCase().trim()
    ) {
      isThisAds = true;
    }
  });

  if (!menueItems.length) {
    //if the popup opened but the content inside has not fully loaded
    return;
  }

  if (already_exists || isThisAds) {
    clearInterval(PPInterval);
    return;
  }

  //To get the post url of the selected post
  var parser = new DOMParser();
  var doc = parser.parseFromString(savePostMenuItem, "text/html");
  PopupMenuBox_children[0].prepend(doc.body.firstChild);
  //   console.log("hi.........................................................", $(".friender"));

  // addedMenue.find
  $(".friender").click(async function () {
    const frToken = await helper.getDatafromStorage("fr_token");
    if (helper.isEmptyObj(frToken)) return;
    if (isSponsored) {
      menueItems[menueItems.length - 1].click();
      getSponsoredLink();
    } else {
      getpostLinkFromLink(postBodyEl);
    }
    // console.log("hi.........................................................");
    // console.log("postBodyEl.", postBodyEl);
    // console.log("use pp is clicked 1.", $(postBodyEl).find(`div.html-div`));
    // console.log("use pp is clicked 2.", $($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`));
    // console.log("use pp is clicked 3.", $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(1));
    // console.log("use pp is clicked 3.", $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(2));
    // let post_body = $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(1)

    // post_body[0].dispatchEvent(
    //     new FocusEvent("focusin", {
    //       view: window,
    //       bubbles: true,
    //       cancelable: true,
    //     })
    // );
    // setTimeout(function () {

    //     let allUrlsOfPsts = $(post_body.find(`div.html-div`)).find(
    //     'a[role="link"]'
    //     );
    //     console.log("allUrlsOfPsts ::::::::::::::: ", allUrlsOfPsts);
    //     let i = allUrlsOfPsts.length - 1;
    //     if(allUrlsOfPsts.length === 0){
    //       post_body = $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(2);
    //       console.log(post_body);
    //       allUrlsOfPsts = $(post_body.find(`div.html-div`)).find(
    //         'a[role="link"]'
    //       );
    //       console.log("allUrlsOfPsts ::::::: 2 :::::::: ", allUrlsOfPsts);
    //       i = 0;
    //     }
    //     console.log("allUrlsOfPsts[i] :::: ", allUrlsOfPsts[i]);
    //     allUrlsOfPsts[i].dispatchEvent(
    //     new FocusEvent("focusin", {
    //         view: window,
    //         bubbles: true,
    //         cancelable: true,
    //     })
    //     );
    //     setTimeout(function () {
    //         let postUrl = $(allUrlsOfPsts[i]).attr("href");
    //         console.log("post URL ::::::::::::::::::::::: ", postUrl);
    //         if(postUrl === "#"){
    //           i = allUrlsOfPsts.length - 2;
    //           console.log("allUrlsOfPsts[i] :::: ", allUrlsOfPsts[i]);
    //           allUrlsOfPsts[i].dispatchEvent(
    //           new FocusEvent("focusin", {
    //               view: window,
    //               bubbles: true,
    //               cancelable: true,
    //           })
    //           );
    //           setTimeout(()=>{
    //             postUrl = $(allUrlsOfPsts[i]).attr("href");
    //             console.log("post URL ::::::::::::::::::::::: ", postUrl);
    //             if(!postUrl.includes("https://www.facebook.com")){
    //                 postUrl = "https://www.facebook.com" + postUrl
    //                 console.log("post URL ::::::::::::::::::::::: ", postUrl);
    //             }
    //             chrome.runtime.sendMessage({"action" :  "openPostSetting", "postUrl" : postUrl})
    //           }, 500)
    //         }
    //         else{
    //           postUrl = $(allUrlsOfPsts[i]).attr("href");
    //           console.log("post URL ::::::::::::::::::::::: ", postUrl);
    //           if(!postUrl.includes("https://www.facebook.com")){
    //               postUrl = "https://www.facebook.com" + postUrl
    //               console.log("post URL ::::::::::::::::::::::: ", postUrl);
    //           }
    //           chrome.runtime.sendMessage({"action" :  "openPostSetting", "postUrl" : postUrl})
    //         }
    //     }, 500);
    // },200)
  });
}

function onElementHeightChange(elm, callback) {
  var lastHeight = elm.clientHeight,
    newHeight;
  (function run() {
    newHeight = elm.clientHeight;
    if (lastHeight != newHeight) callback();
    lastHeight = newHeight;

    if (elm.onElementHeightChangeTimer)
      clearTimeout(elm.onElementHeightChangeTimer);

    elm.onElementHeightChangeTimer = setTimeout(run, 200);
  })();
}

$(document).ready(async () => {
  console.log("--------------------------- dom loaded -------------------------------");
  const frToken = await helper.getDatafromStorage("fr_token");
  if (helper.isEmptyObj(frToken)) return;
  // console.log("frToken ::: ", frToken);
  doInit();

  onElementHeightChange(document.body, function () {
    // console.log("Body height changes");
    doInit();
  });
});

const getpostLinkFromLink = (postBodyEl) => {
  console.log("use pp is clicked 2.", $($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`));
  console.log("use pp is clicked 3.", $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(1));
  console.log("use pp is clicked 3.", $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(2));
  let post_body = $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(1)

  post_body[0].dispatchEvent(
    new FocusEvent("focusin", {
      view: window,
      bubbles: true,
      cancelable: true,
    })
  );
  setTimeout(function () {

    let allUrlsOfPsts = $(post_body.find(`div.html-div`)).find(
      'a[role="link"]'
    );
    console.log("allUrlsOfPsts ::::::::::::::: ", allUrlsOfPsts);
    let i = allUrlsOfPsts.length - 1;
    if (allUrlsOfPsts.length === 0) {
      post_body = $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(2);
      console.log(post_body);
      allUrlsOfPsts = $(post_body.find(`div.html-div`)).find(
        'a[role="link"]'
      );
      console.log("allUrlsOfPsts ::::::: 2 :::::::: ", allUrlsOfPsts);
      i = 0;
    }
    console.log("allUrlsOfPsts[i] :::: ", allUrlsOfPsts[i]);
    allUrlsOfPsts[i].dispatchEvent(
      new FocusEvent("focusin", {
        view: window,
        bubbles: true,
        cancelable: true,
      })
    );
    setTimeout(function () {
      let postUrl = $(allUrlsOfPsts[i]).attr("href");
      console.log("post URL ::::::::::::::::::::::: ", postUrl);
      if (postUrl === "#") {
        i = allUrlsOfPsts.length - 2;
        console.log("allUrlsOfPsts[i] :::: ", allUrlsOfPsts[i]);
        allUrlsOfPsts[i].dispatchEvent(
          new FocusEvent("focusin", {
            view: window,
            bubbles: true,
            cancelable: true,
          })
        );
        setTimeout(() => {
          postUrl = $(allUrlsOfPsts[i]).attr("href");
          console.log("post URL ::::::::::::::::::::::: ", postUrl);
          if (!postUrl.includes("https://www.facebook.com")) {
            postUrl = "https://www.facebook.com" + postUrl
            console.log("post URL ::::::::::::::::::::::: ", postUrl);
          }
          chrome.runtime.sendMessage({ "action": "openPostSetting", "postUrl": postUrl })
        }, 500)
      }
      else {
        postUrl = $(allUrlsOfPsts[i]).attr("href");
        console.log("post URL ::::::::::::::::::::::: ", postUrl);
        if (!postUrl.includes("https://www.facebook.com")) {
          postUrl = "https://www.facebook.com" + postUrl
          console.log("post URL ::::::::::::::::::::::: ", postUrl);
        }
        chrome.runtime.sendMessage({ "action": "openPostSetting", "postUrl": postUrl })
      }
    }, 500);
  }, 200)
}

const getSponsoredLink = () => {
  const embedInterval = setInterval(() => {
    const embedPost = $('div[aria-label="Embed Post"]')
    console.log("embed post div : ", embedPost)
    if (embedPost && embedPost.length > 0) {
      clearInterval(embedInterval);
      const embedLink = embedPost.find('input[aria-label="Sample code input"]')
      console.log("embeded link ::: ", embedLink[0].value)
      var div = document.createElement('div');
      div.innerHTML = embedLink[0].value.trim();
      const iframeVal = div.firstChild;
      console.log("value of iframe value", iframeVal);
      let postUrl = iframeVal && iframeVal.src;
      console.log("post URL ::: ", postUrl);
      postUrl = postUrl.split("href=")[1].split("&")[0]
      postUrl = postUrl.replaceAll("%3A", ":").replaceAll("%2F", "/")
      console.log("post URL ::: ", postUrl);
      $('div[aria-label="Close"]').click();
      chrome.runtime.sendMessage({ "action": "openPostSetting", "postUrl": postUrl })
    }
  }, 500)
}