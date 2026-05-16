import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as Router from "react-router-dom";
import { ProjectsPage } from "./react-components/project/ProjectsPage";
import { ProjectDetailsPage } from "./react-components/project/ProjectDetailsPage";
import { UserPage } from "./react-components/user/UserPage";
import { LoginPage } from "./react-components/auth/LoginPage";
import { RequireAuth } from "./react-components/auth/RequireAuth";
import { AuthProvider } from "./react-components/auth/AuthContext";
import { ProjectsManager } from "./classes/ProjectsManager";
import * as BUI from "@thatopen/ui";

BUI.Manager.init();

const projectsManager = new ProjectsManager();

const rootElement = document.getElementById("app") as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(
  <>
    <AuthProvider>
      <Router.BrowserRouter>
        <Router.Routes>
          <Router.Route path="/login" element={<LoginPage />} />
          <Router.Route element={<RequireAuth />}>
            <Router.Route
              path="/"
              element={<ProjectsPage projectsManager={projectsManager} />}
            />
            <Router.Route
              path="/project/:id"
              element={
                <ProjectDetailsPage projectsManager={projectsManager} />
              }
            />
            <Router.Route path="/users" element={<UserPage />} />
          </Router.Route>
        </Router.Routes>
      </Router.BrowserRouter>
    </AuthProvider>
  </>,
);
