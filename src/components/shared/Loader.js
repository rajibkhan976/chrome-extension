import React from "react";
const kyubiSettings = require("../../kyubiSettings.json")
const Loader = (props) => {
  return (
    <div className="loaderOuter">
      {!kyubiSettings.loader.preLoader ? <div className="progressBar"></div> : <img src={kyubiSettings.loader.preLoader} alt="" />}
      {props.text && <span>{props.text}</span>} 
    </div>

  );
};

export default Loader;
