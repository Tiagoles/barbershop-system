import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _currentToast = signal<ToastOptions | null>(null);

    get currentToast() {
        return this._currentToast.asReadonly();
    }

    show(options: ToastOptions) {
        this._currentToast.set({ ...options });
    }

    success(message: string, duration = 4000) {
        this.show({ message, type: 'success', duration });
    }

    error(message: string, duration = 4000) {
        this.show({ message, type: 'error', duration });
    }

    warning(message: string, duration = 4000) {
        this.show({ message, type: 'warning', duration });
    }

    info(message: string, duration = 4000) {
        this.show({ message, type: 'info', duration });
    }

    clear() {
        this._currentToast.set(null);
    }
}
