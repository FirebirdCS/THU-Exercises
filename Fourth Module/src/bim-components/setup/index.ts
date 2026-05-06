import * as OBC from "@thatopen/components"
import { createWorld, setupIfcLoader, setupFragmentsManager, setupHighlighter, setupItemsFinder } from "./src"
import * as BUI from "@thatopen/ui"
import { loadModelBtnTemplate } from "@uiTemplates"

export const setupComponents = async () => {
    const components = new OBC.Components()
    const { world, viewport } = createWorld(components)

    setupIfcLoader(components)
    setupFragmentsManager(components, world)
    setupHighlighter(components, world)
    setupItemsFinder(components)

    components.init()

    return { components, viewport }
}