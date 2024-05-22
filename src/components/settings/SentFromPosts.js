import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import InnherHeader from "../shared/InnerHeader";
import {
    fr_Req_Payload,
    requestFormAdvncSettings,
    requestPostsSettings
} from '../../helper/fr-setting';
import ModernForm from '../dashboard/requestForms/ModernForm';
import { Bolt, CheckIcon, GenderIcon, KeywordsIcon, MessageSettingIcon, SkipAdmin, TierIcon, LikeReaction, LoveReaction } from '../shared/SVGAsset';
import { LookupSocialIcon, EditSingleIcon, TickIcon, ServerSuccess, ServerError, MutualFriendsIcon, LessThanEquals } from '../../assets/icons/Icons';
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
    syncPayload,
} from '../../helper/syncData';
import { removeforBasic } from '../dashboard/FriendRequest';
import { fetchMesssageGroups } from '../../service/messages/MessagesServices';
import {
    LikeReactionIcon,
    LoveReactionIcon,
    CareReactionIcon,
    HahaReactionIcon,
    WowReactionIcon,
    SadReactionIcon,
    AngryReactionIcon
} from '../../assets/icons/reactionIcons';
import ServerMessages from '../shared/ServerMessages';


const SentFromPosts = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [editType, setEditType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [requestActive, setRequestActive] = useState(null);
    const [formSetup, setFormSetup] = useState(requestPostsSettings);
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
    const settingsType = 9;
    const [sendFrndReqGroupName, setSendFrndReqGroupName] = useState("");
    const [acceptReqGroupName, setAcceptReqGroupName] = useState("");
    const [stats, setStats] = useState({ queueCount: 0, memberCount: 0, source: "post" });


    // FETCH SETTINGS DATA..
    // useEffect(() => {
    //     if (editType !== "basic") {
    //         (async () => {
    //             const runningSettings = await helper.getDatafromStorage("postSettingsPayload");

    //             if (runningSettings) {
    //                 setSettingApiPayload(runningSettings);
    //                 setSettingSyncApiPayload(runningSettings);
    //                 syncFromApi(runningSettings, formSetup, setFormSetup);
    //                 setIsLoding(false);
    //             }
    //         })();
    //     }
    // }, [editType, formSetup]);


    useEffect(() => {
        // console.log("i am re rendered......");
        (async () => {
            const runningStatus = await helper.getDatafromStorage("runAction_post");
            if (runningStatus === "running") {
                console.log("yeah, running.");
                setIsRunnable(true);
                const showCount = await helper.getDatafromStorage("showCount");
                console.log("showCount :: ", showCount);
                if (showCount && showCount.source === "post")
                    setStats(showCount)
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
            await helper.saveDatainStorage('settingMsgGroups', allGroups.data.data);
            injectAGroupsOptionToFormSettings(allGroups.data.data)
            syncData();
        })()
    }, []);

    const syncData = async () => {
        setIsLoding(true);
        const runningStatus = await helper.getDatafromStorage("runAction_post");
        const runningSettings = await helper.getDatafromStorage("postSettingsPayload");

        if (runningStatus === "pause" || runningStatus === "running") {
            if (runningSettings) {
                // let curr_settingObj = JSON.parse(runningSettings);
                let curr_settingObj = runningSettings;
                curr_settingObj = { ...curr_settingObj, is_settings_stop: false }

                setSettingApiPayload(curr_settingObj);
                setSettingSyncApiPayload(curr_settingObj);
                // syncFromApi(curr_settingObj, formSetup, setFormSetup);
                syncFromNewAPi(curr_settingObj, formSetup, setFormSetup);
                setIsLoding(false);
            }

        } else {
            // getting frndReq settings 9 means for post settings..
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
                                    await helper.saveDatainStorage("postSettingId", {
                                        settingsId: apiCoreResponse?._id,
                                    });
                                    response.settingsId = apiCoreResponse?._id;
                                }
                            })();

                            // syncFromApi(response, formSetup, setFormSetup);
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
        requestPostsSettings && setFormSetup(requestPostsSettings);
    };


    // THIS WILL RESPONSIBLE FOR EVERYTIME DATA FETCHING UPDATING SO DON'T USE FOR ANY OTHER WORKS..
    // USE ANOTHER USE_EFFECT INSTEAD OF THIS ONE PLEASE
    useEffect(() => {
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
                    console.log("New Obj - ", newObj);
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
    };
   
    /**
     * CAPITALIZED TEXT
     * @param {*} string 
     * @returns 
     */
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // FETCH SETTINGS DATA FROM LOCAL STORAGE..
    const fetchSetingsLocalData = async () => {
        return await helper.getDatafromStorage('postSettingsPayload');
    };

    // // FETCH SETTINGS DATA..
    // useEffect(() => {
    //     if (editType !== "basic") {
    //         (async () => {
    //             const localData = await fetchSetingsLocalData();
    //             console.log("Local Data -- ", localData);
    //             setSettingSyncApiPayload(localData);
    //         })();
    //     }
    // }, [editType]);


    // RUN FRIENDER HANDLE FUNCTION..
    const runFrinderHandle = async () => {
        console.log("run friender");
    };

    // STOP RUN THE FRIENDER HANDLER..
    const stopFrinderHandle = async () => {
        console.log(" ==== [ STOP FRIENDER ] ==== ");
        await helper.saveDatainStorage("runAction_post", "");
        chrome.runtime.sendMessage({ action: "stop", source: "post" })
        setEditType(null);
        setIsRunnable(false);
    };

    // PAUSE SENDING FR AND EDIT HANDLE FUNCTION..
    const pauseSendingPRAndEdit = async () => {
        console.log(" ==== [ PAUSED AND RETURN EDIT SCREEN ] ==== ");
        await helper.saveDatainStorage("runAction_post", "pause");
        chrome.runtime.sendMessage({ action: "pause", source: "post" })
        setEditType("basic");
        setIsRunnable(false);
    };


    // SAVE / UPDATE TO API..
    const saveToAPI = async (payload, silentSave = false, isRunnable = null) => {
        const fr_token = await helper.getDatafromStorage("fr_token");
        const postSettingId = await helper.getDatafromStorage("postSettingId");

        if (postSettingId?.settingsId) {
            const updatePayload = {
                ...payload,
                settingsId: postSettingId?.settingsId,
            };

            try {
                await axios.post(`${process.env.REACT_APP_UPDATE_FRIEND_REQUEST_SETTINGS}`, updatePayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });


                if (isRunnable === "RUN") {
                    console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")

                    const runningStatus = await helper.getDatafromStorage("runAction_post")
                    await helper.saveDatainStorage("runAction_post", "running");
                    if (runningStatus === "pause") {
                        chrome.runtime.sendMessage({ action: "reSendFriendRequestInGroup", response: updatePayload, source: "post" })
                    }
                    else {
                        chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: updatePayload, source: "post" })
                    }
                    // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", source:"post", response : updatePayload})
                }

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
                const settingRes = await axios.post(`${process.env.REACT_APP_SAVE_FRIEND_REQUEST_SETTINGS}`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });
                console.log("settingRes : ", settingRes._id, settingRes)
                if (settingRes._id)
                    payload = { ...payload, settingsId: settingRes._id }

                if (isRunnable === "RUN") {
                    console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")

                    const runningStatus = await helper.getDatafromStorage("runAction_post")
                    await helper.saveDatainStorage("runAction_post", "running");
                    if (runningStatus === "pause") {
                        chrome.runtime.sendMessage({ action: "reSendFriendRequestInGroup", response: payload, source: "post" })
                    }
                    else {
                        chrome.runtime.sendMessage({ action: "sendFriendRequestInGroup", response: payload, source: "post" })
                    }
                    // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", source:"post", response : payload})
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

        if (!payload?.country_filter_enabled) {
            payload.country_filter = false;
            payload.tier_filter = false;
        }

        // Checkpoint validation..
        const validity = checkValidity(formSetup, setFormSetup);

        if (!validity?.valid) {
            return false;
        }

        console.log("PAYLAOD CHEKCING - ", payload);

        if ((!payload?.reaction || payload?.reaction_type?.length === 0) && !payload?.comment) {
            setOpenNotificationMsg("For runnable action, please select atleast one reaction or comment!");
            setOpenErrorNotification(true);
            return false;
        }

        // Write Extension run code for this runFrienderHandle() function..
        runFrinderHandle();
        setIsRunnable(true);

        await helper.saveDatainStorage('postSettingsPayload', payload);
        await saveToAPI(payload, true, "RUN");
        // console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
        // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", source:"post"})
    };


    // SAVING THE API PAYLOAD TO SERVER
    const handleSaveSettings = async () => {
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
            payload.mutual_friend_value = `${payload.mutual_friend_value}`;
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

        await helper.saveDatainStorage('postSettingsPayload', payload);
        await saveToAPI(payload);
    };


    // Function to get icon component based on icon name
    const getIconComponent = (iconName) => {
        console.log("iconName - ", iconName);
        switch (iconName) {
            case 'like':
                return <LikeReactionIcon />;

            case 'love':
                return <LoveReactionIcon />;

            case 'angry':
                return <AngryReactionIcon />;

            case 'haha':
                return <HahaReactionIcon />;

            case 'care':
                return <CareReactionIcon />;

            case 'wow':
                return <WowReactionIcon />;

            case 'sad':
                return <SadReactionIcon />;

            default:
                return null; // Return null for unrecognized icon names
        }
    };

    // Function to render selected icons
    // const renderSelectedIcons = (selectedIcons) => {
    //     return selectedIcons.map((iconName, index) => (
    //         <span key={index} className="fr-reaction-icon">
    //             {getIconComponent(iconName)}
    //         </span>
    //     ));
    // };


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
                    settingsType={9}
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
                                <LookupSocialIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Look up for given</h6>
                                <div className="fb-requirements">
                                    {settingSyncApiPayload?.reaction || settingSyncApiPayload?.comment ? (
                                        <>
                                            <ul>
                                                {settingSyncApiPayload?.reaction &&
                                                    settingSyncApiPayload?.reaction_type &&
                                                    settingSyncApiPayload?.reaction_type.length &&
                                                    settingSyncApiPayload?.reaction_type?.map((item, index) => (
                                                        <li key={index} style={{ height: '18px', width: '18px' }}>
                                                            {getIconComponent(item)}
                                                        </li>
                                                    ))}
                                            </ul>
                                            <span>{settingSyncApiPayload?.reaction && settingSyncApiPayload?.comment && ' & '}</span>
                                            {settingSyncApiPayload?.comment && <span>Comments</span>}
                                        </>
                                    ) : (<span className='na-not-found-data'>N/A</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <MutualFriendsIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Mutual friend(s)</h6>
                                {/* <p>{<span className="comparator-icon"><LessThanEquals /></span>}{'10'}</p> */}
                                <p>
                                    {settingSyncApiPayload?.lookup_for_mutual_friend ?
                                        <>
                                            {settingSyncApiPayload?.lookup_for_mutual_friend_condition === "<"
                                                ? (
                                                    <span className="comparator-icon"><LessThanEquals /></span>
                                                )
                                                :
                                                (
                                                    <span className="comparator-icon" style={{ textDecoration: 'underline' }}>{">"}</span>
                                                )}
                                            {settingSyncApiPayload?.mutual_friend_value}
                                        </>
                                        :
                                        (<span className='na-not-found-data'>N/A</span>)
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <GenderIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Gender</h6>
                                <p>{settingSyncApiPayload?.gender_filter ? capitalizeFirstLetter(settingSyncApiPayload?.gender_filter_value) : (<span className='na-not-found-data'>N/A</span>)}</p>

                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <TierIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Country</h6>
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
                    </div>
                </>
            )
        } else {
            return (
                <AutomationRunner
                    setrunningScript={setrunningScript}
                    setRequestActive={setRequestActive}
                    statistics={stats}
                    source={"post"}
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
                subHeaderText="Posts settings"
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
                    msgText={"Successfully Saved Post Settings"}
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

export default SentFromPosts;
