import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  RequestIcon,
  MessageIcon,
  NoteIcon,
  MessengerIcon,
} from "../shared/SVGAsset";

import "../../assets/scss/component/shared/_nav.scss"

const Nav = () => {
  const location = useLocation();

  return (
    <nav className="extension-routes d-flex f-justify-center">
      {/*
        --- Commented out this portion as its non-function as of Sprint-3 ---
      <NavLink to="/" data-tooltip="Home">
        <HomeIcon />
      </NavLink> */}
      <NavLink 
        // to="/friend-request" 
        to="/"
        className={() =>   [
          '/',
          '/suggested-friends', 
          '/group',
          '/posts',
          '/friends-friend'].includes(location.pathname) ? "active" : ''}
        data-tooltip="Friend requests"
      >
        <RequestIcon />
      </NavLink>
      {/* <NavLink to="/messages" data-tooltip="Messages">
        <MessageIcon />
      </NavLink> */}
      {/*
        --- Commented out this portion as its non-function as of Sprint-3 ---
      <NavLink to="/notes" data-tooltip="Notes">
        <NoteIcon />
      </NavLink>
      <NavLink to="/messenger" data-tooltip="Messenger">
        <MessengerIcon />
      </NavLink> */}
    </nav>
  );
};

export default Nav;
