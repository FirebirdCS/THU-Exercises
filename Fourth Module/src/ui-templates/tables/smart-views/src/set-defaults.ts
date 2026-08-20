import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import { SmartViewsListTableData, SmartViewsListState } from "./types";
import { appIcons } from "src/index";
import { SmartViews } from "src/bim-components";


export const setDefaults = (state: SmartViewsListState, table: BUI.Table<SmartViewsListTableData>) => {
    const { components } = state;

    table.noIndentation = true;
    table.headersHidden = true;
    table.columns = ["Name", {name: "Actions", width: "auto"}];
    table.hiddenColumns = ["guid"];
    table.dataTransform = {
        Actions: (cellValue, rowData) => {
            const {guid} = rowData;
            if (!guid) return cellValue;

            const smartViews = components.get(SmartViews)
            const view = smartViews.list.get(guid)
            if (!view) return cellValue

            const onClick = async ({target: button}: {target: BUI.Button}) => {
                button.loading = true;
                await smartViews.apply(view)
                button.loading = false;
            }

            const onUpdate = ({target: button}: {target: BUI.Button}) => {
                button.loading = true;
                smartViews.updateView(guid)
                button.loading = false;
            }

            const onDelete = () => {
                smartViews.list.delete(guid)
            }

            return BUI.html`
                <div style="display: flex; gap: 0.25rem;">
                    <bim-button @click=${onClick} style="flex: 0" icon=${appIcons.APPLY}></bim-button>
                    <bim-button @click=${onUpdate} style="flex: 0" icon=${appIcons.REFRESH}></bim-button>
                    <bim-button @click=${onDelete} style="flex: 0" icon=${appIcons.DELETE}></bim-button>
                </div>
            `;
        }
    }
}