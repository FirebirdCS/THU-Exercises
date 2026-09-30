import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as THREE from "three";
import { QueriesListState, QueriesListTableData } from "./types";
import { appIcons } from "src/index";
import { SmartViews } from "src/bim-components";
import { populateExportMenu } from "./property-export";

export const setDefaults = (
  state: QueriesListState,
  table: BUI.Table<QueriesListTableData>,
) => {
  const { components } = state

  table.noIndentation = true
  table.headersHidden = true
  table.columns = ["Name", {name: "Actions", width: "auto"}]
  table.dataTransform = {
    Actions: (cellValue, rowData) => {
      const { Name } = rowData
      if (!Name) return cellValue

      const finder = components.get(OBC.ItemsFinder)
      const query = finder.list.get(Name)
      if (!query) return cellValue

      const onSelect = async ({target: button}: {target: BUI.Button}) => {
        button.loading = true
        const items = await query.test()
        const highligher = components.get(OBF.Highlighter)
        await highligher.highlightByID("select", items)
        button.loading = false
      }

      // El menú contextual del botón se abre solo con el clic; aquí solo se
      // rellena su contenido (query + escaneo de propiedades, con caché).
      let exportMenu: HTMLElement | undefined
      const onExportMenuCreated = (e?: Element) => {
        if (!e) return
        exportMenu = e as HTMLElement
      }

      const onExport = () => {
        if (!exportMenu) return
        void populateExportMenu({
          components,
          menu: exportMenu,
          queryName: Name,
          query,
        })
      }

      let colorInput: BUI.ColorInput | undefined;
      const onColorInputCreated = (e?: Element) => {
        if (!e) return;
        colorInput = e as BUI.ColorInput;
      };

      const onApplyColor = async ({ target: button }: { target: BUI.Button }) => {
        if (!colorInput) return
        button.loading = true
        const items = await query.test()
        if (OBC.ModelIdMapUtils.isEmpty(items)) {
          button.loading = false
          return
        }

        const { color } = colorInput
        const highlighter = components.get(OBF.Highlighter)
        if (!highlighter.styles.has(color)) {
          highlighter.styles.set(color, {
            color: new THREE.Color(color),
            renderedFaces: 1,
            opacity: 1,
            transparent: false
          })
        }

        await highlighter.highlightByID(color, items)
        const smartViews = components.get(SmartViews)
        smartViews.addQueryColor(color, Name)
        button.loading = false
        BUI.ContextMenu.removeMenus()
      }

      return BUI.html`
        <div style="display: flex; gap: 0.25rem;">
          <bim-button icon=${appIcons.SELECT} tooltip-text="Seleccionar" @click=${onSelect}></bim-button>
          <bim-button icon=${appIcons.EXPORT} tooltip-text="Exportar a Excel" @click=${onExport}>
            <bim-context-menu ${BUI.ref(onExportMenuCreated)}></bim-context-menu>
          </bim-button>
          <bim-button style="flex: 0;" icon=${appIcons.CONTEXT_MENU} tooltip-text="Más opciones">
            <bim-context-menu>
              <bim-button style="flex: 0;" icon=${appIcons.COLORIZE} label="Colorize">
                <bim-context-menu>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <bim-color-input ${BUI.ref(onColorInputCreated)}></bim-color-input>
                    <bim-button @click=${onApplyColor} icon=${appIcons.APPLY} label="Apply"></bim-button>
                  </div>
                </bim-context-menu>
              </bim-button>
            </bim-context-menu>
          </bim-button>
        </div>
      `
    }
  }
}
