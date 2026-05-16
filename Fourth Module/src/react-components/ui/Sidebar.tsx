import { appIcons } from "@icons";
import * as React from "react";
import * as Router from "react-router-dom";
import { logOut } from "@db/index";
import { useAuth } from "@reactComponents/auth/AuthContext";

export function Sidebar() {
  const { user } = useAuth();
  const navigate = Router.useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login", { replace: true });
  };

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
      </ul>
      <div id="sidebar-footer">
        {user?.email && (
          <p id="sidebar-user" title={user.email}>
            <span className="material-icons-round">account_circle</span>
            <span className="sidebar-user-email">{user.email}</span>
          </p>
        )}
        <bim-button
          style={{ color: "var(--blanco)", fontSize: "1rem", lineHeight: "1.2" }}
          icon="mingcute:exit-line"
          label="Cerrar sesión"
          onclick={handleLogout}
        ></bim-button>
      </div>
    </aside>
  );
}
