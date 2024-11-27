import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Sidebar } from "./react-components/Sidebar";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { IProject, projectStatus, userRole } from "./classes/Project";
import { ITodo, statusTask } from "./classes/ToDo";
import { ProjectsManager } from "./classes/ProjectsManager";
import { ModalManager } from "./utils/Utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const rootElement = document.getElementById("app") as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(<Sidebar />);

// Declare all the buttons, forms, pages
const projectBtn = document.getElementById("new-project-btn");

const tip = document.getElementById("tip") as HTMLElement;
const error = document.getElementById("nameError") as HTMLElement;
const error2 = document.getElementById("nameError2") as HTMLElement;
const updateError = document.getElementById("updateNameError") as HTMLElement;
const updateError2 = document.getElementById("updateNameError2") as HTMLElement;

const createToDoError = document.getElementById(
  "createDescriptionError"
) as HTMLElement;
const updateDescriptionError = document.getElementById(
  "updateDescriptionError"
) as HTMLElement;

const projectListUI = document.getElementById(
  "projects-lists"
) as HTMLDivElement;
const toDoUI = document.getElementById("task-container") as HTMLDivElement;
const projectsManager = new ProjectsManager(projectListUI, toDoUI);
const projectForm = document.getElementById(
  "new-project-form"
) as HTMLFormElement;
const closeModalBtn = document.getElementById("close-modal");
const closeEditModalBtn = document.getElementById("close-edit-modal");
const projectHome = document.getElementById("projects-home-btn");
const userHome = document.getElementById("users-list-btn");
const editBtn = document.getElementById("edit-btn");
const exportProjects = document.getElementById("export-projects-btn");
const importProjects = document.getElementById("import-projects-btn");
const toDoForm = document.getElementById("create-todo-form") as HTMLFormElement;
const createToDoBtn = document.getElementById("create-toDo");
const closeToDoModalBtn = document.getElementById("close-todo-modal");
const closeEditToDoModal = document.getElementById("close-editToDo-modal");
const editToDoForm = document.getElementById(
  "edit-todo-form"
) as HTMLFormElement;
const editToDo = document.getElementById("editIcon");
const viewerContainer = document.getElementById(
  "viewer-container"
) as HTMLElement;

// Func to show pages
function showPage(pageId: string) {
  const pages = ["projects-page", "project-details", "users-list"];
  for (const id of pages) {
    const page = document.getElementById(id) as HTMLDivElement | null;
    if (page) {
      page.style.display = id === pageId ? "flex" : "none";
    }
  }
}

// Event handlers ("clicks")
if (projectBtn) {
  projectBtn.addEventListener("click", () => {
    if (error) {
      error.style.display = "none";
      error2.style.display = "none";
    }
    const createProjectModal = new ModalManager();
    createProjectModal.showModal("new-project-modal", 1);
  });
} else {
  console.warn("Project button doesn't exist");
}

if (createToDoBtn) {
  createToDoBtn.addEventListener("click", () => {
    if (createToDoError) {
      createToDoError.style.display = "none";
    }
    const createTodoModal = new ModalManager();
    createTodoModal.showModal("create-todo-modal", 1);
  });
} else {
  console.warn("ToDo button doesn't exist");
}

// Search
const searchInput = document.querySelector(
  ".task-searchbar-container input"
) as HTMLInputElement;
searchInput.addEventListener("input", (event) => {
  const searchTerm = (event.target as HTMLInputElement).value.trim();
  projectsManager.searchTodosByDescription(searchTerm);
});

closeModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  const closeProjectModal = new ModalManager();
  closeProjectModal.showModal("new-project-modal", 0);
});

closeEditModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  const closeEditProjectModal = new ModalManager();
  closeEditProjectModal.showModal("update-project-modal", 0);
});

closeToDoModalBtn?.addEventListener("click", () => {
  toDoForm.reset();
  const closeToDoModal = new ModalManager();
  closeToDoModal.showModal("create-todo-modal", 0);
});

closeEditToDoModal?.addEventListener("click", () => {
  editToDoForm.reset();
  const closeEditToDoModal = new ModalManager();
  closeEditToDoModal.showModal("edit-todo-modal", 0);
});

if (projectHome) {
  projectHome.addEventListener("click", () => {
    showPage("projects-page");
  });
}

if (userHome) {
  userHome.addEventListener("click", () => {
    showPage("users-list");
  });
}

if (editBtn) {
  editBtn.addEventListener("click", () => {
    if (error) {
      error.style.display = "none";
      error2.style.display = "none";
    }
    const openEditProjectModal = new ModalManager();
    openEditProjectModal.showModal("update-project-modal", 1);
  });
}

if (exportProjects) {
  exportProjects.addEventListener("click", () => {
    projectsManager.exportToJSON();
  });
}

if (importProjects) {
  importProjects.addEventListener("click", () => {
    projectsManager.importFromJSON();
  });
}

// Operations
// Create
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as projectStatus,
      role: formData.get("role") as userRole,
      date: new Date((formData.get("date") as string) || new Date()),
      todoList: [],
    };
    try {
      const project = projectsManager.newProject(projectData);
      tip.style.display = "grid";
      error.style.display = "none";
      projectForm.reset();
      const projectBtn = new ModalManager();
      projectBtn.showModal("new-project-modal", 0);
    } catch (e) {
      // Experimenting with errors in differents inputs
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
  });
} else {
  console.warn("The project form wasn't found");
}

// Update
const updateForm = document.getElementById(
  "update-project-form"
) as HTMLFormElement;

if (updateForm && updateForm instanceof HTMLFormElement) {
  updateForm.addEventListener("submit", (event) => {
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
    try {
      projectsManager.updateProject(projectData);
      tip.style.display = "grid";
      updateError.style.display = "none";
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
  });
}

// Create to-do
if (toDoForm && toDoForm instanceof HTMLFormElement) {
  toDoForm.addEventListener("submit", (event) => {
    const formData = new FormData(toDoForm);
    event.preventDefault();
    const todoData: ITodo = {
      description: formData.get("description") as string,
      date: new Date((formData.get("date") as string) || new Date()),
      statusToDo: formData.get("statusToDo") as statusTask,
    };
    try {
      projectsManager.newTodo(todoData);
      createToDoError.style.display = "none";
      toDoForm.reset();
      const toDoBtn = new ModalManager();
      toDoBtn.showModal("create-todo-modal", 0);
    } catch (e) {
      if (e.message.includes("description")) {
        createToDoError.innerHTML = `${e}`;
        createToDoError.style.display = "grid";
      }
    }
  });
}

// Edit toDo - done
if (editToDoForm && editToDoForm instanceof HTMLFormElement) {
  editToDoForm.addEventListener("submit", (event) => {
    const formData = new FormData(editToDoForm);
    event.preventDefault();
    const newData: ITodo = {
      description: formData.get("description") as string,
      date: new Date((formData.get("date") as string) || new Date()),
      statusToDo: formData.get("statusToDo") as statusTask,
    };
    try {
      // Get the id from the input element
      const todoId = formData.get("idToDo") as string;
      projectsManager.updateTodo(todoId, newData);
      updateDescriptionError.style.display = "none";
      editToDoForm.reset();
      const updateToDo = new ModalManager();
      updateToDo.showModal("edit-todo-modal", 0);
    } catch (e) {
      if (e.message.includes("description")) {
        updateDescriptionError.innerHTML = `${e}`;
        updateDescriptionError.style.display = "grid";
      }
    }
  });
}

// // Create Three.js scene
// const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(75)
// camera.position.z = 5

// const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
// viewerContainer.append(renderer.domElement)

// function resizeViewer() {
//   const containerDimensions = viewerContainer.getBoundingClientRect()
//   renderer.setSize(containerDimensions.width, containerDimensions.height)
//   const aspectRatio = containerDimensions.width / containerDimensions.height
//   camera.aspect = aspectRatio
//   camera.updateProjectionMatrix()
// }

// window.addEventListener("resize", resizeViewer)
// resizeViewer()

// // Set up the mesh
// const boxGeometry = new THREE.BoxGeometry()
// const material = new THREE.MeshStandardMaterial()
// const cube = new THREE.Mesh(boxGeometry, material)
// // Set up lights
// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
// const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// const spotlight = new THREE.SpotLight( 0xffffff );
// spotlight.castShadow = true;
// const ambientLight = new THREE.AmbientLight()
// ambientLight.intensity = 0.4
// const axes = new THREE.AxesHelper()
// const grid = new THREE.GridHelper()
// grid.material.transparent = true
// grid.material.opacity = 0.4
// grid.material.color = new THREE.Color("#808080")

// scene.add(cube, directionalLight, helper, spotlight, ambientLight, axes, grid)

// const gui = new GUI()

// const cubeControls = gui.addFolder("Cube")
// cubeControls.add(cube.position, "x", -10, 10, 1)
// cubeControls.add(cube.position, "y", -10, 10, 1)
// cubeControls.add(cube.position, "z", -10, 10, 1)
// cubeControls.add(cube, "visible")
// cubeControls.addColor(cube.material, "color")

// const lightControls = gui.addFolder("Lights")
// lightControls.add(directionalLight.position, "x", -5, 5, 1)
// lightControls.add(directionalLight.position, "y", -5, 5, 1)
// lightControls.add(directionalLight.position, "z", -5, 5, 1)
// lightControls.add(directionalLight, "intensity", -10, 10, 1)
// lightControls.addColor(directionalLight, "color")

// const spotControls = gui.addFolder("SpotLights")
// spotControls.add(spotlight.position, "x", -10, 10, 1)
// spotControls.add(spotlight.position, "y", -10, 10, 1)
// spotControls.add(spotlight.position, "z", -10, 10, 1)
// spotControls.add(spotlight, "intensity", 0, 10, 1)
// spotControls.addColor(spotlight, "color")

// const objLoader = new OBJLoader()
// const mtlLoader = new MTLLoader()

// const gltfLoader = new GLTFLoader()

// // mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
// //   materials.preload()
// //   objLoader.setMaterials(materials)
// //   objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
// //     scene.add(mesh)
// //   })
// // })

// gltfLoader.load("../assets/penguin.gltf", (mesh) => {
//   scene.add(mesh.scene);
// })

// const cameraControls = new OrbitControls(camera, viewerContainer)

// function renderScene() {
//   renderer.render(scene,camera)
//   requestAnimationFrame(renderScene)
// }

// renderScene()
