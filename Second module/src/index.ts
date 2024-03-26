import { IProject, projectStatus, userRole } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager"

function showModal(id: string, visible: boolean) {
  const modal = document.getElementById(id) as HTMLDialogElement;
  modal ? (visible == true ? modal.showModal() : modal.close()) :  console.warn("The modal id wasnt found");
}


// Select a part of the HTML, in this case the project button
const projectBtn = document.getElementById("new-project-btn");

const tip = document.getElementById("tip") as HTMLElement
const error = document.getElementById('nameError') as HTMLElement

if (projectBtn) {
  projectBtn.addEventListener("click", () => {
    if (error) {
      error.style.display = "none";
    }
    showModal("new-project-modal", true);
  });
} else {
  console.warn("Project button doesn't exist");
}
const projectListUI = document.getElementById("projects-lists") as HTMLElement
const projectsManager = new ProjectsManager(projectListUI)

const defaultProject: IProject = {
  name: "Default name",
  description: "Default description",
  status: "pending",
  role: "developer",
  date: new Date()
}

const defaultPro = projectsManager.newProject(defaultProject) 

const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
const closeModalBtn = document.getElementById("close-modal")

closeModalBtn?.addEventListener("click", () => {
  projectForm.reset();
  showModal("new-project-modal", false)
})

if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(projectForm);

    if (formData.get("name") === "" || formData.get("description") === "" || 
    formData.get("status") === "" || formData.get("role") === "" || 
    formData.get("date") === "") {
      alert("Please, fill out all the fields!");
      return; 
    }

    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as projectStatus,
      role: formData.get("role") as userRole,
      date: new Date(formData.get("date") as string)
    };
    try{
      const project = projectsManager.newProject(projectData)
      tip.style.display = "grid";
      error.style.display = "none";
      projectForm.reset();
      showModal("new-project-modal", false)
    } catch(e){
      error.innerHTML = `${e}`
      tip.style.display = "none";
      error.style.display = "grid";
    }
  });
} else {
  console.warn("The project form wasn't found");
}

const exportProjects = document.getElementById("export-projects-btn");

if(exportProjects){
  exportProjects.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjects = document.getElementById("import-projects-btn");

if(importProjects){
  importProjects.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

function showPage(pageId: string) {
  const pages = ["projects-page", "project-details", "users-list"];
  for (const id of pages) {
    const page = document.getElementById(id) as HTMLDivElement | null;
    if (page) {
      page.style.display = id === pageId ? "flex" : "none";
    }
  }
}

const projectHome = document.getElementById("projects-home-btn");
const userHome = document.getElementById("users-list-btn");

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



// // Add an event to the constant that we named earlier, in this case the event will be a click event (When we click the button of add project)
// projectBtn.addEventListener("click", () => {
//   // Select the modal element from the HTML and give it a name
//   const modal = document.getElementById("new-project-modal");
//   // Give the modal the property to show it with the function showModal
//   modal.showModal();
