import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../shared/Loader";
import SVGAsset from "../shared/SVGAsset";

import "./css/dashboard.css";

const EngagementModes = () => {
  const [mode, setMode] = useState("manual");
  return (
    <div className="em_ext_content">
      <div className="ext_main h-100 dashboardBody modeScreen">
        <header className="innerBodyHeader">
          <Link to="/" className="inline-btn btn-horizontal-gradient-2 r-30">
            <Suspense fallback={<Loader />}>
              <SVGAsset type="back_arrow" />
            </Suspense>
          </Link>
          <h2>Engagement Modes</h2>
        </header>

        <div className="dashboardStats">Switch engagement modes here</div>
      </div>
    </div>
  );
};

export default EngagementModes;
