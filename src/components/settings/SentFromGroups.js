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
import { getFrndReqSet, getProfileSettings, PostFriendResSet } from "../../service/FriendRequest";
import helper from '../../extensionScript/helper';
import common from '../../extensionScript/commonScript';
import AutomationRunner from '../shared/AutomationRunner';
// import {
//     capitalizeFirstLetter,
//     checkValidity,
//     removeEle,
//     syncFromApi,
//     syncPayload
// } from '../../helper/syncData';
// import { removeforBasic } from '../dashboard/FriendRequest';



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
    const [isPaused, setIsPaused] = useState(null);

    // FETCH USER PROFILE..
    // const fetchUserProfile = (fr_token) => {
    //     return new Promise((resolve, reject) => {
    //         axios
    //             .get(process.env.REACT_APP_FETCH_ALL_PROFILES, {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: fr_token,
    //                 },
    //             })
    //             .then((result) => {
    //                 resolve(result.data.data);
    //             })
    //             .catch((error) => {
    //                 // console.log("error:::", error.message);
    //                 reject(error?.response?.data ? error.response.data : error.message);
    //             });
    //     });
    // };


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



    // RUN FRIENDER BUTTON ACTION HANDLE
    const handleRunFrienderAction = () => {
        // runFrinderHandle();
        setIsRunnable(true);
        // Have to send message to the chrome runtime with payload data..
        console.log("==== RUN FRIENDER ACTION CLICKED NOW ====")
    };


    // SAVING THE API PAYLOAD TO SERVER
    const handleSaveSettings = () => {
        // Have to send payload to save via API from here..
        console.log("CLIENT PAYLOAD HERE -- ", settingApiPayload);
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
                                <p>{'Male'}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <TierIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Country</h6>
                                <p>{'Tier 3'}</p>
                            </div>
                        </div>
                        <div className="setting-show d-flex">
                            <figure>
                                <SkipAdmin />
                            </figure>
                            <div className="setting-content">
                                <h6>Skip Admin</h6>
                                <p>{'Yes'}</p>
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
                                <div className="key-content">
                                    <span className="key">AI & UX</span>
                                    <span className="key">Co-Founder</span>
                                    <span className="key">Design</span>
                                    <span className="key">Front-end Developer</span>
                                </div>
                            </div>
                        </div>
                        <div className="setting-show d-flex setting-keywords-negative">
                            <figure>
                                <KeywordsIcon />
                            </figure>
                            <div className="setting-content">
                                <h6>Negative Keyword(s)</h6>
                                <div className="key-content">
                                    <span className="key">Developer</span>
                                    <span className="key">UI UX</span>
                                    <span className="key">Computer</span>
                                    <span className="key">Professional</span>
                                    <span className="key">NEW</span>
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
                        style={isRunnable ? {background: 'none'} : {}}    
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
