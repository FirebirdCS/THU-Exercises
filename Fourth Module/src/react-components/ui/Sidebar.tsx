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
      <img id="company-logo" src="/assets/BCA-LogoNegro.webp" alt="BCA" />
      <ul id="nav-buttons">
        <Router.Link to="/">
          <bim-button
            style={{
              color: "var(--blanco)",
              fontSize: "1rem",
              lineHeight: "1.2",
            }}
            icon={appIcons.PROJECTS}
            label="Proyectos"
          ></bim-button>
        </Router.Link>
      </ul>

      <bim-label
        style={{
          fontSize: "0.75rem",
          color: "var(--bim-ui_bg-contrast-60)",
          alignSelf: "center",
          marginTop: "auto",
          lineHeight: "1",
          minHeight: "0",
          marginBottom: "-0.5rem",
        }}
      >
        Version 0.0.3
      </bim-label>

      <div id="sidebar-footer" style={{ marginTop: 0 }}>
        {user?.email && (
          <p id="sidebar-user" title={user.email}>
            <span className="material-icons-round">account_circle</span>
            <span className="sidebar-user-email">{user.email}</span>
          </p>
        )}
        <bim-button
          style={{
            color: "var(--blanco)",
            fontSize: "1rem",
            lineHeight: "1.2",
          }}
          icon="mingcute:exit-line"
          label="Cerrar sesión"
          onclick={handleLogout}
        ></bim-button>
      </div>
    </aside>
  );
}
