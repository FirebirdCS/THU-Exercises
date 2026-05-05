import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";

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
    state: {
        components: OBC.Components;
        viewport?: BUI.Viewport;
    };
};

type ViewerGridElements = [Header, Sidebar, ComponentsGrid];
type ViewerGridLayouts = ["Main"];

export type ViewerGrid = BUI.Grid<ViewerGridLayouts, ViewerGridElements>;
