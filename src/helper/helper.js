
import {getProfileInfo} from "../service/Auth";

const loginHelper = {
    
    login: function () {
        return new Promise((resolve, reject) => {
        
            getProfileInfo().then(async (result) => {
                try {
                    let sugest, dtsg, UserFacebookUsername = "", UserFacebookName = "", UserFacebookid = "", UserFacebookImage = "", UserLoggedInFacebook = false;
                    const regex3 = /\\"suggestions\\":\[\{[^}]*\}/gm;
                    const regex4 = /\\"dtsg\\":\{[^}]*\}/gm;
                    if (result.match(regex4)!= null) {
                        // console.log("it is true");

                        dtsg = result.match(regex4)[0];

                        dtsg = "{" + dtsg.replace(/[\\]/g, "") + "}";

                        dtsg = JSON.parse(dtsg).dtsg;
                    }
                    // console.log("dtsg : ", dtsg);
                    // chrome.storage.local.set({"dtsg" : dtsg});

                    if (regex3.test(result)) {
                        sugest = result.match(regex3)[0];
                        sugest = "{" + sugest.replace(/[\\]/g, "") + "]}"
                        sugest = JSON.parse(sugest).suggestions[0]
                        // console.log("sugest in login helper", sugest);
                        // const kyubiUserInfo = await getData("user");
                        // console.log("kyubiUserInfo : ", kyubiUserInfo);
                        setTimeout(()=>{
                            UserFacebookid = sugest.uid;
                            UserFacebookUsername = sugest.path;
                            UserFacebookName = sugest.text;
                            UserFacebookImage = sugest.photo;
                            UserLoggedInFacebook = true;
                            let fbUserInfo={
                                FacebookId : UserFacebookid,
                                FacebookUsername : UserFacebookUsername,
                                FacebookName : UserFacebookName,
                                FacebookImage  : UserFacebookImage,
                                LoggedInFacebook  : UserLoggedInFacebook,
                                // extensionID : kyubiUserInfo.extId,
                                // kyubiEmail : kyubiUserInfo.email,
                                // plan : kyubiUserInfo.plan,
                                dtsg: dtsg
                            }
                            console.log("fbUserInfo in helper : ", fbUserInfo);

                            // chrome.storage.local.set({"fbUserInfo" : fbUserInfo});
                            resolve([true, fbUserInfo]);
                            // chrome.runtime.sendMessage({type: "storeUserInfoOrQueryThenStore", options: parameters});
                        },500)
                    }else {
                        resolve([false]);
                        // UserLoggedInFacebook = false;
                        // let fbUserInfo={
                        //     FacebookId : UserFacebookid,
                        //     FacebookUsername : UserFacebookUsername,
                        //     FacebookName : UserFacebookName,
                        //     FacebookImage  : UserFacebookImage,
                        //     LoggedInFacebook  : UserLoggedInFacebook
                        // }
                        // console.log("fbUserInfo : ", fbUserInfo);
                        // chrome.runtime.sendMessage({type: "storeUserInfoOrQueryThenStore", options: parameters});
                    }
                }
                catch (err) {
                // console.log("err : ", err);
                }
            }).catch(error => {
                // console.log("This I got From backGround EROOOOOO dash1", error);
            })
        })
    },
    logout: function () {
    try{
    }catch(error){
        return error
    }
    }
}


  /** 
 * @getData
 * this function will grab data from local store
 * 
*/
const getData = (key) => {
    return new Promise((resolve, reject) => {
        try {
          chrome.storage.local.get([key], function (res) {
            if (!isEmptyObj(res)) {
            //   console.log("key in helper : ", key);
            //   console.log("retieved data in helper : ",res[key]);
              if(res[key]!=null || res[key]!=undefined)
                resolve(res[key]);
              else {
                  resolve({});
              }
            } else {
              resolve({});
            }
          });
        } catch (e) {
          resolve({});
        }
    });
}

/** 
 * @isEmptyObj
 * this function will check wheather the @obj is object or not
 * 
*/
const isEmptyObj = function (obj) {
    for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
    }
    return true;
    };

export default loginHelper