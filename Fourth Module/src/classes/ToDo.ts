import {v4 as uuidv4} from 'uuid'


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
  
    constructor(data: ITodo, id = uuidv4()) {
      for (const key in data) {
        this[key] = data[key]
      }
      if (this.statusToDo === "important") {
        this.symbol = 'warning'
        this.colorStatus = "#cf0e28";
      } else if (this.statusToDo === "completed") {
        this.symbol = "done";
        this.colorStatus = "#0ec70e";
      } else if (this.statusToDo === "on-going") {
        this.symbol = "grade";
        this.colorStatus = "#2b69b5";
      }
      this.id = id
    }
}
