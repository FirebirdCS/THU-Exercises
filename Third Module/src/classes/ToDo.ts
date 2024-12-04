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
    }
}
