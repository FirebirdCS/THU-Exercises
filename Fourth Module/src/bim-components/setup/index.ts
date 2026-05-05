import * as OBC from "@thatopen/components"
import { createWorld, setupIfcLoader, setupFragmentsManager } from "./src"
import * as BUI from "@thatopen/ui"
import { loadModelBtnTemplate } from "src/react-components/ui/ui-templates"

export const setupComponents = async () => {
    const components = new OBC.Components()
    const { world, viewport } = createWorld(components)

    setupIfcLoader(components)
    setupFragmentsManager(components, world)

    const [loadModelsBtn] = BUI.Component.create(loadModelBtnTemplate, { components })
    loadModelsBtn.style.position = "absolute"
    loadModelsBtn.style.top = "1rem"
    loadModelsBtn.style.left = "1rem"

    viewport.append(loadModelsBtn)

    components.init()

    return { world, viewport }
}