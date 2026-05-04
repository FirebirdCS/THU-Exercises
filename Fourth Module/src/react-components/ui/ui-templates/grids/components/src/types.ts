import * as BUI from "@thatopen/ui";

type Viewport = {
    name: "viewport";
    state: {}
}

type ComponentsGridElements = [Viewport];
type ComponentsGridLayout = ["Models"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayout, ComponentsGridElements>;