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
import { MutualFriendsIcon, EditSingleIcon, TickIcon } from '../../assets/icons/Icons';
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
    const settingsType = 8;

    useEffect(()=>{
        console.log("groups.................")
    }, [])
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
                // console.log("Error in fetching keyword API", err);
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
            requestGroupsFormSettings && setFormSetup(requestGroupsFormSettings);
            requestFormAdvncSettings && setAdvcFormAssets(requestFormAdvncSettings);
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
    }


    // RUN FRIENDER HANDLE FUNCTION..   
    const runFrinderHandle = async () => {
        console.log("run friender");
    };

    // STOP RUN THE FRIENDER HANDLER..
    const stopFrinderHandle = () => {
        console.log(" ==== [ STOP FRIENDER ] ==== ");
        setEditType(null);
        setIsRunnable(false);
    };

    // PAUSE SENDING FR AND EDIT HANDLE FUNCTION..
    const pauseSendingPRAndEdit = () => {
        console.log(" ==== [ PAUSED AND RETURN EDIT SCREEN ] ==== ");
        setEditType("basic");
        setIsRunnable(false);
    };

    // SAVE / UPDATE TO API..
    const saveToAPI = async (payload) => {
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
                
                console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
                chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : updatePayload})
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
                chrome.runtime.sendMessage({action:"sendFriendRequestInGroup", response : payload})
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

        await helper.saveDatainStorage('groupSettingsPayload', payload);
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


    console.log("SETINGS SYNC API PAYLOAD IS HERE -- ", settingSyncApiPayload);

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
                subHeaderText="Groups"
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

export default SentFromGroups;
