import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as Router from "react-router-dom";
import { Sidebar } from "./react-components/ui/Sidebar";
import { ProjectsPage } from "./react-components/project/ProjectsPage";
import { ProjectDetailsPage } from "./react-components/project/ProjectDetailsPage";
import { UserPage } from "./react-components/user/UserPage";
import { ProjectsManager } from "./classes/ProjectsManager";

const projectsManager = new ProjectsManager();

const rootElement = document.getElementById("app") as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(
  <>
    <Router.BrowserRouter>
      <Sidebar />
      <Router.Routes>
        <Router.Route
          path="/"
          element={<ProjectsPage projectsManager={projectsManager} />}
        />
        <Router.Route
          path="/project/:id"
          element={<ProjectDetailsPage projectsManager={projectsManager} />}
        />
        <Router.Route path="/users" element={<UserPage />} />
      </Router.Routes>
    </Router.BrowserRouter>
  </>
);
