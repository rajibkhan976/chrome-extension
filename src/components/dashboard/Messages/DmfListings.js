import { React, memo, useCallback, useEffect, useState } from "react";
//import { Link } from "react-router-dom";
//import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import CheckBoxTicks from "../../form/CheckboxTicks";
import ModalContainer from "../../shared/ModalContainer";
import Lottie from "react-lottie-player";
import noDataAnimationLight from "../../../assets/animations/noDataAnimation.json";
import "../../../assets/scss/pages/_messages.scss";
import { EditIcon, DeleteIcon, DragIcon } from "../../../assets/icons/Icons";
import DraggableList from "../../shared/DragableList/DraggableList";
import Card from "../../shared/DragableList/Card";
import { fetchDMFs, prioritySubDMF } from "../../../service/messages/MessagesServices";
export const dmfJsonArr2 = [];

const dmfJsonArr = [];

const Webview_URL = process.env.REACT_APP_APP_URL;
//console.log("the link kallol is", Webview_URL);

const DmfListings = ({ setShowDetailsFn, setHideDetailsFn, showDetails }) => {
  const [dmfArray, setDmfArray] = useState();

  // DMF array operations
  const [activeDmfIdx, setActiveDmfIdx] = useState(dmfJsonArr2[0]);
  const [subDmfOpen, setSubDmfOpen] = useState(false);
  const [showSubDmfDetails, setShowSubDmfDetails] = useState(false);
  const [hideTooltips, setHideTooltips] = useState(false);

  const [activeDmf, setActiveDmf] = useState();
  const [activedmfId, setActivedmfId] = useState(
  );
 

  // Dmf Child Content
  const [subDmfDetailsInfo, setSubDmfDetailsInfo] = useState(false);
  useEffect(() => {
    // console.log("dmf data");
    fetchDMFs()
      .then((res) => {
        const dmfListsDisplay = res.data.data;
        // console.log("The api of Dmf List>>>///||||\\\\:::", dmfListsDisplay);
        setDmfArray(dmfListsDisplay);
      })
      .catch((err) => {
        // console.log("Error happened in DMF List:::", err);
      });
  }, []);

  useEffect(() => {
    // console.log("The Data of Dmf List:::", dmfArray);

    if(dmfArray?.length>0){
      setActiveDmf(dmfArray[0])
      setActivedmfId(dmfArray && dmfArray[0].sub_dmfs[0]._id)
    }
  }, [dmfArray]);

  // const setSubDmfDetailsInfoFn = (item) => {
  //   setSubDmfDetailsInfo(item);
  // };

  const setSubDmfDetailsHideFn = (item) => {
    setSubDmfDetailsInfo(item);
    // console.log("The index listings is", subDmfDetailsInfo)
  };

  const setShowActiveDmfFn = (item, index) => {
    setActiveDmfIdx(index);
    setActiveDmf(item);
    setSubDmfOpen(true);
  };
  const setShowSubDmfDetailsFn = (idx) => {
    // alert("sub dmf click")
    setShowSubDmfDetails(idx);
    setHideTooltips(true);
  };

  const setHideSubDmfFn = () => {
    setSubDmfOpen(false);
  };

  const setHideSubDmfDetailsFn = () => {
    setShowSubDmfDetails(null);
    setHideTooltips(false);
  };

  // DMF array operations]


  return (
    <div className="message-content-wraper">
      <div className="message-tab-head-wraper d-flex-center">
        {subDmfOpen && (
          <button
            className="btn btn-go-back"
            onClick={() => setHideSubDmfFn(null)}
          ></button>
        )}
        <h5
          style={{
            marginRight: subDmfOpen ? "auto" : 0,
            marginLeft: subDmfOpen ? "10px" : 0,
          }}
        >
          Dynamic Merge Fields
        </h5>

        <a
          href={Webview_URL +"/message"}
          target="_blank"
          className="add-btn btn btn-theme"
        >
          <figure>
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="26" height="26" rx="13" fill="#605BFF" />
              <circle cx="13" cy="13" r="6.75" fill="#605BFF" />
              <path
                d="M13 9.25L13 16.75"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M16.75 13L9.25 13"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </figure>
        </a>
      </div>
      {Array.isArray(dmfArray)
      && dmfArray?.length > 0 ? (
        <>
          <ul className="listing-wraper">
            {dmfArray.slice(0).reverse().map((item, index) => {
              return (
                <>
                  <li
                    className={
                      !subDmfOpen
                        ? "ind-listings dmf-listings"
                        : "ind-listings  dmf-listings hide"
                    }
                    key={index}
                  >
                    {!subDmfOpen && (
                      <>
                        <span
                          className="listing-name"
                          onClick={() => setShowActiveDmfFn(item, index)}
                        >
                          {item.name}
                        </span>
                        <span className="action-icons">
                          <a
                            href={Webview_URL +"/message?dmf="+(item._id)}
                            target="_blank"
                            className="btn inline-btn transparent-btn edit-btn"
                          >
                            <figure>
                              {" "}
                              <EditIcon />
                            </figure>
                          </a>

                          {/* <a
                            href={Webview_URL +"/message"}
                            target="_blank"
                            className="btn inline-btn transparent-btn delete-btn"
                          >
                            <figure>
                              <DeleteIcon />
                            </figure>
                          </a> */}
                        </span>
                      </>
                    )}
                  </li>

                  {activeDmfIdx === index && (
                    <>
                      {subDmfOpen && (
                        <>
                          <DraggableList
                            data={activeDmf}
                            renderItemContent={(item, active) =>
                              LessonCard(item, active)
                            }
                            onClickFun={setSubDmfDetailsInfo}
                            setDataObj={setActiveDmf}
                            activeObjId={activedmfId}
                          />

                          {subDmfDetailsInfo && (
                            <ModalContainer
                              headerText="View Dynamic Merge Fields"
                              actionAllowed={1}
                              closeModal={setSubDmfDetailsHideFn}
                              editLink={Webview_URL+"/message?dmf="+(subDmfDetailsInfo.dmf_id)+"&subdmf="+(subDmfDetailsInfo._id)}
                            >
                              <div
                                className={
                                  subDmfDetailsInfo.subdmf_name.length > 45
                                    ? "message-head-wraper long-infos"
                                    : "message-head-wraper"
                                }
                              >
                                <div
                                  className={
                                    subDmfDetailsInfo.use_as.keyword === true ||
                                    subDmfDetailsInfo.use_as.label === true ||
                                    subDmfDetailsInfo.use_as.tags === true
                                      ? "title-section dmf-details"
                                      : "title-section"
                                  }
                                >
                                  <p className="message-title-heading">Title</p>
                                  <p className="message-title">
                                    {subDmfDetailsInfo.subdmf_name}
                                  </p>
                                </div>
                                {(subDmfDetailsInfo.use_as.keyword === true ||
                                  subDmfDetailsInfo.use_as.label === true ||
                                  subDmfDetailsInfo.use_as.tags === true) && (
                                  <div className="checkbox-section d-flex">
                                    {subDmfDetailsInfo.use_as.keyword ===
                                      true && <CheckBoxTicks label="Keyword" />}
                                    {subDmfDetailsInfo.use_as.label ===
                                      true && <CheckBoxTicks label="Label" />}
                                    {subDmfDetailsInfo.use_as.tags === true && (
                                      <CheckBoxTicks label="Tags" />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div
                                className={
                                  subDmfDetailsInfo.use_as.keyword === true ||
                                  subDmfDetailsInfo.use_as.label === true ||
                                  subDmfDetailsInfo.use_as.tags === true
                                    ? "message-detail-section dmf-details-page"
                                    : "message-detail-section"
                                }
                              >
                                <div className="message-heading">
                                  <p>Message</p>
                                </div>
                                <div className="message-details">
                                  <p>{subDmfDetailsInfo.subdmf_content}</p>
                                </div>
                              </div>
                            </ModalContainer>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="no-records">
          <figure>
            <Lottie
              loop={5}
              animationData={noDataAnimationLight}
              play
              background="transparent"
              style={{ width: "121px", height: "108px" }}
            />
          </figure>
          <p>
            You haven’t created any <br />
            Dynamic Merge Fields yet!
          </p>
        </div>
      )}
    </div>
  );
};
const LessonCard = (item, active) => <Card item={item} active={active} />;
export default DmfListings;
