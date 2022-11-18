import { memo } from "react";
import useOutSideClick from "../../../helper/useOutSideClick";

const SugggesTionBox = ({ fillInputChange, clickFun, element }) => {

  // dataArray = country_list.filter(item=>item.includes(inputTxt));
  // console.log("this the suggestion box", inputTxt);
  const { clickedRef, isComponentVisible, setIsComponentVisible } =
    useOutSideClick(false);

  return (
    <div className="fillinputCF-input-sugg">
      <input
        value={element.value}
        maxlength="30"
        placeholder={
          element.name === "tier_filter_value"
            ? 'Please enter "Tier"..'
            : "Enter country name..."
        }
        onChange={(e) => fillInputChange(e.target.value, element)}
        ref={clickedRef}
        onClick={()=>setIsComponentVisible(true)}
        // autoFocus
      />
      {isComponentVisible && (
        <div className="suggestion_box_main">
          <ul>
            {element.sggArray
              .filter((item) =>
                item.name.toLowerCase().includes(element.value.toLowerCase())
              )
              .map((item, idx) => {
                return (
                  <li
                    key={idx}
                    onClick={() => {
                      clickFun(element, item.name);
                      setIsComponentVisible(false);
                    }}
                    className={`${item.active ? "disabled" : ""}`}
                  >
                    {item.name}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(SugggesTionBox);
