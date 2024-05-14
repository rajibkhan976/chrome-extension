import { memo, useEffect, useRef, useState } from "react";
import axios from "axios";
import helper from "../../../extensionScript/helper";
import {
    getFrndReqSet,
    getProfileSettings,
} from "../../../service/FriendRequest";

import {
    Bolt,
    CheckIcon,
    EditIcon,
    ExternalLink,
    GenderIcon,
    IntervalIcon,
    KeywordsIcon,
    LimitIcon,
    TierIcon,
    XmarkIcon,
} from "../../shared/SVGAsset";
import Tooltip from "../../shared/Tooltip";
import Checkbox from "../../form/Checkbox";
import ModalContainer from "../../shared/ModalContainer";

import "../../../assets/scss/component/request-settings/_requestSettings.scss";
import SugggesTionBox from "./SugggesTionBox";
import { PostFriendResSet, saveKeyWords } from "../../../service/FriendRequest";
import {
    capitalizeFirstLetter,
    checkValidity,
    removeEle,
    syncFromApi,
    syncPayload,
} from "../../../helper/syncData";
import ServerMessages from "../../shared/ServerMessages";
import FriendRequestLoader from "../../shared/FriendRequestLoader";
import CustomSelect from "../../shared/CustomSelect";
import common from "../../../extensionScript/commonScript";
import Modal from "../../shared/Modal";
import { removeforBasic } from "../FriendRequest";
import {
    fr_Req_Payload,
    requestFormSettings,
} from "../../../helper/fr-setting";
import AutomationStats from "../../shared/AutomationStats";
import {
    BoxOutIcon,
    ChevronDownArrowIcon,
    ChevronUpArrowIcon,
    InfoIcon,
    NavMessageIcon,
    ServerError,
    ServerSuccess,
} from "../../../assets/icons/Icons";
import {
    LikeReactionIcon,
    LoveReactionIcon,
    CareReactionIcon,
    HahaReactionIcon,
    WowReactionIcon,
    SadReactionIcon,
    AngryReactionIcon
} from '../../../assets/icons/reactionIcons';
import CustomSelectBox from "../../shared/CustomSelectBox";
import { utils } from "../../../helper/utils";


const Webview_URL = process.env.REACT_APP_APP_URL;


///Zone crusial funtion to change input box value
export const findData = (child, parent, level) => {
    if (!parent.fieldOptions) {
        return false;
    }
    const mainData = parent.fieldOptions[0];

    console.log("Founded main data -- ", mainData);

    if (child.type === mainData.type && child.name === mainData.name) {
        return level;
    } else {
        return findData(child, mainData, level + 1);
    }
};

export const changeData = (item, level, val, setIsValid) => {
    if (level === 0) {
        //console.log(val);
        if (val.toString().length === 0 || val <= 0 || val.toString() === 'NaN') {

            // setIsValid(false)
            return { ...item, value: val, valid: false };
        } else {
            //setIsValid(false)
            return { ...item, value: val, valid: true };
        }
    }
    return {
        ...item,
        fieldOptions: [changeData(item.fieldOptions[0], level - 1, val)],
    };
};

// COMPONENT..
const GroupsRequestForm = ({
    formSetup,
    setFormSetup,
    advcFormAssets,
    setAdvcFormAssets,
    setrunningScript,
    setRequestActive,
    friendReqSet,
    isRunnable,
    isLoding,
    setIsLoding,
    settingApiPayload,
    setSettingApiPayload,
    settingsType = null,
}) => {
    //:::::::
    const countyRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editType, setEditType] = useState("basic");
    const [openNotification, setOpenNotification] = useState(false);
    const [openNotificationMsg, setOpenNotificationMsg] = useState("");
    const [openSuccessNotification, setOpenSuccessNotification] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    // useEffect(() => {
    //   console.log("NEW edit type settinggggg::: ", settingApiPayload);
    // }, [settingApiPayload]);
    const [isPaused, setIsPaused] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [selectedReactionIcons, setSelectedReactionIcon] = useState([]);
    // const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    useEffect(() => {
        (async () => {
            const isPauedThenRun = await helper.getDatafromStorage("runAction");
            // console.log("isPauedThenRun ::: ", isPauedThenRun)
            setIsPaused(isPauedThenRun === "pause" ? true : false);
            // if(isPauedThenRun !== "pause" )
            resetToDefaultSetting();
        })();
    }, []);

    useEffect(() => {
        // console.log("paused ??? ", isPaused)
        // if(isPaused === false){
        // console.log("paused nope")
        resetToDefaultSetting();
        // }
    }, [isPaused]);


    const onEditChange = () => {
        setEditType("basic");
        setIsEditing(true);
    };

    const handleKeyPress = (event) => {
        if (event.key === ".") {
            event.preventDefault();
        }
    };

    const stepInputIncrementHandle = (element) => {
        if (element.name === "tier_filter_value") {
            fillInputChangeStepwise(element, "+");
        } else {
            inputValueChangeStepWise(element, "+");
        }
    }

    const stepInputDecrementHandle = (element) => {
        if (element.name === "tier_filter_value") {
            fillInputChangeStepwise(element, "-");
        } else {
            inputValueChangeStepWise(element, "-");
        }
    }

    const runFrinderHandle = async () => {
        // console.log("run friender");
        const fbTokenAndId = await helper.getDatafromStorage("fbTokenAndId");
        // console.log("fbTokenAndId.userID ::: ", fbTokenAndId.userID)
        const fr_token = await helper.getDatafromStorage("fr_token");
        // console.log("fr_token ::: ", fr_token);
        const getCurrentFbProfile = await fetchUserProfile(fr_token);
        // console.log("getCurrentFbProfile ::: ", getCurrentFbProfile)
        const currentProfilesFromDatabase =
            getCurrentFbProfile.length > 0
                ? getCurrentFbProfile.filter(
                    (el) =>
                        el &&
                        el?.fb_user_id?.toString() === fbTokenAndId?.userID?.toString()
                )
                : [];
        // console.log("currentProfilesFromDatabase::: ", currentProfilesFromDatabase)
        if (currentProfilesFromDatabase.length > 0) {
            const settingStr = JSON.stringify(settingApiPayload);
            // console.log("my sett inngggggggg", settingStr);
            await helper.saveDatainStorage("curr_reqSettings", settingStr);

            let resSettings, settingsID;
            const isPauedThenRun = await helper.getDatafromStorage("runAction");
            // console.log("isPauedThenRun ???? ", isPauedThenRun)
            if (isPauedThenRun !== "pause") {
                resSettings = await PostFriendResSet({
                    ...settingApiPayload,
                    friend_request_send: 0,
                    profile_viewed: 0,
                    time_saved: 0,
                    fbUserId: fbTokenAndId?.userID,
                    is_settings_stop: false,
                });
            } else {
                settingsID = await helper.getDatafromStorage("settingsId");
                const token = await helper.getDatafromStorage("fr_token");
                const updated_Profile_data = await helper.getDatafromStorage(
                    "updated_Profile_data"
                );
                // console.log("updated_Profile_data ::: ", updated_Profile_data)
                resSettings = await common.UpdateSettingsAfterFR(token, {
                    ...settingApiPayload,
                    settingsId: settingsID,
                    friend_request_send: updated_Profile_data.friend_request_send,
                    profile_viewed: updated_Profile_data.profile_viewed,
                    time_saved: updated_Profile_data.time_saved,
                    fbUserId: fbTokenAndId?.userID,
                });
            }
            // console.log("resSettings ::: ", resSettings?.data);
            if (resSettings?.data) {
                const profileSettings = await getProfileSettings();
                //console.log("profile my seetingsss data :::", profileSettings)
                // const isPauedThenRun = await helper.getDatafromStorage("runAction");
                // console.log("isPauedThenRun ::: ", isPauedThenRun);
                if (isPauedThenRun === "pause") {
                    // console.log("rerun...................");
                    // console.log("settingsID :::: ", settingsID)
                    chrome.runtime.sendMessage({
                        action: "reSendFriendRequestInGroup",
                        dataPayload: {
                            friendReqSettings: {
                                ...settingApiPayload,
                                fbUserId: fbTokenAndId?.userID,
                                settingsId: settingsID,
                            },
                            profileSettings: profileSettings.data.data[0],
                        },
                    });
                }
                if (isPauedThenRun !== "pause") {
                    await helper.saveDatainStorage("settingsId", resSettings?.data?.data);
                    chrome.runtime.sendMessage({
                        action: "sendFriendRequestInGroup",
                        dataPayload: {
                            friendReqSettings: {
                                ...settingApiPayload,
                                fbUserId: fbTokenAndId?.userID,
                                settingsId: resSettings?.data?.data,
                            },
                            profileSettings: profileSettings.data.data[0],
                        },
                    });
                    await helper.saveDatainStorage("profile_viewed", 0);
                    await helper.saveDatainStorage("FRSendCount", 0);
                }
                await helper.saveDatainStorage("runAction", "running");
                setrunningScript(true);
                setRequestActive("groups");
                setIsEditing(true);
            }
        } else {
            alert("Please connect this facebook profile with friender.");
        }
    };


    const fetchUserProfile = (fr_token) => {
        return new Promise((resolve, reject) => {
            axios
                .get(process.env.REACT_APP_FETCH_ALL_PROFILES, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: fr_token,
                    },
                })
                .then((result) => {
                    resolve(result.data.data);
                })
                .catch((error) => {
                    // console.log("error:::", error.message);
                    reject(error?.response?.data ? error.response.data : error.message);
                });
        });
    };


    const resetToDefaultSetting = async () => {
        const isPauedThenRun = await helper.getDatafromStorage("runAction");
        if (isPauedThenRun !== "pause") {
            getFrndReqSet(settingsType)
                .then((res) => {
                    const apiObj = res.data.data;
                    // console.log("The api of friend req set>>>///||||\\\\:::", apiObj);
                    // setFriendReqSet(apiObj[0]);
                    if (apiObj?.length > 0) {
                        syncPayload(apiObj[0], settingApiPayload, setSettingApiPayload);
                        removeEle(apiObj[0], removeforBasic).then((response) => {
                            // console.log("[[[[[[[[[[_____>>>>after rrrreeemove", response);
                            syncFromApi(response, formSetup, setFormSetup);
                            setIsLoding(false);
                        });
                        // generateFormElements();
                    } else {
                        setIsLoding(false);

                        setSettingApiPayload(fr_Req_Payload);
                        // setFormSetup(requestFormSettings);
                    }
                })
                .catch((err) => {
                    // console.log("Error happened in Setting api call:::", err);
                });
        } else {
            const runningSettings = await helper.getDatafromStorage(
                "curr_reqSettings"
            );
            if (runningSettings) {
                const curr_settingObj = JSON.parse(runningSettings);
                setSettingApiPayload(curr_settingObj);

                syncFromApi(curr_settingObj, formSetup, setFormSetup);

                setIsLoding(false);
            }
        }
        setModalOpen(false);
        setIsEditing(false);
    };


    const headerCheckModif = (element) => {
        let elementPlaceholder = { ...element };
        let formSetPlaceholder = { ...formSetup };

        setSettingApiPayload((prevState) => ({
            ...prevState,
            [element.name]: !elementPlaceholder.isActive,
        }));

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((item, idx) => {
                if (item.label === element.label) {
                    item.isActive = !element.isActive;
                    if (!item.isActive) {
                        item.valid = true;
                    }

                    // item.fieldOptions = defaultFormSettings.fields[idx].fieldOptions;
                    item.fieldOptions = item.fieldOptions.map((itemCh) => {
                        if (
                            item.name === "country_filter_enabled" ||
                            item.name === "gender_filter"
                        ) {
                            //at time of closing the switch we are update the api pay load also
                            if (itemCh.name === "country_filter") {
                                if (itemCh.value === "Tier Level") {
                                    setSettingApiPayload((prevState) => ({
                                        ...prevState,
                                        tier_filter: true,
                                        country_filter: false,
                                    }));
                                } else if (itemCh.value === "Tier Level") {
                                    setSettingApiPayload((prevState) => ({
                                        ...prevState,
                                        tier_filter: true,
                                        country_filter: false,
                                    }));
                                }
                            }
                            if (itemCh.valueArr) {
                                itemCh.valueArr = [];
                                itemCh.valid = true;
                                setSettingApiPayload((prevState) => ({
                                    ...prevState,
                                    [itemCh.name]: [],
                                }));
                            }
                        } else {
                            itemCh.valid = true;
                            if (itemCh.valueArr) {
                                itemCh.valueArr = [];
                                setSettingApiPayload((prevState) => ({
                                    ...prevState,
                                    [itemCh.name]: [],
                                }));
                            }
                            if (itemCh.value) {
                                itemCh.value = "";
                            }
                        }

                        return itemCh;
                    });
                }
                return item;
            }),
        };

        setFormSetup(newObj);
        generateFormElements();
    };

    /**
     * HANDLE CHANGE THE CHECKBOX OPTIONS
     * @param {*} element 
     * @param {*} option 
     */
    const checkboxOptionChange = (element, option) => {
        let formSetPlaceholder = { ...formSetup };

        console.log("Option here for the active checkbox ::: ", option);

        const newOptions = element?.options?.map((item) => {
            if (item.text === option.text) {
                item.isActive = !item.isActive;
            }
            return item;
        });

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((item) => {
                if (item.label === element.label) {
                    item.fieldOptions = newOptions;
                }
                return item;
            }),
        };

        setSettingApiPayload(prevState => ({
            ...prevState,
            reaction: option?.isActive,
        }));

        setFormSetup(newObj);
        generateFormElements();
    }

    const radioOptionChange = (ele, value) => {
        let formSetPlaceholder = { ...formSetup };

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((item) => {
                return {
                    ...item,
                    fieldOptions: item?.fieldOptions?.map((itemCh) => {
                        if (ele.type === itemCh.type && ele.name === itemCh.name) {
                            ele.value = value.text;

                            if (itemCh.name === "country_filter") {
                                if (value.text === "Country Level") {
                                    setSettingApiPayload((prevState) => ({
                                        ...prevState,
                                        tier_filter: false,
                                        country_filter: true,
                                    }));
                                } else if (value.text === "Tier Level") {
                                    setSettingApiPayload((prevState) => ({
                                        ...prevState,
                                        tier_filter: true,
                                        country_filter: false,
                                    }));
                                }
                            } else {
                                setSettingApiPayload((prevState) => ({
                                    ...prevState,
                                    [ele.name]: value.text,
                                }));
                            }
                        }
                        return itemCh;
                    }),
                };
            }),
        };
        // console.log("new ::: formSetPlaceholder :::", newObj);
        setFormSetup(newObj);
        generateFormElements();
    };


    // SELECT OPTIONS CHANGE HANDLE..
    const selectValueChange = (val, ele) => {
        let formSetPlaceholder = { ...formSetup };

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((formItem, idx) => {
                const found = findData(ele, formItem, 1);

                if (found) {
                    const newObj = changeData(formItem, found, val);
                    // const apiObjPiont = settingApiPayload[ele.name];

                    setSettingApiPayload((prevState) => ({
                        ...prevState,
                        [ele.name]: val,
                    }));
                    return newObj;
                } else {
                    return {
                        ...formItem,
                        fieldOptions: formItem?.fieldOptions?.map((itemCh) => {
                            if (ele.type === itemCh.type && ele.name === itemCh.name) {
                                itemCh.value = val;

                                setSettingApiPayload((prevState) => ({
                                    ...prevState,
                                    [ele.name]: val,
                                }));
                            }
                            return itemCh;
                        }),
                    };
                }
            }),
        };

        setFormSetup(newObj);
        generateFormElements();
    };


    //this function need optimization
    const handleKeyTitleChange = (value, ele) => {
        // console.log("valuw,.,.,.,.,<><><>", value);
        //const optionObj = JSON.parse(value);

        let formSetPlaceholder = { ...formSetup };
        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions?.map((itemCh) => {
                        if (ele.name === itemCh.name) {
                            if (ele.type === itemCh.type) {
                                itemCh.value = value.label;
                            }
                            itemCh.valueArr = value.keys;
                            if (itemCh.valueArr?.length >= 0) {
                                itemCh.valid = true;
                            } else if (itemCh.valueArr?.length === 0) {
                                itemCh.valid = false;
                            }
                            setSettingApiPayload((prevState) => ({
                                ...prevState,
                                [ele.name]: value.keys,
                            }));
                        }

                        return itemCh;
                    }),
                };
            }),
        };

        setFormSetup(newObj);
        generateFormElements();
    };


    /**
     * fuction to handle custon select click
     * @param {{label: string,value: string}} value
     * @param {*} ele
     */
    const handleCustomSelectClick = (value, ele) => {
        // console.log("valuw,.,.,.,.,<><><>", value);

        //const optionObj = JSON.parse(value);

        let formSetPlaceholder = { ...formSetup };
        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions?.map((itemCh) => {
                        if (ele.name === itemCh.name) {
                            if (ele.type === itemCh.type) {
                                itemCh.value = value.value;
                            }
                            // itemCh.valueArr = value.keys;
                            if (itemCh.value?.length >= 0) {
                                itemCh.valid = true;
                            } else if (itemCh.value?.length === 0) {
                                itemCh.valid = false;
                            }
                            setSettingApiPayload((prevState) => ({
                                ...prevState,
                                [ele.name]: value.value,
                            }));
                        }

                        return itemCh;
                    }),
                };
            }),
        };

        setFormSetup(newObj);
        generateFormElements();
    };
    const fillInputChange = (value, ele) => {
        let formSetPlaceholder = { ...formSetup };
        // console.log("e keke ke", e);
        if (value.split("").pop() === ",") {
            return;
        }

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder.fields.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions.map((itemCh) => {
                        if (ele.type === itemCh.type && ele.name === itemCh.name) {
                            itemCh.value = value;
                            if (ele.type !== "fillinput" && ele.type !== "fillinputCF") {
                                if (itemCh.value.length === 0) {
                                    itemCh.valid = false;
                                } else {
                                    itemCh.valid = true;
                                }
                            }
                        }
                        return itemCh;
                    }),
                };
            }),
        };
        // console.log("new ::: formSetPlaceholder :::", newObj);
        setFormSetup(newObj);
        generateFormElements();
    };

    const fillInputChangeStepwise = (ele, type) => {
        let formSetPlaceholder = { ...formSetup };

        const numericValue = parseFloat(ele.value);
        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder.fields.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions.map((itemCh) => {
                        if (ele.type === itemCh.type && ele.name === itemCh.name) {
                            if (!isNaN(numericValue)) {
                                itemCh.value = type === "+" ? numericValue + 1 : numericValue - 1;
                            } else {
                                // Handle the case when the input is not a valid number
                                itemCh.value = ''; // Or any other appropriate value
                            }
                            if (itemCh.value <= 0) {
                                itemCh.valid = false;
                            } else {
                                itemCh.valid = !isNaN(numericValue);
                            }

                        }
                        return itemCh;
                    }),
                };
            }),
        };
        // console.log("new ::: formSetPlaceholder :::", newObj);
        setFormSetup(newObj);
        generateFormElements();
    };
    const removeTag = (idx, ele) => {
        // console.log("current ele", ele);
        // console.log("curent idx", idx);

        let formSetPlaceholder = { ...formSetup };
        for (const item of formSetPlaceholder.fields) {
            for (const itemCh of item.fieldOptions) {
                if (ele.name === itemCh.name) {
                    // console.log(JSON.parse(JSON.stringify(itemCh)));
                    // console.log("doubly boubly", itemCh.valueArr);
                    if (ele.type === itemCh.type) {
                        itemCh.valueArr.splice(idx, 1);
                        setSettingApiPayload((prevState) => ({
                            ...prevState,
                            [ele.name]: itemCh.valueArr,
                        }));
                        if (itemCh.valueArr.length === 0) {
                            itemCh.valid = false;
                        } else {
                            itemCh.valid = true;
                        }
                    }
                }
            }
        }

        // console.log("new ::: formSetPlaceholder :::", formSetPlaceholder);
        setFormSetup(formSetPlaceholder);
        generateFormElements();
    };

    const suggestionClick = (ele, value) => {
        let formSetPlaceholder = { ...formSetup };
        if (value.trim().length === 0) return;
        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions.map((itemCh) => {
                        if (ele.type === itemCh.type && ele.inLabel === itemCh.inLabel) {
                            const idxOfArr = itemCh.valueArr.indexOf(value);
                            if (idxOfArr === -1) {
                                itemCh.valueArr.push(value);
                            } else {
                                itemCh.valueArr.splice(idxOfArr, 1, value);
                            }
                            if (itemCh.valueArr.length === 0) {
                                itemCh.valid = false;
                            } else {
                                itemCh.valid = true;
                            }
                            setSettingApiPayload((prevState) => ({
                                ...prevState,
                                [ele.name]: [...itemCh.valueArr],
                            }));
                        }
                        return itemCh;
                    }),
                };
            }),
        };
        fillInputChange("", ele);
        setFormSetup(newObj);
        generateFormElements();
    };

    const keyPressHandle = (e, ele) => {
        const evalue = e.target.value;
        if (evalue.trim().length === 0) return;
        if (e.key === "," || e.key === "Enter") {
            let formSetPlaceholder = { ...formSetup };
            const newObj = {
                ...formSetPlaceholder,
                fields: formSetPlaceholder.fields.map((item) => {
                    return {
                        ...item,
                        fieldOptions: item.fieldOptions.map((itemCh) => {
                            if (ele.name === itemCh.name) {
                                const idxOfArr = itemCh.valueArr.indexOf(evalue);
                                if (idxOfArr === -1) {
                                    itemCh.valueArr.push(evalue);
                                } else {
                                    itemCh.valueArr.splice(idxOfArr, 1, evalue);
                                }

                                setSettingApiPayload((prevState) => ({
                                    ...prevState,
                                    [ele.name]: [...itemCh.valueArr],
                                }));

                                if (itemCh.valueArr.length === 0) {
                                    itemCh.valid = false;
                                } else {
                                    itemCh.valid = true;
                                }
                            }

                            return itemCh;
                        }),
                    };
                }),
            };
            fillInputChange("", ele);
            // console.log("this is after enter the obj:", newObj);
            setFormSetup(newObj);
            generateFormElements();
        }
    };

    // HANDLE REACTION ICONS TO BE CHANGE WITH CLICK
    const handleReactionIconChange = (event, iconName, element) => {
        const isChecked = event.target.checked;
        let formSetPlaceholder = { ...formSetup };

        if (isChecked) {
            setSelectedReactionIcon(prevIcons => [...prevIcons, iconName]);
        } else {
            setSelectedReactionIcon(prevIcons => prevIcons.filter((icon) => icon !== iconName));
        }

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder.fields.map((formItem) => {
                console.log("FORM ITEM -- ", formItem);

                if (formItem.name === "given_reactions") {
                    const fields = formItem.fieldOptions[0];
                    const option = fields?.options[0];

                    fields.value = [...selectedReactionIcons];
                    option.value = [...selectedReactionIcons];

                    formItem?.fieldOptions?.map(field => {
                        if (field.name === "given_reaction_fields") {
                            field.value = [...selectedReactionIcons];
                        }
                        return fields;
                    })

                    return formItem;

                } else {
                    return formItem; 
                }
            })
        };

        setSettingApiPayload(prevState => ({
            ...prevState,
            reaction_type: [...selectedReactionIcons],
        }));

        setFormSetup(newObj);
        generateFormElements();
    };

    // HANDLE INPUT VALUE CHANGE ON MUTUAL FRIENDS FIELD..
    const handleValueChangeMutualFriend = (element, value) => {
        let formSetPlaceholder = { ...formSetup };

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder?.fields?.map((formItem) => {
                if (formItem.name === "lookup_for_mutual_friend") {
                    const fields = formItem.fieldOptions[1];
                    fields.value = value;

                    formItem?.fieldOptions?.map(field => {
                        if (field.name === "mutual_friend_value") {
                            field.value = value;
                        }
                        return field;
                    })
                    return formItem;

                } else {
                    return formItem;
                }
            })
        };

        setFormSetup(newObj);
        generateFormElements();
    };

    //::::use this function for recursive fields
    const inputValueChange = (ele, val) => {
        console.log("Element -- ", ele);
        console.log("Value -- ", val);

        let formSetPlaceholder = { ...formSetup };

        let newPlaceholder = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder.fields.forEach((formItem, idx) => {
                const found = findData(ele, formItem, 1);

                if (found) {
                    const newObj = changeData(formItem, found, val);

                    setSettingApiPayload((prevState) => ({
                        ...prevState,
                        [ele.name]: val,
                    }));

                    formSetPlaceholder.fields[idx] = newObj;
                }
            })
        };

        // setFormSetup(formSetPlaceholder);
        setFormSetup(newPlaceholder);
        generateFormElements();
    };

    const inputValueChangeStepWise = (ele, type) => {
        if (ele.value - 1 < 1 && type !== "+") return;
        let formSetPlaceholder = { ...formSetup };
        formSetPlaceholder.fields.forEach((formItem, idx) => {
            //Recursive function to find the object
            const found = findData(ele, formItem, 1);

            if (found) {
                //Recursive function to change the value of object
                const currValue = parseInt(ele.value)
                const newObj = changeData(
                    formItem,
                    found,
                    type === "+" ? currValue + 1 : currValue - 1
                );

                setSettingApiPayload((prevState) => ({
                    ...prevState,
                    [ele.name]: type === "+" ? currValue + 1 : currValue - 1,
                }));

                formSetPlaceholder.fields[idx] = newObj;
            }
        });

        setFormSetup(formSetPlaceholder);
        generateFormElements();
    };

    useEffect(() => { }, [settingApiPayload]);

    const syncKeyWord = (ele) => {
        let formSetPlaceholder = { ...formSetup };

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder.fields.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions.map((itemCh) => {
                        if (ele.type === itemCh.type && ele.name === itemCh.name) {
                            itemCh.options.push({
                                selected: false,
                                label: ele.value,
                                value: ele.value,
                                keys: ele.valueArr,
                            });
                        }
                        return itemCh;
                    }),
                };
            }),
        };
        setFormSetup(newObj);
        generateFormElements();
    };


    const saveKeyWordsHandle = (ele) => {
        if (ele.options.filter((el) => el.label === ele.value).length > 0) {
            ele.valid = false;
        } else {
            if (ele.name === "selected_keywords") {
                saveKeyWords({
                    title: ele.value,
                    keywords: ele.valueArr.join(","),
                    keywordType: 1,
                })
                    .then((res) => {
                        // console.log("The response of saving keyword::", res);
                    })
                    .catch((err) => {
                        // console.log("ERROR IS SAVING KEYWORDS:::::", err);
                    });
            } else if (ele.name === "selected_negative_keywords") {
                saveKeyWords({
                    title: ele.value,
                    keywords: ele.valueArr.join(","),
                    keywordType: 2,
                })
                    .then((res) => {
                        // console.log("The response of saving keyword::", res);
                    })
                    .catch((err) => {
                        // console.log("ERROR IS SAVING KEYWORDS:::::", err);
                    });
            }

            syncKeyWord(ele);
            let formSetPlaceholder = { ...formSetup };

            const newObj = {
                ...formSetPlaceholder,
                fields: formSetPlaceholder.fields.map((item) => {
                    return {
                        ...item,
                        fieldOptions: item.fieldOptions.map((itemCh) => {
                            if (ele.name === itemCh.name && ele.type === itemCh.type) {
                                itemCh.valid = false;
                            }
                            return itemCh;
                        }),
                    };
                }),
            };
            setFormSetup(newObj);
            generateFormElements();
        }
    };


    const clearKeyWordsHandle = (ele) => {
        let formSetPlaceholder = { ...formSetup };

        const newObj = {
            ...formSetPlaceholder,
            fields: formSetPlaceholder.fields.map((item) => {
                return {
                    ...item,
                    fieldOptions: item.fieldOptions.map((itemCh) => {
                        if (ele.name === itemCh.name) {
                            itemCh.valueArr = [];
                            itemCh.value = "";
                        }
                        return itemCh;
                    }),
                };
            }),
        };
        setFormSetup(newObj);
        generateFormElements();
    };


    //////////////////////////////////advance setting handles/////////////////
    const adnvcCheckHandle = (ele) => {
        const newObj = {
            ...advcFormAssets,
            fields: advcFormAssets.fields.map((item) => {
                if (item.label === ele.label) {
                    return {
                        ...item,
                        isActive: !ele.isActive,
                    };
                } else {
                    return item;
                }
            }),
        };

        setAdvcFormAssets(newObj);
        generateAdvncForm();
    };


    const advInputChange = (value, ele) => {
        const newObj = {
            ...advcFormAssets,
            fields: advcFormAssets.fields.map((item) => {
                if (item.fieldOptions) {
                    return {
                        ...item,
                        fieldOptions: item.fieldOptions.map((itemCh) => {
                            if (ele.type === itemCh.type && ele.label === itemCh.label) {
                                itemCh.value = value;
                            }
                            return itemCh;
                        }),
                    };
                } else {
                    return {
                        ...item,
                    };
                }
            }),
        };

        setAdvcFormAssets(newObj);
        generateAdvncForm();
    };


    const advSelectChange = (value, ele) => {
        const newObj = {
            ...advcFormAssets,
            fields: advcFormAssets.fields.map((item) => {
                if (item.fieldOptions) {
                    return {
                        ...item,
                        fieldOptions: item.fieldOptions.map((itemCh) => {
                            if (ele.type === itemCh.type && ele.label === itemCh.label) {
                                itemCh.selectValue = value;
                            }
                            return itemCh;
                        }),
                    };
                } else {
                    return {
                        ...item,
                    };
                }
            }),
        };

        setAdvcFormAssets(newObj);
        generateAdvncForm();
    };

    // HANDLE MOUSE MOVE ON TOOLTIP MOVING WITH CURSOR
    const handleMouseMove = (event) => {
        const { offsetX, offsetY, movementX, movementY } = event.nativeEvent;
        const x = (offsetX - movementX) + 20, y = (offsetY - movementY) + 30;
        setTooltipPosition({ x, y });
        // setIsTooltipVisible(true);
    };

    const generateAdvncForm = () => {
        const generateAdvncFormElemnts = (element, idx) => {
            switch (element.type) {
                case "select":
                    return (
                        <div className="fr-advsetting-el-container" key={idx}>
                            {element.label && <label>{element.label}</label>}
                            <div className="fr-advsetting-el-body">
                                <select
                                    value={element.value}
                                    onChange={(e) => {
                                        advSelectChange(e.target.value, element);
                                    }}
                                    className={`fr-advsetting-el-${element.type}`}
                                >
                                    {element?.options?.map((item, index) => {
                                        return (
                                            <option value={item.value} key={"fr-select" + index}>
                                                {item.label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    );
                case "inputSelect":
                    return (
                        <div className="fr-advsetting-el-container" key={idx}>
                            {element.label && <label>{element.label}</label>}
                            <div className="fr-advsetting-el-body">
                                <div className={`fr-advsetting-el-${element.type}`}>
                                    <input
                                        maxlength="6"
                                        type="number"
                                        value={element.value}
                                        onChange={(e) => {
                                            advInputChange(e.target.value, element);
                                        }}
                                        autoFocus
                                    />
                                    <select
                                        value={element.selectValue}
                                        onChange={(e) => {
                                            advSelectChange(e.target.value, element);
                                        }}
                                    >
                                        {element.options.map((item, index) => {
                                            return (
                                                <option
                                                    value={item.selectValue}
                                                    key={"fr-select" + index}
                                                >
                                                    {item.label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {element.suffix && element.suffix}
                            </div>
                        </div>
                    );
                case "input":
                    return (
                        <div className="fr-advsetting-el-container" key={idx}>
                            {element.label && <label>{element.label}</label>}
                            <div className={`fr-advsetting-el-body`}>
                                <input
                                    className={`fr-advsetting-el-${element.type}`}
                                    value={element.value}
                                    type={"number"}
                                    onChange={(e) => {
                                        advInputChange(e.target.value, element);
                                    }}
                                />
                                {element.suffix && element.suffix}
                            </div>
                        </div>
                    );
                default:
                    return <></>;
            }
        };

        return advcFormAssets.fields.map((fromItem, idx) => {
            return (
                <div className="fr-advsetting-container">
                    <div className="fr-advsetting-cell" key={idx}>
                        <div className="fr-advsetting-left">
                            <Checkbox
                                onCheckChange={() => adnvcCheckHandle(fromItem)}
                                isChecked={fromItem.isActive}
                            />
                        </div>
                        <div className="fr-advsetting-right">
                            <h5>{fromItem.label}</h5>
                            {fromItem.fieldOptions &&
                                fromItem.isActive &&
                                fromItem.fieldOptions.map((item, idx) => {
                                    return generateAdvncFormElemnts(item, idx);
                                })}
                        </div>
                    </div>
                </div>
            );
        });
    };


    //////////:::::Generating General::::://////////////
    const generateFormElements = () => {
        // Generate Elements for Form..
        const generateElements = (element, mainEl) => {
            switch (element.type) {
                case "select":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} 
                            ${element.isLabeled ? "fr-req-fieldset" : ""} 
                            ${element?.isHalfWidth ? 'fr-req-half-width' : ''}
                            ${mainEl?.disabled ? 'fr-req-el-disabled' : ''}
                            `}
                        >
                            {element.isLabeled ? <label>{element.inLabel}</label> : ""}
                            <select
                                className={`${element.isLabeled ? "fr-select-basic fr-select-basic-labeled" : "fr-select-basic"}
                                        ${element?.name === "lookup_for_mutual_friend_condition" ? 'fr-select-options-mutial-frnds' : ''}
                                    `}
                                value={element.value}
                                // {element&&element.opti on.length>0?disabled}
                                disabled={
                                    element && element.options && element.options.length <= 0
                                        ? true
                                        : false
                                }
                                onChange={(e) => selectValueChange(e.target.value, element)}
                            >
                                {element.options.map((item, idx) => (
                                    <option value={item.value} key={idx}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                            {element.name === "message_group_id" &&
                                element &&
                                element.options &&
                                element.options.length <= 0 && (
                                    <div className="fr-req-nomessage-text">
                                        <InfoIcon /> You haven’t created any message group yet.{" "}
                                        <button className="fr-req-nomessage-btn">
                                            <a
                                                href={`${Webview_URL}/messages/groups`}
                                                target="_blank"
                                            >
                                                Create group
                                                <BoxOutIcon />
                                            </a>
                                        </button>{" "}
                                    </div>
                                )}

                            {element?.fieldOptions &&
                                generateElements(
                                    element?.fieldOptions && element?.fieldOptions[0]
                                )}
                        </div>
                    );

                case "customSelect":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} 
                                ${element.isLabeled ? "fr-req-fieldset" : ""}
                                ${!element.valid ? "not_valid" : ""} 
                                ${element?.isHalfWidth ? 'fr-req-half-width' : ''}
                                ${mainEl?.disabled ? 'fr-req-el-disabled' : ''}
                            `}
                        >
                            {element.isLabeled ? <label>{element.inLabel}</label> : ""}
                            <div
                                className={`${element.isLabeled
                                    ? "fr-customSelect-basic fr-customSelect-basic-labeled"
                                    : "fr-customSelect-basic"
                                    } ${element && element.options && element.options.length === 0
                                        ? "disable"
                                        : ""
                                    }`}
                                disabled={
                                    element && element.options && element.options.length <= 0
                                        ? true
                                        : false
                                }
                            >
                                <CustomSelectBox
                                    needSearchBar={true}
                                    element={element}
                                    onClickOption={handleCustomSelectClick}
                                />
                            </div>

                            {!element.valid && (
                                <p className="error-msg">Field can't be empty or '0'!</p>
                            )}

                            {(element.name === "send_message_when_friend_request_sent_message_group_id" ||
                                element.name === "send_message_when_friend_request_accepted_message_group_id") &&
                                element &&
                                element.options &&
                                element.options.length <= 0 && (
                                    <div className="fr-req-nomessage-text">
                                        <div className="fr-req-nomessage-title">
                                            <InfoIcon />
                                            <span className="fr-req-title-span">You haven’t created any message group yet.{" "}</span>
                                        </div>

                                        <div className="fr-req-nomessage-btn">
                                            <a
                                                href={`${Webview_URL}/messages/groups`}
                                                target="_blank"
                                                className="fr-req-nomessage-a"
                                            >
                                                <span>Create group</span>
                                                <span><BoxOutIcon /></span>
                                            </a>
                                        </div>{" "}
                                    </div>
                                )}
                            {element?.fieldOptions &&
                                generateElements(
                                    element?.fieldOptions && element?.fieldOptions[0]
                                )}
                        </div>
                    );

                case "checkbox":
                    return (
                        <>
                            <div className={`fr-req-element fr-req-el-${element.type} ${mainEl?.disabled ? 'fr-req-el-disabled' : ''}`}>
                                {element.options.map((optionCheckbox, el) => (
                                    <>
                                        <label className="fr-ext-radio-ui fr-radio-req fr-ext-checkbox-ui checkbox-container f-1" key={el}>
                                            <input
                                                type="checkbox"
                                                className="given-reactions-checkbox"
                                                name={element.name}
                                                defaultChecked={optionCheckbox?.isActive}
                                                value={optionCheckbox?.isActive}
                                                onChange={() => checkboxOptionChange(element, optionCheckbox)}
                                            />

                                            <span className="checkmark"></span>

                                            <span className="fr-ext-radio-ui">
                                                <span className="fr-ext-radio-text fr-ext-checkbox-text">
                                                    {optionCheckbox.text}
                                                </span>
                                            </span>
                                        </label>
                                    </>
                                ))}

                                {element?.options?.length > 0 &&
                                    element?.options[1]?.text === element.value &&
                                    element?.fieldOptions &&
                                    generateElements(
                                        element?.fieldOptions && element?.fieldOptions[0]
                                    )
                                }
                            </div>

                            {/* {console.log("element.options", element?.options[0])} */}

                            {/* Reaction Icons */}
                            {element?.options[0]?.isActive === true && (
                                <section id="reaction-icons-section" className="d-flex f-align-center">
                                    <span>Choose: </span>

                                    <div className="fr-reaction-icons f-1">
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "like", element)} />
                                            <span className="fr-reaction-icon">
                                                <LikeReactionIcon />
                                            </span>
                                        </label>
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "love", element)} />
                                            <span className="fr-reaction-icon">
                                                <LoveReactionIcon />
                                            </span>
                                        </label>
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "care", element)} />
                                            <span className="fr-reaction-icon">
                                                <CareReactionIcon />
                                            </span>
                                        </label>
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "haha", element)} />
                                            <span className="fr-reaction-icon">
                                                <HahaReactionIcon />
                                            </span>
                                        </label>
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "wow", element)} />
                                            <span className="fr-reaction-icon">
                                                <WowReactionIcon />
                                            </span>
                                        </label>
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "sad", element)} />
                                            <span className="fr-reaction-icon">
                                                <SadReactionIcon />
                                            </span>
                                        </label>
                                        <label>
                                            <input type="checkbox" onChange={(event) => handleReactionIconChange(event, "angry", element)} />
                                            <span className="fr-reaction-icon">
                                                <AngryReactionIcon />
                                            </span>
                                        </label>
                                    </div>
                                </section>
                            )}
                        </>
                    );

                case "radio":
                    return (
                        <>
                            <div className={`fr-req-element fr-req-el-${element.type}`}>
                                {element.options.map((optionRadio, el) => (
                                    <>
                                        <label className="fr-ext-radio fr-radio-req" key={el}>
                                            <input
                                                type="radio"
                                                name={element.name}
                                                defaultChecked={optionRadio.text === element.value}
                                                onChange={() => radioOptionChange(element, optionRadio)}
                                            />
                                            <span className="fr-ext-radio-ui">
                                                <span className="fr-ext-radio-text">
                                                    {optionRadio.text}
                                                </span>
                                            </span>
                                        </label>
                                    </>
                                ))}
                                {element?.options?.length > 0 &&
                                    element?.options[1]?.text === element.value &&
                                    element?.fieldOptions &&
                                    generateElements(
                                        element?.fieldOptions && element?.fieldOptions[0]
                                    )}
                            </div>
                        </>
                    );

                case "radioSml":
                    return (
                        <>
                            <div className={`fr-req-element fr-req-el-${element.type}`}>
                                {element.options.map((optionRadio, el) => (
                                    <>
                                        <label className="fr-ext-radioSml fr-radioSml-req" key={el}>
                                            <input
                                                type="radio"
                                                name={element.name}
                                                defaultChecked={optionRadio.text === element.value}
                                                onChange={() => radioOptionChange(element, optionRadio)}
                                            />
                                            <span className="fr-ext-radioSml-ui">
                                                <span className="fr-ext-radioSml-text">
                                                    {optionRadio.text}
                                                </span>
                                            </span>
                                        </label>
                                    </>
                                ))}
                                {element?.options?.length > 0 &&
                                    element?.options[0]?.text === element.value &&
                                    element?.fieldOptions &&
                                    generateElements(
                                        element?.fieldOptions && element?.fieldOptions[0]
                                    )}
                            </div>
                        </>
                    );

                case "input":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} ${element.isLabeled ? "fr-req-fieldset" : ""
                                }  ${!element.valid ? "not_valid" : ""}`}
                        >
                            {element.isLabeled ? <label>{element.inLabel}</label> : ""}
                            <input
                                type="number"
                                maxlength="6"
                                min="1"
                                step="1"
                                className={
                                    element.isLabeled
                                        ? "fr-input-basic fr-input-basic-labeled"
                                        : "fr-input-basic"
                                }
                                value={element.value}
                                onChange={(e) => inputValueChange(element, e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            {!element.valid && (
                                <p className="error-msg">Field can't be empty or '0'!</p>
                            )}
                        </div>
                    );

                case "stepInput":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} 
                                ${element.isLabeled ? "fr-req-lebel" : ""}  
                                ${!element.valid ? "not_valid" : ""} 
                                ${element?.isHalfWidth ? "fr-req-half-width" : ""}
                                ${mainEl?.disabled ? 'fr-req-el-disabled' : ''}
                            `}
                        >
                            {element.isLabeled ? <label>{element.inLabel}</label> : ""}
                            <input
                                type="number"
                                maxlength="6"
                                min={0}
                                max={9999}
                                step="1"
                                className={
                                    element.isLabeled
                                        ? "fr-input-basic fr-input-basic-labeled"
                                        : "fr-input-basic"
                                }
                                value={element.value}
                                onChange={(e) => {
                                    if (element.name === "tier_filter_value") {
                                        fillInputChange(e.target.value, element);

                                    } else if (element.name === "mutual_friend_value") {
                                        handleValueChangeMutualFriend(element, e.target.value);

                                    } else {
                                        inputValueChange(element, e.target.value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === ".") {
                                        e.preventDefault();
                                    }
                                }}
                            // onKeyPress={handleKeyPress}
                            />
                            <div className="input-arrows">
                                <button
                                    className="btn inline-btn btn-transparent"
                                    onMouseDown={() => stepInputIncrementHandle(element)}
                                // onClick={() => inputValueChangeStepWise(element,"+")}
                                >
                                    <ChevronUpArrowIcon size={15} />
                                </button>

                                <button
                                    className="btn inline-btn btn-transparent"
                                    onClick={() => stepInputDecrementHandle(element)}
                                >
                                    <ChevronDownArrowIcon size={15} />
                                </button>
                            </div>
                            {!element.valid && (
                                <p className="error-msg">Field can't be empty or '0'!</p>
                            )}
                        </div>
                    );

                case "fillinputCF":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} ${element.isLabeled ? "fr-req-fieldset" : ""
                                } ${!element.valid ? "not_valid" : ""}`}
                        >
                            {element.isLabeled ? <label>{element.inLabel}</label> : ""}

                            <div
                                className={`${element.isLabeled ? 'fr-fillinputCF-basic fr-fillinputCF-basic-labeled' : 'fr-fillinputCF-basic'}
                                    ${element?.valueArr.length > 0 ? 'fr-fillinputCF-basic-p-5' : ''}
                                `}
                                onClick={() => {
                                    countyRef.current.focus();
                                }}
                            >
                                <div className={element?.valueArr.length > 0 ? "fr-fillinputCF-basic-keys" : ""}>
                                    {element.valueArr.map((item, idx) => {
                                        return (
                                            <span
                                                key={idx}
                                                onClick={() => {
                                                    removeTag(idx, element);
                                                }}
                                            >
                                                {item}
                                            </span>
                                        );
                                    })}
                                </div>
                                {/* </div><div className="fillinputCF-input-sugg"> */}

                                <SugggesTionBox
                                    fillInputChange={fillInputChange}
                                    clickFun={suggestionClick}
                                    element={element}
                                    isKeywords={element?.valueArr.length > 0 ? true : false}
                                />
                            </div>
                            {!element.valid && (
                                <p className="error-msg">Invalid Empty Field!!</p>
                            )}
                        </div>
                    );

                case "fillinput":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} 
                                ${element.isLabeled ? "fr-req-fieldset" : ""} 
                                ${!element.valid ? "not_valid" : ""}
                                ${mainEl?.disabled ? 'fr-req-el-disabled' : ''}
                            `}
                        >
                            <div className="d-flex keywords-label-wrapper">
                                <div>
                                    {element.isLabeled ? <span>{element.inLabel}</span> : ""}
                                </div>

                                <div>
                                    {/* CROSS BUTTON TO REMOVE TAG */}
                                    <span
                                        className={`clear-tags-btn ${element?.valueArr?.length === 0 ? "clear-btn-disabled" : ""}`}
                                        onClick={() => {
                                            clearKeyWordsHandle(element);
                                        }}
                                    >
                                        Clear all
                                    </span>
                                </div>
                            </div>

                            <div
                                className={
                                    element.isLabeled
                                        ? "fr-fillinput-basic fr-fillinput-basic-labeled"
                                        : "fr-fillinput-basic"
                                }
                            >
                                {element.valueArr.map((item, idx) => {
                                    return (
                                        <span
                                            key={idx}
                                            style={{ backgroundColor: `${element.color}` }}
                                            onClick={() => {
                                                removeTag(idx, element);
                                            }}
                                        >
                                            {item}
                                        </span>
                                    );
                                })}
                                <div className="fillinput-input-sugg">
                                    <input
                                        maxlength="30"
                                        value={element.value}
                                        placeholder="Please Enter.."
                                        onChange={(e) => fillInputChange(e.target.value, element)}
                                        onKeyDown={(e) => keyPressHandle(e, element)}
                                    />
                                </div>
                            </div>

                            {!element.valid && (
                                <p className="error-msg">Invalid Empty Field!!</p>
                            )}
                        </div>
                    );

                case "selectInput":
                    return (
                        <div
                            className={`fr-req-element fr-req-el-${element.type} 
                                ${element.isLabeled ? "fr-req-fieldset" : ""}
                                ${mainEl?.disabled ? 'fr-req-el-disabled' : ''}
                            `}
                        >
                            {element.isLabeled ? <label>{element.inLabel}</label> : ""}

                            <div
                                className={
                                    element.isLabeled
                                        ? "fr-selectInput-basic fr-selectInput-basic-labeled"
                                        : "fr-selectInput-basic"
                                }
                            >
                                <input
                                    maxLength="30"
                                    value={element.value}
                                    placeholder="Type.."
                                    onChange={(e) => fillInputChange(e.target.value, element)}
                                />
                                {
                                    <CustomSelect
                                        element={element}
                                        onClickOption={handleKeyTitleChange}
                                    />
                                }
                            </div>

                            {/* CHECK BUTTON TO ADDING TAGS */}
                            <span
                                className={`btn-selectInput btn-right ${element.value.length === 0 ||
                                    element.valueArr.length === 0 ||
                                    !element.valid ||
                                    element.options.filter((el) => el.label === element.value)
                                        .length > 0
                                    // ? "disable"
                                    ? ""
                                    : ""
                                    }`}
                                onClick={() => {
                                    if (
                                        element.value.length === 0 ||
                                        element.valueArr.length === 0
                                    ) {
                                        return;
                                    }
                                    saveKeyWordsHandle(element);
                                }}
                                disabled={
                                    element.options.filter((el) => el.label === element.value)
                                        .length > 0
                                }
                            >
                                <CheckIcon />
                            </span>
                        </div>
                    );

                default:
                    break;
            }
        };

        // Wrapping the form elements in a div..
        return formSetup.fields.map((formCell, i) => {
            return (
                <div
                    key={i}
                    className={`fr-setting-cell ${formCell?.disabled ? 'group-disabled tooltip-box' : ''}`}
                    onMouseMove={handleMouseMove}
                >

                    {formCell?.disabled && (
                        <div
                            className="tooltip-container"
                            style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
                        >
                            Feature disabled on this page
                        </div>
                        // <MouseTracker offset={{ x: tooltipPosition.x, y: tooltipPosition.y }}>Some Text</MouseTracker>
                    )}

                    <header className="fr-cell-header">
                        <h5 className={`fr-cell-header-title`}>
                            {formCell.headerCheckbox && (
                                <span className={`${formCell?.disabled ? 'fr-req-el-disabled' : ''}`}>
                                    <Checkbox
                                        onCheckChange={() => headerCheckModif(formCell)}
                                        isChecked={formCell.isActive}
                                    // isDisabled={formCell.disabled}
                                    />
                                </span>
                            )}
                            {formCell.label}
                        </h5>
                    </header>

                    <div className={`fr-cell-content ${formCell?.name === "lookup_for_mutual_friend" ? "fr-cell-content-mutual-frnd" : ""}`}>
                        {formCell.fieldOptions.map((item, idx) => {
                            if (item.name === "tier_filter_value") {
                                if (formCell.fieldOptions[0].value === "Tier Level") {
                                    return generateElements(item, formCell);
                                } else {
                                    return <></>;
                                }

                            } else if (item.name === "country_filter_value") {
                                if (formCell.fieldOptions[0].value === "Country Level") {
                                    return generateElements(item, formCell);
                                } else {
                                    return <></>;
                                }

                            } else {
                                return generateElements(item, formCell);
                            }
                        })}
                    </div>
                </div>
            );
        });
    };


    return (
        <>
            <Modal
                modalType="delete-type"
                modalIcon={"Icon"}
                headerText={
                    "Do you want to save the changes made to the Basic settings?"
                }
                bodyText={"Your changes will be lost if you don’t save them"}
                open={modalOpen}
                setOpen={setModalOpen}
                ModalFun={() => {
                    if (checkValidity(formSetup, setFormSetup)) {
                        setIsEditing(false);
                        setOpenSuccessNotification(true);
                    } else {
                        setOpenNotification(false);
                    }
                    setModalOpen(false);
                }}
                btnText={"Save"}
                cancelBtnTxt={"Don't Save"}
                resetFn={() => {
                    resetToDefaultSetting();
                }}
            />

            {openSuccessNotification && (
                <ServerMessages
                    icon={<ServerSuccess />}
                    type={"success"}
                    msgText={"Successfully Saved Basic Settings"}
                    headerTxt={"Congratulations!"}
                    openNotification={openSuccessNotification}
                    setOpenNotification={setOpenSuccessNotification}
                />
            )}


            {/* EDITING THE SETTINGS FORM */}
            {/* <div className="form-wraper-settings general-settings"> */}
            <form action="" className='d-flex' onSubmit={(e) => e.preventDefault()}>
                {/* 1st ROW */}
                <div className="form-wraper-settings general-settings">
                    {/* <div className="fr-content-cell-grid"></div> */}
                    <div
                        className="fr-content-cell-grid column-setup"
                    >
                        {generateFormElements()}
                    </div>

                    {openNotification && (
                        <ServerMessages
                            icon={<ServerError />}
                            type={"error"}
                            msgText={openNotificationMsg}
                            headerTxt={"Error"}
                            openNotification={openNotification}
                            setOpenNotification={setOpenNotification}
                        />
                    )}
                </div>
            </form>
        </>
    );
};

export default memo(GroupsRequestForm);
