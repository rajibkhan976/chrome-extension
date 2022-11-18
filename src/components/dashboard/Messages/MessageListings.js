import {React, memo, useCallback, useEffect, useState} from 'react';

import CheckBoxTicks from "../../form/CheckboxTicks";
import ModalContainer from "../../shared/ModalContainer";
import Lottie from "react-lottie-player";
import noDataAnimationLight from "../../../assets/animations/noDataAnimation.json";
import "../../../assets/scss/pages/_messages.scss";
import {EditIcon, DeleteIcon, DragIcon} from "../../../assets/icons/Icons";

const Webview_URL = process.env.REACT_APP_APP_URL;
//console.log("the link kallol is", Webview_URL);


const MessageListings = ({messageLists, setShowDetailsFn, setHideDetailsFn, showDetails}) => {


  // DMF array operations


    return (
      <div className='message-content-wraper'>
      <div className="message-tab-head-wraper d-flex-center">
        <h5>Message Sagement</h5>
        <button className="add-btn btn btn-theme ">
          <figure>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="26" height="26" rx="13" fill="#605BFF"/>
              <circle cx="13" cy="13" r="6.75" fill="#605BFF"/>
              <path d="M13 9.25L13 16.75" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M16.75 13L9.25 13" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </figure>
        </button>
      </div>
      {messageLists.length > 0 ?
        <ul className='listing-wraper'>
        {messageLists.map((item, index) => {
           return (
             <>
           <li className='ind-listings' key={index}>
             <span className='listing-name' onClick={()=>setShowDetailsFn(index)}>{item.title}</span>
             <span className="action-icons">
                          
                        <a href={Webview_URL +"/message"} target="_blank" className="btn inline-btn transparent-btn edit-btn">
                            <figure> <EditIcon />
                            </figure>
                            </a>
              
                            {/* <a href={Webview_URL +"/message"} target="_blank" className="btn inline-btn transparent-btn delete-btn">
                            <figure>
                            <DeleteIcon />
                            </figure>
                          </a> */}
                        </span>
           </li>
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

export default MessageListings;