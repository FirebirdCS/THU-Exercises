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
import {
  getProjectModels,
  downloadProjectModel,
  deleteProjectModelByName,
  deleteAllProjectModels,
} from "@db/models";
import {
  getProjectSmartViews,
  saveProjectSmartView,
  deleteProjectSmartView,
  deleteAllProjectSmartViews,
} from "@db/smart-views";
import { SmartViews } from "src/bim-components";

interface Props {
  projectsManager: ProjectsManager;
}

/**
 * Downloads every `.frag` stored for the project and loads it into the
 * fragments engine, so opening a project restores its 3D models.
 */
async function loadStoredModels(
  components: OBC.Components,
  projectId: string,
  shouldStop: () => boolean,
) {
  let models;
  try {
    models = await getProjectModels(projectId);
  } catch (e) {
    console.error("No se pudieron obtener los modelos del proyecto", e);
    return;
  }
  if (!models.length || shouldStop()) return;

  const fragments = components.get(OBC.FragmentsManager);
  const loadingToast = toast.loading(
    `Cargando ${models.length} modelo(s)...`,
  );
  let ok = 0;
  for (const model of models) {
    // The page may have unmounted (e.g. logout) mid-load; stop touching
    // the now-disposed engine instead of erroring per remaining model.
    if (shouldStop()) break;
    try {
      const buffer = await downloadProjectModel(model.storagePath);
      if (shouldStop()) break;
      await fragments.core.load(buffer, { modelId: model.name });
      ok++;
    } catch (e) {
      console.error(`Error al cargar el modelo "${model.name}"`, e);
    }
  }
  if (shouldStop()) {
    toast.dismiss(loadingToast);
    return;
  }
  toast.update(loadingToast, {
    render:
      ok === models.length
        ? `${ok} modelo(s) cargado(s)`
        : `${ok} de ${models.length} modelo(s) cargado(s)`,
    type: ok > 0 ? "success" : "error",
    isLoading: false,
    autoClose: 3000,
  });
}

/**
 * Loads the project's stored smart views from Firebase and rebuilds them in
 * the SmartViews component so they show up in the panel when the project is
 * opened. `loadingRef` is raised while importing so the persistence listeners
 * don't write the just-loaded views straight back to the cloud.
 */
async function loadStoredSmartViews(
  components: OBC.Components,
  projectId: string,
  shouldStop: () => boolean,
  loadingRef: React.MutableRefObject<boolean>,
) {
  let stored;
  try {
    stored = await getProjectSmartViews(projectId);
  } catch (e) {
    console.error("No se pudieron obtener las vistas inteligentes", e);
    return;
  }
  if (!stored.length || shouldStop()) return;

  const smartViews = components.get(SmartViews);
  loadingRef.current = true;
  try {
    const data: Record<string, (typeof stored)[number]["json"]> = {};
    for (const { id, json } of stored) data[id] = json;
    smartViews.import(data);
  } finally {
    loadingRef.current = false;
  }
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
  // True while the page is unmounting. The fragments engine disposes every
  // model on teardown, which fires the same "model deleted" event as the
  // delete button — this flag stops us wiping all cloud files on navigation.
  const tearingDownRef = React.useRef(false);
  // Raised while smart views are being imported from the cloud, so the
  // persistence listeners don't echo the freshly loaded views back to Firebase.
  const loadingSmartViewsRef = React.useRef(false);
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
        // Remove the project's models (cloud files + metadata). Don't let a
        // cleanup failure block the project deletion itself.
        try {
          await deleteAllProjectModels(id);
        } catch (e) {
          console.error("No se pudieron eliminar los modelos del proyecto", e);
        }
        // Remove the project's smart views too.
        try {
          await deleteAllProjectSmartViews(id);
        } catch (e) {
          console.error("No se pudieron eliminar las vistas inteligentes", e);
        }
        await deleteDocument("/projects", id);
        toast.success("¡Proyecto eliminado exitosamente!");
        navigateTimer = setTimeout(() => navigate("/"), 1500);
      } catch (error) {
        toast.error("Error al eliminar el proyecto o la lista de tareas");
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
    const projectId = routeParams.id;
    const currentProject = props.projectsManager.getProject(projectId);
    if (!(currentProject && currentProject instanceof Project)) return;

    const { components, viewport } = await setupComponents(
      () => tearingDownRef.current,
    );
    engineManager = components;

    // When the user removes a model from the panel, also delete its
    // `.frag` and metadata from the cloud. The same event fires when the
    // engine is disposed on navigation, so skip that case.
    const fragments = components.get(OBC.FragmentsManager);
    fragments.list.onItemDeleted.add(async (modelId: string) => {
      if (tearingDownRef.current) return;
      try {
        const removed = await deleteProjectModelByName(projectId, modelId);
        if (removed) {
          toast.success(`Modelo "${modelId}" eliminado de la nube`);
        }
      } catch (e) {
        console.error("Error al eliminar el modelo de la nube", e);
        toast.error(`No se pudo eliminar "${modelId}" de la nube`);
      }
    });

    // Persist smart views to the cloud as they are created/updated/deleted.
    // Skipped during teardown and while loading (so we don't echo back the
    // views we just imported).
    const smartViews = components.get(SmartViews);
    const persistSmartView = async (id: string) => {
      if (tearingDownRef.current || loadingSmartViewsRef.current) return;
      const view = smartViews.list.get(id);
      if (!view) return;
      try {
        await saveProjectSmartView(projectId, id, smartViews.serializeView(view));
      } catch (e) {
        console.error("No se pudo guardar la vista inteligente en la nube", e);
      }
    };
    smartViews.list.onItemSet.add(({ key }) => void persistSmartView(key));
    smartViews.list.onItemUpdated.add(({ key }) => void persistSmartView(key));
    smartViews.list.onItemDeleted.add(async (id: string) => {
      if (tearingDownRef.current || loadingSmartViewsRef.current) return;
      try {
        await deleteProjectSmartView(projectId, id);
      } catch (e) {
        console.error("No se pudo eliminar la vista inteligente de la nube", e);
      }
    });

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

    // Restore the project's models from the cloud (non-blocking).
    void loadStoredModels(components, projectId, () => tearingDownRef.current);

    // Restore the project's smart views from the cloud (non-blocking).
    void loadStoredSmartViews(
      components,
      projectId,
      () => tearingDownRef.current,
      loadingSmartViewsRef,
    );
  };

  React.useEffect(() => {
    setupGrid();
    return () => {
      // Mark teardown first so the onItemDeleted handler doesn't treat the
      // engine's mass model disposal as user-initiated cloud deletions.
      tearingDownRef.current = true;
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
      toast.success("¡Proyecto actualizado exitosamente!");
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
        title="Eliminar proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto ${project.name}?`}
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
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
      />
      <bim-grid ref={viewerGrid} className="viewer-grid">
        {/* <ToDoPage
          projectsManager={props.projectsManager}
          projectId={routeParams.id}
          project={project}
        /> */}
      </bim-grid>
    </>
  );
}
