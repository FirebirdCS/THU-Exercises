import * as BUI from "@thatopen/ui"
import { Project } from "@classes/Project"
import { formattedDateProject } from "@utils/Utils"

export interface ProjectInfoPanelState {
    project?: Project
    onEdit?: () => void
    onDelete?: () => void
}

export const projectInfoPanelTemplate: BUI.StatefullComponent<ProjectInfoPanelState> = (state) => {
    const { project, onEdit, onDelete } = state
    if (!project) {
        return BUI.html`<bim-panel-section fixed label="Project Information"></bim-panel-section>`
    }
    const formattedDate = formattedDateProject(new Date(project.date))
    const iconTitle = project.name.substring(0, 2).toUpperCase()

    return BUI.html`
    <bim-panel-section fixed label="Project Information">
      <div style="max-width: 475px; padding: 30px 0; border: 1px solid var(--bim-ui_bg-contrast-40); border-radius: 0.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 30px; margin-bottom: 30px;">
          <p style="
            font-size: 20px;
            background-color: ${project.cardColor};
            aspect-ratio: 1;
            border-radius: 100%;
            padding: 12px;
            color: white;
            margin: 0;
          ">${iconTitle}</p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <bim-button label="Edit" @click=${onEdit}></bim-button>
            <bim-button label="Delete" @click=${onDelete}></bim-button>
          </div>
        </div>
        <div style="padding: 0 30px;">
          <div>
            <h5 style="margin: 0;">${project.name}</h5>
            <p style="margin: 0; color: #969696;">${project.description}</p>
          </div>
          <div style="display: flex; column-gap: 30px; padding: 30px 0; justify-content: space-between;">
            <div>
              <p style="color: #969696; font-size: var(--font-sm); margin: 0;">Status</p>
              <p style="margin: 0;">${project.status}</p>
            </div>
            <div>
              <p style="color: #969696; font-size: var(--font-sm); margin: 0;">Cost</p>
              <p style="margin: 0;">${project.cost}</p>
            </div>
            <div>
              <p style="color: #969696; font-size: var(--font-sm); margin: 0;">Role</p>
              <p style="margin: 0;">${project.role}</p>
            </div>
            <div>
              <p style="color: #969696; font-size: var(--font-sm); margin: 0;">Finish Date</p>
              <p style="margin: 0;">${formattedDate}</p>
            </div>
          </div>
          <div style="background-color: #404040; border-radius: 9999px; overflow: hidden;">
            <div style="
              width: ${project.progress * 100}%;
              background-color: green;
              padding: 4px 0;
              text-align: center;
              color: white;
            ">${project.progress * 100}%</div>
          </div>
        </div>
      </div>
    </bim-panel-section>
    `
}
