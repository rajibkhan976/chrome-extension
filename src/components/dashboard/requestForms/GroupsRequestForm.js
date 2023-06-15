import { memo, useEffect, useRef, useState } from "react";
import axios from "axios";
import helper from "../../../extensionScript/helper";
import { getFrndReqSet,getProfileSettings } from "../../../service/FriendRequest";

import {
  Bolt,
  CheckIcon,
  EditIcon,
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
import { ServerError, ServerSuccess } from "../../../assets/icons/Icons";

///Zone crusial funtion to change value
export const findData = (child, parent, level) => {
  if (!parent.fieldOptions) {
    return false;
  }
  const mainData = parent.fieldOptions[0];
  if (child.type === mainData.type && child.name === mainData.name) {
    return level;
  } else {
    return findData(child, mainData, level + 1);
  }
};
export const changeData = (item, level, val, setIsValid) => {
  if (level === 0) {
    if (val.toString().length === 0) {
      // console.log("<><>Not valid<><><");
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
}) => {
  //:::::::
  const countyRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState("basic");
  const [openNotification, setOpenNotification] = useState(false);
  const [openSuccessNotification, setOpenSuccessNotification] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  // useEffect(() => {
  //   console.log("NEW edit type settinggggg::: ", settingApiPayload);
  // }, [settingApiPayload]);
  const [isPaused, setIsPaused] = useState(null);

  useEffect(() => {
    (async () => {
      const isPauedThenRun = await helper.getDatafromStorage("runAction");
      // console.log("isPauedThenRun ::: ", isPauedThenRun)
      setIsPaused(isPauedThenRun === "pause" ? true : false);
      // if(isPauedThenRun !== "pause" )
        resetToDefaultSetting()
    })();
  }, []);

useEffect(()=>{
  // console.log("paused ??? ", isPaused)
  // if(isPaused === false){
    // console.log("paused nope")
    resetToDefaultSetting()
  // }
},[isPaused])

  // const displayServerMessageFn = () => {
  //   setOpenNotification(true);
  //   setTimeout(() => {
  //     setOpenNotification(false);
  //   }, 4500);
  // };

  const onEditChange = () => {
    setEditType("basic");
    setIsEditing(true);
  };

  // const onAdvanceChange = () => {
  //   setEditType("advance");
  //   setIsEditing(true);
  // };

  // const resetModal = () => {
  //   if (checkValidity(formSetup, setFormSetup)) {
  //     setIsEditing(false);
  //     setEditType("basic");
  //   } else {
  //     displayServerMessageFn();
  //   }
  // if (friendReqSet?.length > 0) {
  //   syncPayload(friendReqSet, settingApiPayload, setSettingApiPayload);
  //   removeEle(friendReqSet, removeforBasic).then((response) => {
  //     console.log("[[[[[[[[[[_____>>>>after crossss", friendReqSet);
  //     syncFromApi(response, formSetup, setFormSetup);
  //     setIsEditing(false);
  //     setEditType("basic");
  //   });
  // } else {
  //   setIsEditing(false);
  //   setEditType("basic");
  // }
  //};

  const handleKeyPress = (event) => {
    if (event.key === ".") {
      event.preventDefault();
    }
  };

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
          fbUserId: fbTokenAndId?.userID,
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
        const profileSettings=await getProfileSettings();
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
              profileSettings: profileSettings.data.data[0]
            }
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
              profileSettings: profileSettings.data.data[0]
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
    if(isPauedThenRun !== "pause" ){
        getFrndReqSet()
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
              setFormSetup(requestFormSettings);
            }
          })
          .catch((err) => {
            // console.log("Error happened in Setting api call:::", err);
          });
      // if (friendReqSet) {
      //   syncPayload(friendReqSet, settingApiPayload, setSettingApiPayload);
      //   removeEle(friendReqSet, removeforBasic).then((response) => {
      //     syncFromApi(response, formSetup, setFormSetup);
      //   });
      // } else {
      //   console.log("will reset>>>>");
      //   setSettingApiPayload(fr_Req_Payload);
      //   setFormSetup(requestFormSettings);
      // }
    }else{
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
          // console.log("new obj:::??", newObj);
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

  //::::use this function for recursive fields
  const inputValueChange = (ele, val) => {
    let formSetPlaceholder = { ...formSetup };
    formSetPlaceholder.fields.forEach((formItem, idx) => {
      const found = findData(ele, formItem, 1);

      if (found) {
        const newObj = changeData(formItem, found, val);

        setSettingApiPayload((prevState) => ({
          ...prevState,
          [ele.name]: val,
        }));

        formSetPlaceholder.fields[idx] = newObj;
      }
    });

    setFormSetup(formSetPlaceholder);
    generateFormElements();
  };
  useEffect(() => {}, [settingApiPayload]);

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
    const generateElements = (element) => {
      switch (element.type) {
        case "select":
          return (
            <div
              className={`fr-req-element fr-req-el-${element.type} ${
                element.isLabeled ? "fr-req-fieldset" : ""
              }`}
            >
              {element.isLabeled ? <label>{element.inLabel}</label> : ""}
              <select
                className={
                  element.isLabeled
                    ? "fr-select-basic fr-select-basic-labeled"
                    : "fr-select-basic"
                }
                value={element.value}
                onChange={(e) => selectValueChange(e.target.value, element)}
              >
                {element.options.map((item, idx) => (
                  <option value={item.value} key={idx}>
                    {item.label}
                  </option>
                ))}
              </select>
              {element?.fieldOptions &&
                generateElements(
                  element?.fieldOptions && element?.fieldOptions[0]
                )}
            </div>
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
                  element?.options[0]?.text === element.value &&
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
              className={`fr-req-element fr-req-el-${element.type} ${
                element.isLabeled ? "fr-req-fieldset" : ""
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
        case "fillinputCF":
          return (
            <div
              className={`fr-req-element fr-req-el-${element.type} ${
                element.isLabeled ? "fr-req-fieldset" : ""
              } ${!element.valid ? "not_valid" : ""}`}
            >
              {element.isLabeled ? <label>{element.inLabel}</label> : ""}

              <div
                className={
                  element.isLabeled
                    ? "fr-fillinputCF-basic fr-fillinputCF-basic-labeled"
                    : "fr-fillinputCF-basic"
                }
                onClick={() => {
                  countyRef.current.focus();
                }}
              >
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
                {/* </div><div className="fillinputCF-input-sugg"> */}

                <SugggesTionBox
                  fillInputChange={fillInputChange}
                  clickFun={suggestionClick}
                  element={element}
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
              className={`fr-req-element fr-req-el-${element.type} ${
                element.isLabeled ? "fr-req-fieldset" : ""
              } ${!element.valid ? "not_valid" : ""}`}
            >
              {element.isLabeled ? <label>{element.inLabel}</label> : ""}

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
                  {/* {element.value?.length > 0 && (
                    <SugggesTionBox
                      inputTxt={element.value}
                      dataArray={element.sggArray}
                      clickFun={suggestionClick}
                      ele={element}
                    />
                  )} */}
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
              className={`fr-req-element fr-req-el-${element.type} ${
                element.isLabeled ? "fr-req-fieldset" : ""
              }`}
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
                {/* <span
                  // className={
                  //   element.isLabeled
                  //     ? "fr-select-basic fr-select-basic-labeled"
                  //     : "fr-select-basic"
                  // }
                  className="fr-selectInput-basic-selector"
                  onChange={(e) =>
                    handleKeyTitleChange(
                      JSON.stringify(e.target.value),
                      element
                    )
                  }
                >
                  <ul>
                    {element.options.length > 0 &&
                      element.options.map((item, idx) => {
                        const itString = JSON.stringify(item);

                        return (
                          <li
                            value={itString}
                            selected={item.selected}
                            key={idx}
                          >
                            {item.label}
                          </li>
                        );
                      })}
                  </ul>
                </span> */}
                {
                  <CustomSelect
                    element={element}
                    onClickOption={handleKeyTitleChange}
                  />
                }
              </div>
              <span
                className={`btn-selectInput btn-right ${
                  element.value.length === 0 ||
                  element.valueArr.length === 0 ||
                  !element.valid ||
                  element.options.filter((el) => el.label === element.value)
                    .length > 0
                    ? "disable"
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
              <span
                className="btn-selectInput btn-wrong"
                onClick={() => {
                  clearKeyWordsHandle(element);
                }}
              >
                <XmarkIcon />
              </span>
              {/* {element?.options?.length > 0 &&
                  element?.options[0]?.text === element.value &&
                  element?.fieldOptions &&
                  generateElements(
                    element?.fieldOptions && element?.fieldOptions[0]
                  )} */}
            </div>
          );

        default:
          break;
      }
    };

    return formSetup.fields.map((formCell, i) => {
      return (
        <div key={i} className="fr-setting-cell">
          <header className="fr-cell-header">
            <h5>
              {formCell.headerCheckbox && (
                <Checkbox
                  onCheckChange={() => headerCheckModif(formCell)}
                  isChecked={formCell.isActive}
                />
              )}
              {formCell.label}
            </h5>
          </header>
          {(formCell.headerCheckbox && formCell.isActive) ||
          !formCell.headerCheckbox ? (
            <div className="fr-cell-content">
              {formCell.fieldOptions.map((item, idx) => {
                if (item.name === "tier_filter_value") {
                  if (formCell.fieldOptions[0].value === "Tier Level") {
                    return generateElements(item);
                  } else {
                    return <></>;
                  }
                } else if (item.name === "country_filter_value") {
                  if (formCell.fieldOptions[0].value === "Country Level") {
                    return generateElements(item);
                  } else {
                    return <></>;
                  }
                } else {
                  return generateElements(item);
                }
              })}
              {/* {generateElements(formCell.fieldOptions[0])} */}
            </div>
          ) : (
            ""
          )}
        </div>
      );
    });
  };

  // useEffect(() => {
  //   console.log("the teh notification sttate", openNotification);
  // }, [openNotification]);
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
            resetToDefaultSetting()
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
      <div className="fr-request-body request-groups h-100">
        {isLoding && <FriendRequestLoader />}
        {!isLoding && (
          <>
            <div className="fr-settings-showcase request-bordered">
              <header className="req-settings-header d-flex f-justify-between f-align-center">
                <div className="req-header-content d-flex f-align-center">
                  <h4>
                    Basic settings
                    <Tooltip
                      textContent="Run Friender with your last saved settings"
                      direction="bottom"
                      type="info"
                    />
                  </h4>
                  {/* <span className="req-setting-version">Default</span> */}
                </div>

                <button
                  className="btn inline-btn"
                  onClick={() => {
                    onEditChange("basic");
                  }}
                >
                  <EditIcon />
                </button>
              </header>

              <section className="view-req-settings">
                <div className="req-setting d-flex f-align-center">
                  <figure>
                    <IntervalIcon />
                  </figure>
                  <div className="req-setting-text">
                    <h4>
                      {settingApiPayload.look_up_interval === "auto"
                        ? settingApiPayload.look_up_interval
                        : settingApiPayload.look_up_interval === ".5"
                        ? "30 sec"
                        : settingApiPayload.look_up_interval + " min"}{" "}
                    </h4>
                    <p>Lookup interval</p>
                  </div>
                </div>
                <div className="req-setting d-flex f-align-center">
                  <figure>
                    <LimitIcon />
                  </figure>
                  <div className="req-setting-text">
                    <h4>
                      {capitalizeFirstLetter(
                        settingApiPayload.request_limit_type
                      )}
                    </h4>
                    <p>Request limit</p>
                  </div>
                </div>
                {settingApiPayload.gender_filter && (
                  <div className="req-setting d-flex f-align-center">
                    <figure>
                      <GenderIcon />
                    </figure>
                    <div className="req-setting-text">
                      <h4>
                        {capitalizeFirstLetter(
                          settingApiPayload.gender_filter_value
                        )}
                      </h4>
                      <p>Gender</p>
                    </div>
                  </div>
                )}
                {settingApiPayload.country_filter_enabled && (
                  <div className="req-setting d-flex f-align-center">
                    <figure>
                      <TierIcon />
                    </figure>

                    {settingApiPayload.tier_filter && (
                      <div className="req-setting-text">
                        {settingApiPayload.tier_filter_value?.length > 0
                          ? settingApiPayload.tier_filter_value.map((item) => (
                              <h4>{item}</h4>
                            ))
                          : "N/A"}
                        <p>Tier level</p>
                      </div>
                    )}
                    {settingApiPayload.country_filter && (
                      <div className="req-setting-text">
                        {settingApiPayload.country_filter_value?.length > 0
                          ? settingApiPayload.country_filter_value.map(
                              (item) => <h4>{item}</h4>
                            )
                          : "N/A"}
                        <p>Country level</p>
                      </div>
                    )}
                  </div>
                )}
                {settingApiPayload.keyword && (
                  <div className="req-setting d-flex f-align-center">
                    <figure>
                      <KeywordsIcon />
                    </figure>
                    <div className="req-setting-text">
                      {settingApiPayload.selected_keywords?.length > 0
                        ? settingApiPayload.selected_keywords.map((item) => (
                            <h4>{item}</h4>
                          ))
                        : "N/A"}
                      <p>Keywords</p>
                    </div>
                  </div>
                )}
                {settingApiPayload.negative_keyword && (
                  <div className="req-setting d-flex f-align-center">
                    <figure>
                      <KeywordsIcon />
                    </figure>
                    <div className="req-setting-text">
                      {settingApiPayload.selected_negative_keywords?.length > 0
                        ? settingApiPayload.selected_negative_keywords.map(
                            (item, index) => (
                              <h4 key={index}>{item ? item : "Keywords"}</h4>
                            )
                          )
                        : "N/A"}
                      <p>Negative keywords</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
        {/* <div className="fr-settings-advance request-bordered">
          <header className="req-settings-header d-flex f-justify-between f-align-center">
            <div className="req-header-content d-flex f-align-center">
              <h4>
                <Checkbox onCheckChange={(e) => onAdvanceChange(e)} />
                Advanced settings
                <Tooltip
                  textContent="Add advanced settings to automation"
                  direction="top"
                  type="info"
                />
              </h4>
            </div>

            <button
              className="btn inline-btn"
              onClick={() => onAdvanceChange()}
            >
              <EditIcon />
            </button>
          </header>
        </div> */}
        {!isLoding && (
          <footer className="fr-settings-footer">
            {!isPaused ? (
              <button
                className="btn btn-theme w-100"
                onClick={runFrinderHandle}
                disabled={isRunnable ? "" : "disabled"}
              >
                <figure className="btn-ico">
                  <Bolt />
                </figure>
                <span>Run Friender</span>
              </button>
            ) : (
              <AutomationStats
                automationrunner={true}
                runFrinderHandle={runFrinderHandle}
                disabled={isRunnable ? "" : "disabled"}
                setrunningScript={setrunningScript}
                setRequestActive={setRequestActive}
                setIsPaused={setIsPaused}
              />
            )}
          </footer>
        )}
      </div>
      
      {isEditing && (
        <>
          {/* {editType === "basic" && 
                    <ModalContainer
                        headerText="Settings"
                        closeModal={resetModal}
                    >
                        <form className='fr-content-cell-grid'>
                            {formSetup.fields.map((formAsset) => (
                                <div 
                                    className='fr-setting-cell'
                                >
                                    <header className='fr-cell-header'>
                                        <h5>
                                            {formAsset.headerCheckbox &&
                                                <Checkbox
                                                    onCheckChange={() => headerCheckModif(formAsset)}
                                                    isChecked={formAsset.isActive}
                                                />
                                            }
                                            {formAsset.label}
                                        </h5>
                                    </header>
                                    <div className='fr-cell-content'>
                                        {generateElements(formAsset.fieldOptions[0])}
                                    </div>
                                </div>
                                )
                            )}
                        </form>
                    </ModalContainer>
                } */}
          {editType === "basic" && (
            <ModalContainer
              headerText="Settings"
              closeModal={() => {
                setModalOpen(true);
              }}
            >
              <div className="form-wraper-settings general-settings">
                <form
                  className="fr-content-cell-grid"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {generateFormElements()}
                </form>

                {openNotification && (
                  <ServerMessages
                    icon={<ServerError />}
                    type={"error"}
                    msgText={"Invalid input field"}
                    headerTxt={"Error"}
                    openNotification={openNotification}
                    setOpenNotification={setOpenNotification}
                  />
                )}
              </div>
              <footer className="fr-settings-footer settings-btn-wraper d-flex d-flex-center">
                <button
                  className="btn btn-theme settings-save w-100"
                  onClick={() => {
                    if (checkValidity(formSetup, setFormSetup)) {
                      setIsEditing(false);

                      setOpenSuccessNotification(true);
                    } else {
                      setOpenNotification(true);
                    }
                  }}
                >
                  <span>Save</span>
                </button>
                {/* <div
                  className="settings-modify"
                  onClick={() => setEditType("advance")}
                >
                  <span>Modify advance settings</span>
                </div> */}
              </footer>
            </ModalContainer>
          )}
          {/* {editType === "advance" && (
            <ModalContainer
              headerText="Advanced settings"
              closeModal={resetModal}
            >
              <div className="form-wraper-settings advanced-settings">
                {advcFormAssets && generateAdvncForm()}
              </div>
              <div className="checkbox-wraper">
                <label className="check-container d-block">
                  Save this setting for the future Run
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                </label>
              </div>
              <footer className="fr-settings-footer settings-btn-wraper d-flex d-flex-center">
                <button
                  className="btn btn-theme settings-save"
                  onClick={() => setIsEditing(false)}
                >
                  <span>Back</span>
                </button>
                <div
                  className="settings-modify"
                  onClick={() => setEditType("basic")}
                >
                  <span>Modify basic settings</span>
                </div>
              </footer>
            </ModalContainer>
          )} */}
        </>
      )}
    </>
  );
};

export default memo(GroupsRequestForm);
