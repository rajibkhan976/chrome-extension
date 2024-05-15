import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import InnherHeader from "../shared/InnerHeader";
import {
    fr_Req_Payload,
    requestFormAdvncSettings,
    requestSuggestedFrndsAndFrndsOfFrndsFormSettings
} from '../../helper/fr-setting';
import ModernForm from '../dashboard/requestForms/ModernForm';
import { Bolt, CheckIcon, GenderIcon, MessageSettingIcon, TierIcon } from '../shared/SVGAsset';
import { MutualFriendsIcon, EditSingleIcon, LessThanEquals, TickIcon } from '../../assets/icons/Icons';
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
    syncPayload
} from '../../helper/syncData';
import { removeforBasic } from '../dashboard/FriendRequest';
import { fetchMesssageGroups } from '../../service/messages/MessagesServices';


const SentFromFriendsFriend = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [editType, setEditType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [requestActive, setRequestActive] = useState(null);
    const [formSetup, setFormSetup] = useState(requestSuggestedFrndsAndFrndsOfFrndsFormSettings);
    // const [formSetup, setFormSetup] = useState(requestFormSettings);
    const [advcFormAssets, setAdvcFormAssets] = useState(null);
    const [runningScript, setrunningScript] = useState(false);
    const [isRunnable, setIsRunnable] = useState(false);
    const [friendReqSet, setFriendReqSet] = useState(false);
    const [isLoding, setIsLoding] = useState(true);
    const [settingApiPayload, setSettingApiPayload] = useState(fr_Req_Payload);
    const [settingSyncApiPayload, setSettingSyncApiPayload] = useState(null);
    const [isPaused, setIsPaused] = useState(null);
    const settingsType = 11;


    // FETCH SETTINGS DATA..
    // useEffect(() => {
    //     if (editType !== "basic") {
    //         (async () => {
    //             const runningSettings = await helper.getDatafromStorage("frndsOfFrndsSettingsPayload");

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
            const runningStatus = await helper.getDatafromStorage("runAction_friend");
            if(runningStatus === "running"){
                setIsRunnable(true);
            }
            else if(runningStatus === "pause"){
                setEditType("basic");
                setIsRunnable(false)
            }
            else{
                setIsRunnable(false)
                setEditType("null");
            }
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
                // console.log("Error in fetching keyword API", err);
            });

        ///Fetching data of friend request setting fron api
        (async () => {
            setIsLoding(true);
            const runningStatus = await helper.getDatafromStorage("runAction_friend");
            const runningSettings = await helper.getDatafromStorage("frndsOfFrndsSettingsPayload");

            if (runningStatus === "pause" || runningStatus === "running") {
                if (runningSettings) {
                    let curr_settingObj = JSON.parse(runningSettings);
                    curr_settingObj = { ...curr_settingObj, is_settings_stop: false }

                    setSettingApiPayload(curr_settingObj);
                    setSettingSyncApiPayload(curr_settingObj);
                    syncFromApi(curr_settingObj, formSetup, setFormSetup);
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
                                        await helper.saveDatainStorage('frndsOfFrndsSettingId', { settingsId: apiCoreResponse?._id });
                                        response.settingsId = apiCoreResponse?._id;
                                    }
                                })();

                                syncFromApi(response, formSetup, setFormSetup);
                                setSettingSyncApiPayload(response);
                                // setSettingApiPayload(response);

                                setIsLoding(false);
                            });
                            // generateFormElements();
                        } else {
                            setIsLoding(false);
                        }
                    })
                    .catch((err) => {
                        // console.log("Error happened in Setting api call:::", err);
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
            requestSuggestedFrndsAndFrndsOfFrndsFormSettings && setFormSetup(requestSuggestedFrndsAndFrndsOfFrndsFormSettings);
            requestFormAdvncSettings && setAdvcFormAssets(requestFormAdvncSettings);
        })();
    }, []);



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
    }



    // FETCH SETTINGS DATA FROM LOCAL STORAGE..
    const fetchSetingsLocalData = async () => {
        return await helper.getDatafromStorage('frndsOfFrndsSettingsPayload');
    };


    // FETCH SETTINGS DATA..
    useEffect(() => {
        if (editType !== "basic") {
            (async () => {
                const localData = await fetchSetingsLocalData();
                console.log("Local Data -- ", localData);
                setSettingSyncApiPayload(localData);
            })();
        }
    }, [editType]);


    // RUN FRIENDER HANDLE FUNCTION..
    const runFrinderHandle = async () => {
        console.log("run friender");
    };

    // STOP RUN THE FRIENDER HANDLER..
    const stopFrinderHandle = async () => {
        console.log(" ==== [ STOP FRIENDER ] ==== "); 
        await helper.saveDatainStorage("runAction_friend", "")
        chrome.runtime.sendMessage({action:"stop", source:"friends"})
        setEditType(null);
        setIsRunnable(false);
    };

    // PAUSE SENDING FR AND EDIT HANDLE FUNCTION..
    const pauseSendingPRAndEdit = async () => {
        console.log(" ==== [ PAUSED AND RETURN EDIT SCREEN ] ==== ");
        await helper.saveDatainStorage("runAction_friend", "pause")
        chrome.runtime.sendMessage({action:"pause", source:"friends"})
        setEditType("basic");
        setIsRunnable(false);
    };


    // SAVE / UPDATE TO API..
    const saveToAPI = async (payload) => {
        const fr_token = await helper.getDatafromStorage("fr_token");
        const frndsOfFrndsSettingId = await helper.getDatafromStorage("frndsOfFrndsSettingId");

        if (frndsOfFrndsSettingId?.settingsId) {
            const updatePayload = {
                ...payload,
                settingsId: frndsOfFrndsSettingId?.settingsId,
            };

            try {
                await axios.post(`${process.env.REACT_APP_UPDATE_FRIEND_REQUEST_SETTINGS}`, updatePayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                });
                
                console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                
                const runningStatus = await helper.getDatafromStorage("runAction_friend")
                await helper.saveDatainStorage("runAction_friend", "running");
                if(runningStatus === "pause"){
                    chrome.runtime.sendMessage({action:"reSendFriendRequestInGroup", response : payload, source:"friends"})
                }
                else {
                    chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : payload})
                }
                // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : updatePayload})
            } catch (error) {
                console.log("ERROR WHILE UPDATE SETTINGS - ", error);
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
                
                console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                
                const runningStatus = await helper.getDatafromStorage("runAction_friend")
                await helper.saveDatainStorage("runAction_friend", "running");
                if(runningStatus === "pause"){
                    chrome.runtime.sendMessage({action:"reSendFriendRequestInGroup", response : payload, source:"friends"})
                }
                else {
                    chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : payload})
                }
                // chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : payload})
            } catch (error) {
                console.log("ERROR WHILE SAVE SETTINGS - ", error);
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
        // Write Extension run code for this runFrienderHandle() function..
        runFrinderHandle();
        setIsRunnable(true);

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

        await helper.saveDatainStorage('frndsOfFrndsSettingsPayload', payload);
        await saveToAPI(payload);
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

        await helper.saveDatainStorage('frndsOfFrndsSettingsPayload', payload);
        // await saveToAPI(payload);
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
                                    setEditType(null);
                                    setIsEditing(false);
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
                    settingsType={11}
                />
            ) : (
                <>

                    <div className="setting-col d-flex d-flex-column">
                        <div className="setting-show d-flex">
                            <figure>
                                <MutualFriendsIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Mutual friend(s)</h6>
                                <p>{<span className="comparator-icon"><LessThanEquals /></span>}{'10'}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <GenderIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Gender</h6>
                                <p>{settingSyncApiPayload?.gender_filter_value}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <TierIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Country</h6>
                                <p>{settingSyncApiPayload?.tier_filter_value}</p>
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
                                <p>{'Dynamic Discourse'}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <MessageSettingIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Selected message for accepted friend request</h6>
                                <p>{'The Conversation Connoisseurs'}</p>
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

    return (
        <>
            <InnherHeader
                goBackTo="/"
                subHeaderText="Friends friend settings"
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
        </>
    );
}

export default SentFromFriendsFriend;
