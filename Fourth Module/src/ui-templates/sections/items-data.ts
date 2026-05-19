import * as BUI from "@thatopen/ui"
import * as OBC from "@thatopen/components"
import * as CUI from "@thatopen/ui-obc"
import * as OBF from "@thatopen/components-front"
import { appIcons } from "src/index"

export interface ItemsDataPanelState {
    components: OBC.Components
}

export const itemsDataPanelTemplate: BUI.StatefullComponent<ItemsDataPanelState> = (state) => {
    const { components } = state

    const highlighter = components.get(OBF.Highlighter)

    const [ propsTable, updatePropsTable ] = CUI.tables.itemsData({
        components,
        modelIdMap: {}
    })

    propsTable.dataTransform.Value = (value) => {
        const onClick = ({ target }: { target: BUI.Label }) => {
          navigator.clipboard.writeText(value)
          target.textContent = "¡Copiado!"
          setTimeout(() => {
            target.textContent = value
          }, 500)
        }
    
        const onMouseOver = ({ target }: { target: BUI.Label }) => {
          target.style.color = "var(--primary)"
        }
    
        const onMouseLeave = ({ target }: { target: BUI.Label }) => {
          target.style.removeProperty("color")
        }
        
        return BUI.html`
          <bim-label @click=${onClick} @mouseleave=${onMouseLeave} @mouseover=${onMouseOver}>${value}</bim-label>
        `
      }
    
      // Every highlight style (the "select" selection plus any custom color
      // styles applied via "Colorear") is registered in highlighter.selection.
      // Joining them gives every item the user can currently see highlighted.
      const getHighlightedItems = () =>
        OBC.ModelIdMapUtils.join(Object.values(highlighter.selection))

      highlighter.events.select.onClear.add(() => {
        // "select" is also cleared when a custom color is applied to the
        // selection. In that case the items are still highlighted under the
        // color's style, so keep showing their data instead of blanking it.
        const highlighted = getHighlightedItems()
        updatePropsTable({
          modelIdMap: OBC.ModelIdMapUtils.isEmpty(highlighted) ? {} : highlighted,
        })
      })

    const onSearch = (e: Event) => {
        const input = e.target as BUI.TextInput
        propsTable.queryString = input.value
        propsTable.expanded = false
    }

    const onRefresh = () => {
        const highlighted = getHighlightedItems()
        if (OBC.ModelIdMapUtils.isEmpty(highlighted)) return
        updatePropsTable({modelIdMap: highlighted})
      }

    return BUI.html`<bim-panel-section fixed label="Datos de selección">
        <div style="display: flex; gap: 0.5rem;">
            <bim-text-input @input=${onSearch} placeholder="Buscar datos..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0" icon=${appIcons.REFRESH} @click=${onRefresh}></bim-button>
        </div>
    ${propsTable}
    </bim-panel-section>`
}