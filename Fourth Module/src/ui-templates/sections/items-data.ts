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
          target.textContent = "Copied!"
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
    
      highlighter.events.select.onClear.add(() => {
        updatePropsTable({modelIdMap: {}})
      })

    const onSearch = (e: Event) => {
        const input = e.target as BUI.TextInput
        propsTable.queryString = input.value
        propsTable.expanded = false
    }

    const onRefresh = () => {
        const selection = highlighter.selection.select
        if (OBC.ModelIdMapUtils.isEmpty(selection)) return
        updatePropsTable({modelIdMap: selection})
      }

    return BUI.html`<bim-panel-section fixed label="Selection Data">
        <div style="display: flex; gap: 0.5rem;">
            <bim-text-input @input=${onSearch} placeholder="Search data..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0" icon=${appIcons.REFRESH} @click=${onRefresh}></bim-button>
        </div>
    ${propsTable}
    </bim-panel-section>`
}