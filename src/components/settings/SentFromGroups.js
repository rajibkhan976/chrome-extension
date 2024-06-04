import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import InnherHeader from "../shared/InnerHeader";
import {
    fr_Req_Payload,
    requestFormAdvncSettings,
    requestGroupsFormSettings
} from '../../helper/fr-setting';
import ModernForm from '../dashboard/requestForms/ModernForm';
import { Bolt, CheckIcon, GenderIcon, KeywordsIcon, MessageSettingIcon, SkipAdmin, TierIcon } from '../shared/SVGAsset';
import { MutualFriendsIcon, EditSingleIcon, TickIcon, ServerSuccess, ServerError } from '../../assets/icons/Icons';
import AutomationStats from '../shared/AutomationStats';
import { getFrndReqSet, getKeyWords, getProfileSettings, PostFriendResSet, saveFrndReqSettings, updateFrndReqSettings } from "../../service/FriendRequest";
import helper from '../../extensionScript/helper';
import common from '../../extensionScript/commonScript';
import AutomationRunner from '../shared/AutomationRunner';
import {
    capitalizeFirstLetter,
    checkValidity,
    removeEle,
    syncFromApi,
    syncFromNewAPi,
    syncPayload
} from '../../helper/syncData';
import { removeforBasic } from '../dashboard/FriendRequest';
import { fetchMesssageGroups } from '../../service/messages/MessagesServices';
import ServerMessages from '../shared/ServerMessages';
import Modal from '../shared/Modal';



const SentFromGroups = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [editType, setEditType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [requestActive, setRequestActive] = useState(null);
    const [formSetup, setFormSetup] = useState(requestGroupsFormSettings);
    // const [formSetup, setFormSetup] = useState(requestFormSettings);
    const [advcFormAssets, setAdvcFormAssets] = useState(null);
    const [runningScript, setrunningScript] = useState(false);
    const [isRunnable, setIsRunnable] = useState(false);
    const [friendReqSet, setFriendReqSet] = useState(false);
    const [isLoding, setIsLoding] = useState(true);
    const [settingApiPayload, setSettingApiPayload] = useState(fr_Req_Payload);
    const [settingSyncApiPayload, setSettingSyncApiPayload] = useState(null);
    const [isPaused, setIsPaused] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [readyToBack, setReadyToBack] = useState(false);
    const [openSuccessNotification, setOpenSuccessNotification] = useState(false);
    const [openErrorNotification, setOpenErrorNotification] = useState(false);
    const [openNotificationMsg, setOpenNotificationMsg] = useState("");
    const settingsType = 8;
    const [sendFrndReqGroupName, setSendFrndReqGroupName] = useState("");
    const [acceptReqGroupName, setAcceptReqGroupName] = useState("");
    const [stats, setStats] = useState({ queueCount: 0, memberCount: 0, source: "groups" });
    const [shouldfrienderRun, setShouldfrienderRun] = useState(true);
    const [settingsID, setSettingsID] = useState(null);
    const [stopFrnderModalOpen, setStopFrnderModalOpen] = useState(false);


    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.action === "shouldfrienderRun") {
            // console.log("request log -------------------> ", request, request.res);
            setShouldfrienderRun(request.res)
        }
    })

    useEffect(() => {
        (async () => {
            await chrome.runtime.sendMessage({ action: "shouldfrienderRun", source: "groups" });
            // console.log("groups.................")
            const runningStatus = await helper.getDatafromStorage("runAction_group");
            // console.log("runningStatus :::************************ ", runningStatus);
            if (runningStatus === "running") {
                setIsRunnable(true);
                const showCount = await helper.getDatafromStorage("showCount");
                console.log("showCount :: ", showCount);
                if (showCount && showCount.source === "groups")
                    setStats(showCount)
            }
            else if (runningStatus === "pause") {
                const savedPage = await helper.getDatafromStorage('save_groups');
                if (savedPage === false)
                    setEditType("basic");
                else
                    setEditType(null);
                setIsRunnable(false)
            }
            else {
                setIsRunnable(false)
                await helper.saveDatainStorage('save_groups', true)
                setEditType(null);
            }

            const allGroups = await fetchMesssageGroups();
            await helper.saveDatainStorage('settingMsgGroups', allGroups.data.data);
            injectAGroupsOptionToFormSettings(allGroups.data.data)
            syncData();
        })()
    }, [])


    const syncData = async () => {
        setIsLoding(true);
        const runningStatus = await helper.getDatafromStorage("runAction_group");
        const runningSettings = await helper.getDatafromStorage(
            // "curr_reqSettings"
            "groupSettingsPayload"
        );

        if (runningStatus === "pause" || runningStatus === "running") {
            if (runningSettings) {
                let curr_settingObj = runningSettings;
                // curr_settingObj = { ...curr_settingObj, is_settings_stop: false }
                setSettingApiPayload(curr_settingObj);
                setSettingSyncApiPayload(curr_settingObj);
                syncFromNewAPi(curr_settingObj, formSetup, setFormSetup);

                if (curr_settingObj?._id) {
                    // await helper.saveDatainStorage('groupSettingsId', { settingsId: apiCoreResponse?._id });
                    setSettingsID(curr_settingObj?._id);
                }

                if (curr_settingObj?.send_message_when_friend_request_accepted_message_group_id) {
                    setGroupName(curr_settingObj?.send_message_when_friend_request_accepted_message_group_id, setAcceptReqGroupName);
                }

                if (curr_settingObj?.send_message_when_friend_request_sent_message_group_id, setSendFrndReqGroupName) {
                    setGroupName(curr_settingObj?.send_message_when_friend_request_sent_message_group_id, setSendFrndReqGroupName);
                }

                setIsLoding(false);
            }

        } else {
            // getting frndReq settings 8 means for group settings..
            getFrndReqSet(settingsType)
                .then((res) => {
                    const apiObj = res.data.data;
                    // console.log("The api of friend req set>>>///||||\\\\:::", apiObj);
                    setFriendReqSet(apiObj[0]);
                    if (apiObj?.length > 0) {
                        syncPayload(apiObj[0], { ...settingApiPayload, is_settings_stop: false }, setSettingApiPayload);
                        removeEle(apiObj[0], removeforBasic).then((response) => {
                            const apiCoreResponse = apiObj[0];

                            (async () => {
                                await helper.saveDatainStorage('groupSettingsPayload', apiCoreResponse);

                                if (apiCoreResponse?._id) {
                                    // await helper.saveDatainStorage('groupSettingsId', { settingsId: apiCoreResponse?._id });
                                    response.settingsId = apiCoreResponse?._id;
                                    setSettingsID(apiCoreResponse?._id);
                                }
                            })();

                            // (async () => {
                            //     const localData = await fetchSetingsLocalData();

                            //     if (localData) {
                            //         setSettingSyncApiPayload(localData);
                            //         setSettingApiPayload(localData);
                            //     }
                            // })();

                            syncFromNewAPi(response, formSetup, setFormSetup);
                            setSettingSyncApiPayload(response);
                            // setSettingApiPayload(response);
                            setIsLoding(false);

                            if (response?.send_message_when_friend_request_accepted_message_group_id) {
                                setGroupName(response?.send_message_when_friend_request_accepted_message_group_id, setAcceptReqGroupName);
                            }

                            if (response?.send_message_when_friend_request_sent_message_group_id) {
                                setGroupName(response?.send_message_when_friend_request_sent_message_group_id, setSendFrndReqGroupName);
                            }
                        });
                        // generateFormElements();
                    } else {
                        setIsLoding(false);
                    }
                })
                .catch((err) => {
                    console.log("Error happened in Setting api call:::", err);
                });
        }

        // if (props.settingPage === "setSettingsForGroup") {
        //     setRequestActive("groups");
        //     setIsRunnable(true);

        //     // console.log("runningStatus ::: ", runningStatus);
        //     if (runningStatus === "running") {
        //         // console.log("runningrunningrunning", requestActive);
        //         setrunningScript(true);
        //     }
        // }
        requestGroupsFormSettings && setFormSetup(requestGroupsFormSettings);
        // requestFormAdvncSettings && setAdvcFormAssets(requestFormAdvncSettings);
    };


    // THIS WILL RESPONSIBLE FOR EVERYTIME DATA FETCHING UPDATING SO DON'T USE FOR ANY OTHER WORKS..
    // USE ANOTHER USE_EFFECT INSTEAD OF THIS ONE PLEASE
    useEffect(() => {
        // console.log("i am re rendered......");
        (async () => {
            const allGroups = await fetchMesssageGroups();
            await helper.saveDatainStorage('settingMsgGroups', allGroups.data.data);
            injectAGroupsOptionToFormSettings(allGroups.data.data)
        })()

        // console.log("all groups", allGroups.data);
        getKeyWords()
            .then((res) => {
                //console.log("inside key_____>>", res);
                const resdata = res.data.data;
                // console.log("ressssssssssss", resdata.length);
                if (resdata.length > 0) {
                    // console.log("hii data respwWWW>>>:", resdata);
                    let formSetPlaceholder = { ...formSetup };

                    const newObj = {
                        ...formSetPlaceholder,
                        fields: formSetPlaceholder.fields.map((item) => {
                            return {
                                ...item,
                                fieldOptions: item.fieldOptions.map((itemCh) => {
                                    if (
                                        "selectInput" === itemCh.type &&
                                        "selected_keywords" === itemCh.name
                                    ) {
                                        itemCh.options = [];
                                        resdata.forEach((item) => {
                                            if (item.keyword_type === 1) {
                                                itemCh.options.push({
                                                    //selected: false,
                                                    label: item.title,
                                                    value: item.title,
                                                    keys: item.keywords.split(","),
                                                });
                                            }
                                        });
                                    } else if (
                                        "selectInput" === itemCh.type &&
                                        "selected_negative_keywords" === itemCh.name
                                    ) {
                                        itemCh.options = [];
                                        resdata.forEach((item) => {
                                            if (item.keyword_type === 2) {
                                                itemCh.options.push({
                                                    // selected: false,
                                                    label: item.title,
                                                    value: item.title,
                                                    keys: item.keywords.split(","),
                                                });
                                            }
                                        });
                                    }

                                    return itemCh;
                                }),
                            };
                        }),
                    };
                    setFormSetup(newObj);
                    //  generateFormElements();
                    // data.forEach((item)=>

                    // syncKeyWord({ name: "selected_keywords",
                    // type: "selectInput",
                    // inLabel: item.title,
                    // value:  item.title,
                    // valueArr:item.keywords,
                    // options:[]}))
                }
            })
            .catch((err) => {
                console.log("Error in fetching keyword API", err);
            });

        ///Fetching data of friend request setting fron api
        syncData();
    }, [editType, isRunnable]);

    // FETCH SETTINGS DATA..
    useEffect(() => {
        if (editType !== "basic") {
            (async () => {
                const localData = await fetchSetingsLocalData();
                // console.log("Local Data -- ", localData);
                setSettingSyncApiPayload(localData);
            })();
        }
    }, [editType]);

    /**
     * 
     * @param {*} groupsArr 
     */
    const injectAGroupsOptionToFormSettings = (groupsArr) => {
        if (groupsArr.length > 0) {
            // console.log("hii data respwWWW>>>:", resdata);
            let formSetPlaceholder = { ...formSetup };

            const newObj = {
                ...formSetPlaceholder,
                fields: formSetPlaceholder.fields.map((item) => {
                    return {
                        ...item,
                        fieldOptions: item.name !== "send_message_when_friend_request_sent" && item.name !== "send_message_when_friend_request_accepted" ? item.fieldOptions : item.fieldOptions.map((itemCh) => {
                            // console.log("Got itemch name....>", itemCh.name);
                            // console.log("groups array", groupsArr);
                            itemCh.options = [];
                            groupsArr.forEach((item) => {
                                itemCh.options.push({
                                    //selected: false,
                                    label: item.group_name,
                                    value: item._id,
                                    id: item._id,
                                });

                            });
                            return itemCh;
                        }),
                    };
                }),
            };
            setFormSetup(newObj);
        }
    };


    // FETCH SETTINGS DATA FROM LOCAL STORAGE..
    const fetchSetingsLocalData = async () => {
        return await helper.getDatafromStorage('groupSettingsPayload');
    };



    /**
     * GETTING THE GROUP NAME BY ID AND SET TO STATE
     * @param {*} groupId 
     * @param {*} setState 
     */
    const setGroupName = (groupId, setState) => {
        (async () => {
            const fr_token = await helper.getDatafromStorage("fr_token");

            if (groupId && (groupId !== 'undefined' || groupId !== undefined) && groupId !== null && groupId !== '') {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_FETCH_MESSAGE_GROUP}/${groupId}`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: fr_token,
                        },
                    });

                    const data = response?.data?.data?.length ? response?.data?.data[0] : null;

                    if (data) {
                        console.log("Data -- ", data);
                        setState(data?.group_name);
                    }

                } catch (error) {
                    console.log("ERR - ", error);
                }
            };
        })();
    }


    /**
     * CAPITALIZED TEXT
     * @param {*} string 
     * @returns 
     */
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    // RUN FRIENDER HANDLE FUNCTION..   
    const runFrinderHandle = async () => {
        // console.log("run friender");
    };

    // STOP RUN THE FRIENDER HANDLER..
    const stopFrinderHandle = async () => {
        setStopFrnderModalOpen(true);
        
        // console.log(" ==== [ STOP FRIENDER ] ==== ");
        // await helper.saveDatainStorage("runAction_group", "")
        // chrome.runtime.sendMessage({ action: "stop", source: "groups" })
        // await helper.saveDatainStorage('save_groups', true)
        // setEditType(null);
        // setIsRunnable(false);
    };

    // PAUSE SENDING FR AND EDIT HANDLE FUNCTION..
    const pauseSendingPRAndEdit = async () => {
        await helper.saveDatainStorage('save_groups', false)
        console.log(" ==== [ PAUSED AND RETURN EDIT SCREEN ] ==== ");
        await helper.saveDatainStorage("runAction_group", "pause")
        chrome.runtime.sendMessage({ action: "pause", source: "groups" })
        setEditType("basic");
        setIsRunnable(false);
    };

    // SAVE / UPDATE TO API..
    const saveToAPI = async (payload, silentSave = false, isRunnable = null, willUpdate = false) => {
        console.log("isRunnable ::: ", isRunnable);
        const fr_token = await helper.getDatafromStorage("fr_token");
        // const groupSettingsId = await helper.getDatafromStorage("groupSettingsId");
        const runningStatus = await helper.getDatafromStorage("runAction_group")
        console.log("runningStatus :::: ", runningStatus);

        if (runningStatus === "pause" || (willUpdate && settingsID !== null)) {
            const updatePayload = {
                ...payload,
                settingsId: settingsID,
            };

            if (updatePayload?._id) {
                delete updatePayload._id;
            }

            try {
                const updatedResponse = await axios.post(`${process.env.REACT_APP_UPDATE_FRIEND_REQUEST_SETTINGS}`, updatePayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });

                if (updatedResponse && updatedResponse?.data) {
                    await helper.saveDatainStorage('groupSettingsPayload', updatedResponse?.data?.data);
                    setSettingsID(updatedResponse?.data?.data?._id);
                }

                if (isRunnable === "RUN") {
                    console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                    //  const runningStatus = await helper.getDatafromStorage("runAction_group")
                    await helper.saveDatainStorage("runAction_group", "running");

                    // if (runningStatus === "pause") {
                    chrome.runtime.sendMessage({ action: "reSendFriendRequestInGroup", response: updatePayload, source: "groups" })
                    // }
                    // else {
                    //     chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: updatePayload })
                    // }

                }
                // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : updatePayload})

                setReadyToBack(true);
                await helper.saveDatainStorage('save_groups', true)
                setEditType(null);
                setIsEditing(false);

                if (!silentSave) {
                    setOpenSuccessNotification(true);
                }

            } catch (error) {
                await helper.saveDatainStorage('save_groups', false)
                console.log("ERROR WHILE UPDATE SETTINGS - ", error);
                setOpenNotificationMsg("Can not update the settings!");
                setOpenErrorNotification(true);
                setEditType("basic");
                setIsEditing(true);
            }

            // updateFrndReqSettings(groupSettingsId?.settingsId, payload)
            //     .then((res) => {
            //         console.log("Update Res - ", res);
            //     })
            //     .catch(err => {
            //         console.log("ERROR WHILE UPDATE SETTINGS - ", err);
            //     });

        } else {

            try {
                if (payload?._id) {
                    delete payload._id;
                }

                const settingRes = await axios.post(`${process.env.REACT_APP_SAVE_FRIEND_REQUEST_SETTINGS}`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });

                console.log("settingRes in save : ", settingRes._id, settingRes.data, settingRes.data.data)

                if (settingRes && settingRes?.data) {
                    setSettingsID(settingRes?.data?.data);
                    await helper.saveDatainStorage('groupSettingsPayload', {...payload, _id: settingRes?.data?.data});
                }

                if (settingRes._id)
                    payload = { ...payload, settingsId: settingRes._id }
                else if (settingRes.data.data)
                    payload = { ...payload, settingsId: settingRes.data.data }

                if (isRunnable === "RUN") {
                    console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                    // const runningStatus = await helper.getDatafromStorage("runAction_group")

                    await helper.saveDatainStorage("runAction_group", "running");
                    console.log("<<<---------------------------------reSendFriendRequestInGroup ------------------------->>>");
                    // if (runningStatus === "pause") {
                    chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: payload, source: "groups" })
                    // }
                    // else {
                    //     chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: payload })
                    // }
                    // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : payload})
                }


                setReadyToBack(true);
                await helper.saveDatainStorage('save_groups', true)
                setEditType(null);
                setIsEditing(false);

                if (!silentSave) {
                    setOpenSuccessNotification(true);
                }

            } catch (error) {
                console.log("ERROR WHILE SAVE SETTINGS - ", error);
                setOpenNotificationMsg("Can not save the settings!");
                setOpenErrorNotification(true);
                await helper.saveDatainStorage('save_groups', false)
                setEditType("basic");
                setIsEditing(true);
            }

            // saveFrndReqSettings(payload)
            //     .then((res) => {
            //         console.log("Save Res - ", res);
            //     })
            //    .catch(err => {
            //         console.log("ERROR WHILE SAVE SETTINGS - ", err);
            //     });
        }
    };



    // RUN FRIENDER BUTTON ACTION HANDLE
    const handleRunFrienderAction = async () => {
        // Have to send message to the chrome runtime with payload data..
        const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");

        const payload = {
            ...settingApiPayload,
            fbUserId: fbTokenAndId?.userID,
            settings_type: settingsType,
        };

        if (payload?.settingsType) {
            delete payload.settingsType;
        }

        if (payload?.mutual_friend_value) {
            payload.mutual_friend_value = payload.mutual_friend_value.toString();
        }

        if (!payload?.country_filter_enabled) {
            payload.country_filter = false;
            payload.tier_filter = false;
        }

        // Checkpoint validation..
        const validity = checkValidity(formSetup, setFormSetup);

        if (!validity?.valid) {
            return false;
        }

        // Write Extension run code for this runFrienderHandle() function..
        runFrinderHandle();
        setIsRunnable(true);

        // await helper.saveDatainStorage('groupSettingsPayload', payload);
        await saveToAPI(payload, true, "RUN");
        // console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
        // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup"})

        // SYNC API FETCH DATA..
        syncData();
    };


    // SAVING THE API PAYLOAD TO SERVER
    const handleSaveSettings = async () => {
        console.log("I AM SAVING...");

        // Have to send payload to save via API from here..
        const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");

        const payload = {
            ...settingApiPayload,
            fbUserId: fbTokenAndId?.userID,
            settings_type: settingsType,
        };

        if (payload?.settingsType) {
            delete payload.settingsType;
        }

        if (payload?.mutual_friend_value) {
            payload.mutual_friend_value = payload.mutual_friend_value.toString();
        }

        if (!payload?.country_filter_enabled) {
            payload.country_filter = false;
            payload.tier_filter = false;
        }

        // Checkpoint validation..
        const validity = checkValidity(formSetup, setFormSetup);

        if (!validity?.valid) {
            return false;
        }

        // await helper.saveDatainStorage('groupSettingsPayload', payload);
        await saveToAPI(payload, false, null, true);

        // SYNC API FETCH DATA..
        syncData();
    };


    // RENDERING THE ACTION BUTTONS..
    const renderActionButtons = () => {
        if (!isRunnable) {
            return (
                <>
                    {
                        editType === "basic" ?
                            <button
                                className="btn btn-edit inline-btn"
                                onClick={(event) => {
                                    handleSaveSettings(event);
                                }}
                            >
                                <TickIcon /> Save
                            </button>
                            :
                            <button
                                className="btn btn-edit inline-btn"
                                onClick={async () => {
                                    await helper.saveDatainStorage('save_groups', false)
                                    setEditType("basic");
                                    setIsEditing(true);
                                }}
                            >
                                <EditSingleIcon /> Edit
                            </button>
                    }

                    <button
                        className="btn btn-run inline-btn"
                        onClick={handleRunFrienderAction}
                        disabled={isRunnable || !shouldfrienderRun}
                    >
                        <Bolt /> Run Friender
                    </button>
                </>
            );

        } else {
            return (
                <>
                    <button
                        className="btn btn-theme pause-btn"
                        onClick={pauseSendingPRAndEdit}
                    >
                        <figure>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    x="4.5"
                                    y="3.75"
                                    width="3"
                                    height="10.5"
                                    rx="1"
                                    fill="#BDBDBD"
                                />
                                <rect
                                    x="10.5"
                                    y="3.75"
                                    width="3"
                                    height="10.5"
                                    rx="1"
                                    fill="#BDBDBD"
                                />
                            </svg>
                        </figure>
                        <span>Pause & Edit</span>
                    </button>

                    <button className="btn stop-btn" onClick={stopFrinderHandle}>
                        <span className='icon-span'>
                            <figure>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clip-rule="evenodd"
                                        d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75ZM5.25 10H12.75V8H5.25V10Z"
                                        fill="white"
                                    />
                                </svg>
                            </figure>
                        </span>

                        <span>Stop</span>
                    </button>
                </>
            );
        }
    };


    // console.log("SETINGS SYNC API PAYLOAD IS HERE -- ", settingSyncApiPayload);

    // RENDERING THE CONTENT BASED ON THE CONDITIONS..
    const renderContent = () => {
        if (!isRunnable) {
            return editType === "basic" ? (
                <ModernForm
                    formSetup={formSetup}
                    setFormSetup={setFormSetup}
                    advcFormAssets={advcFormAssets}
                    setAdvcFormAssets={setAdvcFormAssets}
                    setrunningScript={setrunningScript}
                    setRequestActive={setRequestActive}
                    friendReqSet={friendReqSet}
                    isRunnable={isRunnable}
                    isLoding={isLoding}
                    setIsLoding={setIsLoding}
                    settingApiPayload={settingApiPayload}
                    setSettingApiPayload={setSettingApiPayload}
                    settingsType={settingsType}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    handleSaveSettings={handleSaveSettings}
                    setEditType={setEditType}
                    openSuccessNotification={openSuccessNotification}
                    setOpenSuccessNotification={setOpenSuccessNotification}
                    openErrorNotification={openErrorNotification}
                    setOpenErrorNotification={setOpenErrorNotification}
                    openNotificationMsg={openNotificationMsg}
                />
            ) : (
                <>

                    <div className="setting-col d-flex d-flex-column">
                        <div className="setting-show d-flex">
                            <figure>
                                <GenderIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Gender</h6>
                                {/* <p>{'Male'}</p> */}
                                <p>{settingSyncApiPayload?.gender_filter ? capitalizeFirstLetter(settingSyncApiPayload?.gender_filter_value) : (<span className='na-not-found-data'>N/A</span>)}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <TierIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Country</h6>
                                {/* <p>{'Tier 3'}</p> */}
                                <p>
                                    {settingSyncApiPayload?.country_filter_enabled ? (
                                        <>
                                            {settingSyncApiPayload?.tier_filter ? settingSyncApiPayload?.tier_filter_value : ''}
                                            {/* {settingSyncApiPayload?.country_filter_value?.length > 0 && ''} */}
                                            {settingSyncApiPayload?.country_filter && settingSyncApiPayload?.country_filter_value?.length ? settingSyncApiPayload?.country_filter_value?.map((value, index) => (
                                                <React.Fragment key={index}>
                                                    {value}
                                                    {index < settingSyncApiPayload.country_filter_value.length - 1 ? ', ' : ''}
                                                </React.Fragment>
                                            )) : ''}
                                        </>
                                    ) :
                                        (<span className='na-not-found-data'>N/A</span>)
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="setting-col d-flex d-flex-column">
                        <div className="setting-show d-flex setting-keywords">
                            <figure>
                                <KeywordsIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Keyword(s)</h6>
                                {/* <div className="key-content">
                                    <span className="key">AI & UX</span>
                                    <span className="key">Co-Founder</span>
                                    <span className="key">Design</span>
                                    <span className="key">Front-end Developer</span>
                                </div> */}

                                <div className='key-content'>
                                    {settingSyncApiPayload?.keyword ? settingSyncApiPayload?.selected_keywords?.map((item, id) => {
                                        return <span className='key' key={id}>{item}</span>
                                    }) : (<span className='na-not-found-data'>N/A</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="setting-show d-flex setting-keywords-negative">
                            <figure>
                                <KeywordsIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Negative Keyword(s)</h6>
                                {/* <div className="key-content">
                                    <span className="key">Developer</span>
                                    <span className="key">UI UX</span>
                                    <span className="key">Computer</span>
                                    <span className="key">Professional</span>
                                    <span className="key">NEW</span>
                                </div> */}

                                <div className='key-content'>
                                    {settingSyncApiPayload?.negative_keyword ? settingSyncApiPayload?.selected_negative_keywords?.map((item, id) => {
                                        return <span className='key' key={id}>{item}</span>
                                    }) : (<span className='na-not-found-data'>N/A</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="setting-col d-flex d-flex-column">
                        <div className="setting-show d-flex">
                            <figure>
                                <MessageSettingIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Selected message for sent friend request</h6>
                                <p>{settingSyncApiPayload?.send_message_when_friend_request_sent ? (sendFrndReqGroupName ? sendFrndReqGroupName : '') : (<span className='na-not-found-data'>N/A</span>)}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <MessageSettingIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Selected message for accepted friend request</h6>
                                <p>{settingSyncApiPayload?.send_message_when_friend_request_accepted ? (acceptReqGroupName ? acceptReqGroupName : '') : (<span className='na-not-found-data'>N/A</span>)}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <SkipAdmin />
                            </figure>
                            <div className="setting-content">
                                <h6>Skip sending friend request to admin(s)</h6>
                                {/* <p>{'Yes'}</p> */}
                                {!settingSyncApiPayload?.skip_admin ? (
                                    <p>No</p>
                                ) : (
                                    <p>Yes</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )
        } else {
            return (
                <AutomationRunner
                    setrunningScript={setrunningScript}
                    setRequestActive={setRequestActive}
                    statistics={stats}
                    source={"groups"}
                />
            );
        }
    };

    // Function to open modal and go back
    const handleGoBack = () => {
        if (editType === null || readyToBack) {
            navigate(-1);
            setModalOpen(false);
        } else {
            setModalOpen(true);
        }
    };


    return (
        <>
            <Modal
                modalType="delete-type"
                modalIcon={"Icon"}
                headerText={
                    "Stop adding in Friend Queue"
                }
                bodyText={"This will stop adding friends in Friend Queue. Are you sure you want to stop this run?"}
                open={stopFrnderModalOpen}
                setOpen={setStopFrnderModalOpen}
                ModalFun={() => {
                    (async () => {
                        console.log(" ==== [ STOP FRIENDER ] ==== ");
                        await helper.saveDatainStorage("runAction_group", "")
                        chrome.runtime.sendMessage({ action: "stop", source: "groups" })
                        await helper.saveDatainStorage('save_groups', true)
                        setEditType(null);
                        setIsRunnable(false);
                    })();

                    setStopFrnderModalOpen(false);
                }}
                btnText={"Yes, stop"}
                cancelBtnTxt={"Close"}
                resetFn={() => {
                    setStopFrnderModalOpen(false);
                }}
                stopBtnClass={'btn-stop-friender'}
            />

            <InnherHeader
                goBackTo="/"
                subHeaderText="Groups"
                handleGoBack={handleGoBack}
                activePageTextTooltip="Friender's Friend Queue feature gathers Facebook profiles from chosen facebook Groups, letting users send friend requests conveniently later"
            />
            <section className="section-main f-1">
                <div className="main-container d-flex d-flex-column main-settings-container">
                    <section
                        className={`setting-area f-1 d-flex ${editType !== "basic" ? 'settings-show-saved' : 'row-container'}`}
                        style={isRunnable ? { background: 'none' } : {}}
                    >
                        {/* RENDERING MAIN CONTENT HERE */}
                        {renderContent()}
                    </section>

                    <footer className="setting-footer d-flex f-align-center">
                        <div
                            className="note-inline text-center"
                            style={!isRunnable ? { visibility: 'hidden' } : { visibility: 'visible' }}
                        >
                            Edit details, pause, and re-run will create new run history
                        </div>

                        <div className='d-flex f-justify-end f-align-center setting-footer-btn-section'>
                            {renderActionButtons()}
                        </div>
                    </footer>
                </div>
            </section>

            {openSuccessNotification && (
                <ServerMessages
                    icon={<ServerSuccess />}
                    type={"success"}
                    msgText={"Successfully Saved Group Settings"}
                    headerTxt={"Congratulations!"}
                    openNotification={openSuccessNotification}
                    setOpenNotification={setOpenSuccessNotification}
                />
            )}


            {openErrorNotification && (
                <ServerMessages
                    icon={<ServerError />}
                    type={"error"}
                    msgText={openNotificationMsg}
                    headerTxt={"Error"}
                    openNotification={openErrorNotification}
                    setOpenNotification={setOpenErrorNotification}
                />
            )}
        </>
    );
}

export default SentFromGroups;
