import axios from "axios";
import useApi from "./useApi";
import helper from "../extensionScript/helper";
const kyubiSettings = require("../kyubiSettings.json");

/**
 *
 * @param {useApi} {url,payload,type}
 * @returns {data,loading,error}
 */
export const PostFriendResSet = (data) => {
  // console.log("data came", data);
  //   return useApi(kyubiSettings.postFriendReqSetUrl,data,"POST")
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    const body = { ...data, fbUserId: fbTokenAndId?.userID }
    // console.log("config ::: ", config)
    // console.log("kyubiSettings.postFriendReqSetUrl ::: ", kyubiSettings.postFriendReqSetUrl)
    // console.log("config.headers ::: ", config.headers)
    axios
      .post(process.env.REACT_APP_POST_FRIEND_REQUEST_SET_URL, body, config)
      .then((res) => {
        // console.log("res : ", res);
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
};

export const getKeyWords = () => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    const body = { fbUserId: fbTokenAndId?.userID, }
    axios
      .post(process.env.REACT_APP_KEYWORDS_URL, body, config)
      .then((res) => {
        // console.log("res : ", res);
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
}




export const getAllMessageGroup = () => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    const body = { fbUserId: fbTokenAndId?.userID, }
    axios
      .post(process.env.REACT_APP_FETCH_ALL_MESSAGE_GROUPS, body, config)
      .then((res) => {
        // console.log("res : ", res);
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
}


export const saveKeyWords = (data) => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    data.fbUserId = fbTokenAndId?.userID
    axios
      .post(process.env.REACT_APP_SAVE_KEYWORDS_URL, data, config)
      .then((res) => {
        // console.log("res : ", res);
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
}


/**
 * GET DEFAULT FRND REQUEST SETTINGS
 * @param {*} settingsType 
 * @returns 
 */
export const getFrndReqSet = (settingsType = null) => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    // console.log("fbTokenAndId?.userID :::: ", fbTokenAndId?.userID)
    const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    const body = {
      fbUserId: fbTokenAndId?.userID,
      settings_type: settingsType,
    }
    // console.log("body :::: ", body)
    axios
      .post(process.env.REACT_APP_GET_FRIEND_REQUEST_URL, body, config)
      .then((res) => {
        // console.log("res ::: ", res);
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
}

/**
 * SAVE FRIEND REQUEST SETTINGS
 * @param {*} payload 
 * @returns 
 */
export const saveFrndReqSettings = (payload) => {
  return new Promise(async (resolve, _reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };

    axios.post(process.env.REACT_APP_SAVE_FRIEND_REQUEST_SETTINGS, payload, config)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        resolve(err);
      });
  });
};

/**
 * UPDATE FRIEND REQUEST SETTINGS
 * @param {*} settingsId 
 * @param {*} payload 
 * @returns 
 */
export const updateFrndReqSettings = (settingsId, payload) => {
  return new Promise(async (resolve, _reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };

    const updatePayload = {
      ...payload,
      settingsId: settingsId,
    };

    axios.post(process.env.REACT_APP_UPDATE_FRIEND_REQUEST_SETTINGS, updatePayload, config)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        resolve(err);
      });
  });
};


export const getProfileSettings = () => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    // console.log("fbTokenAndId?.userID :::: ", fbTokenAndId?.userID)
    const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    const body = { fbUserId: fbTokenAndId?.userID, }
    //console.log("body :::: ", body)
    axios
      .post(process.env.REACT_APP_SETTING_API, body, config)
      .then((res) => {
        console.log("res ::: ", res);
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
}




// /**
//  * 
//  * @param {useApi} {url,payload,type} 
//  * @returns {data,loading,error}
//  */
// export const PostFriendResSet = (data) => {
// console.log("data came", data);
// //   return useApi(kyubiSettings.postFriendReqSetUrl,data,"POST")
// return new Promise(async (resolve, reject) => {
//     const token = await helper.getDatafromStorage('fr_token');
//     const config = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization' : token
//         }
//     }
//     const body = data
// console.log("config ::: ", config)
// console.log("kyubiSettings.postFriendReqSetUrl ::: ", kyubiSettings.postFriendReqSetUrl)
// console.log("config.headers ::: ", config.headers)
//     axios
//         .post(kyubiSettings.postFriendReqSetUrl, body, config.headers)
//         .then(res => {
//               // console.log("res : ", res);
//             resolve(res);
//         }
//         )
//         .catch(err => {
//              // console.log("err : ", err);
//             resolve(err);
//         });
// })
// }