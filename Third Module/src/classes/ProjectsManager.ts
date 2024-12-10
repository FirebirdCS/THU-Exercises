import { ModalManager } from './../utils/Utils';
import { IProject, Project } from "./Project"
import { ITodo, ToDo } from "./ToDo"
import { formatShortDate} from '../utils/Utils';

export class ProjectsManager {
    list: Project[] = []
    todoList: ToDo[] = []
    oldProject: Project
    oldTodo: ToDo
    onProjectCreated = (project: Project) => {

    }

    onToDoCreated = (todo: ToDo) => {

    }


    onProjectDeleted = () => {

    }
    

    constructor() {
        const project = this.newProject({
            name: "Default name",
            description: "Default description",
            status: "pending",
            role: "developer",
            date: new Date(),
            todoList: [ 
            ]
        })
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
        this.oldProject = project
        this.list.push(project)
        this.onProjectCreated(project)
        return project
    }


    filterProjects(value: string){
        const filteredProjects = this.list.filter((project) => {
            return project.name.includes(value.toLowerCase());
        });
        return filteredProjects
    }


    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    getToDo(id: string){
        const todo = this.todoList.find((todo) => {
            return todo.id === id
        })
        return todo
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
        const remaining = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remaining
        this.onProjectDeleted()
    }

    updateProject(projectId: string, data: IProject) {
        // Find the existing project by its ID
        if (data.name.length < 5) {
            throw new Error(`The project name "${data.name}" should be at least 5 characters long`);
        }

        if(!data.description){
            throw new Error(`There isn't a description for this project`);
        }
        const existingProject = this.list.find((project) => project.id === projectId);
        if (existingProject) {
            existingProject.name = data.name;
            existingProject.description = data.description;
            existingProject.status = data.status;
            existingProject.role = data.role;
            existingProject.date = data.date;
            data.todoList = this.oldProject.todoList; 
            this.onProjectCreated(existingProject); 
        } else {
            console.error(`Project with ID ${projectId} not found for update`);
        }
    }
    

    // Gets the task id and verify it belongs to the project

    getProjectIdForToDo(todoId: string) {
        for (const project of this.list) {
          if (project.todoList.some((todo) => todo.id === todoId)) {
            return project.id;
          }
        }
        return "";
      }

    // newTodo updated, added projectId to verify it makes the task in the right project

    newTodo(projectId: string, todoData: ITodo) {
        if (!todoData.description) {
            throw new Error(`The description should not be empty!`);
        }
        const project = this.list.find((proj) => proj.id === projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        const todoNew = new ToDo(todoData);
        project.todoList.push(todoNew);
        this.todoList.push(todoNew); // Push the todoNew to the list of toDos
        this.onToDoCreated(todoNew);
        return todoNew;
    }

    
    // Update toDo - done
    updateTodo(todoId: string, updatedTodo: ITodo) {
          if (!updatedTodo.description) {
            throw new Error(`The description should not be empty!`);
          }
          // Instead of searching in oldProject the toDo, search it in the todoList
          // This fixes the problem while importing projects 
          const todoToUpdate = this.todoList.find(todo => todo.id === todoId);
          if (todoToUpdate) {
            todoToUpdate.description = updatedTodo.description;
            todoToUpdate.date = updatedTodo.date;
            todoToUpdate.statusToDo = updatedTodo.statusToDo;
            // Recalculate derived properties
            if (updatedTodo.statusToDo === "important") {
              todoToUpdate.symbol = "warning";
              todoToUpdate.colorStatus = "#cf0e28";
            } else if (updatedTodo.statusToDo === "completed") {
              todoToUpdate.symbol = "done";
              todoToUpdate.colorStatus = "#0ec70e";
            } else if (updatedTodo.statusToDo === "on-going") {
              todoToUpdate.symbol = "grade";
              todoToUpdate.colorStatus = "#2b69b5";
            }
          } else {
            console.error('ToDo not found for update');
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
                const nameInUse = new Set<string>();  
                for (const projectData of projects) {
                    const todoList = projectData.todoList;
                    projectData.todoList = [];
                    let existingProject = this.list.find(project => project.name === projectData.name);
                    // If project does exist, update their toDo content
                    if (existingProject) {
                        for (const todo of todoList) {
                            if (typeof todo.date === 'string') {
                                todo.date = new Date(todo.date);
                            }
                            // Only add a toDo if it doesnt exists & the toDo description doesnt exist (experimental)
                            if (!existingProject.todoList.some(existingTodo => existingTodo.id === todo.id) 
                                && !existingProject.todoList.some(existingTodo => existingTodo.description === todo.description)) {
                                this.newTodo(existingProject.id, todo); 
                            }
                        }
                    } else {
                        // If project does not exist, create it
                        try {
                            this.oldProject = this.newProject(projectData);
                            if (typeof projectData.date === 'string') {
                                projectData.date = new Date(projectData.date); // Parse the date into a date object
                            }
                            // Add todos only if they are not already in the project's todoList
                            for (const todo of todoList) {
                                if (typeof todo.date === 'string') {
                                    todo.date = new Date(todo.date); // Parse the todo date into a date object
                                }
                                // Check if this todo already exists in the project's todoList && the toDo description exists (experimental)
                                if (!this.oldProject.todoList.some(existingTodo => existingTodo.id === todo.id) 
                                    && !this.oldProject.todoList.some(existingTodo => existingTodo.description === todo.description) ) {
                                    this.newTodo(this.oldProject.id, todo); // Add the new todo
                                }
                            }
                        } catch (e) {
                            console.error("Error while importing project", e);
                            this.oldProject = this.updateProjectWhenImport(projectData);
                            for (const todo of todoList) {
                                if (typeof todo.date === 'string') {
                                    todo.date = new Date(todo.date);
                                }
                                this.newTodo(this.oldProject.id, todo); // Create the imported todo
                            }
                            nameInUse.add(projectData.name);
                        }
                    }
                }
            });
            reader.readAsText(filesList[0]);
        });
        input.click();
    }
    
}
