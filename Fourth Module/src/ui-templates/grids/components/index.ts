import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";
import { itemsDataPanelTemplate, modelsPanelTemplate } from "src/ui-templates/sections";
import * as OBC from "@thatopen/components"

interface ComponentsGridState {
    components: OBC.Components
    viewport?: BUI.Viewport;
}

export const componentsGridTemplate: BUI.StatefullComponent<ComponentsGridState> = (state) => {
    const onCreated = (e?: Element) => {
        const { components, viewport } = state;
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
            }
        };

        grid.layouts = {
            Models: {
                template: `"models viewport itemsData" 1fr / 22rem 1fr 22rem`,
            }
        }

        grid.layout = "Models";
    }
    return BUI.html`<bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>`;
};