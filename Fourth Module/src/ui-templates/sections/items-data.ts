import * as BUI from "@thatopen/ui"
import * as OBC from "@thatopen/components"
import * as CUI from "@thatopen/ui-obc"
import * as OBF from "@thatopen/components-front"

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

    highlighter.events.select.onHighlight.add((modelIdMap) => {
        updatePropsTable({modelIdMap})
    })
    
      highlighter.events.select.onClear.add(() => {
        updatePropsTable({modelIdMap: {}})
    })
    
    return BUI.html`<bim-panel-section fixed label="Selection Data">
    ${propsTable}
    </bim-panel-section>`
}