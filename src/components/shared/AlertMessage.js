import React from 'react';

import SVGAsset from '../shared/SVGAsset'

const AlertMessage = (props) => {
    return (
        <div className='alertOuter'>
            <div className={props.type === "success" ? "alert-message alert-success" : props.type === "warning" ? "alert-message alert-warning": props.type === "error" ? "alert-message alert-error" : "alert-message"}>
                <figure>
                    {props.type === "success" ? <SVGAsset type="success" /> : props.type === "warning" ? <SVGAsset type="warning" /> : props.type === "error" ? <SVGAsset type="error" /> : ""}
                </figure>
                <div className='alertBody d-flex f-1 f-align-center f-column f-justify-center'>
                    <header>
                        {props.headerText ? props.headerText : "Custom Header"}
                    </header>
                    <div className="contentAlert">
                        {props.contentAlert ? props.contentAlert : "Custom Content"}
                    </div>
                </div>
                <button className='btn close-modal d-flex f-align-center f-justify-center' onClick={(e)=>props.onClick(e)}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default AlertMessage;