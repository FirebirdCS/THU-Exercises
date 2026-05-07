import * as OBC from "@thatopen/components"
import { createWorld, setupIfcLoader, setupFragmentsManager, setupHighlighter, setupItemsFinder, setupDataEnhancer } from "./src"

export const setupComponents = async () => {
    const components = new OBC.Components()
    const { world, viewport } = createWorld(components)

    setupIfcLoader(components)
    setupFragmentsManager(components, world)
    setupHighlighter(components, world)
    setupItemsFinder(components)
    setupDataEnhancer(components)

    components.init()

    return { components, viewport }
}