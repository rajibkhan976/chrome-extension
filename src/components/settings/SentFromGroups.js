import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import InnherHeader from "../shared/InnerHeader";
import {
    fr_Req_Payload,
    requestFormAdvncSettings,
    requestFormSettings,
    requestGroupsFormSettings
} from '../../helper/fr-setting';
import ModernForm from '../dashboard/requestForms/ModernForm';
import { Bolt, CheckIcon, GenderIcon, KeywordsIcon, MessageSettingIcon, SkipAdmin, TierIcon } from '../shared/SVGAsset';
import { MutualFriendsIcon, EditSingleIcon, TickIcon } from '../../assets/icons/Icons';


const SentFromGroups = () => {
    const location = useLocation();
    const navigate = useNavigate()
    const [editType, setEditType] = useState(null)
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

    // SEGREGATIONS OF 1st Row FORM FIELDS
    const [firstRowFormSetup, setFirstRowFormSetup] = useState(() => {
        const firstRowFormFields = requestGroupsFormSettings.fields.slice(0, 4);
        const firstRowFormData = { ...requestGroupsFormSettings, fields: [...firstRowFormFields] };
        return firstRowFormData;
    });

    // SEGREGATIONS OF 2nd Row FORM FIELDS
    const [secondRowFormSetup, setSecondRowFormSetup] = useState(() => {
        const secondRowFormFields = requestGroupsFormSettings.fields.slice(4, 6);
        const secondRowFormData = { ...requestGroupsFormSettings, fields: [...secondRowFormFields] };
        return secondRowFormData;
    });

    // SEGREGATIONS OF 3rd Row FORM FIELDS
    const [thirdRowFormSetup, setThirdRowFormSetup] = useState(() => {
        const thirdRowFormFields = requestGroupsFormSettings.fields.slice(6, 9);
        const thirdRowFormData = { ...requestGroupsFormSettings, fields: [...thirdRowFormFields] };
        return thirdRowFormData;
    });

    // console.log("FIRSTTTTTT FORM -- ", firstRowFormSetup);
    // console.log("SECONDDDDD FORM -- ", secondRowFormSetup);


    return (
        <>
            <InnherHeader
                goBackTo="/"
                subHeaderText="Groups"
                activePageTextTooltip="Friender's Friend Queue feature gathers Facebook profiles from chosen facebook Groups, letting users send friend requests conveniently later"
            />
            <section className="section-main f-1">
                <div className="main-container d-flex d-flex-column main-settings-container">
                    <section className={`setting-area f-1 d-flex ${editType !== "basic" ? 'settings-show-saved' : 'row-container'}`}>
                        {editType === "basic" ? (
                            <form action="" className='d-flex' onSubmit={(e) => e.preventDefault()}>
                                {/* 1st ROW */}
                                <div className="form-wraper-settings general-settings">
                                    <div className="fr-content-cell-grid">
                                        <ModernForm
                                            formSetup={firstRowFormSetup}
                                            setFormSetup={setFirstRowFormSetup}
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
                                    </div>
                                </div>

                                {/* 2nd ROW */}
                                <div className="form-wraper-settings general-settings">
                                    <div className="fr-content-cell-grid">
                                        <ModernForm
                                            formSetup={secondRowFormSetup}
                                            setFormSetup={setSecondRowFormSetup}
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
                                    </div>
                                </div>

                                {/* 3rd ROW */}
                                <div className="form-wraper-settings general-settings no-border">
                                    <div className="fr-content-cell-grid">
                                        <ModernForm
                                            formSetup={thirdRowFormSetup}
                                            setFormSetup={setThirdRowFormSetup}
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
                                    </div>
                                </div>
                            </form>
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
                        )}
                    </section>

                    <footer className="setting-footer d-flex f-justify-end f-align-center">
                        {editType === "basic" ?
                            <button
                                className="btn btn-edit inline-btn"
                                onClick={() => {
                                    setEditType(null);
                                    setIsEditing(false);
                                }}
                            >
                                <TickIcon /> Save
                            </button> :
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
                        <button className="btn btn-run inline-btn">
                            <Bolt /> Run Friender
                        </button>
                    </footer>
                </div>
            </section>
        </>
    );
}

export default SentFromGroups;
