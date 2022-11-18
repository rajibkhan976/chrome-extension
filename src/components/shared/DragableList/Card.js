import React, { memo, useEffect, useRef, useState } from "react";
//import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import CheckBoxTicks from "../../form/CheckboxTicks";
import ModalContainer from "../../shared/ModalContainer";
import { DragHoldIcon, FileDocIcon, EditIcon, DeleteIcon, DragIcon } from "../../../assets/icons/Icons";

const Webview_URL = process.env.REACT_APP_APP_URL;
//console.log("the link kallol is", Webview_URL);

const Card = (props) => {
  const renderCount = useRef(0)
  const [previous, setPrevious] = useState(0);
  const [colorSt, setColor] = useState(props.color)
  // console.log("i amthe props card///", props);
  const bgColorArr = ["#ee37ff1e", "#ff8f6b1e", "#ff906b1e", "#605bbf1e", "#26bfe21e"]
  const iconColorArr = ["#ee37ff", "#ff8f6b", "#ff906b", "#605bbf", "#26bfe2"]

  let ColorIndex = Math.floor(Math.random() * 4) + 1
  // console.log("card color",props.color+"1e")
  useEffect(() => {
    setPrevious(previous + 1)
    renderCount.current = renderCount.current + 1;
    // console.log("COLOR state",previous)
  }, [])
  const LengthNumber = props.item.subdmf_name.length

  //console.log("The length is", LengthNumber);

  const LengthInfoNumber = props.item.subdmf_content.length

  //console.log("The info length is", LengthInfoNumber);



  return (
    <>
      <div className={`subdmf_card ${props.active && "active"} ${props.item.subdmf_name === "Default" && "default"}`}>
        <div className="subdmf_card_icons">
          <span className="listing-icon">
            <DragIcon />
          </span>
        </div>{" "}
        <div className="dragable-item-infos">
          <h4>{/* {props.item.subdmf_name.length > 25 ? (props.item.sub_dmf_name) : (props.item.subdmf_name.slice(0, 25).concat("..."))  } */}
            {(LengthNumber < 35) ? (
              <>
                {props.item.subdmf_name}
              </>
            )
              :
              (
                <>
                  {props.item.subdmf_name?.slice(0, 35).concat("...")}
                </>
              )
            }
            <span className="tooltip-infos">
              <p className="tooltip-header">
                {/* {props.item.subdmf_name.length > 25 ? (props.item.sub_dmf_name) : (props.item.subdmf_name.slice(0, 25).concat("..."))  } */}
                {props.item.subdmf_name}
              </p>
              <p className="tooltip-texts">
                {/* {props.item.infos} */}
                {(LengthInfoNumber < 75) ? (
              <>
                {props.item.subdmf_content}
              </>
            )
              :
              (
                <>
                  {props.item.subdmf_content?.slice(0, 75).concat("...")}
                </>
              )
            }
              </p>
              <p className="tooltip-link">
                More...
              </p>
            </span>
          </h4>
          {/* <p>{props.item.subdmf_content.slice(0, 30).concat("...")}</p> */}

        </div>
        <div className="action-icons">
                          
                          <a href={Webview_URL +"/message?dmf="+(props.item.dmf_id)+"&subdmf="+(props.item._id)} target="_blank" className="btn inline-btn transparent-btn edit-btn">
                              <figure> <EditIcon />
                              </figure>
                              </a>
                
                              {/* <a href={Webview_URL +"/message"} target="_blank" className="btn inline-btn transparent-btn delete-btn">
                              <figure>
                              <DeleteIcon />
                              </figure>
                            </a> */}
        </div>
      </div>






    </>
  );
};

Card.propTypes = {
  item: PropTypes.object,
};

export default memo(Card);
