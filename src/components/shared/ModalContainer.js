import React, { memo } from 'react';

import { Cross } from './SVGAsset';
import "../../assets/scss/component/shared/_modalContainer.scss"
import {EditIcon, DeleteIcon} from "../../assets/icons/Icons";

const Webview_URL = process.env.REACT_APP_APP_URL;
//console.log("the link kallol is", Webview_URL);

const ModalContainer = ({headerText="", closeModal, actionAllowed, editLink, children}) => {
    const closeThisModal = () => {
        closeModal()
    }
    return (
        <div className='fr-ext-modal'>
            <div className='fr-ext-modal-overlay' onClick={closeThisModal}></div>
            <div className='fr-ext-modal-body d-flex d-flex-column'>
                <header className='fr-ext-modal-header d-flex f-align-center f-justify-between'>
                    {headerText}
                    {(actionAllowed === 1) && (
                      <span className="inline-action-btn-wraper">
                        <a href={editLink} className='btn inline-btn transparent-btn edit-btn modal-header-components' target="_blank"><figure>
                          <EditIcon />
                          </figure></a>
                       
                          {/* <a href={Webview_URL +"/message"} className='btn inline-btn transparent-btn delete-btn' target="_blank"><figure>
                          <DeleteIcon />
                          </figure></a> */}
                        
                      </span>
                    )}
                    
                    <button className='btn inline-btn' onClick={closeThisModal}>
                      <Cross />
                    </button>
                </header>
                <section className='fr-ext-modal-content'>
                    <div className='fr-content-modal'>
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default memo(ModalContainer);