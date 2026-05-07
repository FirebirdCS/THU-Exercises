import * as OBC from "@thatopen/components"
import { DataEnhancer } from "../../DataEnhancer"
import { ItemData } from "@thatopen/fragments"
import * as OBF from "@thatopen/components-front"

export const setupDataEnhancer = (components: OBC.Components) => {
  const enhancer = components.get(DataEnhancer)

  enhancer.sources.set("Technical Documentation", {
    data: async () => {
      const file = await fetch("/resources/technical_documentation.json")
      const json = await file.json()
      return json
    },
    matcher: (attrs: ItemData, data: any[]) => {
      const categoryData = attrs._category
      if (!(categoryData && "value" in categoryData)) return null
      const category = categoryData.value
      const dataSubset = data.filter(entry => entry.category === category)
      return dataSubset.length > 0 ? dataSubset : null
    }
  })

  const highlighter = components.get(OBF.Highlighter)
  highlighter.events.select.onHighlight.add(async items => {
    const data = await enhancer.getData(items)
    console.log(data)
  })
}