import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import './css/footer.css'

import Loader from "./Loader";

const SVGAsset = React.lazy(() => import("../shared/SVGAsset"));
const kyubiSettings = require("../../kyubiSettings.json");

const FooterExtension = () => {
  const [footer, setFooter] = useState(false);
  const [poweredBy, setPoweredBy] = useState(false);
  const [partenership, setPartenership] = useState(false);
  const [facebookGroup, setFacebookGroup] = useState(false);
  const [chat, setChat] = useState(false);
  const [poweredByURL, setPoweredByURL] = useState("");
  const [poweredByLabel, setPoweredByLabel] = useState("");
  const [partnershipURL, setPartenershipURL] = useState("");
  const [partnershipLabel, setPartenershipLabel] = useState("");
  const [facebookGroupURL, setFacebookGroupURL] = useState("");
  const [isPoweredBYUrl, setIsPoweredBYUrl] = useState("");
  const [chatURL, setChatURL] = useState("");
  const [isPartnershipUrl, setIsPartnershipUrl] = useState("");

  useEffect(() => {
    setFooter(kyubiSettings.footer.showFooter);
    setPoweredBy(kyubiSettings.footer.poweredBy.willBeDisplayed);
    setPartenership(kyubiSettings.footer.partnership.willBeDisplayed);
    setFacebookGroup(kyubiSettings.footer.officialGroup.willBeDisplayed);
    setChat(kyubiSettings.footer.chatSupport.willBeDisplayed);
  }, []);

  useEffect(() => {
    if(poweredBy){
      if(kyubiSettings.footer.poweredBy.label.length)
        setPoweredByLabel(kyubiSettings.footer.poweredBy.label);
      else
        setPoweredBy(false)
      
      if(kyubiSettings.footer.poweredBy.url.length)
        setPoweredByURL(kyubiSettings.footer.poweredBy.url);
      // else
      //   setPoweredByURL("#");
    }
  },[poweredBy])

  useEffect(() => {
    if(partenership){
      if(kyubiSettings.footer.partnership.label.length)
        setPartenershipLabel(kyubiSettings.footer.partnership.label);
      else
        setPartenership(false);
      
      if(kyubiSettings.footer.partnership.url.length)
        setPartenershipURL(kyubiSettings.footer.partnership.url);
      // else
      //   setPartenershipURL("#");
    }
  },[partenership])


  useEffect(() => {
    if(facebookGroup){
      if(kyubiSettings.footer.officialGroup.url.length)
        setFacebookGroupURL(kyubiSettings.footer.officialGroup.url);
      else
        setFacebookGroup(false);
    }
  },[facebookGroup]);

  useEffect(() => {
    if(chat){
      if(kyubiSettings.footer.chatSupport.url.length)
        setChatURL(kyubiSettings.footer.chatSupport.url);
      else
        setChat(false);
    }
  },[chat]);

  return (
    <>
      {(footer && (poweredBy || partenership || facebookGroup || chat)) ? 
      (<footer className={(!poweredBy && !partenership) ? 
        "footer d-flex f-align-center f-justify-center" : "footer d-flex f-align-center f-justify-between"}>
          <p>
            {(poweredBy || partenership) && "Powered by"} {poweredBy && (poweredByURL && poweredByURL.length ? (<a href={poweredByURL} target="_blank">{poweredByLabel}</a> ): <>{poweredByLabel}</>)} {(poweredBy && partenership) && "and"} {partenership && (partnershipURL && partnershipURL.length ? (<a href={partnershipURL} target="_blank">{partnershipLabel}</a>) : <>{partnershipLabel}</>)}
          </p>
          <div className="em_links_footer">
          {facebookGroup && (<a href={facebookGroupURL} className="d-inline-f" target="_blank">
              <React.Suspense fallback={<Loader />}>
                <SVGAsset type="facebook" />
              </React.Suspense>
            </a>)}
            {chat && (<a href={chatURL} className="d-inline-f" target="_blank">
              <React.Suspense fallback={<Loader />}>
                <SVGAsset type="messenger" />
              </React.Suspense>
            </a>)}
          </div>
      </footer>)
      : 
      ""
      }
    </>
  );
};

export default FooterExtension;
// {poweredBy && (<p>Powered by <Link to="/">Tier5</Link>)} and <Link to="/">Tier5 Partnership</Link></p>
