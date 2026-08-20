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

export function selectRandomColor(): string {
    const colors = ["#212B37", "#EF6337", "#781239", "#3b95bf", "#48bf3b"];
    return colors[Math.floor(Math.random() * colors.length)];
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