import React, { useState } from "react";
import { Link } from "react-router-dom";
import SVGAsset from "../shared/SVGAsset";
import ActiveDashboard from "./ActiveDashboard";

import "./css/dashboard.css";

const dataDummyTotal = [
  {
    type: "like",
    quantity: "16,59,204",
  },
  {
    type: "heart",
    quantity: "90,806",
  },
  {
    type: "care",
    quantity: "70,615",
  },
  {
    type: "laugh",
    quantity: "50,826",
  },
  {
    type: "amazed",
    quantity: "98,562",
  },
  {
    type: "sad",
    quantity: "25,878",
  },
  {
    type: "angry",
    quantity: "6,895",
  },
];


const BodyExtension = (props) => {
  const [dashboardActive, setDashboardActive] = useState(false);
  // console.log("I am in body extention");
  // chrome.storage.local.get(['fbUserInfo'], (resp)=>{
  //   console.log("response from local in body ::: ", resp.fbUserInfo);
  // })

  const TotalReactions = () => {
    return dataDummyTotal.map((expression) => (
      <li key={expression.type} className={"quantity_" + expression.type}>
        <figure>
          <SVGAsset type={"reaction_" + expression.type} />
        </figure>
        {expression.quantity}
      </li>
    ));
  };

  return (
    <div className="em_ext_content">
      <div className="ext_main h-100 dashboardBody dashScreen">
        <header className="innerBodyHeader">
          {dashboardActive ? (
            <span className="stateDashboard inline-btn btn-horizontal-gradient-2 r-30 no-pointer">
              Currently Active
            </span>
          ) : (
            <span className="stateDashboard inline-btn btn-horizontal-gradient-2 r-30 no-pointer">
              All time
            </span>
          )}
          <h2>Dashboard</h2>
        </header>

        <div className="dashboardStats">
          {dashboardActive ? (
            <ActiveDashboard />
          ) : (
            <>
              <div className="allTimeReactions boxed">
                <div className="totalReactionHeader">
                  <h2>
                    <small>Total reactions</small>
                    20,02,789
                  </h2>
                </div>
                <ul>
                  <TotalReactions />
                </ul>
                <div className="totalReactionFooter">
                  <h2>
                    <small>Total comments</small>
                    23,951
                  </h2>
                </div>
              </div>

              <Link
                to={"/engagement-portal"}
                target="_blank"
                className="btn d-flex btn-vertical-gradient viewInPortal"
              >
                View in Portal
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyExtension;
