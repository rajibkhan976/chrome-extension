import selectors from "./selector";
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
    popUpmenuBox= "",
    PopupMenuBox_children,
    isEmptyObj = false;
let savePostMenuItem =
`<div class="friender savePost schedulerTrigger x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou xe8uvvx x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz xjyslct x9f619 x1ypdohk x78zum5 x1q0g3np x2lah0s x1w4qvff x13mpval xdj266r xat24cr x1n2onr6 x16tdsg8 x1ja2u2z x6s0dn4 x1y1aw1k x1sxyh0" role="menuitem" tabindex="-1">
                        <div class="x6s0dn4 xoi2r2e x78zum5 xl56j7k xq8finb xcrj56b x1ua1ozc">
                            <i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" style="background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAwFBMVEUAAABhW/9fWf9aVfVYU/VgW/9hW/9gW/9XU/ZXU/RgW/9gW/9gW/9XUvRXU/RgW/9XUvNXUvNbV/lgW/8V1rcV27cZyro4VNA4VtA/OtVPc+9STe5SdPJTaPJXUvNYVPVZU/VbVvNbV/lcV/NcV/pfWv5fW/5gW/9gXPphXP9oY/+GgvaJhveKh/+hn/ihqe6joe+opf2ppvyrqPiuq/y3tP/S0fzY1/za2P/f3v3n5//08/709P/39/78/P////8+SfssAAAAFHRSTlMAKiszNLS2t8HC7e7v8vL2+P7+/u/UC28AAAABYktHRD8+YzB1AAAAjUlEQVQYGQXB20rDQBQAwNmzJ62XRl8D9f//rNAHwZKikNuuM0Xk6Qq4rXsrMU4AuM85TKC+D/HdTX85gPg4s/XBkFeQZ31ph+E1geTxYA+J36W88DneN2tPtF4LEdATtRasR4PEW2t4ziDgEgAEuFQAcQMF4MgVtF0Ha4lxQtsamJ9F1NMXfen87Nv+DxViNU4/HML/AAAAAElFTkSuQmCC); background-position: 0px -108px; background-size: auto; width: 20px; height: 20px; background-repeat: no-repeat; display: inline-block;"></i>
                        </div>
                        <div class="x6s0dn4 x78zum5 x1q0g3np x1iyjqo2 x1qughib xeuugli">
                            <div class="x78zum5 xdt5ytf xz62fqu x16ldp7u">
                                <div class="xu06os2 x1ok221b">
                                    <span class="friender_savePost  x193iq5w xeuugli x13faqbe x1vvkbs x10flsy6 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x41vudc x6prxxf xvq8zen xk50ysn xzsf02u x1yc453h" dir="auto">
                                        Use Friender
                                    </span>
                                </div>
                        </div>
                        <div class="x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1ey2m1c xds687c xg01cxk x47corl x10l6tqk x17qophe x13vifvy x1ebt8du x19991ni x1dhq9h" data-visualcompletion="ignore">
                        </div>
                      </div>
                      <hr class="x14nfmen x1e56ztr xktsk01 x1d52u69 x1xmf6yo">`;

// post_count = document.querySelectorAll(selectors.ariaLabel).length;

function doInit() {
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
      if(postObjElArr.length === 0)
        postObjElArr = $(this).closest('div[class="x1a2a7pz"]');
      if(postObjElArr.length === 0)
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
      if ($(child).hasClass("postProfits")) {
        already_exists = true;
      }
    });
    let canDelete;
    var isThisAds = false;
  
    Array.prototype.forEach.call(menueItems, (child) => {
      if (
        $(child)[0].textContent.toLowerCase().trim() ===
        "why am i seeing this ad?".toLowerCase().trim()
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
      $(".friender").click(function () {
        // console.log("hi.........................................................");
        // console.log("postBodyEl.", postBodyEl);
        // console.log("use pp is clicked 1.", $(postBodyEl).find(`div.html-div`));
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
            if(allUrlsOfPsts.length === 0){
              post_body = $($($(postBodyEl).find(`div.html-div`)[0]).find(`div.html-div`)[0]).children().eq(2);
              console.log(post_body);
              allUrlsOfPsts = $(post_body.find(`div.html-div`)).find(
                'a[role="link"]'
              );
              console.log("allUrlsOfPsts ::::::: 2 :::::::: ", allUrlsOfPsts);
              i = 0;
            }
            allUrlsOfPsts[i].dispatchEvent(
            new FocusEvent("focusin", {
                view: window,
                bubbles: true,
                cancelable: true,
            })
            );
            // var postUrl = $(allUrlsOfPsts[allUrlsOfPsts.length - 1]).attr("href");
            setTimeout(function () {
                var postUrl = $(allUrlsOfPsts[i]).attr("href");
                console.log("post URL ::::::::::::::::::::::: ", postUrl);
                if(!postUrl.includes("https://www.facebook.com")){
                    postUrl = "https://www.facebook.com" + postUrl
                    console.log("post URL ::::::::::::::::::::::: ", postUrl);
                }
                chrome.runtime.sendMessage({"action" :  "openPostSetting", "postUrl" : postUrl})
            }, 500);
        },500)
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

//   document.addEventListener("DOMContentLoaded", function(event) { 
    setTimeout(()=>{
    console.log("--------------------------- dom loaded -------------------------------");
    doInit();
  
    onElementHeightChange(document.body, function () {
      // console.log("Body height changes");
      doInit();
    });
  }, 1000);
