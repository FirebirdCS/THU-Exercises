import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { DataEnhancerSource } from "./src";

export class DataEnhancer extends OBC.Component {
    static uuid = "48856d78-3cdf-4fa9-9952-9a76a8b5b497" as const
    enabled = true

    readonly sources = new FRAGS.DataMap<string, DataEnhancerSource>()

    async getData(items: OBC.ModelIdMap) {
        const fragments = this.components.get(OBC.FragmentsManager)
        for (const [modelId, _localIds] of Object.entries(items)) {
          const model = fragments.list.get(modelId)
          if (!model) continue
          const localIds = [..._localIds]
          const itemsData = await model.getItemsData(localIds)
          for (const [source, config] of this.sources.entries()) {
            const sourceData = await config.data()
            for (const attributes of itemsData) {
              const itemExternalData = config.matcher(attributes, sourceData)
              if (!itemExternalData) continue
            }
          }
        }
    }
}