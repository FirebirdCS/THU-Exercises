import * as OBC from "@thatopen/components";
import { SmartViews } from "src/bim-components/SmartViews";

// Registers the SmartViews component. Views are not seeded here anymore;
// they are loaded from (and persisted to) Firebase per project.
export const setupSmartViews = (components: OBC.Components) => {
    components.get(SmartViews)
}