import * as THREE from "three"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import * as FRAGS from "@thatopen/fragments"

export const setupHighlighter = (components: OBC.Components, world: OBC.World) => {
    const highlighter = components.get(OBF.Highlighter)
    highlighter.setup({
        world,
        selectMaterialDefinition: {
            color: new THREE.Color("#feca29"),
            renderedFaces: FRAGS.RenderedFaces.ONE,
            opacity: 1,
            transparent: false,
        },
    })
}
