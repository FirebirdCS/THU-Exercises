import * as React from "react";
import * as OBC from "@thatopen/components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { appIcons } from "@icons";
import {
  AuditError,
  CANCELLED,
  ModelAuditResult,
  auditModelFile,
  createAuditEngine,
  exportAuditToXlsx,
} from "./batch-audit";

type FileStatus = "pendiente" | "procesando" | "completado" | "error" | "cancelado";

interface AuditFile {
  file: File;
  status: FileStatus;
  stage?: string;
  done: number;
  total: number;
  result?: ModelAuditResult;
  error?: string;
}

const STATUS_LABEL: Record<FileStatus, string> = {
  pendiente: "Pendiente",
  procesando: "Procesando...",
  completado: "Completado",
  error: "Error",
  cancelado: "Cancelado",
};

// Estado como cápsula de marca (paleta BIM·CA®, sin verdes/rojos ajenos).
const STATUS_CLASS: Record<FileStatus, string> = {
  pendiente: "status-capsule status-capsule--muted",
  procesando: "status-capsule status-capsule--yellow",
  completado: "status-capsule status-capsule--navy",
  error: "status-capsule status-capsule--coral",
  cancelado: "status-capsule status-capsule--muted",
};

const formatSize = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
};

// El atributo `disabled` de bim-button fuerza fondo gris y texto oscuro desde
// su shadow DOM (con !important, no se puede sobrescribir desde fuera). Se
// emula el estado deshabilitado atenuando el botón, que conserva sus colores.
const inactiveStyle = (inactive: boolean): React.CSSProperties =>
  inactive ? { opacity: 0.45, pointerEvents: "none" } : {};

export function AuditPage() {
  const [files, setFiles] = React.useState<AuditFile[]>([]);
  const [running, setRunning] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [filterText, setFilterText] = React.useState("");
  // El motor se crea la primera vez que se inicia una auditoría (visitar la
  // página no cuesta nada) y se libera al salir de ella.
  const engineRef = React.useRef<OBC.Components | null>(null);
  const cancelRef = React.useRef<(() => void) | null>(null);
  const cancelledRef = React.useRef(false);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelledRef.current = true;
      cancelRef.current?.();
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const getEngine = () => {
    if (!engineRef.current) engineRef.current = createAuditEngine();
    return engineRef.current;
  };

  const updateFile = (index: number, patch: Partial<AuditFile>) => {
    if (!mountedRef.current) return;
    setFiles((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  };

  const onPickFiles = () => {
    if (running) return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".ifc,.frag";
    input.addEventListener("change", () => {
      const picked = [...(input.files ?? [])];
      if (!picked.length) return;
      // Agrega al lote existente (sin duplicados); para quitar un archivo
      // está el botón de eliminar de cada fila.
      setFiles((prev) => {
        const next = [...prev];
        for (const file of picked) {
          const duplicated = next.some(
            (entry) =>
              entry.file.name === file.name && entry.file.size === file.size,
          );
          if (duplicated) continue;
          next.push({ file, status: "pendiente", done: 0, total: 0 });
        }
        return next;
      });
    });
    input.click();
  };

  const onRemoveFile = (index: number) => {
    if (running) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onStart = async () => {
    if (running || !files.length) return;
    const batch = files.map((entry) => entry.file);
    setRunning(true);
    setCancelling(false);
    cancelledRef.current = false;
    const cancelled = new Promise<void>((resolve) => {
      cancelRef.current = resolve;
    });

    // Reinicia estados por si se relanza el mismo lote.
    setFiles((prev) =>
      prev.map((entry) => ({
        file: entry.file,
        status: "pendiente" as FileStatus,
        done: 0,
        total: 0,
      })),
    );

    const filter = filterText
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);

    const components = getEngine();
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < batch.length; i++) {
      if (!mountedRef.current) return;
      if (cancelledRef.current) {
        updateFile(i, { status: "cancelado" });
        continue;
      }
      updateFile(i, { status: "procesando", stage: undefined });
      try {
        const result = await auditModelFile(components, batch[i], {
          filter: filter.length ? filter : undefined,
          onStage: (stage) => updateFile(i, { stage }),
          onProgress: (done, total) =>
            updateFile(i, { stage: undefined, done, total }),
          cancelled,
        });
        updateFile(i, { status: "completado", stage: undefined, result });
        completed++;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === CANCELLED) {
          updateFile(i, { status: "cancelado", stage: undefined });
        } else {
          console.error(`Error al auditar "${batch[i].name}"`, e);
          updateFile(i, { status: "error", stage: undefined, error: message });
          failed++;
        }
      }
    }

    cancelRef.current = null;
    if (!mountedRef.current) return;
    setRunning(false);
    setCancelling(false);
    if (cancelledRef.current) {
      toast.info(
        completed
          ? `Auditoría cancelada. ${completed} modelo(s) alcanzaron a completarse y se pueden descargar.`
          : "Auditoría cancelada.",
      );
    } else if (completed) {
      toast.success(
        failed
          ? `Auditoría completada: ${completed} modelo(s), ${failed} con error.`
          : `Auditoría completada: ${completed} modelo(s).`,
      );
    } else if (failed) {
      toast.error("Ningún modelo se pudo auditar.");
    }
  };

  const onCancel = () => {
    if (!running || cancelledRef.current) return;
    cancelledRef.current = true;
    setCancelling(true);
    cancelRef.current?.();
  };

  const onDownload = () => {
    const results = files
      .map((entry) => entry.result)
      .filter((r): r is ModelAuditResult => Boolean(r));
    if (!results.length) return;
    const errors: AuditError[] = files
      .filter((entry) => entry.status === "error")
      .map((entry) => ({
        model: entry.file.name,
        error: entry.error ?? "Error desconocido",
      }));
    exportAuditToXlsx(results, errors);
  };

  const hasResults = files.some((entry) => entry.result);

  const fileRows = files.map((entry, index) => {
    let detail = "";
    if (entry.status === "procesando") {
      detail = entry.stage
        ? ` — ${entry.stage}`
        : entry.total
          ? ` — ${entry.done}/${entry.total} elementos`
          : "";
    } else if (entry.status === "completado" && entry.result) {
      detail = ` — ${entry.result.total} elementos, ${entry.result.coverage.size} propiedades`;
    } else if (entry.status === "error" && entry.error) {
      detail = ` — ${entry.error}`;
    }
    return (
      <div
        key={`${entry.file.name}-${entry.file.size}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.5rem 0.75rem",
          borderBottom: "1px solid var(--bim-ui_bg-contrast-20)",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.file.name}
          <span style={{ color: "var(--bim-ui_bg-contrast-60)", marginLeft: "0.5rem" }}>
            {formatSize(entry.file.size)}
          </span>
        </span>
        <span style={{ color: "var(--gris-texto)", whiteSpace: "nowrap" }}>
          {detail.replace(/^ — /, "")}
        </span>
        <span className={STATUS_CLASS[entry.status]}>
          {STATUS_LABEL[entry.status].replace("...", "")}
        </span>
        <bim-button
          onclick={() => onRemoveFile(index)}
          icon={appIcons.DELETE}
          tooltip-text="Quitar de la lista"
          style={{ flex: "0 0 auto", ...inactiveStyle(running) }}
        ></bim-button>
      </div>
    );
  });

  return (
    <div className="page" id="audit-page">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
      />
      <header>
        <bim-label style={{ fontSize: "1.3rem", color: "var(--azul)" }}>
          Auditoría por lotes
        </bim-label>
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <bim-button
            onclick={onPickFiles}
            icon={appIcons.ADD}
            label="Seleccionar archivos"
            style={inactiveStyle(running)}
          ></bim-button>
          {running ? (
            <bim-button
              key="cancel"
              onclick={onCancel}
              icon={appIcons.CLEAR}
              label={cancelling ? "Cancelando..." : "Cancelar"}
              style={inactiveStyle(cancelling)}
            ></bim-button>
          ) : (
            <bim-button
              key="start"
              onclick={onStart}
              icon={appIcons.AUDIT}
              label="Iniciar auditoría"
              style={inactiveStyle(!files.length)}
            ></bim-button>
          )}
          <bim-button
            onclick={onDownload}
            icon={appIcons.EXPORT}
            label="Descargar informe"
            style={inactiveStyle(!hasResults || running)}
          ></bim-button>
        </div>
      </header>

      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <bim-label style={{ whiteSpace: "normal" }}>
          Mide qué porcentaje de elementos tiene cada propiedad, por modelo y
          en total.
        </bim-label>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", maxWidth: "40rem" }}>
          <bim-label style={{ whiteSpace: "nowrap" }}>Solo propiedades que contengan:</bim-label>
          <bim-text-input
            placeholder="ej. EDAR_, FireRating (vacío = todas)"
            value={filterText}
            oninput={(e: Event) =>
              setFilterText((e.target as HTMLInputElement).value ?? "")
            }
            style={{ flex: 1, ...inactiveStyle(running) }}
          ></bim-text-input>
        </div>

        {files.length ? (
          <div
            style={{
              border: "1px solid var(--bim-ui_bg-contrast-20)",
              borderRadius: "0.5rem",
              overflow: "hidden",
            }}
          >
            {fileRows}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 0 }}>
            <h4>Sin archivos en el lote</h4>
            <p>Selecciona archivos .ifc o .frag para comenzar la auditoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}
