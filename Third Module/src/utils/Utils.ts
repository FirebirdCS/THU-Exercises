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


export function formatShortDate(date: Date): string {
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


export function getFormattedDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    if (!date || !(date instanceof Date)) {
        return ''; 
    }
    return date.toLocaleDateString('en-US', options);
}

export function selectRandomColor(): string {
    const colors = ["#212B37", "#EF6337", "#781239", "#3b95bf", "#48bf3b"];
    return colors[Math.floor(Math.random() * colors.length)];
}
