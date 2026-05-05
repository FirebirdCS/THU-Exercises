import * as BUI from "@thatopen/ui"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import { appIcons } from "src/index"
import * as THREE from "three"

export interface ViewerToolbarState {
    components: OBC.Components
}


export const viewerToolbarTemplate : BUI.StatefullComponent<ViewerToolbarState> = (state) => {
    const { components } = state

    let colorInput: BUI.ColorInput | undefined

    const onInputCreated = (e?: Element) => {
        if (!e) return
        colorInput = e as BUI.ColorInput
    }
    
    const onApplyColor = async ({target: button}: {target: BUI.Button}) => {
        if (!colorInput) return
        const { color } = colorInput
        const highlighter = components.get(OBF.Highlighter)
        const selection = highlighter.selection.select;

        if (OBC.ModelIdMapUtils.isEmpty(selection)) return
        button.loading = true
        const modelIdMap = selection.modelIdMap
        for (const modelId in modelIdMap) {
            const model = modelIdMap[modelId]
            if (!model) continue
            model.material.color.set(color)
        }
        if (!highlighter.styles.has(color)) {
            highlighter.styles.set(color, {
                color: new THREE.Color(color),
                opacity: 1,
                renderedFaces: 1,
                transparent: false,
            })
        }
        
        await Promise.all([highlighter.highlightByID(
            color,
            selection,
            false,
            false
        ),
        highlighter.clear("select")])

        button.loading = false
        BUI.ContextMenu.removeMenus()
    }

    const onReset = async ({ target }: { target: BUI.Button }) => {
        target.loading = true;
        const highlighter = components.get(OBF.Highlighter)
        await highlighter.clear()
        BUI.ContextMenu.removeMenus()
        target.loading = false;
    };

    return BUI.html`<bim-toolbar>
     <bim-toolbar-section label="Selection" icon=${appIcons.SELECT}>
        <bim-button icon=${appIcons.COLORIZE} label="Colorize">
        <bim-context-menu>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
               <bim-color-input ${BUI.ref(onInputCreated)} ></bim-color-input>
               <div style="display: flex; gap: 0.5rem;">
                    <bim-button @click=${onApplyColor} icon=${appIcons.APPLY} label="Apply"></bim-button>
                    <bim-button icon=${appIcons.CLEAR} label="Reset" @click=${onReset}></bim-buttom>
               </div>
            </div>
        </bim-context-menu>
        </bim-button>
     </bim-toolbar-section>
    </bim-toolbar>`
}