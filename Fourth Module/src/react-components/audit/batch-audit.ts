import * as OBC from "@thatopen/components";
import * as XLSX from "xlsx";
import fragmentsWorkerUrl from "@thatopen/fragments/dist/Worker/worker.mjs?url";
import { setupIfcLoader } from "src/bim-components/setup/src";
import {
  PSET_ITEMS_DATA_CONFIG,
  PropCoverage,
  KEY_SEPARATOR,
  collectItemProps,
  coveragePct,
} from "src/ui-templates/tables/queries/src/property-export";

/**
 * Auditoría por lotes: procesa muchos IFC/FRAG en secuencia sin federarlos
 * en un espacio 3D. Motor "headless" (sin mundo, cámara ni renderer): cada
 * modelo se carga, se escanea la cobertura de propiedades por pset y se
 * libera de memoria antes de pasar al siguiente — nunca está el lote entero
 * cargado a la vez.
 */

export interface ModelAuditResult {
  model: string;
  total: number;
  // clave "Pset::Propiedad" -> cobertura, en orden de descubrimiento
  coverage: Map<string, PropCoverage>;
}

export interface AuditError {
  model: string;
  error: string;
}

const CHUNK_SIZE = 500;

export const CANCELLED = "Auditoría cancelada";

/** Motor mínimo para leer datos: solo FragmentsManager (worker) + IfcLoader. */
export const createAuditEngine = () => {
  const components = new OBC.Components();
  setupIfcLoader(components);
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(fragmentsWorkerUrl);
  components.init();
  return components;
};

let loadCounter = 0;

/**
 * Carga un archivo (.ifc o .frag), escanea la cobertura de propiedades de sus
 * elementos y libera el modelo de memoria al terminar (también si falla o se
 * cancela). `filter`: términos en minúsculas; si se da, solo cuentan las
 * propiedades cuyo "Pset.Propiedad" contenga alguno.
 *
 * `cancelled` es una promesa que se resuelve al pulsar "Cancelar": se compite
 * contra cada espera larga para que la cancelación sea inmediata, incluso a
 * mitad de una conversión IFC (que no se puede interrumpir; su resultado se
 * libera en segundo plano cuando termine).
 */
export const auditModelFile = async (
  components: OBC.Components,
  file: File,
  options: {
    filter?: string[];
    onStage?: (stage: string) => void;
    onProgress?: (done: number, total: number) => void;
    cancelled?: Promise<void>;
  } = {},
): Promise<ModelAuditResult> => {
  const { filter, onStage, onProgress, cancelled } = options;
  const name = file.name.replace(/\.(ifc|frag)$/i, "");
  const fragments = components.get(OBC.FragmentsManager);

  let isCancelled = false;
  const cancelError = cancelled?.then(() => {
    isCancelled = true;
    throw new Error(CANCELLED);
  });
  cancelError?.catch(() => {});
  const orCancel = <T>(promise: Promise<T>): Promise<T> =>
    cancelError ? Promise.race([promise, cancelError]) : promise;

  // Id interno único: evita choques si el lote trae el mismo modelo en .ifc
  // y .frag, o si una carga cancelada aún se está liberando.
  const modelId = `${name}__audit${loadCounter++}`;
  let loadPromise: Promise<unknown> | undefined;

  try {
    onStage?.("Leyendo archivo...");
    const buffer = await orCancel(file.arrayBuffer());

    if (/\.frag$/i.test(file.name)) {
      onStage?.("Cargando modelo...");
      loadPromise = fragments.core.load(buffer, { modelId });
    } else {
      onStage?.("Convirtiendo IFC...");
      const ifcLoader = components.get(OBC.IfcLoader);
      // coordinate=false: no hay escena, no hace falta reposicionar nada.
      loadPromise = ifcLoader.load(new Uint8Array(buffer), false, modelId, {
        processData: {
          progressCallback: (progress) => {
            const pct = Math.round(progress <= 1 ? progress * 100 : progress);
            onStage?.(`Convirtiendo IFC... ${pct}%`);
          },
        },
      });
    }
    await orCancel(loadPromise);

    const model = fragments.list.get(modelId);
    if (!model) throw new Error(`El modelo "${name}" no se pudo cargar`);

    // Solo elementos físicos (con geometría): los psets, propiedades y
    // relaciones también son items del modelo y, si se contaran, inflarían el
    // total y hundirían los porcentajes. Se excluyen los huecos (openings),
    // que tienen geometría pero no son elementos a auditar.
    onStage?.("Preparando elementos...");
    const [withGeometry, openings] = await orCancel(
      Promise.all([
        model.getItemsIdsWithGeometry(),
        model.getItemsOfCategories([/OPENINGELEMENT/i]),
      ]),
    );
    const excluded = new Set(Object.values(openings).flat());
    const localIds = [...new Set(withGeometry)].filter((id) => !excluded.has(id));
    const total = localIds.length;
    const coverage = new Map<string, PropCoverage>();
    onProgress?.(0, total);

    for (let start = 0; start < localIds.length; start += CHUNK_SIZE) {
      if (isCancelled) throw new Error(CANCELLED);
      const chunk = localIds.slice(start, start + CHUNK_SIZE);
      const dataList = await orCancel(
        model.getItemsData(chunk, PSET_ITEMS_DATA_CONFIG),
      );

      for (const data of dataList) {
        const props = collectItemProps(data as Record<string, any>);
        for (const key of props.keys()) {
          if (filter?.length) {
            const text = key.toLowerCase();
            if (!filter.some((term) => text.includes(term))) continue;
          }
          let entry = coverage.get(key);
          if (!entry) {
            const [pset, prop] = key.split(KEY_SEPARATOR);
            entry = { pset, prop, count: 0 };
            coverage.set(key, entry);
          }
          entry.count++;
        }
      }

      onProgress?.(Math.min(start + CHUNK_SIZE, total), total);
      // Cede el hilo entre chunks para que la UI de progreso respire.
      await new Promise((resolve) => setTimeout(resolve));
    }

    return { model: name, total, coverage };
  } finally {
    // Si la carga sigue en curso (cancelada a mitad), se libera al terminar.
    const release = () =>
      fragments.core.disposeModel(modelId).catch(() => {
        // El modelo pudo no llegar a cargarse; nada que liberar.
      });
    if (loadPromise) {
      loadPromise.then(release, () => {});
    } else {
      void release();
    }
  }
};

const sortedCoverage = (coverage: Map<string, PropCoverage>) =>
  [...coverage.values()].sort(
    (a, b) => a.pset.localeCompare(b.pset) || a.prop.localeCompare(b.prop),
  );

/**
 * Genera el Excel del lote: hoja "Consolidado" (totales de todo el lote),
 * hoja "Por modelo" (filas agrupadas por archivo, como pidió el cliente) y,
 * si hubo fallos, hoja "Errores".
 */
export const exportAuditToXlsx = (
  results: ModelAuditResult[],
  errors: AuditError[] = [],
) => {
  const totalAll = results.reduce((sum, r) => sum + r.total, 0);

  const aggregate = new Map<string, PropCoverage>();
  for (const result of results) {
    for (const [key, { pset, prop, count }] of result.coverage) {
      let entry = aggregate.get(key);
      if (!entry) {
        entry = { pset, prop, count: 0 };
        aggregate.set(key, entry);
      }
      entry.count += count;
    }
  }

  const consolidatedRows = sortedCoverage(aggregate).map(
    ({ pset, prop, count }) => ({
      Pset: pset,
      Propiedad: prop,
      "Con valor": count,
      "Sin valor": totalAll - count,
      "Total entidades": totalAll,
      "%": coveragePct(count, totalAll),
    }),
  );

  const perModelRows: Record<string, string | number>[] = [];
  for (const result of results) {
    for (const { pset, prop, count } of sortedCoverage(result.coverage)) {
      perModelRows.push({
        Modelo: result.model,
        Pset: pset,
        Propiedad: prop,
        "Con valor": count,
        "Sin valor": result.total - count,
        "Total entidades": result.total,
        "%": coveragePct(count, result.total),
      });
    }
  }

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.json_to_sheet(consolidatedRows),
    "Consolidado",
  );
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.json_to_sheet(perModelRows),
    "Por modelo",
  );
  if (errors.length) {
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        errors.map(({ model, error }) => ({ Modelo: model, Error: error })),
      ),
      "Errores",
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(book, `Auditoria_${stamp}.xlsx`);
};
