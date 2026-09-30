export class ModalManager {
    constructor() {}
    showModal(id: string, visible: number) {
        const modal = document.getElementById(id) as HTMLDialogElement;
        if (modal) {
            if (visible === 1) {
                modal.showModal();
            } else if (visible === 0) {
                modal.close();
            }
        } else {
            console.warn(`The modal with id ${id} wasn't found`);
        }
    }
    
}


export function formattedDateToDo(date: Date): string {
    if (!date || !(date instanceof Date)) {
        return '';
    }
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        timeZone: 'America/Guatemala'
    }).format(date);
}


export function formattedDateProject(date: Date, options?: Intl.DateTimeFormatOptions): string {
    if (!date || !(date instanceof Date)) {
        return ''; 
    }
    return date.toLocaleDateString('en-US', options);
}

// Colores de marca BIM·CA® aptos para el avatar de proyecto (texto crema
// encima). El amarillo queda fuera: con texto crema no es legible.
const PROJECT_COLORS = ["#202B37", "#EB6241"];

export function selectRandomColor(): string {
    return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}

/**
 * Los proyectos antiguos guardaron en Firebase colores fuera de la paleta
 * (vino, celeste, verde...). Se mapean de forma estable a un color de marca
 * al mostrarlos, sin tocar los datos guardados.
 */
export function brandProjectColor(stored: string | undefined): string {
    const value = (stored ?? "").toUpperCase();
    if (PROJECT_COLORS.includes(value)) return value;
    let hash = 0;
    for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

/**
 * Workaround para un bug de `iconify-icon` (incluido en @thatopen/ui): si el
 * icono se oculta (IntersectionObserver borra el SVG de su shadow root) y luego
 * el elemento se desmonta y se vuelve a montar —lo que ocurre al cambiar de
 * layout en un bim-grid—, el observer nuevo cree que el icono ya está visible
 * y nunca vuelve a renderizar el SVG. Reasignar el atributo `icon` con su mismo
 * valor dispara el re-render interno solo cuando el SVG falta.
 */
export function refreshIcons(root: ParentNode = document.body) {
    // Doble rAF: espera a que lit re-renderice el layout y a que los iconos
    // vuelvan a estar conectados antes de reasignar el atributo.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const nudge = (node: ParentNode) => {
                for (const el of node.querySelectorAll("*")) {
                    if (el.tagName === "ICONIFY-ICON") {
                        const icon = el.getAttribute("icon");
                        if (icon) el.setAttribute("icon", icon);
                    }
                    if (el.shadowRoot) nudge(el.shadowRoot);
                }
            };
            nudge(root);
        });
    });
}

export function parseDateInput(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    // En JS los meses van 0–11
    return new Date(year, month - 1, day);
  }