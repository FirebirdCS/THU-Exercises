import {v4 as uuidv4} from 'uuid'
import { ToDo } from './ToDo'
import { selectRandomColor } from '../utils/Utils'

export type projectStatus = "pending" | "active" | "finished"
export type userRole = "architect" | "engineer" | "developer"

// En Firebase se guarda el código en inglés (estable); estas etiquetas son
// solo para mostrarlo en español. Mismos textos que las opciones de ProjectForm.
const STATUS_LABELS: Record<projectStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  finished: "Finalizado",
}

const ROLE_LABELS: Record<userRole, string> = {
  architect: "Arquitecto",
  engineer: "Ingeniero",
  developer: "Desarrollador",
}

export const statusLabel = (status: string) =>
  STATUS_LABELS[status as projectStatus] ?? status

export const roleLabel = (role: string) =>
  ROLE_LABELS[role as userRole] ?? role

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
  progress: number = 0
  cardColor: string;
  todoList: ToDo[] = []


  constructor(data: IProject, id = uuidv4()) {
    for (const key in data){
      this[key] = data[key]
    } 
    this.id = id
    this.cardColor = selectRandomColor();
  }
  
}


