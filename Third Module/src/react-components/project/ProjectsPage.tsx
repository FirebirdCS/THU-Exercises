import * as React from "react";
import * as Firestore from "firebase/firestore";
import { ModalManager } from "@utils/Utils";
import { IProject, Project, projectStatus, userRole } from "@classes/Project";
import { ProjectsManager } from "@classes/ProjectsManager";
import { ProjectCard } from "@reactComponents/project/ProjectCard";
import { SearchProjectbox } from "@reactComponents/ui/SearchProjectBox";
import * as Router from "react-router-dom";
import { firebaseDB } from "../../firebase/index";

interface Props {
  projectsManager: ProjectsManager;
}

export function ProjectsPage(props: Props) {
  const [projects, setProjects] = React.useState<Project[]>(
    props.projectsManager.list
  );

  props.projectsManager.onProjectCreated = () => {
    setProjects([...props.projectsManager.list]);
  };
  props.projectsManager.onProjectDeleted = () => {
    setProjects([...props.projectsManager.list]);
  };

  const getFirestoreProjects = async () => {
    const projectsCollection = Firestore.collection(
      firebaseDB,
      "/projects"
    ) as Firestore.CollectionReference<IProject>;
    const firebaseProjects = await Firestore.getDocs(projectsCollection);
    for (const doc of firebaseProjects.docs) {
      const data = doc.data();
      const project: IProject = {
        ...data,
        date: (data.date as unknown as Firestore.Timestamp).toDate(),
      };
      try {
        props.projectsManager.newProject(project, doc.id);
      } catch (e) {
        props.projectsManager.updateProject(doc.id, project);
      }
    }
  };

  React.useEffect(() => {
    getFirestoreProjects();
  }, []);

  const projectCards = projects.map((project) => {
    return (
      <Router.Link to={`/project/${project.id}`} key={project.id}>
        <ProjectCard project={project} />
      </Router.Link>
    );
  });

  // Open new modal logic
  const onNewProjectClick = () => {
    const error = document.getElementById("nameError") as HTMLElement;
    const error2 = document.getElementById("nameError2") as HTMLElement;
    if (error) {
      error.style.display = "none";
      error2.style.display = "none";
    }
    const createProjectModal = new ModalManager();
    createProjectModal.showModal("new-project-modal", 1);
  };

  // Create new modal logic
  const onFormSubmit = (event: React.FormEvent) => {
    const projectForm = document.getElementById(
      "new-project-form"
    ) as HTMLFormElement;
    const error = document.getElementById("nameError") as HTMLElement;
    const error2 = document.getElementById("nameError2") as HTMLElement;
    const tip = document.getElementById("tip") as HTMLElement;
    if (!(projectForm && projectForm instanceof HTMLFormElement)) {
      return;
    }
    event.preventDefault();
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as projectStatus,
      role: formData.get("role") as userRole,
      date: new Date(
        (formData.get("date") as string).replace(/-/g, "/") || new Date()
      ),
      todoList: [],
    };
    try {
      const project = props.projectsManager.newProject(projectData);
      tip.style.display = "grid";
      error.style.display = "none";
      projectForm.reset();
      const projectBtn = new ModalManager();
      projectBtn.showModal("new-project-modal", 0);
    } catch (e) {
      if (e.message.includes("description")) {
        error2.innerHTML = `${e}`;
        error2.style.display = "grid";
        tip.style.display = "none";
        error.style.display = "none";
      } else {
        error.innerHTML = `${e}`;
        tip.style.display = "none";
        error.style.display = "grid";
        error2.style.display = "none";
      }
    }
  };

  // Close modal logic
  const onCloseModal = () => {
    const projectForm = document.getElementById(
      "new-project-form"
    ) as HTMLFormElement;
    projectForm.reset();
    const closeProjectModal = new ModalManager();
    closeProjectModal.showModal("new-project-modal", 0);
  };

  // Import & Export Logic
  const onExportProject = () => {
    props.projectsManager.exportToJSON();
  };

  const onImportProject = () => {
    props.projectsManager.importFromJSON();
  };

  const onProjectSearch = (value: string) => {
    setProjects(props.projectsManager.filterProjects(value));
  };

  return (
    <div className="page" id="projects-page">
      <dialog id="new-project-modal">
        <form onSubmit={(e) => onFormSubmit(e)} id="new-project-form">
          <h2>New project</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">apartment</span>Name
              </label>
              <input name="name" type="text" />
              <p
                id="tip"
                style={{ color: "#5d616f", fontStyle: "italic", marginTop: 5 }}
              >
                TIP: Give it a short name
              </p>
              <p
                id="nameError"
                style={{ color: "red", marginTop: 5, display: "none" }}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">notes</span>Description
              </label>
              <textarea
                name="description"
                cols={30}
                rows={5}
                placeholder="Give your description"
                defaultValue={""}
              />
              <p
                id="nameError2"
                style={{ color: "red", marginTop: 5, display: "none" }}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">account_circle</span>Role
              </label>
              <select name="role">
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">help</span>Status
              </label>
              <select name="status">
                <option>Pending</option>
                <option>Active</option>
                <option>Finished</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">calendar_month</span>
                Finish date
              </label>
              <input name="date" type="date" />
            </div>
          </div>
          <div className="modals-buttons">
            <button
              onClick={onCloseModal}
              id="close-modal"
              type="button"
              value="cancel"
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="accept-button">
              Accept
            </button>
          </div>
        </form>
      </dialog>
      <header>
        <h2>Project List</h2>
        <SearchProjectbox
          onChange={(value) => {
            onProjectSearch(value);
          }}
        />
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <span
            onClick={onImportProject}
            id="import-projects-btn"
            style={{ cursor: "pointer" }}
            className="material-icons-round action-icon"
          >
            file_upload
          </span>
          <span
            onClick={onExportProject}
            id="export-projects-btn"
            style={{ cursor: "pointer" }}
            className="material-icons-round action-icon"
          >
            file_download
          </span>
          <button
            onClick={onNewProjectClick}
            id="new-project-btn"
            className="project-button"
          >
            <span className="material-icons-round">add</span>New project
          </button>
        </div>
      </header>
      {projects.length > 0 ? (
        <div id="projects-lists">{projectCards}</div>
      ) : (
        <div
          style={{
            textAlign: "center",
            marginTop: "50px",
            color: "#FF6347",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          🚫 No projects found! Please try a different search.
        </div>
      )}
    </div>
  );
}
