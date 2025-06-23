import * as React from "react";
import * as Router from "react-router-dom";

export function Sidebar() {
  return (
    <aside id="sidebar">
      <img
        id="company-logo"
        src="/assets/company-logo.svg"
        alt="Construction-site"
      />
      <ul id="nav-buttons">
        <Router.Link to="/">
          <li id="projects-home-btn">
            <span className="material-icons-round">apartment</span>Home
          </li>
        </Router.Link>
        {/* <Router.Link to="/users">
          <li id="users-list-btn">
            <span className="material-icons-round">person </span>Users
          </li>
        </Router.Link> */}
      </ul>
    </aside>
  );
}
