import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

/**
 * Verificador IDS (buildingSMART) sobre los modelos cargados en el proyecto.
 *
 * Usa el motor IDS de @thatopen/components (IDSSpecifications) para leer el
 * XML y evaluar cada faceta, y le agrega lo que le falta para usarlo en
 * producción:
 * - Validación del archivo: XML bien formado, raíz <ids>, al menos una
 *   especificación y un esquema IFC compatible con los modelos cargados. Si
 *   el IDS no corresponde a los modelos, no se carga nada y se lanza un error.
 * - Aplicabilidad con semántica IDS (todas las facetas deben cumplirse: AND).
 *   El motor original une los resultados de cada faceta (OR).
 * - Patrones anclados (^...$) como en XSD; el motor original los evalúa sin
 *   anclar, así que un patrón podía "cumplirse" con solo una parte del valor.
 * - Detección de especificaciones que el motor no sabe evaluar
 *   (Clasificación, PartOf, Atributo como aplicabilidad), que se reportan
 *   como "no evaluables" en lugar de dar un resultado falso.
 */

export class IdsValidationError extends Error {}

export type IdsSpecStatus = "cumple" | "no-cumple" | "no-evaluable" | "no-aplica";

export interface IdsInfo {
  title: string;
  author?: string;
  date?: string;
  version?: string;
  description?: string;
}

export interface LoadedIds {
  fileName: string;
  info: IdsInfo;
  specs: OBC.IDSSpecification[];
  /** Esquema IFC de cada modelo cargado (p. ej. "IFC2X3"). */
  modelSchemas: Map<string, string>;
  warnings: string[];
}

export interface IdsFailedCheck {
  facet: string;
  parameter: string;
  currentValue: string;
  requiredValue: string;
}

export interface IdsFailure {
  modelId: string;
  localId: number;
  guid?: string;
  name?: string;
  checks: IdsFailedCheck[];
}

export interface IdsSpecResult {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  ifcVersions: string[];
  status: IdsSpecStatus;
  reason?: string;
  applicable: number;
  passed: number;
  failed: number;
  pass: OBC.ModelIdMap;
  fail: OBC.ModelIdMap;
  failures: IdsFailure[];
}

export interface IdsReport {
  fileName: string;
  info: IdsInfo;
  results: IdsSpecResult[];
  /** Elementos evaluados (aplicables a al menos una especificación). */
  evaluatedElements: number;
  /** Elementos que fallan al menos una especificación. */
  failedElements: number;
  /** Porcentaje de comprobaciones elemento-especificación que cumplen. */
  compliance: number;
  date: Date;
}

const FACET_LABELS: Record<string, string> = {
  Entity: "Entidad",
  Attribute: "Atributo",
  Property: "Propiedad",
  Classification: "Clasificación",
  Material: "Material",
  PartOf: "Parte de",
};

const PARAMETER_LABELS: Record<string, string> = {
  Name: "Nombre",
  PredefinedType: "Tipo predefinido",
  Value: "Valor",
  System: "Sistema",
  URI: "URI",
  PropertySet: "Pset",
  BaseName: "Propiedad",
  DataType: "Tipo de dato",
  Entity: "Entidad",
  Relation: "Relación",
};

export const facetLabel = (facet: string) => FACET_LABELS[facet] ?? facet;

type FacetParameter = { type: string; parameter: any } | undefined;

const ANCHOR_START = "^(?:";
const ANCHOR_END = ")$";

/**
 * Convierte un patrón simple en una máscara legible: `AP\.\d{2}` → `AP.##`
 * (# = dígito, @ = letra). Si el patrón usa construcciones que no se pueden
 * expresar como máscara (alternativas, repeticiones abiertas...), devuelve
 * undefined y se muestra el patrón original.
 */
const patternToMask = (pattern: string) => {
  const DIGIT = "#";
  const LETTER = "@";
  const tokens: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^(?:\\d|\[0-9\])\{(\d+)\}/, (m) => DIGIT.repeat(Number(m[1]))],
    [/^(?:\\d|\[0-9\])/, () => DIGIT],
    [/^\[A-Z\]\{(\d+)\}/, (m) => LETTER.repeat(Number(m[1]))],
    [/^\[A-Z\]/, () => LETTER],
    [/^\\([.\-_/ ])/, (m) => m[1]],
    [/^[A-Za-z0-9 _\-/:]/, (m) => m[0]],
  ];
  let rest = pattern;
  let mask = "";
  while (rest.length) {
    const token = tokens.find(([regex]) => regex.test(rest));
    if (!token) return undefined;
    const match = rest.match(token[0])!;
    mask += token[1](match);
    rest = rest.slice(match[0].length);
  }
  const legend = [
    mask.includes(DIGIT) && `${DIGIT} = dígito`,
    mask.includes(LETTER) && `${LETTER} = letra`,
  ].filter(Boolean);
  return legend.length ? `${mask} (${legend.join(", ")})` : mask;
};

/** Texto legible del valor requerido por una faceta. */
export const formatRequired = (required: unknown): string => {
  if (required === undefined || required === null) return "—";
  if (typeof required !== "object") return String(required);
  const { type, parameter } = required as { type: string; parameter: any };
  switch (type) {
    case "simple":
      return String(parameter);
    case "enumeration":
      return `uno de: ${(parameter as unknown[]).join(", ")}`;
    case "pattern": {
      let pattern = String(parameter);
      if (pattern.startsWith(ANCHOR_START) && pattern.endsWith(ANCHOR_END)) {
        pattern = pattern.slice(ANCHOR_START.length, -ANCHOR_END.length);
      }
      const mask = patternToMask(pattern);
      if (mask) return `formato ${mask}`;
      return `que cumpla el patrón ${pattern}`;
    }
    case "bounds": {
      const { min, max, minInclusive, maxInclusive } = parameter;
      const parts: string[] = [];
      if (min !== undefined) parts.push(`${minInclusive ? "≥" : ">"} ${min}`);
      if (max !== undefined) parts.push(`${maxInclusive ? "≤" : "<"} ${max}`);
      return parts.join(" y ");
    }
    case "length": {
      const { length, min, max } = parameter;
      if (length !== undefined) return `longitud ${length}`;
      const parts: string[] = [];
      if (min !== undefined) parts.push(`longitud ≥ ${min}`);
      if (max !== undefined) parts.push(`longitud ≤ ${max}`);
      return parts.join(" y ");
    }
    default:
      return JSON.stringify(parameter);
  }
};

const formatCurrent = (value: unknown) =>
  value === undefined || value === null || value === "" ? "(sin valor)" : String(value);

/** Lee la cabecera <info> y comprueba que el XML sea un IDS bien formado. */
const readIdsHeader = (xml: string): IdsInfo => {
  if (typeof DOMParser === "undefined") return { title: "" };
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new IdsValidationError(
      "El archivo no es un XML válido (está dañado o incompleto).",
    );
  }
  const root = doc.documentElement;
  if (!root || root.localName !== "ids") {
    throw new IdsValidationError(
      `El archivo no es un IDS: su elemento raíz es <${root?.localName ?? "?"}> y debería ser <ids>.`,
    );
  }
  const text = (tag: string) => {
    const info = root.getElementsByTagNameNS("*", "info")[0];
    const el = info?.getElementsByTagNameNS("*", tag)[0];
    return el?.textContent?.trim() || undefined;
  };
  return {
    title: text("title") ?? "",
    author: text("author"),
    date: text("date"),
    version: text("version"),
    description: text("description"),
  };
};

const PARAMETER_FIELDS = ["name", "predefinedType", "value", "propertySet", "baseName", "system"];

/** Ancla los patrones (semántica XSD: el patrón debe cubrir todo el valor). */
const anchorPatterns = (facet: OBC.IDSFacet) => {
  const record = facet as unknown as Record<string, FacetParameter>;
  for (const field of PARAMETER_FIELDS) {
    const parameter = record[field];
    if (parameter?.type !== "pattern") continue;
    const pattern = String(parameter.parameter);
    if (pattern.startsWith(ANCHOR_START)) continue;
    parameter.parameter = `${ANCHOR_START}${pattern}${ANCHOR_END}`;
  }
};

/** Motivo por el que el motor no puede evaluar la especificación, si lo hay. */
const unsupportedReason = (spec: OBC.IDSSpecification): string | undefined => {
  const reasons = new Set<string>();
  for (const facet of spec.applicability) {
    if (["Classification", "PartOf", "Attribute"].includes(facet.facetType)) {
      reasons.add(`${facetLabel(facet.facetType)} como condición de aplicabilidad`);
    }
  }
  for (const facet of spec.requirements) {
    if (["Classification", "PartOf"].includes(facet.facetType)) {
      reasons.add(`${facetLabel(facet.facetType)} como requisito`);
    }
  }
  if (reasons.size) {
    return `El verificador aún no soporta: ${[...reasons].join(", ")}.`;
  }
  if (spec.applicability.size === 0) {
    return "La especificación no define a qué elementos aplica.";
  }
  if (spec.requirements.size === 0) {
    return "La especificación no tiene requisitos que verificar.";
  }
  return undefined;
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const readModelSchemas = async (components: OBC.Components) => {
  const fragments = components.get(OBC.FragmentsManager);
  const schemas = new Map<string, string>();
  for (const [modelId, model] of fragments.list) {
    let schema = "";
    try {
      const metadata = (await model.getMetadata()) as { schema?: string };
      schema = String(metadata?.schema ?? "").toUpperCase();
    } catch {
      // Sin metadatos: el esquema queda desconocido y no se filtra por él.
    }
    schemas.set(modelId, schema);
  }
  return schemas;
};

/** Modelos cuyo esquema está entre los que declara la especificación. */
const modelsForSpec = (spec: OBC.IDSSpecification, schemas: Map<string, string>) => {
  const versions = [...spec.ifcVersion].map((v) => String(v).toUpperCase());
  const models: string[] = [];
  for (const [modelId, schema] of schemas) {
    if (!schema || versions.includes(schema)) models.push(modelId);
  }
  return models;
};

/**
 * Carga y valida un archivo IDS contra los modelos del proyecto. Si el IDS no
 * es válido o no corresponde a los modelos cargados, no carga nada y lanza
 * IdsValidationError con un mensaje para el usuario.
 */
export const loadIds = async (
  components: OBC.Components,
  xml: string,
  fileName: string,
): Promise<LoadedIds> => {
  const info = readIdsHeader(xml);
  const manager = components.get(OBC.IDSSpecifications);
  manager.list.clear();

  let specs: OBC.IDSSpecification[];
  try {
    specs = manager.load(xml);
  } catch (error) {
    manager.list.clear();
    console.error("Error al interpretar el IDS", error);
    throw new IdsValidationError(
      "El IDS tiene una estructura que no se pudo interpretar. Revisa que siga el estándar IDS 1.0 de buildingSMART.",
    );
  }
  if (!specs.length) {
    throw new IdsValidationError(
      "El IDS no contiene especificaciones válidas (cada una necesita nombre y versión IFC).",
    );
  }

  const modelSchemas = await readModelSchemas(components);
  if (!modelSchemas.size) {
    manager.list.clear();
    throw new IdsValidationError("Carga al menos un modelo antes de verificar un IDS.");
  }

  const matchesAnyModel = specs.some((spec) => modelsForSpec(spec, modelSchemas).length);
  if (!matchesAnyModel) {
    manager.list.clear();
    const idsVersions = [...new Set(specs.flatMap((s) => [...s.ifcVersion]))].join(", ");
    const modelVersions = [...new Set(modelSchemas.values())].filter(Boolean).join(", ");
    throw new IdsValidationError(
      `El IDS es para ${idsVersions}, pero los modelos cargados son ${modelVersions}. Usa un IDS escrito para el esquema de tus modelos.`,
    );
  }

  for (const spec of specs) {
    for (const facet of spec.applicability) anchorPatterns(facet);
    for (const facet of spec.requirements) anchorPatterns(facet);
  }

  const warnings: string[] = [];
  const unsupported = specs.filter((spec) => unsupportedReason(spec));
  if (unsupported.length) {
    warnings.push(
      `${unsupported.length} de ${specs.length} especificación(es) no se pueden evaluar y se marcarán como "no evaluable".`,
    );
  }

  return { fileName, info, specs, modelSchemas, warnings };
};

const intersect = (a: OBC.ModelIdMap, b: OBC.ModelIdMap): OBC.ModelIdMap => {
  const result: OBC.ModelIdMap = {};
  for (const modelId in a) {
    const other = b[modelId];
    if (!other) continue;
    const ids = new Set([...a[modelId]].filter((id) => other.has(id)));
    if (ids.size) result[modelId] = ids;
  }
  return result;
};

const countItems = (map: OBC.ModelIdMap) =>
  Object.values(map).reduce((sum, ids) => sum + ids.size, 0);

const NAME_CHUNK = 1000;

/** Nombre (atributo Name) de cada elemento que falla, para el informe. */
const fillNames = async (components: OBC.Components, failures: IdsFailure[]) => {
  const fragments = components.get(OBC.FragmentsManager);
  const byModel = new Map<string, IdsFailure[]>();
  for (const failure of failures) {
    const list = byModel.get(failure.modelId) ?? [];
    list.push(failure);
    byModel.set(failure.modelId, list);
  }
  for (const [modelId, list] of byModel) {
    const model = fragments.list.get(modelId);
    if (!model) continue;
    for (let start = 0; start < list.length; start += NAME_CHUNK) {
      const chunk = list.slice(start, start + NAME_CHUNK);
      const data = await model.getItemsData(chunk.map((f) => f.localId), {
        attributesDefault: false,
        attributes: ["Name"],
        relationsDefault: { attributes: false, relations: false },
      });
      data.forEach((item, i) => {
        const name = (item as Record<string, any>)?.Name?.value;
        if (name !== undefined && name !== null) chunk[i].name = String(name);
      });
    }
  }
};

const evaluateSpec = async (
  components: OBC.Components,
  spec: OBC.IDSSpecification,
  schemas: Map<string, string>,
): Promise<IdsSpecResult> => {
  const base: IdsSpecResult = {
    id: spec.identifier,
    name: spec.name,
    description: spec.description,
    instructions: spec.instructions,
    ifcVersions: [...spec.ifcVersion].map(String),
    status: "no-evaluable",
    applicable: 0,
    passed: 0,
    failed: 0,
    pass: {},
    fail: {},
    failures: [],
  };

  const reason = unsupportedReason(spec);
  if (reason) return { ...base, reason };

  const modelIds = modelsForSpec(spec, schemas);
  if (!modelIds.length) {
    const modelVersions = [...new Set(schemas.values())].filter(Boolean).join(", ");
    return {
      ...base,
      status: "no-aplica",
      reason: `Es para ${base.ifcVersions.join(", ")} y los modelos cargados son ${modelVersions}.`,
    };
  }
  const modelRegexes = modelIds.map((id) => new RegExp(`^${escapeRegExp(id)}$`));

  // Aplicabilidad IDS: un elemento aplica si cumple TODAS las facetas.
  let applicable: OBC.ModelIdMap | undefined;
  for (const facet of spec.applicability) {
    const collector: OBC.ModelIdMap = {};
    await facet.getEntities(modelRegexes, collector);
    applicable = applicable ? intersect(applicable, collector) : collector;
  }
  const applicableCount = applicable ? countItems(applicable) : 0;
  if (!applicable || !applicableCount) {
    return {
      ...base,
      status: "no-aplica",
      reason: "Ningún elemento de los modelos cargados cumple las condiciones de aplicabilidad.",
    };
  }

  const collector: OBC.IDSCheckResult = new FRAGS.DataMap();
  for (const requirement of spec.requirements) {
    await requirement.test(applicable, collector, { skipIfFails: false });
  }

  const pass: OBC.ModelIdMap = {};
  const fail: OBC.ModelIdMap = {};
  const failures: IdsFailure[] = [];
  for (const [modelId, items] of collector) {
    for (const [localId, result] of items) {
      if (result.pass) {
        (pass[modelId] ??= new Set()).add(localId);
        continue;
      }
      (fail[modelId] ??= new Set()).add(localId);
      const checks: IdsFailedCheck[] = [];
      for (const facetCheck of result.checks) {
        if (facetCheck.pass) continue;
        for (const check of facetCheck.checks) {
          if (check.pass) continue;
          checks.push({
            facet: facetLabel(facetCheck.facetType),
            parameter: PARAMETER_LABELS[check.parameter ?? ""] ?? String(check.parameter ?? ""),
            currentValue: formatCurrent(check.currentValue),
            requiredValue: formatRequired(check.requiredValue),
          });
        }
      }
      failures.push({ modelId, localId, guid: result.guid, checks });
    }
  }

  await fillNames(components, failures);
  const passed = countItems(pass);
  const failed = countItems(fail);
  return {
    ...base,
    status: failed ? "no-cumple" : "cumple",
    applicable: passed + failed,
    passed,
    failed,
    pass,
    fail,
    failures,
  };
};

/**
 * Evalúa todas las especificaciones del IDS cargado. Si ninguna se pudo
 * aplicar a los modelos, lanza IdsValidationError (el IDS no corresponde).
 */
export const runIds = async (
  components: OBC.Components,
  loaded: LoadedIds,
  onProgress?: (done: number, total: number, specName: string) => void,
): Promise<IdsReport> => {
  const results: IdsSpecResult[] = [];
  for (let i = 0; i < loaded.specs.length; i++) {
    const spec = loaded.specs[i];
    onProgress?.(i, loaded.specs.length, spec.name);
    results.push(await evaluateSpec(components, spec, loaded.modelSchemas));
  }
  onProgress?.(loaded.specs.length, loaded.specs.length, "");

  const evaluated = results.filter((r) => r.status === "cumple" || r.status === "no-cumple");
  if (!evaluated.length) {
    const anyUnsupported = results.some((r) => r.status === "no-evaluable");
    throw new IdsValidationError(
      anyUnsupported && results.every((r) => r.status === "no-evaluable")
        ? "Ninguna especificación de este IDS se puede evaluar con el verificador actual."
        : "Ninguna especificación de este IDS aplica a los elementos de los modelos cargados. Revisa que el IDS corresponda a estos modelos.",
    );
  }

  const evaluatedKeys = new Set<string>();
  const failedKeys = new Set<string>();
  let checksTotal = 0;
  let checksPassed = 0;
  for (const result of evaluated) {
    checksTotal += result.applicable;
    checksPassed += result.passed;
    for (const [modelId, ids] of Object.entries(result.pass)) {
      for (const id of ids) evaluatedKeys.add(`${modelId}|${id}`);
    }
    for (const [modelId, ids] of Object.entries(result.fail)) {
      for (const id of ids) {
        evaluatedKeys.add(`${modelId}|${id}`);
        failedKeys.add(`${modelId}|${id}`);
      }
    }
  }

  return {
    fileName: loaded.fileName,
    info: loaded.info,
    results,
    evaluatedElements: evaluatedKeys.size,
    failedElements: failedKeys.size,
    compliance: checksTotal ? Number(((checksPassed / checksTotal) * 100).toFixed(1)) : 0,
    date: new Date(),
  };
};
