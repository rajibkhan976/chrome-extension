import { NavLink } from "react-router-dom";
import { Fire, DiamondPoints, ThreeDots, LogoIcon } from "../shared/SVGAsset";

import "../../assets/scss/component/shared/_header.scss"

const HeaderExtension = (props) => {
  return (
    <header className="header d-flex f-align-center f-justify-between">
      <figure
        className="logo-header"
      >
        <NavLink 
          to="/"
        >
          <LogoIcon />
          <span class="logoText">Your organic marketing best friend</span>
        </NavLink>
      </figure>

      {/* 
        --- Commented out this portion as its non-function as of Sprint-3 ---
        <div className="options-header d-flex f-align-center h-100">
          <div className="header-saved-points d-flex f-align-center h-100">
            <figure>
              <Fire/>
            </figure>
            <span>
              <strong>5 Hours</strong>
              Saved
            </span>
          </div>
          <div className="header-points d-flex f-align-center h-100">
            <button className="btn btn-points h-100 f-align-center f-justify-center">
              <figure>
                <DiamondPoints />
              </figure>
              <span>
                345
              </span>
            </button>
          </div>
          <div className="menu-header d-flex f-align-center h-100">
            <button
              className="btn h-100 f-align-center f-justify-center"
            >
              <ThreeDots />
            </button>
          </div>
        </div>
        --- Commented out this portion as its non-function as of Sprint-3 ---
      */}
    </header>
  );
};

export default HeaderExtension;
