import {v4 as uuidv4} from 'uuid'

export type projectStatus = "pending" | "active" | "finished"
export type userRole = "architect" | "engineer" | "developer"

export interface IProject {
  name: string
  description: string
  status: "pending" | "active" | "finished"
  role: "architect" | "engineer" | "developer"
  date: Date
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

  constructor(data: IProject) {
    this.id = uuidv4()
    for (const key in data){
      this[key] = data[key]
    } 
    this.setUI()
  }

  setUI(){
        // Project card UI
        if(this.ui && this.ui instanceof HTMLElement) {return}
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.innerHTML = `<div class="project-card">
        <div class="card-header">
            <p style="background-color: #ca8134; padding: 10px; border-radius:8px; aspect-ratio: 1;">HC</p>
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
}
