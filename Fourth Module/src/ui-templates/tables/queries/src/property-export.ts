import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as XLSX from "xlsx";
import { appIcons } from "src/index";

/**
 * Exportación configurable de propiedades por familia:
 * - Un solo escaneo por consulta trae atributos + psets de todos los items
 *   (en chunks para no bloquear la UI y con reporte de progreso).
 * - El resultado se cachea por nombre de consulta y se invalida cuando los
 *   modelos cargados cambian, así reabrir el popup o exportar no re-escanea.
 * - El popup permite marcar qué propiedades exportar (agrupadas por pset) y
 *   muestra la cobertura de cada una: cuántas entidades la tienen y el %.
 */

interface BaseRow {
  Model: string;
  LocalId: number;
  GlobalId: string;
  Category: string;
  Name: string;
  ObjectType: string;
  PredefinedType: string;
}

interface ScannedItem {
  base: BaseRow;
  // clave "pset::propiedad" -> valor
  props: Map<string, unknown>;
}

export interface PropCoverage {
  pset: string;
  prop: string;
  count: number;
}

export interface QueryScan {
  id: string;
  items: ScannedItem[];
  // clave "pset::propiedad" -> cobertura, en orden de descubrimiento
  coverage: Map<string, PropCoverage>;
}

interface FinderQuery {
  test: () => Promise<OBC.ModelIdMap>;
}

export const KEY_SEPARATOR = "::";
const CHUNK_SIZE = 500;

// Configuración de getItemsData compartida por el visor y la auditoría por
// lotes: solo se expande la relación IsDefinedBy (psets); el resto de
// relaciones no se trae, que es donde se iría el tiempo en modelos grandes.
export const PSET_ITEMS_DATA_CONFIG = {
  attributesDefault: true,
  relationsDefault: { attributes: false, relations: false },
  relations: { IsDefinedBy: { attributes: true, relations: true } },
};

export const coveragePct = (count: number, total: number) =>
  total ? Number(((count / total) * 100).toFixed(1)) : 0;

const attrValue = (data: any, key: string): unknown => {
  const value = data?.[key]?.value;
  return value === undefined || value === null ? undefined : value;
};

const attrText = (data: any, key: string): string => {
  const value = attrValue(data, key);
  return value === undefined ? "" : String(value);
};

// Obtiene el valor de una propiedad de pset o de una cantidad (quantity set):
// NominalValue para IfcProperty, o el primer atributo *Value presente
// (LengthValue, AreaValue, VolumeValue, CountValue...) para IfcQuantity.
const getPropertyValue = (prop: Record<string, any>): unknown => {
  const nominal = attrValue(prop, "NominalValue");
  if (nominal !== undefined) return nominal;
  for (const key in prop) {
    if (key === "Name" || !key.endsWith("Value")) continue;
    const value = attrValue(prop, key);
    if (value !== undefined) return value;
  }
  return undefined;
};

// Criterio de cobertura: un valor cuenta como "presente" solo si aporta
// información. Se descartan undefined/null, cadenas vacías o de solo
// espacios, false y 0 (parámetros creados pero nunca rellenados).
export const isMeaningfulValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return true;
};

/**
 * Extrae las propiedades con valor de un item (resultado de getItemsData con
 * PSET_ITEMS_DATA_CONFIG) como mapa "Pset::Propiedad" -> valor. Compartido
 * entre la exportación del visor y la auditoría por lotes.
 */
export const collectItemProps = (
  data: Record<string, any>,
): Map<string, unknown> => {
  const props = new Map<string, unknown>();
  const psets = Array.isArray(data?.IsDefinedBy) ? data.IsDefinedBy : [];
  for (const pset of psets) {
    const psetName = attrText(pset, "Name") || "(Sin nombre)";
    // Las propiedades cuelgan de relaciones cuyo nombre depende del tipo de
    // pset (HasProperties, Quantities...): se toma cualquier relación
    // expandida como lista de propiedades.
    for (const relName in pset) {
      const rel = pset[relName];
      if (!Array.isArray(rel)) continue;
      for (const prop of rel) {
        const propName = attrText(prop, "Name");
        if (!propName) continue;
        const value = getPropertyValue(prop);
        if (!isMeaningfulValue(value)) continue;
        props.set(`${psetName}${KEY_SEPARATOR}${propName}`, value);
      }
    }
  }
  return props;
};

let scanCounter = 0;
const scanCache = new Map<string, QueryScan>();
const invalidationHooked = new WeakSet<OBC.Components>();

// El caché deja de ser válido si se cargan o eliminan modelos.
const ensureCacheInvalidation = (components: OBC.Components) => {
  if (invalidationHooked.has(components)) return;
  invalidationHooked.add(components);
  const fragments = components.get(OBC.FragmentsManager);
  fragments.list.onItemSet.add(() => scanCache.clear());
  fragments.list.onItemDeleted.add(() => scanCache.clear());
};

const getQueryScan = async (
  components: OBC.Components,
  queryName: string,
  modelIdMap: OBC.ModelIdMap,
  onProgress?: (done: number, total: number) => void,
): Promise<QueryScan> => {
  ensureCacheInvalidation(components);
  const cached = scanCache.get(queryName);
  if (cached) return cached;

  const fragments = components.get(OBC.FragmentsManager);
  const items: ScannedItem[] = [];
  const coverage = new Map<string, PropCoverage>();

  let total = 0;
  for (const localIdSet of Object.values(modelIdMap)) total += localIdSet.size;
  let done = 0;

  for (const [modelId, localIdSet] of Object.entries(modelIdMap)) {
    const model = fragments.list.get(modelId);
    if (!model) continue;
    const localIds = [...localIdSet];
    if (!localIds.length) continue;

    // Item.getCategory() no está puenteado por el worker en 3.1.x; se arma un
    // mapa localId -> categoría con una sola llamada por modelo.
    const itemsByCategory = await model.getItemsOfCategories([/.*/]);
    const categoryByLocalId = new Map<number, string>();
    for (const [category, ids] of Object.entries(itemsByCategory)) {
      for (const id of ids) categoryByLocalId.set(id, category);
    }

    for (let start = 0; start < localIds.length; start += CHUNK_SIZE) {
      const chunk = localIds.slice(start, start + CHUNK_SIZE);
      const [dataList, guids] = await Promise.all([
        model.getItemsData(chunk, PSET_ITEMS_DATA_CONFIG),
        model.getGuidsByLocalIds(chunk),
      ]);

      for (let i = 0; i < chunk.length; i++) {
        const data = dataList[i] as Record<string, any>;
        const props = collectItemProps(data);

        for (const key of props.keys()) {
          let entry = coverage.get(key);
          if (!entry) {
            const [pset, prop] = key.split(KEY_SEPARATOR);
            entry = { pset, prop, count: 0 };
            coverage.set(key, entry);
          }
          entry.count++;
        }

        items.push({
          base: {
            Model: modelId,
            LocalId: chunk[i],
            GlobalId: guids[i] ?? "",
            Category: categoryByLocalId.get(chunk[i]) ?? "",
            Name: attrText(data, "Name"),
            ObjectType: attrText(data, "ObjectType"),
            PredefinedType: attrText(data, "PredefinedType"),
          },
          props,
        });
      }

      done += chunk.length;
      onProgress?.(done, total);
      // Cede el hilo entre chunks para que la UI (spinner/progreso) respire.
      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  const scan: QueryScan = { id: String(scanCounter++), items, coverage };
  scanCache.set(queryName, scan);
  return scan;
};

export const sanitizeSheetName = (name: string) => {
  // Los nombres de hoja en Excel aceptan máx. 31 caracteres y rechazan : \ / ? * [ ]
  return name.replace(/[\\/?*[\]:]/g, "_").slice(0, 31) || "Export";
};

const toCellValue = (value: unknown): string | number | boolean => {
  if (typeof value === "number" || typeof value === "boolean") return value;
  return value === undefined || value === null ? "" : String(value);
};

const exportScanToXlsx = (
  queryName: string,
  scan: QueryScan,
  selectedKeys: string[],
) => {
  const total = scan.items.length;

  const dataRows = scan.items.map((item) => {
    const row: Record<string, string | number | boolean> = { ...item.base };
    for (const key of selectedKeys) {
      const { pset, prop } = scan.coverage.get(key)!;
      row[`${pset}.${prop}`] = toCellValue(item.props.get(key));
    }
    return row;
  });

  // Resumen desglosado por modelo: además del combinado, una sección de
  // filas por cada archivo cargado (pedido del cliente para lotes de IFC).
  const perModel = new Map<
    string,
    { total: number; counts: Map<string, number> }
  >();
  const selectedSet = new Set(selectedKeys);
  for (const item of scan.items) {
    let entry = perModel.get(item.base.Model);
    if (!entry) {
      entry = { total: 0, counts: new Map() };
      perModel.set(item.base.Model, entry);
    }
    entry.total++;
    for (const key of item.props.keys()) {
      if (!selectedSet.has(key)) continue;
      entry.counts.set(key, (entry.counts.get(key) ?? 0) + 1);
    }
  }

  const summaryRows: Record<string, string | number>[] = [];
  const pushSummary = (
    modelLabel: string,
    modelTotal: number,
    countOf: (key: string) => number,
  ) => {
    for (const key of selectedKeys) {
      const { pset, prop } = scan.coverage.get(key)!;
      const count = countOf(key);
      summaryRows.push({
        Modelo: modelLabel,
        Pset: pset,
        Propiedad: prop,
        "Con valor": count,
        "Sin valor": modelTotal - count,
        "Total entidades": modelTotal,
        "%": coveragePct(count, modelTotal),
      });
    }
  };

  if (perModel.size === 1) {
    const [onlyModel] = perModel.keys();
    pushSummary(onlyModel, total, (key) => scan.coverage.get(key)!.count);
  } else {
    pushSummary("TODOS LOS MODELOS", total, (key) => scan.coverage.get(key)!.count);
    for (const [modelId, entry] of perModel) {
      pushSummary(modelId, entry.total, (key) => entry.counts.get(key) ?? 0);
    }
  }

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.json_to_sheet(dataRows),
    sanitizeSheetName(queryName),
  );
  if (summaryRows.length) {
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(summaryRows),
      "Resumen",
    );
  }
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(book, `${queryName}_${stamp}.xlsx`);
};

const buildMenuContent = (queryName: string, scan: QueryScan) => {
  const total = scan.items.length;
  const selected = new Set<string>(scan.coverage.keys());

  const propCheckboxes = new Map<string, BUI.Checkbox>();
  const groupCheckboxes = new Map<string, BUI.Checkbox>();
  const propRows = new Map<string, { element: HTMLElement; search: string }>();
  const groupContainers = new Map<string, HTMLElement>();
  let exportButton: BUI.Button | undefined;

  // Agrupa la cobertura por pset preservando el orden de descubrimiento.
  const groups = new Map<string, { key: string; prop: string; count: number }[]>();
  for (const [key, { pset, prop, count }] of scan.coverage) {
    let group = groups.get(pset);
    if (!group) {
      group = [];
      groups.set(pset, group);
    }
    group.push({ key, prop, count });
  }

  const updateExportLabel = () => {
    if (!exportButton) return;
    exportButton.label = `Exportar (${selected.size})`;
  };

  const syncGroupCheckbox = (pset: string) => {
    const checkbox = groupCheckboxes.get(pset);
    const group = groups.get(pset);
    if (!checkbox || !group) return;
    checkbox.checked = group.every(({ key }) => selected.has(key));
  };

  const setAll = (on: boolean) => {
    selected.clear();
    for (const [key, checkbox] of propCheckboxes) {
      checkbox.checked = on;
      if (on) selected.add(key);
    }
    for (const checkbox of groupCheckboxes.values()) checkbox.checked = on;
    updateExportLabel();
  };

  const onSearch = (e: Event) => {
    const term = (e.target as BUI.TextInput).value.trim().toLowerCase();
    const visibleGroups = new Map<string, boolean>();
    for (const [pset, group] of groups) {
      let anyVisible = false;
      for (const { key } of group) {
        const row = propRows.get(key);
        if (!row) continue;
        const visible = !term || row.search.includes(term);
        row.element.style.display = visible ? "" : "none";
        anyVisible = anyVisible || visible;
      }
      visibleGroups.set(pset, anyVisible);
    }
    for (const [pset, container] of groupContainers) {
      container.style.display = visibleGroups.get(pset) ? "" : "none";
    }
  };

  const onExport = ({ target }: { target: BUI.Button }) => {
    target.loading = true;
    try {
      const orderedKeys = [...scan.coverage.keys()].filter((key) =>
        selected.has(key),
      );
      exportScanToXlsx(queryName, scan, orderedKeys);
    } finally {
      target.loading = false;
    }
    BUI.ContextMenu.removeMenus();
  };

  return BUI.Component.create<HTMLDivElement>(() => {
    const groupTemplates = [...groups.entries()].map(([pset, group]) => {
      const onGroupCreated = (e?: Element) => {
        if (e) groupCheckboxes.set(pset, e as BUI.Checkbox);
      };
      const onGroupContainerCreated = (e?: Element) => {
        if (e) groupContainers.set(pset, e as HTMLElement);
      };
      const onGroupChange = ({ target }: { target: BUI.Checkbox }) => {
        for (const { key } of group) {
          const checkbox = propCheckboxes.get(key);
          if (checkbox) checkbox.checked = target.checked;
          if (target.checked) selected.add(key);
          else selected.delete(key);
        }
        updateExportLabel();
      };

      const propTemplates = group.map(({ key, prop, count }) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        const onPropCreated = (e?: Element) => {
          if (!e) return;
          propCheckboxes.set(key, e as BUI.Checkbox);
          propRows.set(key, {
            element: e as HTMLElement,
            search: `${pset} ${prop}`.toLowerCase(),
          });
        };
        const onPropChange = ({ target }: { target: BUI.Checkbox }) => {
          if (target.checked) selected.add(key);
          else selected.delete(key);
          syncGroupCheckbox(pset);
          updateExportLabel();
        };
        return BUI.html`
          <bim-checkbox ${BUI.ref(onPropCreated)} checked
            style="margin-left: 1.25rem;"
            label="${prop} — ${count}/${total} (${pct}%)"
            @change=${onPropChange}></bim-checkbox>
        `;
      });

      return BUI.html`
        <div ${BUI.ref(onGroupContainerCreated)} style="display: flex; flex-direction: column; gap: 0.25rem;">
          <bim-checkbox ${BUI.ref(onGroupCreated)} checked
            style="font-weight: bold;"
            label=${pset}
            @change=${onGroupChange}></bim-checkbox>
          ${propTemplates}
        </div>
      `;
    });

    const onExportCreated = (e?: Element) => {
      if (!e) return;
      exportButton = e as BUI.Button;
      updateExportLabel();
    };

    const emptyMessage = groups.size
      ? null
      : BUI.html`<bim-label>No se encontraron propiedades en los psets.</bim-label>`;

    return BUI.html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 22rem; max-width: 28rem;">
        <bim-label style="font-weight: bold;">${queryName}: ${total} entidades</bim-label>
        <bim-text-input placeholder="Buscar propiedad..." debounce="150" @input=${onSearch}></bim-text-input>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 22rem; overflow-y: auto; padding-right: 0.25rem;">
          ${emptyMessage}
          ${groupTemplates}
        </div>
        <div style="display: flex; gap: 0.25rem;">
          <bim-button label="Todas" @click=${() => setAll(true)}></bim-button>
          <bim-button label="Ninguna" @click=${() => setAll(false)}></bim-button>
          <bim-button ${BUI.ref(onExportCreated)} icon=${appIcons.EXPORT} label="Exportar" @click=${onExport}></bim-button>
        </div>
      </div>
    `;
  });
};

const buildingMenus = new WeakSet<Element>();

/**
 * Rellena el bim-context-menu del botón de exportar de una consulta: ejecuta
 * la query, escanea las propiedades (con caché) y monta el popup de selección.
 * Idempotente: si el menú ya se construyó para el escaneo vigente, no hace nada.
 */
export const populateExportMenu = async (options: {
  components: OBC.Components;
  menu: HTMLElement;
  queryName: string;
  query: FinderQuery;
}) => {
  const { components, menu, queryName, query } = options;
  if (buildingMenus.has(menu)) return;

  const cached = scanCache.get(queryName);
  if (cached && menu.dataset.scanId === cached.id) return;

  buildingMenus.add(menu);
  try {
    const status = document.createElement("bim-label");
    status.textContent = "Ejecutando consulta...";
    menu.replaceChildren(status);

    const items = await query.test();
    const scan = await getQueryScan(components, queryName, items, (done, total) => {
      status.textContent = `Leyendo propiedades... ${done}/${total}`;
    });

    menu.dataset.scanId = scan.id;
    menu.replaceChildren(buildMenuContent(queryName, scan));
    (menu as any).updatePosition?.();
  } catch (error) {
    console.error("No se pudieron leer las propiedades de la consulta", error);
    const failed = document.createElement("bim-label");
    failed.textContent = "Error al leer las propiedades.";
    menu.replaceChildren(failed);
  } finally {
    buildingMenus.delete(menu);
  }
};
