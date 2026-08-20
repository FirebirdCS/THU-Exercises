import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";

export interface SpatialTreePanelState {
  components: OBC.Components;
}

export const spatialTreePanelTemplate: BUI.StatefullComponent<
  SpatialTreePanelState
> = (state) => {
  const { components } = state;

  // Seed the tree with the models already loaded into the engine. Switching
  // grid layouts (tabs) re-creates this panel, and the load event has already
  // fired by then, so starting from `[]` would leave the tree blank until a
  // model is loaded/removed again. The tree still auto-updates afterwards.
  const fragments = components.get(OBC.FragmentsManager);
  const [spatialTree] = CUI.tables.spatialTree({
    components,
    models: [...fragments.list.values()],
  });
  spatialTree.preserveStructureOnFilter = true;

  const onSearch = (e: Event) => {
    const input = e.target as BUI.TextInput;
    spatialTree.queryString = input.value;
  };

  return BUI.html`
  <bim-panel-section fixed label="Árbol del modelo">
    <div style="display: flex; gap: 0.5rem;">
      <bim-text-input @input=${onSearch} placeholder="Buscar elementos..." debounce="200"></bim-text-input>
    </div>
    ${spatialTree}
  </bim-panel-section>`;
};
