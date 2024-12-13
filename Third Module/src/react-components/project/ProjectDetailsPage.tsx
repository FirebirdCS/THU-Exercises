import * as React from "react";
import * as Router from "react-router-dom";
import * as Firestore from "firebase/firestore";
import { ProjectsManager } from "@classes/ProjectsManager";
import { IProject, Project, projectStatus, userRole } from "@classes/Project";
import { ToDoPage } from "@reactComponents/todo/ToDoPage";
import { formattedDateProject, ModalManager } from "@utils/Utils";
import { ThreeViewer } from "@reactComponents/three/ThreeViewer";
import { deleteDocument, getCollection, updateDocument } from "@db/index";
import { ITodo } from "@classes/ToDo";

interface Props {
  projectsManager: ProjectsManager;
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{ id: string }>();
  const [projectDetails, setProjectDetails] = React.useState<IProject | null>(
    null
  );
  const navigate = Router.useNavigate();

  React.useEffect(() => {
    if (routeParams.id) {
      const currentProject = props.projectsManager.getProject(routeParams.id);
      if (currentProject && currentProject instanceof Project) {
        setProjectDetails(currentProject);
      } else {
        console.log("Project not found", routeParams.id);
        setTimeout(() => navigate("/"), 1000);
      }
    }
  }, [routeParams.id, props.projectsManager, navigate]);

  if (!routeParams.id) return console.log("Project not found", routeParams.id);
  const project = props.projectsManager.getProject(routeParams.id);
  if (!(project && project instanceof Project)) {
    return console.log("Project not found in the list", routeParams.id);
  }

  const navigateTo = Router.useNavigate();
  const todoListCollection = getCollection<ITodo>(
    `/projects/${routeParams.id}/todoList`
  );

  props.projectsManager.onProjectDeleted = async (id) => {
    try {
      const firebaseProjects = await Firestore.getDocs(todoListCollection);
      for (const doc of firebaseProjects.docs) {
        await deleteDocument(`/projects/${routeParams.id}/todoList`, doc.id);
      }
      await deleteDocument("/projects", id);
      navigateTo("/");
    } catch (error) {
      console.error("Error deleting project or todo list:", error);
    }
  };

  const formattedDate = formattedDateProject(new Date(project.date));

  const iconTitle = project.name.substring(0, 2).toUpperCase();

  const onUpdateProjectClick = () => {
    const updateError = document.getElementById(
      "updateNameError"
    ) as HTMLElement;
    const updateError2 = document.getElementById(
      "updateNameError2"
    ) as HTMLElement;
    if (updateError || updateError2) {
      updateError.style.display = "none";
      updateError2.style.display = "none";
    }
    const createProjectModal = new ModalManager();
    createProjectModal.showModal("update-project-modal", 1);
  };

  const onCloseModal = () => {
    const projectForm = document.getElementById(
      "update-project-form"
    ) as HTMLFormElement;
    projectForm.reset();
    const closeProjectModal = new ModalManager();
    closeProjectModal.showModal("update-project-modal", 0);
    const updateError = document.getElementById(
      "updateNameError"
    ) as HTMLElement;
    const updateError2 = document.getElementById(
      "updateNameError2"
    ) as HTMLElement;
    if (updateError || updateError2) {
      updateError.style.display = "none";
      updateError2.style.display = "none";
    }
  };

  const onFormSubmit = async (event: React.FormEvent) => {
    const updateForm = document.getElementById(
      "update-project-form"
    ) as HTMLFormElement;
    const updateError = document.getElementById(
      "updateNameError"
    ) as HTMLElement;
    const updateError2 = document.getElementById(
      "updateNameError2"
    ) as HTMLElement;
    const tip = document.getElementById("tip") as HTMLElement;
    if (!(updateForm && updateForm instanceof HTMLFormElement)) {
      return;
    }
    event.preventDefault();
    const formData = new FormData(updateForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as projectStatus,
      role: formData.get("role") as userRole,
      date: new Date((formData.get("date") as string) || new Date()),
      todoList: [],
    };
    if (routeParams.id) {
      try {
        await updateDocument<Partial<IProject>>(
          "/projects",
          project.id,
          projectData
        );
        props.projectsManager.updateProject(routeParams.id, projectData);
        tip.style.display = "grid";
        updateError.style.display = "none";
        setProjectDetails(projectData);
        updateForm.reset();
        const updateBtn = new ModalManager();
        updateBtn.showModal("update-project-modal", 0);
      } catch (e) {
        if (e.message.includes("description")) {
          updateError2.innerHTML = `${e}`;
          updateError2.style.display = "grid";
          tip.style.display = "none";
          updateError.style.display = "none";
        } else {
          updateError.innerHTML = `${e}`;
          tip.style.display = "none";
          updateError.style.display = "grid";
          updateError2.style.display = "none";
        }
      }
    } else {
      console.error("Project ID not found in URL.");
    }
  };

  return (
    <>
      <div className="page" id="project-details">
        <dialog id="update-project-modal">
          <form onSubmit={(e) => onFormSubmit(e)} id="update-project-form">
            <h2>Edit project</h2>
            <div className="input-list">
              <div className="form-field-container">
                <label>
                  <span className="material-icons-round">apartment</span>Name
                </label>
                <input name="name" type="text" />
                <p
                  id="tip"
                  style={{
                    color: "#5d616f",
                    fontStyle: "italic",
                    marginTop: 5,
                  }}
                >
                  TIP: Give it a short name
                </p>
                <p
                  id="updateNameError"
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
                  id="updateNameError2"
                  style={{ color: "red", marginTop: 5, display: "none" }}
                />
              </div>
              <div className="form-field-container">
                <label>
                  <span className="material-icons-round">account_circle</span>
                  Role
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
                id="close-edit-modal"
                type="button"
                value="cancel"
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="update-button">
                Update
              </button>
            </div>
          </form>
        </dialog>
        <header>
          <div>
            <h2 data-project-info="name">{project.name}</h2>
            <p data-project-info="description" style={{ color: "#969696" }}>
              {project.description}
            </p>
          </div>
        </header>
        <div className="main-page-content">
          <div className="details-column">
            <div className="dashboard-card" style={{ padding: "30px 0" }}>
              <div className="details-header">
                <p
                  data-project-info="icon"
                  style={{
                    fontSize: 20,
                    backgroundColor: `${project.cardColor}`,
                    aspectRatio: 1,
                    borderRadius: "100%",
                    padding: 12,
                  }}
                >
                  {iconTitle}
                </p>
                <div
                  className="action-buttons"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <button
                    onClick={onUpdateProjectClick}
                    id="edit-btn"
                    className="edit-button"
                  >
                    <p style={{ margin: 0, width: "100%" }}>Edit</p>
                  </button>
                  <span
                    onClick={() => {
                      props.projectsManager.deleteProject(project.id);
                    }}
                    className="material-icons-round action-icon delete"
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    delete
                  </span>
                </div>
              </div>
              <div style={{ padding: "0 30px" }}>
                <div>
                  <h5 data-project-info="name">{project.name}</h5>
                  <p data-project-info="description">{project.description}</p>
                </div>
                <div className="details-info">
                  <div>
                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                      Status
                    </p>
                    <p data-project-info="status">{project.status}</p>
                  </div>
                  <div>
                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                      Cost
                    </p>
                    <p data-project-info="cost">{project.cost}</p>
                  </div>
                  <div>
                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                      Role
                    </p>
                    <p data-project-info="role">{project.role}</p>
                  </div>
                  <div>
                    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                      Finish Date
                    </p>
                    <p data-project-info="date">{formattedDate}</p>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "#404040",
                    borderRadius: 9999,
                    overflow: "auto",
                  }}
                >
                  <div
                    data-project-info="progress"
                    style={{
                      width: `${project.progress * 100}%`,
                      backgroundColor: "green",
                      padding: "4px 0",
                      textAlign: "center",
                    }}
                  >
                    {project.progress * 100}%
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-card" style={{ flexGrow: "1" }}>
              {/* projectId as an parameter  */}
              {/* Send the project info to the todoPage for the todoCard so it can retrieve the collection of todolist*/}
              <ToDoPage
                projectsManager={props.projectsManager}
                projectId={routeParams.id}
                project={project}
              />
            </div>
          </div>
          <ThreeViewer />
        </div>
      </div>
    </>
  );
}
