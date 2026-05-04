import * as OBC from "@thatopen/components"
import { createWorld } from "./src"

export const setupComponents = async () => {
    const components = new OBC.Components()
    const { world, viewport } = createWorld(components)

    components.init()

    return { world, viewport }
}