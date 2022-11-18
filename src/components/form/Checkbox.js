import { memo, useCallback } from 'react';

import "../../assets/scss/component/form/_checkbox.scss";

const Checkbox = ({isChecked=false, textContent="", onCheckChange=null}) => {
    const handleCheckChange = useCallback((e) => {
        onCheckChange(e.target.checked)
    })
    return (
        <label className='fr-ext-checkbox'>
            <input 
                type="checkbox" 
                defaultChecked={isChecked}
                onChange={handleCheckChange}
            />
            <span className='fr-ext-checkContent'>
                <span className='fr-ext-check-ui'>

                </span>
                {textContent && textContent.trim() != "" && <span className='fr-ext-check-ui'></span>}
            </span>
        </label>
    );
};

export default memo(Checkbox);