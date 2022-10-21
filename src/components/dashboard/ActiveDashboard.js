import React from "react";
import SVGAsset from "../shared/SVGAsset";

const dummyActiveCard = {
  name: "Swagata Automation",
  startTime: "10:05",
  postNum: 450,
  deepEngage: true,
  activeDays: [true, true, true, true, true, true, true],
};

const ActiveDashboard = () => {
  const ActiveCardInfo = () => {
    return (
      <>
        <h5>{dummyActiveCard.name}</h5>
        <div className="w-row">
          <div className="w-col">
            <label>Start Time</label>
            <span>{dummyActiveCard.startTime}</span>
          </div>
          <div className="w-col">
            <label>No. of post</label>
            <span>{dummyActiveCard.postNum}</span>
          </div>
          <div className="w-col">
            <label>Deep engage</label>
            <span>{dummyActiveCard.deepEngage ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
        <div className="activeDays">
          <label>Days active</label>
          <div className="activeList d-flex">
            {dummyActiveCard.activeDays.map((day, index) => {
              switch (index) {
                case 0:
                  return day ? <span key={index}>M</span> : false;

                case 1:
                  return day ? <span key={index}>T</span> : false;

                case 2:
                  return day ? <span key={index}>W</span> : false;

                case 3:
                  return day ? <span key={index}>Th</span> : false;

                case 4:
                  return day ? <span key={index}>F</span> : false;

                case 5:
                  return day ? <span key={index}>Sa</span> : false;

                case 6:
                  return day ? <span key={index}>S</span> : false;

                default:
                  break;
              }
            })}
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="active_shotStats">
        <div className="w-row">
          <div className="w-col w-50">
            <div className="activeShot boxed">
              <h6 className="d-flex f-align-center">
                <figure>
                  <SVGAsset type="heart" />
                </figure>
                Reactions
              </h6>
              <h2>
                380/<sub>650</sub>
              </h2>
            </div>
          </div>
          <div className="w-col w-50">
            <div className="activeShot boxed">
              <h6 className="d-flex f-align-center">
                <figure>
                  <SVGAsset type="comments" />
                </figure>
                Comments
              </h6>
              <h2>
                380/<sub>650</sub>
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="activeEngagementCard d-flex f-column f-justify-between">
        <ActiveCardInfo />
      </div>
      <div className="actionsActiveEngagement">
        <div className="w-row">
          <div className="w-col w-50">
            <button className="btn btn-vertical-gradient viewInPortal">
              View in Portal
            </button>
          </div>
          <div className="w-col w-50">
            <button className="btn btn-skeleton btn-skeleton-blue stopAutomation">
              Stop
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActiveDashboard;
