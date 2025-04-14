import * as React from "react";
import * as Firestore from "firebase/firestore";
import { ModalManager } from "@utils/Utils";
import { IProject, Project } from "@classes/Project";
import { ProjectsManager } from "@classes/ProjectsManager";
import { ProjectCard } from "@reactComponents/project/ProjectCard";
import { SearchBox } from "@reactComponents/ui/SearchBox";
import { ProjectForm } from "@reactComponents/project/ProjectForm";
import * as Router from "react-router-dom";
import { getCollection } from "@db/index";
import { ITodo, ToDo } from "@classes/ToDo";

interface Props {
  projectsManager: ProjectsManager;
}

const projectsCollection = getCollection<IProject>("/projects");

export function ProjectsPage(props: Props) {
  const [projects, setProjects] = React.useState<Project[]>(
    props.projectsManager.list
  );

  props.projectsManager.onProjectCreated = () => {
    setProjects([...props.projectsManager.list]);
  };

  // Make sure to get information about the todo collection and push it
  const getFirestoreProjectTodo = async (
    collection: Firestore.CollectionReference<ITodo>
  ): Promise<ToDo[]> => {
    const firebaseTodos = await Firestore.getDocs(collection);
    const todoList: ToDo[] = [];
    for (const doc of firebaseTodos.docs) {
      const data = doc.data();
      try {
        data.date = (data.date as unknown as Firestore.Timestamp).toDate();
        const todo = new ToDo(data, doc.id);
        todoList.push(todo);
        props.projectsManager.todoList.push(todo);
      } catch (error) {
        console.log("No ToDo Found");
      }
    }
    return todoList;
  };

  const getFirestoreProjects = async () => {
    const firebaseProjects = await Firestore.getDocs(projectsCollection);
    for (const doc of firebaseProjects.docs) {
      const data = doc.data();
      const fbTodosCollection = getCollection<ITodo>(
        `/projects/${doc.id}/todoList`
      );
      const todoList = await getFirestoreProjectTodo(fbTodosCollection);
      const project: IProject = {
        ...data,
        date: (data.date as unknown as Firestore.Timestamp).toDate(),
        todoList: todoList,
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

  const modal = new ModalManager();

  const handleCreate = async (data: IProject) => {
    try {
      props.projectsManager.validateProject(data);
    } catch (err: any) {
      throw err;
    }
    const doc = await Firestore.addDoc(projectsCollection, data);
    props.projectsManager.newProject(data, doc.id);
    modal.showModal("new-project-modal", 0);
  };

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
        <ProjectForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => modal.showModal("new-project-modal", 0)}
        />
      </dialog>
      <header>
        <h2>Project List</h2>
        <SearchBox
          onChange={(value) => {
            onProjectSearch(value);
          }}
          searchProp="Project"
          size="40%"
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
