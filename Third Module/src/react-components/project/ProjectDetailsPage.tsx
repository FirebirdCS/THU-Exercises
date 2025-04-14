import * as React from "react";
import * as Router from "react-router-dom";
import * as Firestore from "firebase/firestore";
import { ProjectsManager } from "@classes/ProjectsManager";
import { IProject, Project } from "@classes/Project";
import { ToDoPage } from "@reactComponents/todo/ToDoPage";
import { formattedDateProject, ModalManager } from "@utils/Utils";
import { ThreeViewer } from "@reactComponents/three/ThreeViewer";
import { deleteDocument, getCollection, updateDocument } from "@db/index";
import { ITodo } from "@classes/ToDo";
import { ProjectForm } from "@reactComponents/project/ProjectForm";

interface Props {
  projectsManager: ProjectsManager;
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{ id: string }>();
  const [projectDetails, setProjectDetails] = React.useState<IProject | null>(
    null
  );
  const navigate = Router.useNavigate();
  const modal = new ModalManager();

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
    modal.showModal("update-project-modal", 1);
  };

  const handleUpdate = async (data: IProject) => {
    if (routeParams.id) {
      await updateDocument<Partial<IProject>>("/projects", project.id, data);
      props.projectsManager.updateProject(routeParams.id, data);
      setProjectDetails(data);
      modal.showModal("update-project-modal", 0);
    }
  };

  const handleCancel = () => {
    modal.showModal("update-project-modal", 0);
  };

  return (
    <>
      <div className="page" id="project-details">
        <dialog id="update-project-modal">
          <ProjectForm
            mode="edit"
            initialData={project}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
          />
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
