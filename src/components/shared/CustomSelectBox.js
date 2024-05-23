import React, { useEffect, useState } from "react";
import useOutSideClick from "../../helper/useOutSideClick";
import { CrossWhite, DropDownIcon, NotFoundIcon, SearchIcon } from "../../assets/icons/Icons";
import { utils } from "../../helper/utils";


function CustomSelectBox({ element, onClickOption, className = "", needSearchBar = false, barWitdh = "100%", disabled = false }) {
    const [currentOptions, SetcurrentOptions] = useState(element.options);
    const selectedOption = element.options.filter((item) => item.value === element.value);
    const [searchVal, setSearchVal] = useState("");
    const { clickedRef, isComponentVisible, setIsComponentVisible } =
        useOutSideClick(false);

    useEffect(() => {
        if (!isComponentVisible) {
            handleSearch("");
        }
    }, [isComponentVisible])

    const handleSearch = (val) => {
        //console.log("Search value:", val);
        setSearchVal(val);
        SetcurrentOptions(element.options.filter((item) => item.label.toLowerCase().includes(val.toLowerCase())))
    }
    const clearSearchClickHandle = () => {
        handleSearch("");
        setSearchVal("");
    }
    return (
        <div
            className="custom-selectBox"

            ref={clickedRef}
        >
            <span
                className="custom-selectBox-text"
                onClick={() => {
                    element.options && element.options.length > 0 && setIsComponentVisible(!isComponentVisible);
                }}
                style={{ width: barWitdh }}
            >
                <p>{element && element.value && element.options && selectedOption.length > 0 && element.value.length > 0 ? utils.truncateText(selectedOption[0].label) : "Select message group"}</p>
                <span className="custom-selectBox-drop">
                    <DropDownIcon />
                </span>
            </span>
            {isComponentVisible && !disabled && (
                <ul>
                    {needSearchBar &&
                        <div className="custom-select-list-search">
                            <SearchIcon />
                            <input
                                value={searchVal}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <span onClick={clearSearchClickHandle}>
                                <CrossWhite />
                            </span>
                        </div>}
                    {currentOptions.length > 0 &&
                        currentOptions.map((item, idx) => {
                            return (
                                <li
                                    //value={itString}
                                    //selected={item.selected}
                                    className={item.label.length > 32 ? "full_text_tooltip" : ""}
                                    key={idx}
                                    onClick={() => {
                                        onClickOption(item, element);
                                        setIsComponentVisible(false);
                                    }}
                                    data-text={item.label}
                                >
                                    {item.label.length > 32 ? item.label.slice(0, 32) + "..." : item.label}
                                </li>
                            );
                        })}
                    {currentOptions.length === 0 && <div className="not-found">
                        <NotFoundIcon />
                        <p>No message group found</p>
                    </div>}
                </ul>
            )}
        </div>
    );
}

export default CustomSelectBox;
