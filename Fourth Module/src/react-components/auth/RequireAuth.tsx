import * as React from "react";
import * as Router from "react-router-dom";
import { Sidebar } from "@reactComponents/ui/Sidebar";
import { useAuth } from "./AuthContext";

/**
 * Layout route guard. While the auth state is resolving it shows a loader;
 * if there is no signed-in user it redirects to the login screen; otherwise
 * it renders the sidebar plus the matched page.
 */
export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-screen">
        <div className="login-loader">
          <span className="material-icons-round spin">progress_activity</span>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Router.Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar />
      <div id="app-content">
        <Router.Outlet />
      </div>
    </>
  );
}
