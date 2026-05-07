import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { DataEnhancerSource } from "./src";

export class DataEnhancer extends OBC.Component {
    static uuid = "48856d78-3cdf-4fa9-9952-9a76a8b5b497" as const
    enabled = true

    private _sourcesDataCache: Record<string, any[]> = {}
    private _itemsDataCache: Record<string, Record<number, Record<string, any>>> = {}

    readonly sources = new FRAGS.DataMap<string, DataEnhancerSource>()

    async getSourceData(source: string) {
        const config = this.sources.get(source)
        if (!config) {
          throw new Error(`Data Enhancer: Source ${source} not found`)
        }

        let data = this._sourcesDataCache[source]
        if (!data) {
            data = await config.data()
            this._sourcesDataCache[source] = data
        }
        return data
    }

    async getItemData(modelId: string, localId: number, attributes?: any) {
        if (!this._itemsDataCache[modelId]) this._itemsDataCache[modelId] = {}
        const modelCache = this._itemsDataCache[modelId]

        let data = modelCache[localId]
        if (!data) {
            data = {}
            for (const [source, config] of this.sources.entries()) {
                const sourceData = await this.getSourceData(source)
                const itemExternalData = config.matcher(attributes, sourceData)
                if (itemExternalData) data[source] = itemExternalData
            }
            modelCache[localId] = data
        }
        return data
    }

    async getData(items: OBC.ModelIdMap) {
        const fragments = this.components.get(OBC.FragmentsManager)
        const result: OBC.ModelIdDataMap<Record<string, any[]>> = new FRAGS.DataMap()
        for (const [modelId, _localIds] of Object.entries(items)) {
          const model = fragments.list.get(modelId)
          if (!model) continue
          const localIds = [..._localIds]
          const modelCache = this._itemsDataCache[modelId] ?? {}
          const uncachedIds = localIds.filter((id) => !(id in modelCache))
          const uncachedData = uncachedIds.length > 0 ? await model.getItemsData(uncachedIds) : []
          const attributesByLocalId = new Map(uncachedIds.map((id, i) => [id, uncachedData[i]]))
          for (const localId of localIds) {
            const itemData = await this.getItemData(modelId, localId, attributesByLocalId.get(localId))
            if (Object.keys(itemData).length === 0) continue
            let modelResult = result.get(modelId)
            if (!modelResult) {
              modelResult = new FRAGS.DataMap()
              result.set(modelId, modelResult)
            }
            modelResult.set(localId, itemData)
          }
        }
        return result
    }
}