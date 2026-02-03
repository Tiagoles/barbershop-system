import { Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    message: string;
    type: ToastType;
    duration: number;
}

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule], // ✅ aqui precisa mesmo
    template: `
    <div *ngIf="visible()" class="fixed top-4 right-4 z-50 w-80"
         (mouseenter)="pause()" (mouseleave)="resume()">
      <div class="relative overflow-hidden rounded-xl border p-4 shadow-md transition-all duration-300 ease-out
                  hover:scale-[1.03] hover:shadow-xl"
           [ngClass]="containerClass()">
        <button class="absolute top-2 right-2 text-xs font-bold opacity-60 hover:opacity-100 transition"
                (click)="close()">✕</button>
        <p class="text-sm font-medium pr-6 leading-snug">{{ message() }}</p>
        <div class="absolute bottom-0 left-0 w-full h-[3px] bg-black/10">
          <div class="h-full origin-right transition-transform linear"
               [ngClass]="barClass()"
               [style.transform]="'scaleX(' + progress() / 100 + ')'">
          </div>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent implements OnDestroy {
    private currentToast = signal<Toast | null>(null);

    constructor(private toastService: ToastService) {
        // Observa o signal do serviço e exibe o toast quando houver
        effect(() => {
            const toast = this.toastService.currentToast();
            if (toast) {
                this.show(toast.message, toast.type ?? 'info', toast.duration ?? 4000);
            }
        });
    }

    message = computed(() => this.currentToast()?.message || '');
    type = computed(() => this.currentToast()?.type || 'info');
    duration = computed(() => this.currentToast()?.duration || 4000);
    visible = computed(() => !!this.currentToast());

    progress = signal(100);
    private intervalId: any = null;
    private remainingTime = 4000;
    private startTime = 0;

    show(message: string, type: ToastType = 'info', duration = 4000) {
        this.currentToast.set({ message, type, duration });
        this.start();
    }

    start() {
        this.clear();
        this.remainingTime = this.duration();
        this.startTime = Date.now();
        this.progress.set(100);

        this.intervalId = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const percent = 100 - (elapsed / this.remainingTime) * 100;
            this.progress.set(Math.max(percent, 0));

            if (elapsed >= this.remainingTime) {
                this.close();
            }
        }, 50);
    }

    pause() {
        if (!this.intervalId) return;
        clearInterval(this.intervalId);
        this.intervalId = null;
        const elapsed = Date.now() - this.startTime;
        this.remainingTime -= elapsed;
    }

    resume() {
        if (this.intervalId || this.remainingTime <= 0) return;
        this.startTime = Date.now();
        this.intervalId = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const percent = ((this.remainingTime - elapsed) / this.duration()) * 100;
            this.progress.set(Math.max(percent, 0));
            if (elapsed >= this.remainingTime) this.close();
        }, 50);
    }

    close() {
        this.clear();
        this.currentToast.set(null);
        this.progress.set(100);
        // Mantém o estado do serviço sincronizado
        this.toastService.clear();
    }

    clear() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = null;
    }

    ngOnDestroy() {
        this.clear();
    }

    containerClass() {
        return {
            success: 'bg-green-100 text-green-800 border-green-400 dark:bg-green-900/30 dark:text-green-300',
            error: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-900/30 dark:text-red-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300',
            info: 'bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
        }[this.type()];
    }

    barClass() {
        return {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        }[this.type()];
    }
}
