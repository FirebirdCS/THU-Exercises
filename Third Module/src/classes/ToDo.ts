import {v4 as uuidv4} from 'uuid'
import { formatShortDate } from '../utils/Utils'


export type statusTask = "important" | "completed" | "on-going" 

export interface ITodo{
    description: string
    date: Date
    statusToDo: statusTask
  }

export class ToDo implements ITodo{
    description: string
    date: Date
    uiTodo: HTMLDivElement
    statusToDo: statusTask
    id: string
    symbol: string = ""
    colorStatus: string = ""
  
    constructor(data: ITodo) {
      this.id = uuidv4()
      for (const key in data) {
        this[key] = data[key]
      }
      this.createUI()
    }

    setUI() {
      if (this.statusToDo === "important") {
          this.symbol = "warning";
          this.colorStatus = "#cf0e28";
      } else if (this.statusToDo === "completed") {
          this.symbol = "done";
          this.colorStatus = "#0ec70e";
      } else if (this.statusToDo === "on-going") {
          this.symbol = "grade";
          this.colorStatus = "#2b69b5";
      }
      
      this.uiTodo = document.createElement("div");
      this.uiTodo.className = "task-item";
      this.uiTodo.style.backgroundColor = this.colorStatus;
      this.uiTodo.innerHTML = '';

      const formattedDate = formatShortDate(this.date);

      this.uiTodo.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; column-gap: 15px; align-items: center;">
                  <span class="material-icons-round" style="padding: 10px; border-radius: 10px;">${this.symbol}</span>
                  <p class="description" style="word-wrap: break-word;">${this.description}</p>
              </div>
              <p style="text-wrap: nowrap; margin-left: 10px;">${formattedDate}</p>
              <span id="editIcon" class="edit-icon material-icons-round" style="margin-left: 5px">edit</span>
          </div>`;

      return this.uiTodo;
  }
  createUI(){
    if (this.uiTodo && this.uiTodo instanceof HTMLElement) {return}
    this.uiTodo = document.createElement("div")
    this.setUI()
    return this.uiTodo
  }

}
