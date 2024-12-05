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

    updateProject (data:IProject) {
        data.todoList = this.oldProject.todoList
        this.deleteProject(this.oldProject.id)
        const project = this.newProject(data)
    }

    
    newTodo(data: ITodo) {
        if (!data.description) {
            throw new Error(`The description should not be empty!`);
        }
        const todoNew = new ToDo(data);
        this.oldProject.todoList.push(todoNew);;
        this.todoList.push(todoNew)
        this.onToDoCreated(todoNew)
        return todoNew
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
            // const newUI = todoToUpdate.setUI();
            this.addEditEventListener(todoToUpdate);
            // projectTodoCardsContainer.append(newUI);
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
