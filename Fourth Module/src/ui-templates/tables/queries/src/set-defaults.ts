import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as THREE from "three";
import * as XLSX from "xlsx";
import { QueriesListState, QueriesListTableData } from "./types";
import { appIcons } from "src/index";
import { SmartViews } from "src/bim-components";

type ExportRow = {
  Model: string
  LocalId: number
  GlobalId: string
  Category: string
  Name: string
  ObjectType: string
  PredefinedType: string
}

const attr = (data: any, key: string): string => {
  const value = data?.[key]?.value
  return value === undefined || value === null ? "" : String(value)
}

const sanitizeSheetName = (name: string) => {
  // Excel sheet names cap at 31 chars and reject : \ / ? * [ ]
  return name.replace(/[\\/?*[\]:]/g, "_").slice(0, 31) || "Export"
}

const exportQueryToXlsx = async (
  components: OBC.Components,
  queryName: string,
  modelIdMap: OBC.ModelIdMap,
) => {
  const fragments = components.get(OBC.FragmentsManager)
  const rows: ExportRow[] = []

  for (const [modelId, localIdSet] of Object.entries(modelIdMap)) {
    const model = fragments.list.get(modelId)
    if (!model) continue
    const localIds = [...localIdSet]
    if (localIds.length === 0) continue

    const [itemsData, guids, itemsByCategory] = await Promise.all([
      model.getItemsData(localIds),
      model.getGuidsByLocalIds(localIds),
      // Item.getCategory() isn't bridged through the worker in 3.1.x; build a
      // localId → category map from getItemsOfCategories instead (one call per
      // model, hashable lookup per row).
      model.getItemsOfCategories([/.*/]),
    ])

    const categoryByLocalId = new Map<number, string>()
    for (const [category, ids] of Object.entries(itemsByCategory)) {
      for (const id of ids) categoryByLocalId.set(id, category)
    }

    for (let i = 0; i < localIds.length; i++) {
      const data = itemsData[i] as Record<string, any>
      rows.push({
        Model: modelId,
        LocalId: localIds[i],
        GlobalId: guids[i] ?? "",
        Category: categoryByLocalId.get(localIds[i]) ?? "",
        Name: attr(data, "Name"),
        ObjectType: attr(data, "ObjectType"),
        PredefinedType: attr(data, "PredefinedType"),
      })
    }
  }

  const sheet = XLSX.utils.json_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, sanitizeSheetName(queryName))
  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(book, `${queryName}_${stamp}.xlsx`)
}

export const setDefaults = (
  state: QueriesListState,
  table: BUI.Table<QueriesListTableData>,
) => {
  const { components } = state

  table.noIndentation = true
  table.headersHidden = true
  table.columns = ["Name", {name: "Actions", width: "auto"}]
  table.dataTransform = {
    Actions: (cellValue, rowData) => {
      const { Name } = rowData
      if (!Name) return cellValue

      const finder = components.get(OBC.ItemsFinder)
      const query = finder.list.get(Name)
      if (!query) return cellValue

      const onSelect = async ({target: button}: {target: BUI.Button}) => {
        button.loading = true
        const items = await query.test()
        const highligher = components.get(OBF.Highlighter)
        await highligher.highlightByID("select", items)
        button.loading = false
      }

      const onExport = async ({target: button}: {target: BUI.Button}) => {
        button.loading = true
        try {
          const items = await query.test()
          await exportQueryToXlsx(components, Name, items)
        } finally {
          button.loading = false
        }
      }

      let colorInput: BUI.ColorInput | undefined;
      const onColorInputCreated = (e?: Element) => {
        if (!e) return;
        colorInput = e as BUI.ColorInput;
      };

      const onApplyColor = async ({ target: button }: { target: BUI.Button }) => {
        if (!colorInput) return
        button.loading = true
        const items = await query.test()
        if (OBC.ModelIdMapUtils.isEmpty(items)) {
          button.loading = false
          return
        }

        const { color } = colorInput
        const highlighter = components.get(OBF.Highlighter)
        if (!highlighter.styles.has(color)) {
          highlighter.styles.set(color, {
            color: new THREE.Color(color),
            renderedFaces: 1,
            opacity: 1,
            transparent: false
          })
        }

        await highlighter.highlightByID(color, items)
        const smartViews = components.get(SmartViews)
        smartViews.addQueryColor(color, Name)
        button.loading = false
        BUI.ContextMenu.removeMenus()
      }

      return BUI.html`
        <div style="display: flex; gap: 0.25rem;">
          <bim-button icon=${appIcons.SELECT} tooltip-text="Seleccionar" @click=${onSelect}></bim-button>
          <bim-button icon=${appIcons.EXPORT} tooltip-text="Exportar a Excel" @click=${onExport}></bim-button>
          <bim-button style="flex: 0;" icon=${appIcons.CONTEXT_MENU} tooltip-text="Más opciones">
            <bim-context-menu>
              <bim-button style="flex: 0;" icon=${appIcons.COLORIZE} label="Colorize">
                <bim-context-menu>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <bim-color-input ${BUI.ref(onColorInputCreated)}></bim-color-input>
                    <bim-button @click=${onApplyColor} icon=${appIcons.APPLY} label="Apply"></bim-button>
                  </div>
                </bim-context-menu>
              </bim-button>
            </bim-context-menu>
          </bim-button>
        </div>
      `
    }
  }
}
