import selectors from "./selector";
import common from "./commonScript";
import helper from "./helper";
const $ = require("jquery");
const querystring = require('querystring');
let clickedObj = null,
  status = false,
  processed_posts_count = 0,
  post_count = 0,
  menueButton = "",
  PPInterval = 0,
  MenuItemInterval,
  popUpmenuBox = "",
  PopupMenuBox_children,
  isEmptyObj = false,
  groupSettings = {},
  addFriendList = [],
  contactDetails = [],
  genDialogue,
  count = 0,
  memberCount = 0,
  queueCount = 0,
  postFigure;
let shoudIstop = false;

let savePostMenuItem =
  `<div class="friender savePost schedulerTrigger x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou xe8uvvx x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz xjyslct x9f619 x1ypdohk x78zum5 x1q0g3np x2lah0s x1w4qvff x13mpval xdj266r xat24cr x1n2onr6 x16tdsg8 x1ja2u2z x6s0dn4 x1y1aw1k x1sxyh0" role="menuitem" tabindex="-1">
                        <div class="x6s0dn4 xoi2r2e x78zum5 xl56j7k xq8finb xcrj56b x1ua1ozc">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.76186 0H15.2386C16.5014 0.000123349 17.7125 0.501872 18.6054 1.39488C19.4984 2.28789 20 3.49902 20 4.76186V15.2386C19.9999 16.5014 19.4981 17.7125 18.6051 18.6054C17.7121 19.4984 16.501 20 15.2381 20H4.7614C3.49855 19.9999 2.28747 19.4981 1.39455 18.6051C0.501631 17.7121 -6.02406e-09 16.501 0 15.2381V4.7614C0.000123349 3.49855 0.501872 2.28747 1.39488 1.39455C2.28789 0.501631 3.49902 -6.02406e-09 4.76186 0V0Z" fill="#605BFF"/>
                        <path d="M4.76562 10.9281L8.40968 14.5723V7.58984H5.17504L4.76562 10.9281Z" fill="#3F3AD5"/>
                        <path d="M8.12481 7.57422H4.76562V10.9332L8.12481 7.57422Z" fill="#11E6B4"/>
                        <mask id="mask0_3929_34681" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                        <path d="M4.76186 0H15.2386C16.5014 0.000123349 17.7125 0.501872 18.6054 1.39488C19.4984 2.28789 20 3.49902 20 4.76186V15.2386C19.9999 16.5014 19.4981 17.7125 18.6051 18.6054C17.7121 19.4984 16.501 20 15.2381 20H4.7614C3.49855 19.9999 2.28747 19.4981 1.39455 18.6051C0.501631 17.7121 -6.02406e-09 16.501 0 15.2381V4.7614C0.000123349 3.49855 0.501872 2.28747 1.39488 1.39455C2.28789 0.501631 3.49902 -6.02406e-09 4.76186 0V0Z" fill="#605BFF"/>
                        </mask>
                        <g mask="url(#mask0_3929_34681)">
                        <path d="M13.786 2.5625L19.9975 8.77413L19.9277 29.3058L8.11719 17.4535V6.91634L13.786 2.5625Z" fill="#3F3AD5"/>
                        </g>
                        <path d="M13.793 5.93982C12.3473 5.81532 11.6243 6.35955 11.6239 7.57249H13.793V10.9316H11.6238V17.4532H8.125V7.57249C8.125 5.89312 8.59922 4.61405 9.54767 3.73529C10.4961 2.85653 11.9112 2.4716 13.7928 2.58052L13.793 5.93982Z" fill="white"/>
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
      checkCommentSpan(postBodyEl);
      // chrome.runtime.sendMessage({ "action": "openPostSetting", "isSponsored": true })
      // postFigure = postBodyEl;
    } else {
      getpostLinkFromLink(postBodyEl);
    }
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
    // console.log("embed post div : ", embedPost)
    if (embedPost && embedPost.length > 0) {
      clearInterval(embedInterval);
      const embedLink = embedPost.find('input[aria-label="Sample code input"]')
      // console.log("embeded link ::: ", embedLink[0].value)
      var div = document.createElement('div');
      div.innerHTML = embedLink[0].value.trim();
      const iframeVal = div.firstChild;
      // console.log("value of iframe value", iframeVal);
      let postUrl = iframeVal && iframeVal.src;
      // console.log("post URL ::: ", postUrl);
      postUrl = postUrl.split("href=")[1].split("&")[0]
      postUrl = querystring.parse(postUrl)
      postUrl = Object.keys(postUrl)[0];
      // postUrl = postUrl.replaceAll("%3A", ":").replaceAll("%2F", "/")
      // console.log("post URL ::: ", postUrl);
      $('div[aria-label="Close"]').click();
      chrome.runtime.sendMessage({ "action": "openPostSetting", "postUrl": postUrl })
    }
  }, 500)
}

const checkCommentSpan = (postBodyEl) => {

  // console.log("use pp is clicked 3.", $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(3));
  let post_body = $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(3);
  post_body = $(post_body[0]).find('[data-visualcompletion="ignore-dynamic"]')
  // console.log($(post_body[0]).find('[data-visualcompletion="ignore-dynamic"]'))
  console.log("post_body ::: ", post_body);
  let coment_section = $(post_body[0]).find('[id^=":r"][role="button"]')
  console.log("coment_section  ::  ", coment_section)
  if (coment_section && coment_section.length > 0) {
    // coment_section = $(coment_section[0]).find('span[dir="auto]')[0]
    coment_section[0].click();
    const commentInterval = setInterval(() => {
      const commentDialogue = $('[role="dialog"]')
      console.log("commentDialogue ::: ", commentDialogue)
      let commentSection = $(commentDialogue).find('[aria-label^="Comment by "]')
      console.log("commentSection :=: 1 :=: ", commentSection);
      if (commentSection && commentSection.length > 0) {
        clearInterval(commentInterval)
        commentSection = $(commentSection[0]).find('ul.html-ul')
        console.log("commentSection :=: 2 :=: ", commentSection);
        commentSection = $(commentSection[0]).find('li.html-li')[0]
        console.log("commentSection :=: 3 :=: ", commentSection);
        const postUrl = $($(commentSection).find('a[role="link"]')).attr("href")
        console.log("postUrl ::: ", postUrl);
        $('div[aria-label="Close"]')[0].click();
        chrome.runtime.sendMessage({ "action": "openPostSetting", "postUrl": postUrl })
      }
    }, 500)
  } else {
    chrome.runtime.sendMessage({ "action": "openPostSetting", "isSponsored": true })
    postFigure = postBodyEl;
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("request for sponsored post : ", request);
  switch (request.action) {
    case "reStartForSponsored":
      shoudIstop = false;
      groupSettings = request.response;
      if (!groupSettings.reaction && groupSettings.comment) {
        // getMembersFromComments()
        $('div[aria-label="Close"]')[0].click();
      }
      if (groupSettings.reaction) {
        const ignoreDiv = $('div[role="dialog"][aria-labelledby^=":"]').find('div[data-visualcompletion="ignore-dynamic"]')
        getMembersOfReaction(ignoreDiv[0], $('div[role="dialog"][aria-labelledby^=":"]'));
      }
      break;
    case "startForSponsored":
      queueCount = 0;
      memberCount = 0;
      chrome.runtime.sendMessage({
        action: "showCount",
        paylaod: {
          queueCount: queueCount,
          memberCount: memberCount,
          source: "post",
        },
      });

      await helper.saveDatainStorage("showCount", {
        queueCount: queueCount,
        memberCount: memberCount,
        source: "post",
      });
      shoudIstop = false;
      groupSettings = request.response;
      startOpenDialogues();
      break;
    case "getfriendId":
      // if (shoudIstop) return;
      contactDetails = [...contactDetails, request.memberContact];
      // console.log("contactDetails", contactDetails);
      if (contactDetails.length >= 1) {
        if (shoudIstop) return;
        storeWouldbeFriends(contactDetails, contactDetails.length);
      }

      addFriendList.shift();
      await startFetchingDetails(genDialogue);
      break;
    case "pauseForSponsored":
      shoudIstop = true;
      break;
    case "stopForSponsored":
      console.log("stop the process");
      $('div[aria-label="Close"][role="button"]').click();
      chrome.runtime.sendMessage({
        action: "showCount",
        paylaod: {
          queueCount: 0,
          memberCount: 0,
          source: "post",
        },
      });

      await helper.saveDatainStorage("showCount", {
        queueCount: 0,
        memberCount: 0,
        source: "post",
      });
      chrome.runtime.sendMessage({ action: "close" })
      break;
    default:
      break;
  }
})

const startOpenDialogues = () => {
  if (groupSettings.reaction) {
    // document.querySelector('span[role="toolbar"][aria-label="See who reacted to this"]').querySelector('div[role="button"]').click()
    let reactionholder = $(postFigure).find('span[role="toolbar"][aria-label="See who reacted to this"]');
    reactionholder = $(reactionholder).find('div[role="button"]')
    reactionholder = reactionholder[0]//[reactionholder.length - 1]
    console.log("reactionholder ::: ", reactionholder);
    if (reactionholder) {
      // console.log($(reactionholder).find('span:not([aria-hidden="true"])'));
      // console.log($(reactionholder).find('span[aria-hidden="true"]'));
      // $(reactionholder).find('span[aria-hidden="true"]')[0].click();
      reactionholder.click();
      const reactorsInterval = setInterval(() => {
        // console.log(`$('div[role="dialog"]') =====>> >  >   >    >     >      > `, $('div[role="dialog"][aria-labelledby^=":"]'));
        const ignoreDiv = $('div[role="dialog"][aria-labelledby^=":"]').find('div[data-visualcompletion="ignore-dynamic"]')
        // console.log("ignoreDiv ----------> ", ignoreDiv);
        if (ignoreDiv && ignoreDiv.length > 0) {
          clearInterval(reactorsInterval)
          getMembersOfReaction(ignoreDiv[0], $('div[role="dialog"][aria-labelledby^=":"]'));
        }
      }, 500)
    }
  }
  if (!groupSettings.reaction && groupSettings.comment) {
    // getMembersFromComments()
    $('div[aria-label="Close"]')[0].click();
  }
}

const getMembersOfReaction = (ignoreDiv, dialogue) => {
  // console.log("reaction selected from settings : ", groupSettings.reaction, groupSettings.reaction_type);
  if (groupSettings.reaction && groupSettings.reaction_type.length > 0) {
    if (shoudIstop) return;
    function capitalizeFLetter(string) {
      return (string[0].toUpperCase() +
        string.slice(1));
    }
    const current_reaction = capitalizeFLetter(groupSettings.reaction_type[0])
    // console.log(`$(ignoreDiv).find('[aria-label^=${current_reaction}]') ::::::::: `, $(ignoreDiv).find(`[aria-label^=${current_reaction}][role="tab"]`));
    let current_reaction_div = $(ignoreDiv).find(`[aria-label^=${current_reaction}]`)
    console.log("current_reaction_div ::: ", current_reaction_div[0]);
    console.log("current_reaction_div area checked ::: ", current_reaction_div && current_reaction_div[0] && $(current_reaction_div[0]).attr("aria-checked") === "false");
    console.log("current_reaction_div aria hidden ::: ", current_reaction_div && current_reaction_div[0] && $(current_reaction_div[0]).attr("aria-hidden") === "false");
    if (shoudIstop) return;
    // console.log("sob miliye --- > ", current_reaction_div && current_reaction_div.length > 0 && 
    //   ($(current_reaction_div[0]).attr("aria-hidden") === "false" || 
    //   $(current_reaction_div[0]).attr("aria-checked") === "false")
    // );
    if (current_reaction_div && current_reaction_div.length > 0 && ($(current_reaction_div[0]).attr("aria-hidden") === "false" || $(current_reaction_div[0]).attr("aria-checked") === "false")) {
      current_reaction_div[0].click();
      collectDataTillEnd(dialogue)
    } else {
      // console.log(`$(current_reaction).attr("aria-hidden") ::: `, $(current_reaction_div[0]).attr("aria-hidden"));
      current_reaction_div = $(ignoreDiv).find(`[aria-haspopup="menu"][role="tab"]`)
      console.log("current_reaction_div in more ::: ", current_reaction_div);
      if (current_reaction_div && current_reaction_div.length > 0) {
        current_reaction_div[0].click();
        setTimeout(() => {
          getMembersOfReaction(ignoreDiv, dialogue);
        }, 1000)
      } else {
        groupSettings.reaction_type.shift();
        getMembersOfReaction(ignoreDiv, dialogue)
      }
    }
  }
  else {
    const close = $('div[aria-label="Close"][role="button"]');
    console.log("close ::: ", close);
    close.click();
    if (groupSettings.comment) {
      // getMembersFromComments()
      $('div[aria-label="Close"]')[0].click();
    }
    else {
      // porda sora
      chrome.runtime.sendMessage({ action: "close" })
    }
  }
}

const collectDataTillEnd = (dialogue) => {
  const memberinterval = setInterval(async () => {
    console.log("dialogue ::: ", $(dialogue));
    let memberListDiv = $(dialogue).find('div[aria-label="Add friend"]:not(.selected)');
    // console.log("memberListDiv 1 ::: ", memberListDiv);
    memberListDiv = Object.values(memberListDiv);
    memberListDiv.splice(memberListDiv.length - 2, 2)
    // console.log("memberListDiv ::: ", memberListDiv);
    if (memberListDiv && memberListDiv.length > 0 && count < 15) {
      clearInterval(memberinterval)
      if (shoudIstop) return;
      const scrolElem = memberListDiv[memberListDiv.length - 1];
      console.log("scrolElem ::: ", scrolElem);
      count = 0;
      addFriendList = [...addFriendList, ...memberListDiv];
      memberCount = memberCount + memberListDiv.length;
      chrome.runtime.sendMessage({
        action: "showCount",
        paylaod: {
          queueCount: queueCount,
          memberCount: memberCount,
          source: "post",
        },
      });

      await helper.saveDatainStorage("showCount", {
        queueCount: queueCount,
        memberCount: memberCount,
        source: "post",
      });
      halfPagescroll(scrolElem)

      memberListDiv.forEach(el => {
        if (!$(el).hasClass('selected')) {
          $(el).addClass('selected')
        }
      })
      startFetchingDetails(dialogue);
    }
    else {
      count++;
      if (count >= 15) {
        clearInterval(memberinterval)
        count = 0;
        groupSettings.reaction_type.shift();
        // console.log("groupSettings.reaction_type ::::::::::: ", groupSettings.reaction_type);
        const ignoreDiv = $('div[role="dialog"][aria-labelledby^=":"]').find('div[data-visualcompletion="ignore-dynamic"]')
        // console.log("ignoreDiv ::: ", ignoreDiv, ignoreDiv[0]);
        getMembersOfReaction(ignoreDiv[0], dialogue);
      }
    }
  }, 1000)
}

const startFetchingDetails = async (dialogue) => {
  // console.log("dialogue ::: ", dialogue);
  // console.log("addFriendList ::: ", addFriendList);
  if (addFriendList && addFriendList.length > 0) {
    if (shoudIstop) return;
    const AddFriendParent = $(addFriendList[0]).closest('div[aria-disabled="false"]');
    // console.log("Add friend Parent ::: ", AddFriendParent);
    const imgAnchore = $(AddFriendParent).find('a[role="link"]')
    console.log("imgAnchore ::: ", imgAnchore[0]);
    const name = $(imgAnchore[0]).attr('aria-label');
    let profileUrl = $($($(AddFriendParent).children().eq(0)).children().eq(1)).children().eq(0);
    console.log("profile Url ::: 1 ", profileUrl);
    profileUrl = $(profileUrl).find('a[role="link"]')
    console.log("profile Url ::: 2 ", profileUrl);
    profileUrl = $(profileUrl[0]).attr('href').split('__cft__')[0];
    profileUrl = profileUrl.slice(0, profileUrl.length - 1);
    let friendFBId = ""
    if (profileUrl.includes('php')) {
      friendFBId = profileUrl.split("id=")[1];
    }
    let payload = {
      friendName: name,
      friendProfileUrl: profileUrl,
      friendProfilePicture: $(imgAnchore[0]).find(`svg[aria-label="${name}"][role="img"]`).find('image').attr('xlink:href'),
      mutual_friend: '0',
      friendFbId: friendFBId,
      sourceName: "Request from post",
      "finalSource": "post",
      "sourceUrl": "#"
    }
    console.log("payload ::: ", payload);
    // if (groupSettings.gender_filter || groupSettings.country_filter_enabled) {
      genDialogue = dialogue
      await chrome.runtime.sendMessage({
        action: "getfriendId",
        memberContact: payload,
        filter: groupSettings.gender_filter || groupSettings.country_filter_enabled
      });
  }
  else {
    if (shoudIstop) return;
    console.log("addFriendList sesh");
    collectDataTillEnd(dialogue);

  }
};

const halfPagescroll = (el) => {
  return new Promise((resolve, reject) => {
    try {
      // console.log("invoking half page scroll")
      el.scrollIntoView({
        behavior: "smooth",
      });

      resolve(true);
    } catch (err) {
      // console.log("error", err);
      resolve(false);
    }
  });
};


const storeWouldbeFriends = async (facebook_contacts, contactNumber = null) => {
  console.log("facebook_contacts ::: ", facebook_contacts);
  console.log("contactDetails ::: ", contactDetails);
  let { userID } = await helper.getDatafromStorage("fbTokenAndId");
  const paylaod = {
    fb_user_id: userID,
    settingsId: groupSettings.settingsId,
    settingsType: groupSettings.settings_type,
    facebook_contacts: [...facebook_contacts],
  };

  console.log("paylaod fpr req to store it in FRQS ------> ", paylaod);
  if (contactNumber) {
    facebook_contacts.splice(0, contactNumber)
    contactDetails.splice(0, contactNumber)
  }
  const respOfFRQS = await common.storeInFRQS(paylaod);
  console.log("queue count <<<<<<<<<<<<<<<<<<<<<<<<<<<---------------------------- ", queueCount, typeof queueCount)

  console.log("respOfFRQS ::: ", respOfFRQS, respOfFRQS.record_count, typeof respOfFRQS.record_count)

  queueCount = queueCount + respOfFRQS.record_count;
  console.log("queue count ---------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>> ", queueCount, typeof queueCount)
  if (respOfFRQS.record_count > 0) {
    chrome.runtime.sendMessage({ action: "fr_queue_success" })
    chrome.runtime.sendMessage({
      action: "showCount",
      paylaod: {
        queueCount: queueCount,
        memberCount: memberCount,
        source: "post",
      },
    });

    await helper.saveDatainStorage("showCount", {
      queueCount: queueCount,
      memberCount: memberCount,
      source: "post",
    });
  }
};

const getMembersFromComments = () => { }

// aria-label="See who reacted to this"
// role="dialog"
// aria-label="Like, 82"
// aria-selected="false"
// data-visualcompletion="ignore-dynamic"
// aria-disabled="false"
// g[mask^="url("]  image
// data-visualcompletion=ignore-dynamic"
// id=":r1o9:" role="button"
// data-virtualized="false"
// aria-label="Comment by Soumen Roy 12 weeks ago"
// aria-hidden="false" html-undefinedl ul