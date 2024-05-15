import React from 'react'

function Modal({ headerText, modalIcon, bodyText, modalType, open, setOpen, btnText, ModalFun, cancelBtnTxt, resetFn }) {

  return (
    <div className='modal-background' style={{ display: open ? "block" : "none" }}>
      <div className='fr-ext-modal-overlay' ></div>
      <div className='modal'>
        <div className='modal-content-wraper'>
          {/* == CROSS BUTTON TO CLOSE MODAL IT-SELF == */}
          {/* <span className='close-modal' onClick={() => { setOpen(false) }} x>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.8" d="M5.91615 4.99993L9.80995 8.89392C10.0634 9.14721 10.0634 9.55675 9.80995 9.81003C9.55667 10.0633 9.14714 10.0633 8.89386 9.81003L4.99994 5.91604L1.10614 9.81003C0.85274 10.0633 0.443335 10.0633 0.190051 9.81003C-0.0633505 9.55675 -0.0633505 9.14721 0.190051 8.89392L4.08385 4.99993L0.190051 1.10593C-0.0633505 0.852639 -0.0633505 0.443107 0.190051 0.189818C0.316278 0.0634708 0.482246 0 0.648097 0C0.813947 0 0.979797 0.0634708 1.10614 0.189818L4.99994 4.08382L8.89386 0.189818C9.0202 0.0634708 9.18605 0 9.3519 0C9.51775 0 9.6836 0.0634708 9.80995 0.189818C10.0634 0.443107 10.0634 0.852639 9.80995 1.10593L5.91615 4.99993Z" fill="#FF6A77" />
            </svg>

          </span> */}

          {/* == HEADER TEXT == */}
          <div className={`modal-header ${modalType}`} >
            {/* <figure>
                   <img src={modalIcon} className="modal-icon" alt="" />
                  </figure>  */}
            {headerText}
          </div>

          {/* == BODY TEXT == */}
          <div className='modal-content'>
            {bodyText}
          </div>

          {/* == BUTTONS PART == */}
          <div className='modal-buttons'>
            <button className='btn-primary-outline btn-new-outline'
              onClick={() => resetFn ? resetFn() : setOpen(false)}>
              {cancelBtnTxt ? cancelBtnTxt : 'Close'}
            </button>
            <button className="btn-stop unfriend btn-new-stop" onClick={() => { ModalFun() }}>{btnText}</button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Modal
