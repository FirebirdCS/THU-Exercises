import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as XLSX from "xlsx";
import { appIcons } from "src/index";
import {
  IdsReport,
  IdsSpecResult,
  IdsSpecStatus,
  IdsValidationError,
  LoadedIds,
  loadIds,
  runIds,
} from "src/bim-components/IdsChecker";

export interface IdsPanelState {
  components: OBC.Components;
}

interface IdsUiState {
  /** XML del IDS cargado: se revalida contra los modelos en cada verificación. */
  xml?: string;
  loaded?: LoadedIds;
  report?: IdsReport;
  error?: string;
  busy: boolean;
  progress?: string;
  hideValid: boolean;
  expanded: Set<string>;
  /** Los modelos cambiaron después de verificar: el informe puede no valer. */
  stale: boolean;
}

const FAIL_STYLE = "ids-fail";
const PASS_STYLE = "ids-pass";
const MAX_FAILURES_SHOWN = 100;

const STATUS_LABEL: Record<IdsSpecStatus, string> = {
  cumple: "Cumple",
  "no-cumple": "No cumple",
  "no-evaluable": "No evaluable",
  "no-aplica": "No aplica",
};

const STATUS_CLASS: Record<IdsSpecStatus, string> = {
  cumple: "status-capsule status-capsule--navy",
  "no-cumple": "status-capsule status-capsule--coral",
  "no-evaluable": "status-capsule status-capsule--yellow",
  "no-aplica": "status-capsule status-capsule--muted",
};

// El estado de la UI sobrevive a los re-render y a los cambios de pestaña.
const uiStates = new WeakMap<OBC.Components, IdsUiState>();
const hookedComponents = new WeakSet<OBC.Components>();

const getUiState = (components: OBC.Components) => {
  let state = uiStates.get(components);
  if (!state) {
    state = { busy: false, hideValid: false, expanded: new Set(), stale: false };
    uiStates.set(components, state);
  }
  return state;
};

const pct = (part: number, total: number) =>
  total ? Number(((part / total) * 100).toFixed(1)) : 0;

const ensureHighlightStyles = (components: OBC.Components) => {
  const highlighter = components.get(OBF.Highlighter);
  if (!highlighter.styles.has(FAIL_STYLE)) {
    highlighter.styles.set(FAIL_STYLE, {
      color: new THREE.Color("#EB6241"),
      opacity: 1,
      renderedFaces: 1,
      transparent: false,
    });
  }
  if (!highlighter.styles.has(PASS_STYLE)) {
    highlighter.styles.set(PASS_STYLE, {
      color: new THREE.Color("#202B37"),
      opacity: 1,
      renderedFaces: 1,
      transparent: false,
    });
  }
  return highlighter;
};

const clearIdsHighlights = async (components: OBC.Components) => {
  const highlighter = ensureHighlightStyles(components);
  await highlighter.clear(FAIL_STYLE);
  await highlighter.clear(PASS_STYLE);
};

const sanitizeSheetName = (name: string) =>
  name.replace(/[\\/?*[\]:]/g, "_").slice(0, 31) || "Hoja";

const exportReport = (report: IdsReport) => {
  const summary = report.results.map((r) => ({
    Especificación: r.name,
    Estado: STATUS_LABEL[r.status],
    "Versión IFC": r.ifcVersions.join(", "),
    "Elementos aplicables": r.applicable,
    Cumplen: r.passed,
    "No cumplen": r.failed,
    "%": pct(r.passed, r.applicable),
    Motivo: r.reason ?? "",
    Descripción: r.description ?? "",
    Instrucciones: r.instructions ?? "",
  }));

  const detail: Record<string, string | number>[] = [];
  for (const r of report.results) {
    for (const failure of r.failures) {
      for (const check of failure.checks.length ? failure.checks : [undefined]) {
        detail.push({
          Especificación: r.name,
          Modelo: failure.modelId,
          GUID: failure.guid ?? "",
          Elemento: failure.name ?? "",
          Faceta: check?.facet ?? "",
          Parámetro: check?.parameter ?? "",
          "Valor actual": check?.currentValue ?? "",
          "Valor requerido": check?.requiredValue ?? "",
        });
      }
    }
  }

  const info = [
    { Campo: "IDS", Valor: report.info.title || report.fileName },
    { Campo: "Archivo", Valor: report.fileName },
    { Campo: "Fecha de verificación", Valor: report.date.toLocaleString("es-GT") },
    { Campo: "Cumplimiento (%)", Valor: report.compliance },
    { Campo: "Elementos evaluados", Valor: report.evaluatedElements },
    { Campo: "Elementos con fallos", Valor: report.failedElements },
  ];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(info), "Información");
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(summary), "Resumen");
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.json_to_sheet(detail.length ? detail : [{ Resultado: "Sin fallos" }]),
    "Fallos",
  );
  const stamp = new Date().toISOString().slice(0, 10);
  const base = sanitizeSheetName(report.info.title || report.fileName.replace(/\.(ids|xml)$/i, ""));
  XLSX.writeFile(book, `IDS_${base}_${stamp}.xlsx`);
};

export const idsPanelTemplate: BUI.StatefullComponent<IdsPanelState> = (
  state,
  update,
) => {
  const { components } = state;
  const ui = getUiState(components);
  const rerender = () => update();

  if (!hookedComponents.has(components)) {
    hookedComponents.add(components);
    const fragments = components.get(OBC.FragmentsManager);
    const markStale = () => {
      if (!ui.report) return;
      ui.stale = true;
      rerender();
    };
    fragments.list.onItemSet.add(markStale);
    fragments.list.onItemDeleted.add(markStale);
  }

  const onLoadIds = () => {
    if (ui.busy) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ids,.xml";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      ui.busy = true;
      ui.error = undefined;
      ui.progress = "Validando IDS...";
      ui.loaded = undefined;
      ui.report = undefined;
      ui.expanded.clear();
      ui.stale = false;
      rerender();
      try {
        await clearIdsHighlights(components);
        const xml = await file.text();
        ui.loaded = await loadIds(components, xml, file.name);
        ui.xml = xml;
      } catch (error) {
        ui.loaded = undefined;
        ui.xml = undefined;
        ui.error =
          error instanceof IdsValidationError
            ? error.message
            : "No se pudo leer el archivo IDS.";
        if (!(error instanceof IdsValidationError)) console.error(error);
      } finally {
        ui.busy = false;
        ui.progress = undefined;
        rerender();
      }
    });
    input.click();
  };

  const onVerify = async () => {
    if (ui.busy || !ui.loaded) return;
    ui.busy = true;
    ui.error = undefined;
    ui.report = undefined;
    ui.expanded.clear();
    rerender();
    try {
      await clearIdsHighlights(components);
      // Se revalida contra los modelos actuales (pueden haber cambiado).
      const loaded = ui.xml
        ? await loadIds(components, ui.xml, ui.loaded.fileName)
        : ui.loaded;
      ui.loaded = loaded;
      ui.report = await runIds(components, loaded, (done, total, name) => {
        ui.progress = name
          ? `Verificando ${done + 1}/${total}: ${name}`
          : "Preparando informe...";
        rerender();
      });
      ui.stale = false;
      const failing = ui.report.results.filter((r) => r.status === "no-cumple");
      if (failing.length) {
        const fail = OBC.ModelIdMapUtils.join(failing.map((r) => r.fail));
        await ensureHighlightStyles(components).highlightByID(FAIL_STYLE, fail, true, false);
      }
    } catch (error) {
      ui.report = undefined;
      ui.error =
        error instanceof IdsValidationError
          ? error.message
          : "Ocurrió un error durante la verificación.";
      if (!(error instanceof IdsValidationError)) console.error(error);
    } finally {
      ui.busy = false;
      ui.progress = undefined;
      rerender();
    }
  };

  const onExport = () => {
    if (ui.report) exportReport(ui.report);
  };

  const onClearColors = async () => {
    await clearIdsHighlights(components);
    await components.get(OBC.Hider).set(true);
  };

  const onToggleHideValid = ({ target }: { target: BUI.Checkbox }) => {
    ui.hideValid = target.checked;
    rerender();
  };

  const highlight = async (result: IdsSpecResult, which: "fail" | "pass") => {
    await clearIdsHighlights(components);
    const highlighter = ensureHighlightStyles(components);
    const map = which === "fail" ? result.fail : result.pass;
    if (OBC.ModelIdMapUtils.isEmpty(map)) return;
    await highlighter.highlightByID(which === "fail" ? FAIL_STYLE : PASS_STYLE, map, true, true);
  };

  const isolate = async (result: IdsSpecResult) => {
    if (OBC.ModelIdMapUtils.isEmpty(result.fail)) return;
    await components.get(OBC.Hider).isolate(result.fail);
  };

  const toggleExpanded = (id: string) => {
    if (ui.expanded.has(id)) ui.expanded.delete(id);
    else ui.expanded.add(id);
    rerender();
  };

  const selectElement = async (modelId: string, localId: number) => {
    const highlighter = components.get(OBF.Highlighter);
    await highlighter.highlightByID("select", { [modelId]: new Set([localId]) }, true, true);
  };

  const { loaded, report } = ui;
  const hasReport = Boolean(report);

  const errorBlock = ui.error
    ? BUI.html`<div class="ids-message ids-message--error">${ui.error}</div>`
    : null;

  const staleBlock = ui.stale
    ? BUI.html`<div class="ids-message">Los modelos cambiaron desde la última verificación. Pulsa "Verificar" para actualizar el informe.</div>`
    : null;

  const loadedBlock = loaded
    ? BUI.html`
      <div class="ids-file">
        <span class="ids-file__title">${loaded.info.title || loaded.fileName}</span>
        <span class="ids-file__meta">${loaded.fileName} · ${loaded.specs.length} especificación(es)</span>
        ${loaded.warnings.map((w) => BUI.html`<span class="ids-file__meta">${w}</span>`)}
      </div>`
    : null;

  const progressBlock = ui.busy && ui.progress
    ? BUI.html`<div class="ids-message">${ui.progress}</div>`
    : null;

  const summaryBlock = report
    ? BUI.html`
      <div class="ids-summary">
        <span class=${report.failedElements ? "status-capsule status-capsule--coral" : "status-capsule status-capsule--navy"}>
          ${report.failedElements ? "No cumple" : "Cumple"}
        </span>
        <span class="ids-summary__value">${report.compliance}%</span>
        <span class="ids-file__meta">de cumplimiento · ${report.evaluatedElements} elementos evaluados · ${report.failedElements} con fallos</span>
      </div>`
    : null;

  const specCards = report
    ? report.results
        .filter((r) => !(ui.hideValid && r.status === "cumple"))
        .map((r) => {
          const expanded = ui.expanded.has(r.id);
          const evaluated = r.status === "cumple" || r.status === "no-cumple";
          const failuresList = expanded
            ? BUI.html`
              <div class="ids-failures">
                ${r.failures.slice(0, MAX_FAILURES_SHOWN).map(
                  (f) => BUI.html`
                    <div class="ids-failure" @click=${() => selectElement(f.modelId, f.localId)} title="Seleccionar en el visor">
                      <span class="ids-failure__name">${f.name ?? f.guid ?? f.localId}</span>
                      ${f.checks.map(
                        (c) => BUI.html`<span class="ids-file__meta">${c.parameter}: tiene <strong>${c.currentValue}</strong> · se espera <strong>${c.requiredValue}</strong></span>`,
                      )}
                    </div>`,
                )}
                ${r.failures.length > MAX_FAILURES_SHOWN
                  ? BUI.html`<span class="ids-file__meta">Mostrando ${MAX_FAILURES_SHOWN} de ${r.failures.length}. Exporta el informe para ver todos.</span>`
                  : null}
              </div>`
            : null;
          return BUI.html`
            <div class="ids-spec">
              <div class="ids-spec__header">
                <span class=${STATUS_CLASS[r.status]}>${STATUS_LABEL[r.status]}</span>
                <span class="ids-spec__name">${r.name}</span>
              </div>
              ${evaluated
                ? BUI.html`<span class="ids-file__meta">${r.passed} de ${r.applicable} elementos cumplen (${pct(r.passed, r.applicable)}%)</span>`
                : null}
              ${r.reason ? BUI.html`<span class="ids-file__meta">${r.reason}</span>` : null}
              ${r.description ? BUI.html`<span class="ids-spec__description">${r.description}</span>` : null}
              ${r.instructions && r.failed
                ? BUI.html`<span class="ids-spec__description"><strong>Cómo corregirlo:</strong> ${r.instructions}</span>`
                : null}
              ${evaluated
                ? BUI.html`
                  <div class="ids-spec__actions">
                    ${r.failed
                      ? BUI.html`
                        <bim-button icon=${appIcons.COLORIZE} label="Resaltar fallos" @click=${() => highlight(r, "fail")}></bim-button>
                        <bim-button icon=${appIcons.ISOLATE} label="Aislar fallos" @click=${() => isolate(r)}></bim-button>
                        <bim-button icon=${appIcons.SELECT} label=${expanded ? "Ocultar elementos" : `Ver elementos (${r.failed})`} @click=${() => toggleExpanded(r.id)}></bim-button>`
                      : BUI.html`
                        <bim-button icon=${appIcons.COLORIZE} label="Resaltar elementos" @click=${() => highlight(r, "pass")}></bim-button>`}
                  </div>`
                : null}
              ${failuresList}
            </div>`;
        })
    : null;

  const inactive = (value: boolean) => (value ? "opacity: 0.45; pointer-events: none;" : "");

  return BUI.html`
    <bim-panel-section fixed label="Verificación IDS" icon=${appIcons.IDS}>
      <div class="ids-panel">
        <div class="ids-actions">
          <bim-button icon=${appIcons.UPLOAD} label="Cargar IDS" style=${inactive(ui.busy)} @click=${onLoadIds}></bim-button>
          <bim-button icon=${appIcons.APPLY} label="Verificar" style=${inactive(ui.busy || !loaded)} @click=${onVerify}></bim-button>
          <bim-button icon=${appIcons.EXPORT} label="Exportar" style=${inactive(ui.busy || !hasReport)} @click=${onExport}></bim-button>
          <bim-button icon=${appIcons.CLEAR} label="Limpiar" tooltip-title="Quitar colores y mostrar todo" style=${inactive(ui.busy || !hasReport)} @click=${onClearColors}></bim-button>
        </div>
        ${errorBlock}
        ${loadedBlock}
        ${progressBlock}
        ${staleBlock}
        ${summaryBlock}
        ${report
          ? BUI.html`<bim-checkbox inverted label="Ocultar especificaciones que cumplen" .checked=${ui.hideValid} @change=${onToggleHideValid}></bim-checkbox>`
          : null}
        ${!loaded && !ui.error && !ui.busy
          ? BUI.html`<div class="ids-file__meta">Carga un archivo IDS (.ids) para verificar si los modelos del proyecto tienen la información que se solicita.</div>`
          : null}
        <div class="ids-specs">${specCards}</div>
      </div>
    </bim-panel-section>
  `;
};
