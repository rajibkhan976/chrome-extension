import {React, memo, useCallback, useEffect, useState} from 'react';
//import { Link } from "react-router-dom";
import CheckBoxTicks from "../../form/CheckboxTicks";
import ModalContainer from "../../shared/ModalContainer";
import Lottie from "react-lottie-player";
import noDataAnimationLight from "../../../assets/animations/noDataAnimation.json";
import "../../../assets/scss/pages/_messages.scss";
import {EditIcon, DeleteIcon} from "../../../assets/icons/Icons";

//const Webview_URL = process.env.REACT_APP_APP_URL;
//console.log("the link kallol is", Webview_URL);

const SagementListings = ({setShowDetailsFn, setHideDetailsFn, showDetails}) => {


  const sagementLists = [
    {
      title: "Sagement by Friender",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      title: "Message Lorem Sagements Message Lorem Sagements Testing It",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      title: "Ipsum is Sagement ...",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      title: "Ipsum is Sagement ...",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },

    {
      title: "Ipsum is Sagement ...",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      title: "Ipsum is Sagement ...",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      title: "Ipsum is Sagement ...",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
    {
      title: "Ipsum is Sagement ...",
      infos:
      "{executive director | co-founder | chief-executive }",
      message:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
    },
  ];


    return (
      <div className='message-content-wraper'>
      <div className="message-tab-head-wraper d-flex-center">
        <h5>Message Sagement</h5>
        <a className="add-btn btn btn-theme"><figure>
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
          </figure></a>
      </div>
      {sagementLists.length > 0 ?
        <ul className='listing-wraper message-listings'>
        {sagementLists.map((item, index) => {
           return (
             <>
           <li className='ind-listings' key={index}>
             <span className='listing-name' onClick={()=>setShowDetailsFn(index)}>
             {(item.title.length < 35) ? (
                  <>
                {item.title}
                </>
                )
                :
                (
                  <>
                {item.title.slice(0, 35).concat("...") }
                </>
                )
                }
             
              <span className="tooltip-infos">
                <p className="tooltip-header">
                {item.title}
                </p>
                <p className="tooltip-texts">
                {item.infos}
                </p>
                <p className="tooltip-link">
                  More...
                </p>
              </span>
             
             </span>
             <span className="action-icons">
                          
                        <a className="btn inline-btn transparent-btn edit-btn">
                            <figure> <EditIcon />
                            </figure>
                            </a>
              
                            {/* <a className="btn inline-btn transparent-btn delete-btn">
                            <figure>
                            <DeleteIcon />
                            </figure>
                          </a> */}
                        </span>
           
           {showDetails===index &&
                  <ModalContainer headerText="View Messsage Segment" actionAllowed={1} closeModal={setHideDetailsFn}>
                    <div className="message-head-wraper">
                      <div className={((item.keyword === 1) || (item.label === 1) || (item.tags === 1)) ? "title-section dmf-details": "title-section"}>
                        <p className="message-title-heading">Title</p>
                        <p className="message-title">{item.title}</p>
                      </div>
                      {((item.keyword === 1) || (item.label === 1) || (item.tags === 1)) && (
                        <div className="checkbox-section d-flex">                          
                        {item.keyword === 1 && 
                          <CheckBoxTicks label="Keyword" />
                        }
                        {item.label ===1 && 
                          <CheckBoxTicks label="Label" />
                        }
                        {item.tags ===1 && 
                          <CheckBoxTicks label="Tags" />
                        }
                      </div>
                      )}
                    </div>
                    <div className= {((item.keyword === 1) || (item.label === 1) || (item.tags === 1)) ? "message-detail-section dmf-details-page": "message-detail-section"}>
                      <div className="message-heading">
                        <p>Message</p>
                      </div>
                      <div className="message-details">
                        <p>{item.message}</p>
                      </div>
                    </div>
                  </ModalContainer>
                }
                </li>
                </>
           )
         })}
     </ul>
        
        :
        <div className='no-records'>
           <figure>
            <Lottie
              loop = {5}
              animationData={noDataAnimationLight}
              play
              background="transparent"
              style={{ width: "121px", height: "108px" }}
            />
          </figure> 
          <p>You haven’t created any <br />
            Message Sagement yet!</p>
        </div>
      

      }
    </div>
        );
};

export default SagementListings;