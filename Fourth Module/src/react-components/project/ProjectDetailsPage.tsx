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
import { ConfirmModal } from "@reactComponents/ui/ConfirmModal";
import * as BUI from "@thatopen/ui";
import * as TEMPLATES from "@uiTemplates";
import type { ViewerGrid } from "@uiTemplates";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setupComponents } from "src/bim-components/setup";
import * as OBC from "@thatopen/components";
import { ComponentsGrid } from "src/ui-templates/grids/components/src";

interface Props {
  projectsManager: ProjectsManager;
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{ id: string }>();
  const [projectDetails, setProjectDetails] = React.useState<IProject | null>(
    null,
  );
  const navigate = Router.useNavigate();
  const modal = React.useMemo(() => new ModalManager(), []);
  const viewerGrid = React.useRef<ViewerGrid>(null);
  const componentsGridRef = React.useRef<ComponentsGrid | null>(null);
  let engineManager: OBC.Components | null = null;

  React.useEffect(() => {
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;
    if (routeParams.id) {
      const currentProject = props.projectsManager.getProject(routeParams.id);
      if (currentProject && currentProject instanceof Project) {
        setProjectDetails(currentProject);
      } else {
        redirectTimer = setTimeout(() => navigate("/"), 1000);
      }
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [routeParams.id, props.projectsManager, navigate]);

  React.useEffect(() => {
    if (!routeParams.id) return;
    const todoListCollection = getCollection<ITodo>(
      `/projects/${routeParams.id}/todoList`,
    );
    let navigateTimer: ReturnType<typeof setTimeout> | null = null;
    props.projectsManager.onProjectDeleted = async (id) => {
      try {
        const firebaseProjects = await Firestore.getDocs(todoListCollection);
        for (const doc of firebaseProjects.docs) {
          await deleteDocument(`/projects/${routeParams.id}/todoList`, doc.id);
        }
        await deleteDocument("/projects", id);
        toast.success("Project deleted successfully!");
        navigateTimer = setTimeout(() => navigate("/"), 1500);
      } catch (error) {
        toast.error("Error deleting project or todo list");
        console.error(error);
      }
    };
    return () => {
      if (navigateTimer) clearTimeout(navigateTimer);
    };
  }, [routeParams.id, props.projectsManager, navigate]);

  const setupGrid = async () => {
    const { current: grid } = viewerGrid;
    if (!grid) return;
    if (!routeParams.id) return;
    const currentProject = props.projectsManager.getProject(routeParams.id);
    if (!(currentProject && currentProject instanceof Project)) return;

    const { components, viewport } = await setupComponents();
    engineManager = components;

    grid.elements = {
      sidebar: {
        template: TEMPLATES.gridSidebarTemplate,
        initialState: {},
      },
      componentsGrid: {
        template: TEMPLATES.componentsGridTemplate,
        initialState: {
          components,
          viewport,
          project: currentProject,
          onEditProject: () => modal.showModal("update-project-modal", 1),
          onDeleteProject: () => modal.showModal("confirm-delete-modal", 1),
        },
      },
    };

    grid.layouts = {
      Main: {
        template: `
          "sidebar" auto
          "componentsGrid" 1fr
          /1fr
        `,
      },
    };

    grid.addEventListener("elementcreated", (e) => {
      const { name, element: componentsGrid } = (
        e as CustomEvent<BUI.ElementCreatedEventDetail<ComponentsGrid>>
      ).detail;
      if (name !== "componentsGrid") return;
      componentsGridRef.current = componentsGrid;
      grid.updateComponent.sidebar({ grid: componentsGrid });
    });

    grid.layout = "Main";
  };

  React.useEffect(() => {
    setupGrid();
    return () => {
      engineManager?.dispose();
      engineManager = null;
    };
  }, []);

  if (!routeParams.id) {
    return null;
  }
  const project = props.projectsManager.getProject(routeParams.id);
  if (!(project && project instanceof Project)) {
    return null;
  }

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
      const updatedProject = props.projectsManager.getProject(routeParams.id);
      if (updatedProject instanceof Project) {
        componentsGridRef.current?.updateComponent.projectInfo({
          project: updatedProject,
        });
      }
      modal.showModal("update-project-modal", 0);
      toast.success("Project updated successfully!");
    }
  };

  const handleCancel = () => {
    modal.showModal("update-project-modal", 0);
  };

  const openConfirmModal = () => {
    modal.showModal("confirm-delete-modal", 1);
  };

  const closeConfirmModal = () => {
    modal.showModal("confirm-delete-modal", 0);
  };

  return (
    <>
      <ConfirmModal
        id="confirm-delete-modal"
        title="Delete Project"
        message={`Are you sure you want to delete project ${project.name}?`}
        onConfirm={() => props.projectsManager.deleteProject(project.id)}
        onCancel={closeConfirmModal}
      />
      <dialog id="update-project-modal">
        <ProjectForm
          mode="edit"
          initialData={project}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
        />
      </dialog>
      <bim-grid ref={viewerGrid} className="viewer-grid">
        {/* <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
        /> */}
        {/* <ToDoPage
          projectsManager={props.projectsManager}
          projectId={routeParams.id}
          project={project}
        /> */}
      </bim-grid>
    </>
  );
}
