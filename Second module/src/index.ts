import { IProject, projectStatus, userRole } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager"

// Default project
const defaultProject: IProject = {
  name: "Default name",
  description: "Default description",
  status: "pending",
  role: "developer",
  date: new Date(),
}



// Declare all the buttons, forms, pages
const projectBtn = document.getElementById("new-project-btn");

const tip = document.getElementById("tip") as HTMLElement
const error = document.getElementById('nameError') as HTMLElement
const error2 = document.getElementById('nameError2') as HTMLElement
const updateError = document.getElementById('updateNameError') as HTMLElement
const updateError2 = document.getElementById('updateNameError2') as HTMLElement

const projectListUI = document.getElementById("projects-lists") as HTMLElement
const projectsManager = new ProjectsManager(projectListUI)
const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
const closeModalBtn = document.getElementById("close-modal")
const closeEditModalBtn = document.getElementById("close-edit-modal")
const projectHome = document.getElementById("projects-home-btn");
const userHome = document.getElementById("users-list-btn");
const editBtn = document.getElementById("edit-btn");
const exportProjects = document.getElementById("export-projects-btn");
const importProjects = document.getElementById("import-projects-btn");

// Create the default project
const defaultPro = projectsManager.newProject(defaultProject) 

// Func to show modals
function showModal(id: string, visible: boolean) {
  const modal = document.getElementById(id) as HTMLDialogElement;
  modal ? (visible == true ? modal.showModal() : modal.close()) :  console.warn("The modal id wasnt found");
}
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
    showModal("new-project-modal", true);
  });
} else {
  console.warn("Project button doesn't exist");
}


closeModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  showModal("new-project-modal", false)
})

closeEditModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  showModal("update-project-modal", false)
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
    showModal("update-project-modal", true);
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
      date: new Date(formData.get("date") as string || new Date())
    };
    try{
      const project = projectsManager.newProject(projectData)
      tip.style.display = "grid";
      error.style.display = "none";
      projectForm.reset();
      showModal("new-project-modal", false)
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
      date: new Date(formData.get("date") as string || new Date())
    };
    try{
      projectsManager.updateProject(projectData)
      tip.style.display = "grid";
      updateError.style.display = "none";
      updateForm.reset();
      showModal("update-project-modal", false)
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





// // Add an event to the constant that we named earlier, in this case the event will be a click event (When we click the button of add project)
// projectBtn.addEventListener("click", () => {
//   // Select the modal element from the HTML and give it a name
//   const modal = document.getElementById("new-project-modal");
//   // Give the modal the property to show it with the function showModal
// modal.showModal();
