import * as BUI from "@thatopen/ui";
import { ModelsPanelState } from "src/ui-templates/sections";
import { ItemsDataPanelState } from "src/ui-templates/sections/items-data";

type Viewport = {
    name: "viewport";
    state: {}
}

export type ItemsData = {
    name: "itemsData";
    state: ItemsDataPanelState
}

export type Models = {
    name: "models";
    state: ModelsPanelState
}

type ComponentsGridElements = [Viewport, ItemsData, Models];
type ComponentsGridLayout = ["Models"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayout, ComponentsGridElements>;