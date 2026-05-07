import * as BUI from "@thatopen/ui";
import * as OBF from "@thatopen/components-front";
import { DataSourcesListState } from "./types";
import { DataEnhancer } from "src/bim-components/DataEnhancer";


export const setDefaults = (
  getState: () => DataSourcesListState,
  table: BUI.Table,
) => {
  const { components } = getState()

  table.noIndentation = true
  table.addEventListener("rowcreated", ((e: CustomEvent<BUI.RowCreatedEventDetail>) => {
    const { row } = e.detail
    row.addEventListener("click", async () => {
      const { source } = getState()
      if (!source) return
      const entry = row.data
      if (!entry) return
      const enhancer = components.get(DataEnhancer)
      const items = await enhancer.getItemsByEntry(source, entry)
      const highlighter = components.get(OBF.Highlighter)
      await highlighter.highlightByID("select", items)
    })
  }) as EventListener)
}