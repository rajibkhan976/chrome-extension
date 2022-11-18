import React from "react";
import useOutSideClick from "../../helper/useOutSideClick";

function CustomSelect({ element, onClickOption }) {
  const { clickedRef, isComponentVisible, setIsComponentVisible } =
  useOutSideClick(false);
  return (
    <span
      className="custom-select"
      onClick={() => {
        setIsComponentVisible(!isComponentVisible);
      }}
      ref={clickedRef}
    >
      {isComponentVisible && (
        <ul>
          {element.options.length > 0 &&
            element.options.map((item, idx) => {
              return (
                <li
                  //value={itString}
                  //selected={item.selected}
                  key={idx}
                  onClick={() => {
                    onClickOption(item, element);
                  }}
                >
                  {item.label}
                </li>
              );
            })}
        </ul>
      )}
    </span>
  );
}

export default CustomSelect;
