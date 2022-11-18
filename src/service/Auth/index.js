import axios from "axios";
const kyubiSettings = require("../../kyubiSettings.json");

/**
 * 
 * @param {* payload for login api from login} payload 
 * @returns {* response or error from login api }
 */

export const adminLogin = async (payload) => {

    // console.log("I am in service : ", kyubiSettings);
    // console.log("I am in service : ", kyubiSettings.loginURL);
    return new Promise((resolve, reject) => {

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const body = payload

        axios
            .post(kyubiSettings.loginURL, body, config)
            .then(res => {
                // console.log("res : ", res);
                resolve(res);
            }
            )
            .catch(err => {
                // console.log("err : ", err);
                resolve(err);
            });
    })
};

/**
 * 
 * @param {* emailid for forgot password api} email 
 * @returns {* response from forot password api }
 */

export const forgotPassword = async (email) => {

    // console.log("I am in service : ", kyubiSettings);
    // console.log("I am in service : ", kyubiSettings.loginURL);
    return new Promise((resolve, reject) => {

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }
        const body = {
            email: email,
            extId: kyubiSettings.extId
        };

        axios
            .post(kyubiSettings.forgotPassURL, body, config)
            .then(res => {
                // console.log("response in forgot password service : ", res);
                resolve(res && res.data);
            }
            )
            .catch(err => {
                // console.log("err : ", err);
                resolve({status: false})
            });
    })
};

/**
 * 
 * @param {* payload for body of chane password api} payload 
 * @param {* jwt token stored in local storae after login} token 
 * @returns 
 */

export const changePassword = async (payload, token) => {

    // console.log("I am in service : ", kyubiSettings);
    // console.log("I am in service : ", kyubiSettings.loginURL);
    return new Promise((resolve, reject) => {

        const config = {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': "KYUBI_" + token,
                'Access-Control-Allow-Origin': "*"
            }
        }
        payload.extensionId = kyubiSettings.extId
        const body = payload;

        axios
            .post(kyubiSettings.changePassURL, body, config)
            .then(res => {
                // console.log("res : ", res);
                resolve(res && res.data);
            }
            )
            .catch(err => {
                // console.log("err : ", err);
                resolve({status: false})
            });
    })
};

/**
 * 
 * @param {* payload for chec user status} payload 
 * @returns 
 */

const checkUserStatus = function (payload) {
    return new Promise(function (resolve, reject) {
        const config = {
            headers: {
                "Content-Type": "application/json"
            }
        }
        payload.extensionId = kyubiSettings.extId

        const body = payload;

        axios
            .post(kyubiSettings.checkUserStatusURL, body, config)
            .then(res => {
                // console.log("res : ", res);
                resolve(res && res.data);
            }
            )
            .catch(err => {
                // console.log("err : ", err);
                resolve(false)
            });
    });
};

export const getProfileInfo = () => {
    return new Promise((resolve, reject) => {
        let options = {
            method: 'GET',
            mode: "cors", // no-cors, cors, *same-origin
            url: "https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed",
            headers: {
                "Origin": "https://www.facebook.com",
                'Content-Type': 'text/html'
            },
            // data: JSON.stringify(payload)
        }
        axios(options)
            .then(res => {
                // console.log("In Success profile get", res);
                resolve(res.data)
            })
            .catch(err => {
                // console.log("Error In get profile data");
                reject(err)
            })
    })
}

export const saveFbUserInfoDB = (payload) => {
    return new Promise((resolve) => {
        let options = {
            method: 'POST',
            mode: "cors", // no-cors, cors, *same-origin
            url: "http://localhost:8080/api/user/create",
            headers: {
                'Content-Type': 'text/html'
            },
            data: payload
        };
        axios(options)
            .then(res => {
                // console.log("In Success profile saeve : ",res);
                resolve(res.data)
            })
            .catch(err => {
                // console.log("Error In get profile data", err);
                // reject(err)
            })
    })
}