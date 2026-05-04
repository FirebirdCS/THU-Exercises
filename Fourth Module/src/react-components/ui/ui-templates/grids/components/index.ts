import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";

export const componentsGridTemplate = (_) => {
    const onCreated = (e?: Element) => {
        if (!e) return;
        const grid = e as ComponentsGrid;

        grid.elements = {
            viewport: {
                template: viewportContainerTemplate,
                initialState: {},
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