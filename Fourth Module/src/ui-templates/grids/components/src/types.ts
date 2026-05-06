import * as BUI from "@thatopen/ui";
import { ModelsPanelState, QueriesPanelState, ProjectInfoPanelState } from "src/ui-templates/sections";
import { ItemsDataPanelState } from "src/ui-templates/sections/items-data";

type Viewport = {
    name: "viewport";
    state: {}
}

export type ItemsData = {
    name: "itemsData";
    state: ItemsDataPanelState
}

export type Queries = {
    name: "queries";
    state: QueriesPanelState
}

export type Models = {
    name: "models";
    state: ModelsPanelState
}

export type ProjectInfo = {
    name: "projectInfo";
    state: ProjectInfoPanelState
}

type ComponentsGridElements = [Viewport, ItemsData, Models, Queries, ProjectInfo];
type ComponentsGridLayout = ["Models", "Queries", "Viewer", "Project"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayout, ComponentsGridElements>;