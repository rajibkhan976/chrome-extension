import { Link, useLocation } from "react-router-dom";
import Tooltip from "./Tooltip";
import { useEffect, useState } from "react";

const InnherHeader = (props) => {
  const location = useLocation()
  const [activeTooltip, setActiveTooltip] = useState()
  const [subHeader, setSubheader] = useState()

  useEffect(() => {
    setActiveTooltip(props.activePageTextTooltip)
    setSubheader(props.subHeaderText)
  }, [location, props.subHeaderText, props.activePageTextTooltip])
  
  return (
    <header className="header-inner d-flex f-align-center f-justify-between">
      {/* {requestActive && requestActive != null && (
          <button
            className="btn btn-go-back"
            onClick={() => setRequestActive(null)}
          ></button>
        )} */}
      {props.goBackTo &&
        <Link
          to={props.goBackTo}
          className="btn btn-go-back"
        />
      }
      <p
      //   style={{
      //     marginRight: requestActive && requestActive != null ? "auto" : 0,
      //     marginLeft: requestActive && requestActive != null ? "10px" : 0,
      //   }}
      >
        {/* {requestActive === 'groups' ? 'Facebook groups' : requestActive === 'friendsfriend' ? 'Friends Friends' : 'Sent Friend Request from'} */}
        {subHeader}

        <Tooltip
          type="info"
          textContent={activeTooltip}
          direction="bottom"
        />
      </p>

      {/* <Tooltip 
            textContent={props.activePageTextTooltip} 
            direction="left" 
        /> */}
    </header>
  );
}

export default InnherHeader;