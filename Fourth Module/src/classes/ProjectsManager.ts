import { IProject, Project } from "./Project"
import { ITodo, ToDo } from "./ToDo"

export class ProjectsManager {
    list: Project[] = []
    todoList: ToDo[] = []
    oldProject: Project
    oldTodo: ToDo
    onProjectCreated = (project: Project) => {

    }

    onToDoCreated = (todo: ToDo) => {

    }


    onProjectDeleted = (id: string) => {

    }

    onTodoDeleted = (id: string) => {

    }

    /* Validate the requiered inputs */
    validateProject(data: IProject){
        const names = this.list.map(p => p.name)
    if (names.includes(data.name)) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    if (data.name.length < 5) {
      throw new Error(
        `The project name "${data.name}" should be at least 5 characters long`
      )
    }
    if (!data.description.trim()) {
      throw new Error(`There isn't a description for this project`)
    }
    }
    

    newProject(data: IProject, id?: string) {
        this.validateProject(data)
        const project = new Project(data, id)
        this.oldProject = project
        this.list.push(project)
        this.onProjectCreated(project)
        return project
    }


    filterProjects(value: string) {
        const searchTerm = value.trim().toLowerCase().replace(/\s+/g, ""); // Remove spaces from the search input
        const filteredProjects = this.list.filter((project) => {
            const normalizedProjectName = project.name?.toLowerCase().replace(/\s+/g, ""); // Remove spaces from project names
            return normalizedProjectName?.includes(searchTerm);
        });
        return filteredProjects;
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
        this.onProjectDeleted(id)
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

    newTodo(todoData: ITodo, projectId?: string) {
        if (!todoData.description) {
            throw new Error(`The description should not be empty!`);
        }
        const project = this.list.find((proj) => proj.id === projectId);
        if (!project) {
            throw new Error("Project not found");
        }
        const todoNew = new ToDo(todoData, projectId);
        project.todoList.push(todoNew);
        this.todoList.push(todoNew);
        this.onToDoCreated(todoNew);
        return todoNew;
    }
    
    deleteTodo(id: string) {
        const todo = this.getToDo(id)
        if (!todo) { return }
        this.todoList = this.todoList.filter((t) => t.id !== id);
        // Find the project where the ToDo belongs to
        const projectId = this.getProjectIdForToDo(id);
        if (projectId) {
            const project = this.getProject(projectId);
            if (project) {
                // Remove the ToDo from the project's todoList
                project.todoList = project.todoList.filter((t) => t.id !== id);
            }
        }
        this.onTodoDeleted(id)
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

}
