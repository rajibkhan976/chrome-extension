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

    useEffect(() => {
        (async () => {
            console.log("groups.................")
            const runningStatus = await helper.getDatafromStorage("runAction_group");
            console.log("runningStatus :::************************ ", runningStatus);
            if (runningStatus === "running") {
                setIsRunnable(true);
            }
            else if (runningStatus === "pause") {
                setEditType("basic");
                setIsRunnable(false)
            }
            else {
                setIsRunnable(false)
                setEditType(null);
            }
            const allGroups = await fetchMesssageGroups();
            injectAGroupsOptionToFormSettings(allGroups.data.data)
        })()
    }, [])

    // useEffect(()=>{
    //     console.log("isRunnable _____________> ", isRunnable);
    // }, [isRunnable])

    // FETCH SETTINGS DATA FROM LOCAL STORAGE..
    const fetchSetingsLocalData = async () => {
        return await helper.getDatafromStorage('groupSettingsPayload');
    };

    const fetchSettingsAPIData = async () => {
        const fr_token = await helper.getDatafromStorage("fr_token");
        const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");

        if (fr_token && fbTokenAndId?.userID) {
            const bodyObj = {
                "fbUserId": fbTokenAndId?.userID,
                "settingsType": settingsType
            }

            const response = await axios.post(`${process.env.REACT_APP_GET_FRIEND_REQUEST_URL}`, bodyObj, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: fr_token,
                },
            });

            const responseData = response?.data;

            if (responseData?.data[0]) {
                const payload = responseData?.data[0];
                // console.log("payload -- ", payload);
                setSettingSyncApiPayload(payload);
                setSettingApiPayload(payload);

                if (payload?._id) {
                    await helper.saveDatainStorage('groupSettingsId', { settingsId: payload?._id });
                    payload.settingsId = payload?._id;
                    delete payload._id;
                }

                return payload;
            }

            return response;
        }

        return false;
    };



    // FETCH SETTINGS DATA..
    // useEffect(() => {
    //     if (editType !== "basic") {
    //         (async () => {
    //             const runningSettings = await helper.getDatafromStorage("groupSettingsPayload");

    //             if (runningSettings) {
    //                 setSettingApiPayload(runningSettings);
    //                 setSettingSyncApiPayload(runningSettings);
    //                 syncFromApi(runningSettings, formSetup, setFormSetup);
    //                 setIsLoding(false);
    //             }
    //         })();
    //     }
    // }, [editType, formSetup]);

    // useEffect(() => {
    //     (async () => {
    //         const fr_token = await helper.getDatafromStorage("fr_token");
    //         const groupsResponse = await axios.get(`${process.env.REACT_APP_FETCH_MESSAGE_GROUPS}`, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: fr_token,
    //             },
    //         });

    //         const responseData = groupsResponse?.data;

    //         if (responseData?.data && responseData?.data?.length) {
    //             // only take the group_name from the response
    //             const groupSelects = responseData?.data?.map((item) => ({
    //                 selected: false,
    //                 label: item.group_name,
    //                 value: item._id,
    //             }));
    //             // HAVE TO CHANGE FORMsETUP TO ARRAY..
    //             const placeholderForm = { ...formSetup };

    //             const newObj = {
    //                 ...placeholderForm,
    //                 fields: placeholderForm?.fields?.map((formItem) => {
    //                     return {
    //                         ...formItem,
    //                         fieldOptions: formItem?.fieldOptions?.map((option) => {
    //                             if (option?.name === "send_message_when_friend_request_sent_message_group_id" ||
    //                                 option?.name === "send_message_when_friend_request_accepted_message_group_id"
    //                             ) {
    //                                 option.options = groupSelects;
    //                             }
    //                             return option;
    //                         })
    //                     };
    //                 })
    //             };

    //             setFormSetup(newObj);
    //         }
    //     })();
    // }, []);



    useEffect(() => {
        // console.log("i am re rendered......");
        (async () => {
            const allGroups = await fetchMesssageGroups();
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
        (async () => {
            setIsLoding(true);
            const runningStatus = await helper.getDatafromStorage("runAction");
            const runningSettings = await helper.getDatafromStorage(
                // "curr_reqSettings"
                "groupSettingsPayload"
            );

            if (runningStatus === "pause" || runningStatus === "running") {
                if (runningSettings) {
                    let curr_settingObj = JSON.parse(runningSettings);
                    curr_settingObj = { ...curr_settingObj, is_settings_stop: false }
                    setSettingApiPayload(curr_settingObj);
                    setSettingSyncApiPayload(curr_settingObj);
                    syncFromNewAPi(curr_settingObj, formSetup, setFormSetup);
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
                                    if (apiCoreResponse?._id) {
                                        await helper.saveDatainStorage('groupSettingsId', { settingsId: apiCoreResponse?._id });
                                        response.settingsId = apiCoreResponse?._id;
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
                                setGroupName(response?.send_message_when_friend_request_accepted_message_group_id, setAcceptReqGroupName);
                                setGroupName(response?.send_message_when_friend_request_sent_message_group_id, setSendFrndReqGroupName);
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
        })();
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


    /**
     * GETTING THE GROUP NAME BY ID AND SET TO STATE
     * @param {*} groupId 
     * @param {*} setState 
     */
    const setGroupName = (groupId, setState) => {
        (async () => {
            const fr_token = await helper.getDatafromStorage("fr_token");

            if (groupId && groupId !== 'undefined' || groupId !== undefined) {
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


    // RUN FRIENDER HANDLE FUNCTION..   
    const runFrinderHandle = async () => {
        // console.log("run friender");
    };

    // STOP RUN THE FRIENDER HANDLER..
    const stopFrinderHandle = async () => {
        console.log(" ==== [ STOP FRIENDER ] ==== ");
        await helper.saveDatainStorage("runAction_group", "")
        chrome.runtime.sendMessage({ action: "stop", source: "groups" })
        setEditType(null);
        setIsRunnable(false);
    };

    // PAUSE SENDING FR AND EDIT HANDLE FUNCTION..
    const pauseSendingPRAndEdit = async () => {
        console.log(" ==== [ PAUSED AND RETURN EDIT SCREEN ] ==== ");
        await helper.saveDatainStorage("runAction_group", "pause")
        chrome.runtime.sendMessage({ action: "pause", source: "groups" })
        setEditType("basic");
        setIsRunnable(false);
    };

    // SAVE / UPDATE TO API..
    const saveToAPI = async (payload, silentSave = false, isRunnable = null) => {
        const fr_token = await helper.getDatafromStorage("fr_token");
        const groupSettingsId = await helper.getDatafromStorage("groupSettingsId");

        if (groupSettingsId?.settingsId) {
            const updatePayload = {
                ...payload,
                settingsId: groupSettingsId?.settingsId,
            };

            try {
                await axios.post(`${process.env.REACT_APP_UPDATE_FRIEND_REQUEST_SETTINGS}`, updatePayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });
<<<<<<< Updated upstream

                if (isRunnable === "RUN") {
                    console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                    const runningStatus = await helper.getDatafromStorage("runAction_group")
                    await helper.saveDatainStorage("runAction_group", "running");

                    if (runningStatus === "pause") {
                        chrome.runtime.sendMessage({ action: "reSendFriendRequestInGroup", response: payload, source: "groups" })
                    }
                    else {
                        chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: payload })
                    }
=======
                console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                const runningStatus = await helper.getDatafromStorage("runAction_group")
                await helper.saveDatainStorage("runAction_group", "running");
                if(runningStatus === "pause"){
                    chrome.runtime.sendMessage({action:"reSendFriendRequestInGroup", response : updatePayload, source:"groups"})
                }
                else {
                    chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : updatePayload})
>>>>>>> Stashed changes
                }
                // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : updatePayload})

                setReadyToBack(true);
                setEditType(null);
                setIsEditing(false);

                if (!silentSave) {
                    setOpenSuccessNotification(true);
                }

            } catch (error) {
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
                await axios.post(`${process.env.REACT_APP_SAVE_FRIEND_REQUEST_SETTINGS}`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });

                if (isRunnable === "RUN") {
                    console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                    const runningStatus = await helper.getDatafromStorage("runAction_group")

                    await helper.saveDatainStorage("runAction_group", "running");

                    if (runningStatus === "pause") {
                        chrome.runtime.sendMessage({ action: "reSendFriendRequestInGroup", response: payload, source: "groups" })
                    }
                    else {
                        chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: payload })
                    }
                    // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : payload})
                }


                setReadyToBack(true);
                setEditType(null);
                setIsEditing(false);

                if (!silentSave) {
                    setOpenSuccessNotification(true);
                }

            } catch (error) {
                console.log("ERROR WHILE SAVE SETTINGS - ", error);
                setOpenNotificationMsg("Can not save the settings!");
                setOpenErrorNotification(true);
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
            payload.mutual_friend_value = `${payload.mutual_friend_value}`;
        }

        // Checkpoint validation..
        const validity = checkValidity(formSetup, setFormSetup);

        if (!validity?.valid) {
            return false;
        }

        // Write Extension run code for this runFrienderHandle() function..
        runFrinderHandle();
        setIsRunnable(true);

        await helper.saveDatainStorage('groupSettingsPayload', payload);
        await saveToAPI(payload, true, "RUN");
        // console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
        // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup"})
    };


    // SAVING THE API PAYLOAD TO SERVER
    const handleSaveSettings = async () => {
        // Have to send payload to save via API from here..
        console.log("CLIENT PAYLOAD HERE -- ", settingApiPayload);

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
            payload.mutual_friend_value = `${payload.mutual_friend_value}`;
        }

        // Checkpoint validation..
        const validity = checkValidity(formSetup, setFormSetup);

        if (!validity?.valid) {
            return false;
        }

        await helper.saveDatainStorage('groupSettingsPayload', payload);
        await saveToAPI(payload);
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
                                    // setEditType(null);
                                    // setIsEditing(false);
                                    handleSaveSettings(event);
                                }}
                            >
                                <TickIcon /> Save
                            </button>
                            :
                            <button
                                className="btn btn-edit inline-btn"
                                onClick={() => {
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
                        disabled={isRunnable}
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
                    settingsType={8}
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
                                <p>{settingSyncApiPayload?.gender_filter_value}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <TierIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Country</h6>
                                {/* <p>{'Tier 3'}</p> */}
                                <p>{settingSyncApiPayload?.tier_filter_value}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <SkipAdmin />
                            </figure>
                            <div className="setting-content">
                                <h6>Skip Admin</h6>
                                {/* <p>{'Yes'}</p> */}
                                {!settingSyncApiPayload?.skip_admin ? (
                                    <p>No</p>
                                ) : (
                                    <p>Yes</p>
                                )}
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
                                    {settingSyncApiPayload?.selected_keywords?.map((item, id) => {
                                        return <span className='key' key={id}>{item}</span>
                                    })}
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
                                    {settingSyncApiPayload?.selected_negative_keywords?.map((item, id) => {
                                        return <span className='key' key={id}>{item}</span>
                                    })}
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
                                <p>{sendFrndReqGroupName ? sendFrndReqGroupName : ''}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <MessageSettingIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Selected message for accepted friend request</h6>
                                <p>{acceptReqGroupName ? acceptReqGroupName : ''}</p>
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
