import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { DataEnhancerSource } from "./src";

export class DataEnhancer extends OBC.Component {
    static uuid = "48856d78-3cdf-4fa9-9952-9a76a8b5b497" as const
    enabled = true

    readonly sources = new FRAGS.DataMap<string, DataEnhancerSource>()

    async getData(items: OBC.ModelIdMap) {
        for (const [modelId, _localIds] of Object.entries(items)) {
            const localIds = [..._localIds]

        }
    }
}