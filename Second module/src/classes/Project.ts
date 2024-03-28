import {v4 as uuidv4} from 'uuid'

export type projectStatus = "pending" | "active" | "finished"
export type userRole = "architect" | "engineer" | "developer"
export type statusTask = "important" | "completed" | "on-going" 
export type statusColors = "red" | "green" | "orange"

export interface IProject {
  name: string
  description: string
  status: "pending" | "active" | "finished"
  role: "architect" | "engineer" | "developer"
  date: Date
  todoList: toDo[]
}


export interface ITodo{
  description: string
  date: Date
}

export class toDo implements ITodo{
  description: string
  date: Date
  uiTodo: HTMLElement
  constructor(data: ITodo){
    for (const key in data) {
      this[key] = data[key]
    }
    this.setUI()
  }
  setUI(){
    if(this.uiTodo && this.uiTodo instanceof HTMLElement) {return}
    this.uiTodo = document.createElement("div")
    this.uiTodo.className = "task-item"
    // Way to format the date in a correct way without showing an offset day, like in project details
    const localDate = new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' });
    this.uiTodo.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; column-gap: 15px; align-items: center;">
        <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
        <p>${this.description}</p>
      </div>
      <p style="text-wrap: nowrap; margin-left: 10px;">${formattedDate}</p>
    </div>`;
}

}


export class Project implements IProject {
  id: string
  name: string
  description: string
  status: projectStatus
  role: userRole
  date: Date
  ui: HTMLDivElement
  cost: number = 0
  progress: number = 0.6
  cardColor: string;
  todoList: toDo[] = []


  constructor(data: IProject) {
    for (const key in data){
      this[key] = data[key]
    } 
    this.id = uuidv4()
    this.cardColor = this.selectRandomColor();
    this.setUI()
  }

  newTodo(data:ITodo){
    const toDoList = new toDo(data)
    this.todoList.push(toDoList)
    return toDoList
}

  setUI(){
        // Project card UI
        if(this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        const iconTitle = this.name.substring(0,2).toUpperCase();
        this.ui.innerHTML = `<div class="project-card">
        <div class="card-header">
            <p style="background-color: ${this.cardColor}; padding: 10px; border-radius:8px; aspect-ratio: 1;">${iconTitle}</p>
            <div>
                <h5>${this.name}</h5>
                <p>${this.description} </p>
            </div>
        </div>
          <div class="card-content">
            <div class="card-property">
                <p style="color: #969696;">Status</p>
                <p>${this.status}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Role</p>
                <p>${this.role}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Cost</p>
                <p>${this.cost}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696;">Estimated Progress</p>
                <p>${this.progress * 100}</p>
            </div>
          </div>
        </div>`
  }

  private selectRandomColor(): string {
    const colors = ["#212B37", "#EF6337", "#781239", "#3b95bf", "#48bf3b"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
}
