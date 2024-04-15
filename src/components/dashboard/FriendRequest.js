import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

// import requestFormSettings from "../../helper/friend-request-setting-form.json"
import {
  fr_Req_Payload,
  requestFormAdvncSettings,
  requestFormSettings,
} from "../../helper/fr-setting";

import Tooltip from "../shared/Tooltip";
import GroupsRequestForm from "./requestForms/GroupsRequestForm";
import FriendsFriendRequestForm from "./requestForms/FriendsFriendRequestForm";

import { FriendsFriend, Groups, Post, QueryIcon, Suggested } from "../shared/SVGAsset";
import "../../assets/scss/pages/_friend-request.scss";
import helper from "../../extensionScript/helper";
import AutomationRunner from "../shared/AutomationRunner";
import { getFrndReqSet, getKeyWords } from "../../service/FriendRequest";
import { removeEle, syncFromApi, syncPayload } from "../../helper/syncData";
import { fetchMesssageGroups } from "../../service/messages/MessagesServices";
import InnherHeader from "../shared/InnerHeader";
import { ExternalIcon } from "../../assets/icons/Icons";
export const removeforBasic = [
  "_id",
  "user_id",
  "fb_user_id",
  "settings_name",
  "default_sttings",
  "updated_at",
  "created_at",
  "profile_viewed",
  "time_saved",
  "friend_request_send",
  "re_friending_settings",
  "re_friending",
  "send_message_when_someone_accept_new_friend_request_settings",
  "send_message_when_someone_accept_new_friend_request",
  "dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected",
  "dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected",
  "dont_send_friend_requests_prople_ive_been_friends_with_before",
  "advanced_settings",
];

const FriendRequest = (props) => {
  const location = useLocation();
  const navigate = useNavigate()
  const [requestActive, setRequestActive] = useState(null);
  const [formSetup, setFormSetup] = useState(requestFormSettings);
  // const [formSetup, setFormSetup] = useState(requestFormSettings);
  const [advcFormAssets, setAdvcFormAssets] = useState(null);
  const [runningScript, setrunningScript] = useState(false);
  const [isRunnable, setIsRunnable] = useState(false);
  const [friendReqSet, setFriendReqSet] = useState(false);
  const [isLoding, setIsLoding] = useState(true);
  const [settingApiPayload, setSettingApiPayload] = useState(fr_Req_Payload);

  // const setActiveText = () => {
  //   switch (requestActive) {
  //     case null:
  //       return "Choose one option to start sending out requests!";
  //     //break;

  //     case "groups":
  //       return "Facebook Groups";
  //     //  break;

  //     case "friendsfriend":
  //       return "Facebook Friends Friend";
  //     //break;

  //     default:
  //       break;
  //   }
  // };

  const chooseRequestMethod = async (type) => {
    setRequestActive(type);
    if (type === "groups") {
      const runningStatus = await helper.getDatafromStorage("runAction");
      if (runningStatus === "running") {
        setrunningScript(true);
      }
    }
  };

  useEffect(() => {
    setRequestActive(null);
  }, [location.pathname]);
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
            fieldOptions: item.name !== "send_message" ? item.fieldOptions : item.fieldOptions.map((itemCh) => {
              if (
                "message_group_id" === itemCh.name
              ) {
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
              }
              //console.log("Final item-->>>>>", itemCh);
              return itemCh;
            }),
          };
        }),
      };
      setFormSetup(newObj);
    }
  }
  useEffect(() => {
    //console.log("form setup_____>", formSetup);
  }, [formSetup])

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
        "curr_reqSettings"
      );

      if (runningStatus === "pause" || runningStatus === "running") {
        if (runningSettings) {
          let curr_settingObj = JSON.parse(runningSettings);
          curr_settingObj = {...curr_settingObj, is_settings_stop : false}
          setSettingApiPayload(curr_settingObj);

          syncFromApi(curr_settingObj, formSetup, setFormSetup);

          setIsLoding(false);
        }
      } else {
        getFrndReqSet()
          .then((res) => {
            const apiObj = res.data.data;
            // console.log("The api of friend req set>>>///||||\\\\:::", apiObj);
            setFriendReqSet(apiObj[0]);
            if (apiObj?.length > 0) {
              syncPayload(apiObj[0], {...settingApiPayload, is_settings_stop : false}, setSettingApiPayload);
              removeEle(apiObj[0], removeforBasic).then((response) => {
                // console.log("[[[[[[[[[[_____>>>>after rrrreeemove", response);
                syncFromApi(response, formSetup, setFormSetup);
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

      if (props.settingPage === "setSettingsForGroup") {
        setRequestActive("groups");
        setIsRunnable(true);

        // console.log("runningStatus ::: ", runningStatus);
        if (runningStatus === "running") {
          // console.log("runningrunningrunning", requestActive);
          setrunningScript(true);
        }
      }
      requestFormSettings && setFormSetup(requestFormSettings);
      requestFormAdvncSettings && setAdvcFormAssets(requestFormAdvncSettings);
    })();
  }, []);


  chrome.runtime.onMessage.addListener((request) => {
    // console.log("request", request)
    if (request.action === "curr_reqSettings") {
      // console.log("request", request)
      setSettingApiPayload({...JSON.parse(request.curr_reqSettings), is_settings_stop : false});

      syncFromApi(JSON.parse(request.curr_reqSettings), formSetup, setFormSetup);

      setIsLoding(false);
    }
  })
  
  const navigatePage = (el) => {
    navigate(`/${el}`)
  }

  return (
    <>
      <InnherHeader
        subHeaderText="Add friends to friend queue from"
        activePageTextTooltip="Friender's Friend Queue lets you save Facebook profiles for future friend requests, making connecting easier and organized"
      />
      <section className="section-main f-1">
        <div className="main-container">
          {/* {requestActive == null && ( */}
            <ul className="fr-request-choice request-bordered">
              {/* <li onClick={() => chooseRequestMethod("groups")}> */}
              <li>
                <button
                  className="btn text-left w-100"
                  onClick={()=>navigatePage("group")}
                >
                  <figure>
                    <Groups />
                  </figure>
                  <div className="text-option-req d-flex w-100">
                    <article className="f-1">
                    <h4>Groups <a rel="noreferrer" href="https://www.facebook.com/groups/joins/" target="_blank"><ExternalIcon /></a></h4>
                    <p>Getting friends from facebook group members.</p>
                    </article>
                    <aside className="tooltip-bawasir d-flex f-justify-end">
                      <div className="tooltip-v3">
                        <span className="trigger-tooltip-v3">How to use <QueryIcon /></span>
                        <div className="tooltip-content-v3">
                        <h6>To use this feature -</h6>

                        <ul>
                          <li>
                            Open any facebook group.
                          </li>
                          <li>
                            Then open <strong>People</strong> tab
                          </li>
                          <li>
                            Then open the <strong>Extension</strong>
                          </li>
                        </ul>
                        </div>
                      </div>
                    </aside>
                  </div>
                </button>
              </li>
              <li>
                <button
                  className="btn text-left w-100"
                  onClick={()=>navigatePage("posts")}
                >
                  <figure>
                    <Post />
                  </figure>
                  <div className="text-option-req d-flex w-100">
                    <article className="f-1">
                    <h4>Posts <a rel="noreferrer" href="https://www.facebook.com/feed" target="_blank"><ExternalIcon /></a></h4>
                    <p>Getting friends from any facebook post that is visible to your facebook account.</p>
                    </article>
                    <aside className="tooltip-bawasir d-flex f-justify-end">
                      <div className="tooltip-v3">
                        <span className="trigger-tooltip-v3">How to use <QueryIcon /></span>
                        <div className="tooltip-content-v3">
                        <h6>To use this feature -</h6>

                        <ul>
                          <li>
                            Go to a <strong></strong>post
                          </li>
                          <li>
                          Click on the <strong>three dots</strong> of the post
                          </li>
                          <li>
                          Then click on <strong>Run Friender</strong>
                          </li>
                        </ul>
                        </div>
                      </div>
                    </aside>
                  </div>
                </button>
              </li>
              <li>
                <button
                  className="btn text-left w-100"
                  onClick={()=>navigatePage("suggested-friends")}
                >
                  <figure>
                    <Suggested />
                  </figure>
                  <div className="text-option-req d-flex w-100">
                    <article className="f-1">
                    <h4>Suggested friends <a rel="noreferrer" href="https://www.facebook.com/friends/suggestions" target="_blank"><ExternalIcon /></a></h4>
                    <p>Getting friends from facebook friends suggestion list.</p>
                    </article>
                    <aside className="tooltip-bawasir d-flex f-justify-end">
                      <div className="tooltip-v3">
                        <span className="trigger-tooltip-v3">How to use <QueryIcon /></span>
                        <div className="tooltip-content-v3">
                        <h6>To use this feature -</h6>

                        <ul>
                          <li>
                          Open facebook
                          </li>
                          <li>
                            Than open facebook <strong>Suggested friends</strong> tab
                          </li>
                          <li>
                            Then run <strong>Friender</strong>
                          </li>
                        </ul>
                        </div>
                      </div>
                    </aside>
                  </div>
                </button>
              </li>
              <li>
                <button
                  className="btn text-left w-100"
                  onClick={()=>navigatePage("friends-friend")}
                >
                  <figure>
                    <FriendsFriend />
                  </figure>
                  <div className="text-option-req d-flex w-100">
                    <article className="f-1">
                    <h4>Friends friend <a rel="noreferrer"  href="https://www.facebook.com/friends/list" target="_blank"><ExternalIcon /></a></h4>
                    <p>Getting friends to your facebook friends friend list.</p>
                    </article>
                    <aside className="tooltip-bawasir d-flex f-justify-end">
                      <div className="tooltip-v3">
                        <span className="trigger-tooltip-v3">How to use <QueryIcon /></span>
                        <div className="tooltip-content-v3">
                        <h6>To use this feature -</h6>

                        <ul>
                          <li>
                            Open any facebook group.
                          </li>
                          <li>
                            Then open <strong>People</strong> tab
                          </li>
                          <li>
                            Then open the <strong>Extension</strong>
                          </li>
                        </ul>
                        </div>
                      </div>
                    </aside>
                  </div>
                </button>
              </li>
              {/* <li onClick={() => chooseRequestMethod("friendsfriend")}>
                <figure>
                  <FriendsFriend />
                </figure>
                <div className="text-option-req d-flex w-100">
                <article className="f-1">
                  <h4>Facebook Friends Friend</h4>
                  <p>
                    You can send friend request to your facebook Friends Friend
                    list.
                  </p>
                </div>
              </li> */}
            </ul>
          {/* )} */}

          {/* {!runningScript && (
            <>
              {requestActive === "groups" && (
                <GroupsRequestForm
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
              )}

              {requestActive == "friendsfriend" && (
                <FriendsFriendRequestForm formSetup={formSetup} />
              )}
            </>
          )}

          {requestActive === "groups" && runningScript && (
            <AutomationRunner
              setrunningScript={setrunningScript}
              setRequestActive={setRequestActive}
            />
          )} */}
        </div>
      </section>
    </>
  );
};

export default FriendRequest;
