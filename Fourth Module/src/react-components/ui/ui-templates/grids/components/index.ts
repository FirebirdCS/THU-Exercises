import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";

interface ComponentsGridState {
    viewport?: BUI.Viewport;
}

export const componentsGridTemplate: BUI.StatefullComponent<ComponentsGridState> = (state) => {
    const onCreated = (e?: Element) => {
        const { viewport } = state;
        if (!e) return;
        const grid = e as ComponentsGrid;

        grid.elements = {
            viewport: {
                template: viewportContainerTemplate,
                initialState: { viewport },
              },
        }

        grid.layouts = {
            Models: {
                template: `"viewport" 1fr / 1fr`,
            }
        }

        grid.layout = "Models";
    }
    return BUI.html`<bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>`;
};