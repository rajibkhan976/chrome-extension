import axios from "axios";
import helper from "../../extensionScript/helper";
const kyubiSettings = require("../../kyubiSettings.json");


//fetch dmf service
export const fetchDMFs = () => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    // const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    // const body = { fbUserId: fbTokenAndId?.userID, }
    axios
      .get(process.env.REACT_APP_FETCH_DMF_URL,config)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err);
      });
  });
}
//sub dmf priority change



export const prioritySubDMFValue = (updatePrioritySubDmf) => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    // console.log("token", token);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    //const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
    //const body = { fbUserId: fbTokenAndId?.userID, }
    axios
      .post(kyubiSettings.prioritySubDMF,updatePrioritySubDmf, config)
      .then((res) => {
        // console.log("res : ", res);
        resolve(res.data);
      })
      .catch((err) => {
        // console.log("err : ", err);
        resolve(err?.res.data ? err.res.data : err.message);
      });
  });
}

/**
 * fetching all message groups
 */
export const fetchMesssageGroups = () => {
  return new Promise(async (resolve, reject) => {
    const token = await helper.getDatafromStorage("fr_token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    };
    axios
      .get(process.env.REACT_APP_FETCH_MESSAGE_GROUPS, config)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        resolve(err);
      });
  });
}





// export const prioritySubDMF = (updatePrioritySubDmf)=>{
//   return new Promise((resolve, reject)=>{
//   axios
//       .post(
//           config.prioritySubDMF,
//           updatePrioritySubDmf,
//           {headers: headers}
//       )
//       .then((result)=>{
//           // console.log('got deleted', result.data);
//           resolve(result.data);
//       })
//       .catch((error)=>{
//           console.log('error', error);
//           reject(error?.response?.data ? error.response.data : error.message);
//       })
//   })
// }

