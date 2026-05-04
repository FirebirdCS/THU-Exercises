import * as BUI from "@thatopen/ui";

type Header = {
    name: "header";
    state: {};
};

type Sidebar = {
    name: "sidebar";
    state: {};
};

type ComponentsGrid = {
    name: "componentsGrid";
    state: {};
};

type ViewerGridElements = [Header, Sidebar, ComponentsGrid];
type ViewerGridLayouts = ["Main"];

export type ViewerGrid = BUI.Grid<ViewerGridLayouts, ViewerGridElements>;
