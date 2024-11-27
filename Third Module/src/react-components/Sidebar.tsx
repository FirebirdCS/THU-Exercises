import * as React from "react";

export function Sidebar() {
  return (
    <aside id="sidebar">
      <img
        id="company-logo"
        src="./assets/company-logo.svg"
        alt="Construction-site"
      />
      <ul id="nav-buttons">
        <li id="projects-home-btn">
          <span className="material-icons-round">apartment</span>Projects
        </li>
        <li id="users-list-btn">
          <span className="material-icons-round">person </span>User
        </li>
      </ul>
    </aside>
  );
}
