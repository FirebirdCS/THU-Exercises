import { IProject, projectStatus, userRole } from "./classes/Project";
import { ITodo,ToDo, statusTask } from "./classes/ToDo";
import { ProjectsManager } from "./classes/ProjectsManager"
import { v4 as uuidv4 } from "uuid";
import { ModalManager } from "./utils/Utils";

// Default project
const defaultProject: IProject = {
  name: "Default name",
  description: "Default description",
  status: "pending",
  role: "developer",
  date: new Date(),
  todoList: [ 
  ]
}

// Declare all the buttons, forms, pages
const projectBtn = document.getElementById("new-project-btn");

const tip = document.getElementById("tip") as HTMLElement
const error = document.getElementById('nameError') as HTMLElement
const error2 = document.getElementById('nameError2') as HTMLElement
const updateError = document.getElementById('updateNameError') as HTMLElement
const updateError2 = document.getElementById('updateNameError2') as HTMLElement

const createToDoError = document.getElementById('createDescriptionError') as HTMLElement
const updateDescriptionError = document.getElementById('updateDescriptionError') as HTMLElement

const projectListUI = document.getElementById("projects-lists") as HTMLDivElement
const toDoUI = document.getElementById("task-container") as HTMLDivElement
const projectsManager = new ProjectsManager(projectListUI, toDoUI)
const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
const closeModalBtn = document.getElementById("close-modal")
const closeEditModalBtn = document.getElementById("close-edit-modal")
const projectHome = document.getElementById("projects-home-btn");
const userHome = document.getElementById("users-list-btn");
const editBtn = document.getElementById("edit-btn");
const exportProjects = document.getElementById("export-projects-btn");
const importProjects = document.getElementById("import-projects-btn");
const toDoForm = document.getElementById("create-todo-form") as HTMLFormElement
const createToDoBtn = document.getElementById("create-toDo")
const closeToDoModalBtn = document.getElementById("close-todo-modal")
const closeEditToDoModal = document.getElementById("close-editToDo-modal") 
const editToDoForm = document.getElementById("edit-todo-form") as HTMLFormElement
const editToDo = document.getElementById("editIcon")

// Create the default project
const defaultPro = projectsManager.newProject(defaultProject) 


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
      error.style.display = "none"
      error2.style.display = "none"
    }
    const createProjectModal = new ModalManager()
    createProjectModal.showModal("new-project-modal", 1);
  });
} else {
  console.warn("Project button doesn't exist");
}

if(createToDoBtn){
  createToDoBtn.addEventListener("click", () => {
    if(createToDoError){
      createToDoError.style.display = "none"
    }
    const createTodoModal = new ModalManager()
    createTodoModal.showModal("create-todo-modal", 1)
  })
} else {
  console.warn("ToDo button doesn't exist")
}


closeModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  const closeProjectModal = new ModalManager()
  closeProjectModal.showModal("new-project-modal", 0)
})

closeEditModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  const closeEditProjectModal = new ModalManager()
  closeEditProjectModal.showModal("update-project-modal", 0)
})

closeToDoModalBtn?.addEventListener("click", () => {
  toDoForm.reset();
  const closeToDoModal = new ModalManager()
  closeToDoModal.showModal("create-todo-modal", 0)
})

 closeEditToDoModal?.addEventListener("click", () => {
  editToDoForm.reset()
  const closeEditToDoModal = new ModalManager()
  closeEditToDoModal.showModal("edit-todo-modal", 0)
 })


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


if(editBtn){
  editBtn.addEventListener("click", () => {
    if (error) {
      error.style.display = "none"
      error2.style.display = "none"
    }
    const openEditProjectModal = new ModalManager()
    openEditProjectModal.showModal("update-project-modal", 1);
  })
}



if(exportProjects){
  exportProjects.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

if(importProjects){
  importProjects.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
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
      date: new Date(formData.get("date") as string || new Date()),
      todoList: []
    };
    try{
      const project = projectsManager.newProject(projectData)
      tip.style.display = "grid";
      error.style.display = "none";
      projectForm.reset();
      const projectBtn = new ModalManager()
      projectBtn.showModal("new-project-modal", 0)
    } catch(e){
      // Experimenting with errors in differents inputs
      if(e.message.includes("description")){
        error2.innerHTML = `${e}`
        error2.style.display = "grid";
        tip.style.display = "none";
        error.style.display = "none";
      } else {
        error.innerHTML = `${e}`
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
const updateForm = document.getElementById("update-project-form") as HTMLFormElement;

if (updateForm && updateForm instanceof HTMLFormElement) {
  updateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(updateForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as projectStatus,
      role: formData.get("role") as userRole,
      date: new Date(formData.get("date") as string || new Date()),
      todoList: []
    };
    try{
      projectsManager.updateProject(projectData)
      tip.style.display = "grid";
      updateError.style.display = "none";
      updateForm.reset();
      const updateBtn = new ModalManager()
      updateBtn.showModal("update-project-modal", 0)
    }catch(e){
      if(e.message.includes("description")){
        updateError2.innerHTML = `${e}`
        updateError2.style.display = "grid";
        tip.style.display = "none";
        updateError.style.display = "none";
      } else {
        updateError.innerHTML = `${e}`
        tip.style.display = "none";
        updateError.style.display = "grid";
        updateError2.style.display = "none";
      }
    }
  }
)}

// Create to-do
if(toDoForm && toDoForm instanceof HTMLFormElement) {
  toDoForm.addEventListener("submit", (event) => {
    const formData = new FormData(toDoForm)
    event.preventDefault()
    const todoData: ITodo = {
      description: formData.get("description") as string,
      date: new Date(formData.get("date") as string || new Date()),
      statusToDo: formData.get("statusToDo") as statusTask,
    }
    try{
      projectsManager.newTodo(todoData)
      createToDoError.style.display = 'none'
      toDoForm.reset();
      const toDoBtn = new ModalManager()
      toDoBtn.showModal("create-todo-modal", 0)
    }catch(e){
      if(e.message.includes("description")){
        createToDoError.innerHTML = `${e}`
        createToDoError.style.display = 'grid'
      }
    }
  })
}

// Edit toDo - done
if(editToDoForm&& editToDoForm instanceof HTMLFormElement) {
  editToDoForm.addEventListener("submit", (event) => {
    const formData = new FormData(editToDoForm)
    event.preventDefault()
    const newData: ITodo = {
      description: formData.get("description") as string,
      date: new Date(formData.get("date") as string || new Date()),
      statusToDo : formData.get("statusToDo") as statusTask,
    }
    try{
      // Get the id from the input element
      const todoId = formData.get("idToDo") as string
      projectsManager.updateTodo(todoId, newData)
      updateDescriptionError.style.display = "none"
      editToDoForm.reset();
      const updateToDo = new ModalManager()
      updateToDo.showModal("edit-todo-modal", 0)
    }catch(e){
      if(e.message.includes("description")){
        updateDescriptionError.innerHTML = `${e}`
        updateDescriptionError.style.display = 'grid'
      }
    }
  })
}

