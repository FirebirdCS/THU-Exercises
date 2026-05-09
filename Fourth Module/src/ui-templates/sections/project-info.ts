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
        return BUI.html`<bim-panel-section fixed label="Información del proyecto"></bim-panel-section>`
    }
    const formattedDate = formattedDateProject(new Date(project.date))
    const iconTitle = project.name.substring(0, 2).toUpperCase()

    return BUI.html`
    <bim-panel-section fixed label="Información del proyecto">
      <div style="max-width: 475px; padding: 30px 0; border: 1px solid var(--gris); border-radius: 0.25rem; background-color: var(--blanco);">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 30px; margin-bottom: 30px;">
          <p style="
            font-size: 20px;
            background-color: ${project.cardColor};
            aspect-ratio: 1;
            border-radius: 100%;
            padding: 12px;
            color: var(--blanco);
            margin: 0;
          ">${iconTitle}</p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <bim-button label="Editar" @click=${onEdit}></bim-button>
            <bim-button label="Eliminar" @click=${onDelete}></bim-button>
          </div>
        </div>
        <div style="padding: 0 30px;">
          <div>
            <h5 style="margin: 0; color: var(--azul);">${project.name}</h5>
            <p style="margin: 0; color: var(--gris-texto);">${project.description}</p>
          </div>
          <div style="display: flex; column-gap: 30px; padding: 30px 0; justify-content: space-between;">
            <div>
              <p style="color: var(--gris-texto); font-size: var(--font-sm); margin: 0;">Estado</p>
              <p style="margin: 0; color: var(--azul);">${project.status}</p>
            </div>
            <div>
              <p style="color: var(--gris-texto); font-size: var(--font-sm); margin: 0;">Costo</p>
              <p style="margin: 0; color: var(--azul);">${project.cost}</p>
            </div>
            <div>
              <p style="color: var(--gris-texto); font-size: var(--font-sm); margin: 0;">Rol</p>
              <p style="margin: 0; color: var(--azul);">${project.role}</p>
            </div>
            <div>
              <p style="color: var(--gris-texto); font-size: var(--font-sm); margin: 0;">Fecha de finalización</p>
              <p style="margin: 0; color: var(--azul);">${formattedDate}</p>
            </div>
          </div>
          <div style="background-color: var(--gris); border-radius: 9999px; overflow: hidden;">
            <div style="
              width: ${project.progress * 100}%;
              background-color: var(--naranja);
              padding: 4px 0;
              text-align: center;
              color: var(--blanco);
            ">${project.progress * 100}%</div>
          </div>
        </div>
      </div>
    </bim-panel-section>
    `
}
