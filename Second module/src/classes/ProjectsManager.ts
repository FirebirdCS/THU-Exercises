import { IProject, Project } from "./Project"

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
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
        project.ui.addEventListener("click", () => {
            const projectsPage = document.getElementById("projects-page")
            const detailsPage = document.getElementById("project-details")
            if (!projectsPage || !detailsPage) { return }
            projectsPage.style.display = "none"
            detailsPage.style.display = "flex"
            this.setDetailsPage(project)
        })

        this.ui.append(project.ui)
        this.list.push(project)
        return project
    }

    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    getProjectByName(name: string) {
        const projectName = this.list.find((project) => {
            return project.name === name
        })
        return projectName
    }

    deleteProject(id: string) {
        const project = this.getProject(id)
        if (!project) { return }
        project.ui.remove()
        const remaining = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remaining
    }

    private setDetailsPage(project: Project) {
        const detailsPage = document.getElementById("project-details")
        if(!detailsPage) { return }
        // Change icon & icon background-color
        const icon = detailsPage.querySelector("[data-project-info='icon']")
        if (!icon || !(icon instanceof HTMLElement)) { return }
        const iconTitle = project.name.substring(0, 2).toUpperCase();
        icon.textContent = iconTitle;
        icon.style.backgroundColor = project.cardColor;
        // Change data related to the project only
        for (const key in project) {
            const elements = detailsPage.querySelectorAll(`[data-project-info='${key}']`)
            if(elements){   
            if(key === "date"){
                const date = elements[0] as HTMLElement
                const dateInfo = new Date(project.date)
                // Way to format the date in a correct way without showing an offset day
                let dateString = ("0" + dateInfo.getUTCDate()).slice(-2) + "-" + ("0" + (dateInfo.getUTCMonth()+1)).slice(-2) + "-" + dateInfo.getUTCFullYear();
                date.textContent = dateString
            }else if(key === "progress"){
                const progress = elements[0] as HTMLElement
                progress.style.width = project.progress * 100 + "%"
                progress.textContent = project.progress * 100 + "%"
            } else {
                for (const element of elements){
                    element.textContent = project[key]
                }
            }
            }
        }
    }

    calcAllProjects() {
        const totalCost = this.list.reduce((total, project) => total + project.cost, 0)
        return totalCost
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
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            const json = reader.result
            if (!json) { return }
            const projects: IProject[] = JSON.parse(json as string)
            for (const project of projects) {
                try {
                    this.newProject(project)
                } catch (e) {
                }
            }
        })

        input.addEventListener('change', () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
        })
        input.click()

    }

}