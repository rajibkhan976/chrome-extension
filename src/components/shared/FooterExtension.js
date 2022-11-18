
import { Link } from "react-router-dom";
import "../../assets/scss/component/shared/_footer.scss"
import { ExternalLink } from "./SVGAsset";

const FooterExtension = () => { 
  const Webview_URL = process.env.REACT_APP_APP_URL; 
  return (
    <>
    <footer className="footer d-flex f-justify-between f-align-center">
      <p>Powered by <a href="https://tier5.us/" target="_blank">Tier5</a></p>

      {/* <Link to={{pathname: "https://www.dev.friender.io"}} target="_blank">
        Go to Webview<ExternalLink />
      </Link> */}
      
      <a
          href={Webview_URL }
          target="_blank">Go to Webview<ExternalLink /></a>
    </footer>
    
    </>
  );
};

export default FooterExtension;