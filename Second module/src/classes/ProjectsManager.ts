import { ModalManager } from './../utils/Utils';
import { IProject, Project } from "./Project"
import { ITodo, ToDo, statusTask } from "./ToDo"
import { formatShortDate} from '../utils/Utils';

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLDivElement
    uiTodo: HTMLDivElement
    oldProject: Project
    oldTodo: ToDo
    

    constructor(container: HTMLDivElement, containerToDo: HTMLDivElement) {
        this.ui = container
        this.uiTodo = containerToDo
    }

    newProject(data: IProject) {
        const projectNames = this.list.map((project) => {
            return project.name
        })
        const nameInUse = projectNames.includes(data.name)
        if (nameInUse) {
            throw new Error(`A project with the name "${data.name}" already exists`)
        }
        if (data.name.length < 5) {
            throw new Error(`The project name "${data.name}" should be at least 5 characters long`);
        }

        if(!data.description){
            throw new Error(`There isn't a description for this project`);
        }

        const project = new Project(data)
        project.ui.addEventListener("click", () => {
            const projectsPage = document.getElementById("projects-page")
            const detailsPage = document.getElementById("project-details")
            this.oldProject = project
            if (!projectsPage || !detailsPage) { return }
            projectsPage.style.display = "none"
            detailsPage.style.display = "flex"
            this.setDetailsPage(project)
        })


        this.ui.append(project.ui)
        this.list.push(project)
        return project
    }

    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    getProjectByName(name: string) {
        const projectName = this.list.find((project) => {
            return project.name === name
        })
        return projectName
    }

    calcAllProjects() {
        const totalCost = this.list.reduce((total, project) => total + project.cost, 0)
        return totalCost
    }

    deleteProject(id: string) {
        const project = this.getProject(id)
        if (!project) { return }
        project.ui.remove()
        const remaining = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remaining
    }

    updateProject (data:IProject) {
        data.todoList = this.oldProject.todoList
        this.deleteProject(this.oldProject.id)
        const project = this.newProject(data)
        this.setDetailsPage(project);
    }

    
    newTodo(data: ITodo) {
        if (!data.description) {
            throw new Error(`The description should not be empty!`);
        }
        const todoNew = new ToDo(data);
        this.oldProject.todoList.push(todoNew);;
        const editBtn = todoNew.uiTodo.querySelector(`[id=editIcon]`) as HTMLElement;
        editBtn.addEventListener('click', () => {
            const updateModal = new ModalManager();
            const updateForm = document.getElementById('edit-todo-form') as HTMLFormElement;
            const idForm = updateForm.querySelector(`[name=idToDo]`) as HTMLInputElement
            const descriptionForm = updateForm.querySelector(`[name=description]`) as HTMLTextAreaElement
            const dateForm = updateForm.querySelector(`[name=date]`) as HTMLInputElement
            const statusForm = updateForm.querySelector(`[name=statusToDo]`) as HTMLSelectElement
            if (updateForm && updateModal) {
                idForm.value = todoNew.id; // Populate the input element
                descriptionForm.value = todoNew.description;
                dateForm.value = todoNew.date.toISOString().slice(0, 10); // Way to format the date to put it into the date input
                statusForm.value = todoNew.statusToDo;
                this.oldTodo = todoNew;
                updateModal.showModal('edit-todo-modal', 1);
            }
        });
        const projectTodoCardsContainer = document.getElementById('task-container') as HTMLDivElement;
        projectTodoCardsContainer.append(todoNew.uiTodo);
    }
    
    // Update toDo - done
    updateTodo(todoId: string, updatedTodo: ITodo) {
        if (!updatedTodo.description) {
            throw new Error(`The description should not be empty!`);
        }
        const projectTodoCardsContainer = document.getElementById('task-container') as HTMLDivElement;
        const todoToUpdate = this.oldProject.todoList.find(todo => todo.id === todoId);
        if (todoToUpdate) {
            projectTodoCardsContainer.removeChild(todoToUpdate.uiTodo);
            todoToUpdate.description = updatedTodo.description;
            todoToUpdate.date = updatedTodo.date;
            todoToUpdate.statusToDo = updatedTodo.statusToDo;
            const newUI = todoToUpdate.setUI();
            this.addEditEventListener(todoToUpdate);
            projectTodoCardsContainer.append(newUI);
        } else {
            console.error('ToDo not found for update');
        }
    }

    // Separate event listener for the update method
    private addEditEventListener(todo: ToDo) {
        const editBtn = todo.uiTodo.querySelector(`[id=editIcon]`) as HTMLElement;
        editBtn.addEventListener('click', () => {
            const updateModal = new ModalManager();
            const updateForm = document.getElementById('edit-todo-form') as HTMLFormElement;
            const idForm = (updateForm.querySelector(`[name=idToDo]`) as HTMLTextAreaElement);
            const descriptionForm = (updateForm.querySelector(`[name=description]`) as HTMLTextAreaElement);
            const dateForm = (updateForm.querySelector(`[name=date]`) as HTMLInputElement);
            const statusForm = (updateForm.querySelector(`[name=statusToDo]`) as HTMLSelectElement);
            if (updateForm && updateModal) {
                idForm.value = todo.id;
                descriptionForm.value = todo.description;
                dateForm.value = todo.date.toISOString().slice(0, 10);
                statusForm.value = todo.statusToDo;
                updateModal.showModal('edit-todo-modal', 1);
            }
        });
    }

    // Search by description - done
    searchTodosByDescription(searchTerm: string) {
        const projectTodoCardsContainer = document.getElementById('task-container') as HTMLDivElement;
        const todosList = projectTodoCardsContainer.getElementsByClassName('task-item');

        Array.from(todosList).forEach((todoElement: Element) => {
            const todo = todoElement as HTMLElement;
            const description = todo.querySelector('.description')?.textContent || '';
            if (description.toLowerCase().includes(searchTerm.toLowerCase())) {
                todo.style.display = 'block';
            } else {
                todo.style.display = 'none';
            }
        });
    }

    updateProjectWhenImport (data: IProject){
        const oldProject = this.getProjectByName(data.name)
        if(oldProject){
            data.todoList = oldProject.todoList.concat(data.todoList)
            this.deleteProject(oldProject.id)
        }
        return this.newProject(data)
    }

    private setDetailsPage(project: Project) {
        const detailsPage = document.getElementById("project-details");

        if (!detailsPage) { return; }
        // Change icon & icon background-color
        const icon = detailsPage.querySelector("[data-project-info='icon']");
        if (!icon || !(icon instanceof HTMLElement)) { return; }
    
        const iconTitle = project.name.substring(0, 2).toUpperCase();
        icon.textContent = iconTitle;
        icon.style.backgroundColor = this.oldProject.cardColor;
    
        // Change data related to the project only
        for (const key in project) {
            const elements = detailsPage.querySelectorAll(`[data-project-info='${key}']`);
            if (elements) {
                if (key === "date") {
                    const date = elements[0] as HTMLElement;
                    const parsedDate = new Date(project.date);
                    const formattedDate = formatShortDate(parsedDate);
                    date.textContent = formattedDate;
                } else if (key === "progress") {
                    const progress = elements[0] as HTMLElement;
                    progress.style.width = project.progress * 100 + "%";
                    progress.textContent = project.progress * 100 + "%";
                } else {
                    for (const element of elements) {
                        element.textContent = project[key];
                    }
                }
            }
        }

        // Renderize to-do cards
        const projectTodoCardsContainer = document.getElementById('task-container') as HTMLDivElement;
        projectTodoCardsContainer.innerHTML = ''
        for (const todo of project.todoList){
            const todoCard = new ToDo(todo)
            projectTodoCardsContainer.append(todoCard.uiTodo)
        }
        // Way to only make the to-do container scrollable, not the whole page
        projectTodoCardsContainer.style.maxHeight = "300px"; 
        projectTodoCardsContainer.style.overflowY = "auto";

    }
    

    exportToJSON(fileName: string = "projects") {
        const json = JSON.stringify(this.list, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
    }

    importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.addEventListener('change', () => {
            const filesList = input.files;
            if (!filesList) { return; }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const json = reader.result;
                if (!json) { return; }
                const projects: IProject[] = JSON.parse(json as string);
                const nameInUse = new Array();
                for (const projectData of projects) {
                    const todoList = projectData.todoList;
                    projectData.todoList = [];
                    try {
                        this.oldProject = this.newProject(projectData);
                        if (typeof projectData.date === 'string') { // Parse the date into a date object
                            projectData.date = new Date(projectData.date);
                        }
                        for (const todo of todoList) {
                            if (typeof todo.date === 'string') {
                                todo.date = new Date(todo.date); // Parse the todo date into a date object
                            }
                            this.newTodo(todo); // Create the imported todo
                        }
                    } catch (e) {
                        this.oldProject = this.updateProjectWhenImport(projectData);
                        for (const todo of todoList) {
                            if (typeof todo.date === 'string') {
                                todo.date = new Date(todo.date);
                            }
                            this.newTodo(todo); // Create the imported todo
                        }
                        nameInUse.push(projectData.name);
                    }
                }
            });
            reader.readAsText(filesList[0]);
        });
        input.click();
    }
    
}
