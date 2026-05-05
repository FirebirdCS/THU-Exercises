import * as BUI from "@thatopen/ui";
import { ItemsDataPanelState } from "src/ui-templates/sections/items-data";

type Viewport = {
    name: "viewport";
    state: {}
}

export type ItemsData = {
    name: "itemsData";
    state: ItemsDataPanelState
}

type ComponentsGridElements = [Viewport, ItemsData];
type ComponentsGridLayout = ["Models"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayout, ComponentsGridElements>;