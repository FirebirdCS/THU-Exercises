import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import { DataEnhancer } from "src/bim-components/DataEnhancer";
import { dataSourcesList } from "..";


export interface DataSourcesPanelState {
  components: OBC.Components;
}

export const dataSourcesPanelTemplate: BUI.StatefullComponent<
  DataSourcesPanelState
> = (state) => {
  const { components } = state;
  const enhancer = components.get(DataEnhancer)

  const [dataSources, updateDataSources] = dataSourcesList({
    components,
  });

  const onSourceChange = ({ target }: { target: BUI.Dropdown }) => {
    const [source] = target.value
    updateDataSources({ source })
    BUI.ContextMenu.removeMenus()
  }

  return BUI.html`
  <bim-panel-section fixed label="Sources">
    <div style="display: flex; gap: 0.5rem;">
      <bim-dropdown @change=${onSourceChange} placeholder="Select a datasource...">
        ${[...enhancer.sources.keys()].map(source => BUI.html`<bim-option label=${source}></bim-option>`)}
      </bim-dropdown>
    </div>
    ${dataSources}
  </bim-panel-section>`;
};