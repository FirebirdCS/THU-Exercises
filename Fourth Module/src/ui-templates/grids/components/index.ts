import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";
import { itemsDataPanelTemplate, modelsPanelTemplate, queriesPanelTemplate, projectInfoPanelTemplate } from "src/ui-templates/sections";
import * as OBC from "@thatopen/components"
import { appIcons } from "src/index";
import { Project } from "@classes/Project";
import { dataSourcesPanelTemplate } from "src/ui-templates/tables/datasources/src/datasources";

interface ComponentsGridState {
    components: OBC.Components
    viewport?: BUI.Viewport;
    project: Project
    onEditProject?: () => void
    onDeleteProject?: () => void
}

export const componentsGridTemplate: BUI.StatefullComponent<ComponentsGridState> = (state) => {
    const onCreated = (e?: Element) => {
        const { components, viewport, project, onEditProject, onDeleteProject } = state;
        if (!e) return;
        const grid = e as ComponentsGrid;

        grid.elements = {
            viewport: {
              template: viewportContainerTemplate,
              initialState: { viewport },
            },
            itemsData: {
              template: itemsDataPanelTemplate,
              initialState: { components }
            },
            models: {
              template: modelsPanelTemplate,
              initialState: { components }
            },
            queries: {
              template: queriesPanelTemplate,
              initialState: { components }
            },
            projectInfo: {
              template: projectInfoPanelTemplate,
              initialState: { project, onEdit: onEditProject, onDelete: onDeleteProject }
            },
            datasources: {
              template: dataSourcesPanelTemplate,
              initialState: { components }
            }
        };

        grid.layouts = {
          Models: {
            icon: appIcons.MODELS,
            template: `
              "models viewport itemsData" 1fr
              "queries viewport datasources" 1fr
              /22rem 1fr 22rem
            `,
          },
          Queries: {
            icon: appIcons.QUERIES,
            template: `
              "viewport queries" 1fr
              /1fr 22rem
            `,
          },
          Viewer: {
            icon: appIcons.VIEWER,
            template: `
              "viewport" 1fr
              /1fr
            `,
          },
          Project: {
            icon: appIcons.PROJECTS,
            template: `
              "projectInfo" 1fr
              /1fr
            `,
          },
        }

        grid.layout = "Models";
    }
    return BUI.html`<bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>`;
};