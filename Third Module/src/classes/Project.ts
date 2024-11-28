import {v4 as uuidv4} from 'uuid'
import { ToDo } from './ToDo'
import { selectRandomColor } from '../utils/Utils'

export type projectStatus = "pending" | "active" | "finished"
export type userRole = "architect" | "engineer" | "developer"

export interface IProject {
  name: string
  description: string
  status: "pending" | "active" | "finished"
  role: "architect" | "engineer" | "developer"
  date: Date
  todoList: ToDo[]
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
  todoList: ToDo[] = []


  constructor(data: IProject) {
    this.id = uuidv4()
    for (const key in data){
      this[key] = data[key]
    } 
    this.cardColor = selectRandomColor();
  }
  
}


