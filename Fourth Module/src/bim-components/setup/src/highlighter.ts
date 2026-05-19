import * as THREE from "three"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"

export const setupHighlighter = (components: OBC.Components, world: OBC.World) => {
    const highlighter = components.get(OBF.Highlighter)
    highlighter.setup({
        world,
        selectionColor: new THREE.Color("#feca29"),
    })
}
