import * as BUI from "@thatopen/ui";
import { ModelsPanelState, QueriesPanelState, ProjectInfoPanelState, SmartViewsPanelState, SpatialTreePanelState, GisPanelState } from "src/ui-templates/sections";
import { ItemsDataPanelState } from "src/ui-templates/sections/items-data";
import { DataSourcesListState } from "src/ui-templates/tables/datasources/src";

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

export type DataSources = {
    name: "datasources";
    state: DataSourcesListState
}

export type SmartViewsElement = {
    name: "smartViews";
    state: SmartViewsPanelState
}

export type SpatialTreeElement = {
    name: "spatialTree";
    state: SpatialTreePanelState
}

export type Gis = {
    name: "gis";
    state: GisPanelState
}
  

type ComponentsGridElements = [Viewport, ItemsData, Models, Queries, ProjectInfo, DataSources, SmartViewsElement, SpatialTreeElement, Gis];
type ComponentsGridLayout = ["Modelos", "Consultas", "Visor", "Vistas", "GIS", "Proyecto"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayout, ComponentsGridElements>;