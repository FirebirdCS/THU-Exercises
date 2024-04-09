import { IProject, ITodo, Project, toDo } from "./Project"

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement
    uiTodo: HTMLElement
    oldProject: Project
    oldTodo: toDo

    constructor(container: HTMLElement, containerToDo: HTMLDivElement) {
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

    // Create toDo

    updateTodo (data:ITodo){
        const todoNew = new toDo(data);
        this.oldProject.todoList.push(todoNew);
        this.uiTodo.append(todoNew.uiTodo);
        this.oldTodo = todoNew
    }

    // Update toDo - in progress

    updateTodoStatus(data: ITodo) {
        const todoToUpdate = this.oldProject.todoList.find(todo => todo.id === this.oldTodo.id);
        console.log(todoToUpdate);
        if (todoToUpdate) {
            todoToUpdate.statusToDo = data.statusToDo;
    
            if (data.description !== null && data.date !== null) {
                todoToUpdate.description = data.description;
                todoToUpdate.date = data.date;
            }

            switch (data.statusToDo) {
                case "important":
                    todoToUpdate.colorStatus = "red"
                    todoToUpdate.uiTodo.style.backgroundColor = "red";
                    break;
                case "completed":
                    todoToUpdate.colorStatus = "green"
                    todoToUpdate.uiTodo.style.backgroundColor = "green";
                    break;
                case "on-going":
                    todoToUpdate.colorStatus = "#2b69b5"
                    todoToUpdate.uiTodo.style.backgroundColor = "#2b69b5";
                    break;
                default:
                    break;
            }
    
            console.log("Todo status updated successfully");
        } else {
            console.error("Todo not found");
        }
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
                    const dateInfo = new Date(project.date);
                    // Way to format the date in a correct way without showing an offset day
                    let dateString = ("0" + dateInfo.getUTCDate()).slice(-2) + "-" + ("0" + (dateInfo.getUTCMonth() + 1)).slice(-2) + "-" + dateInfo.getUTCFullYear();
                    date.textContent = dateString;
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
            const todoCard = new toDo(todo)
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
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            const json = reader.result
            if (!json) { return }
            const projects: IProject[] = JSON.parse(json as string)
            const nameInUse = new Array()
            for (const projectData of projects) {
                try {
                    projectData.date = new Date(projectData.date);
                    for (const todo of projectData.todoList){
                        if (todo.date == null) {
                            todo.date = new Date('');
                        } else {
                            todo.date = new Date(todo.date);
                        }
                    }
                    this.oldProject = this.newProject(projectData)
                } catch (e) {
                    this.oldProject = this.updateProjectWhenImport(projectData)
                    for (const todo of projectData.todoList){
                        if (todo.date == null) {
                            todo.date = new Date('');
                        } else {
                            todo.date = new Date(todo.date);
                        } 
                    }
                    nameInUse.push(projectData.name)
                }
            }
        })

        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
        })
        input.click()

    }

}