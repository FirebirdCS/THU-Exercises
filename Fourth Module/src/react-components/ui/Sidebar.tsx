import { appIcons } from "@icons";
import * as React from "react";
import * as Router from "react-router-dom";

export function Sidebar() {
  return (
    <aside id="sidebar">
      <img
        id="company-logo"
        src="/assets/BCA-LogoNegro.webp"
        alt="BCA"
      />
      <ul id="nav-buttons">
        <Router.Link to="/">
          <bim-button
            style={{ color: "var(--blanco)", fontSize: "1rem", lineHeight: "1.2" }}
            icon={appIcons.PROJECTS}
            label="Proyectos"
          ></bim-button>
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
