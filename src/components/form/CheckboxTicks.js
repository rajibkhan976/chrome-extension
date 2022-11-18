import React from 'react'

function CheckBoxTicks({label=""}) {
    /**@param arg type="normal|wrraped" */
    
  return (
    // <div className="checkbox-wrapper"> 
    //  <input
    //     type="checkbox"
    //     checked={true}
    //     readonly
    //   />
    //   <label>{label}</label>
      
    // </div>

<div className="customizable-checkbox">
            <label className="check-container d-block">
            {label}
              <input
                type="checkbox"
                checked={true}
              />
              <span className="checkmark"></span>
            </label>
          </div>





  )
}

export default CheckBoxTicks