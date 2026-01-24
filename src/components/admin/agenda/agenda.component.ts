import { Component, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

// Interfaces
interface Appointment {
  id: number;
  clientName: string;
  service: string;
  professional: string;
  dateTime: Date;
  duration: number; // in minutes
  status: 'marcado' | 'confirmado' | 'cancelado' | 'concluido';
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="flex flex-col h-full">
      
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button (click)="toggleFilters()" class="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
            Filtros
          </button>
        </div>
        <a routerLink="/booking" class="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-lg text-sm text-center">
          Novo Agendamento
        </a>
      </div>

      <!-- Filters Section -->
      @if (isFilterOpen()) {
        <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Filter selects remain the same -->
           <div>
            <label class="text-xs font-semibold text-zinc-400">Profissional</label>
            <select class="w-full mt-1 bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
              <option>Todos</option>
              <option>Bruno</option>
              <option>Carlos</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-zinc-400">Serviço</label>
            <select class="w-full mt-1 bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
              <option>Todos</option>
              <option>Corte</option>
              <option>Barba</option>
              <option>Combo</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-zinc-400">Status</label>
            <select class="w-full mt-1 bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
              <option>Todos</option>
              <option>Marcado</option>
              <option>Confirmado</option>
              <option>Cancelado</option>
              <option>Concluído</option>
            </select>
          </div>
        </div>
      }

      <!-- Calendar -->
      <div class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between p-4 border-b border-zinc-800">
          <button (click)="changeMonth(-1)" class="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>
          <h2 class="text-lg font-bold text-white uppercase tracking-wider">
            {{ currentDate() | date:'MMMM yyyy' }}
          </h2>
          <button (click)="changeMonth(1)" class="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 flex-1">
          <!-- Day Headers -->
          @for (day of weekDays; track day) {
            <div class="text-center py-3 text-xs font-bold text-zinc-500 uppercase border-b border-r border-zinc-800">
              {{ day }}
            </div>
          }
          <!-- Calendar Days -->
          @for (day of calendarDays(); track day.date) {
            <div class="relative p-2 border-b border-r border-zinc-800" [class.bg-zinc-900]="!day.isCurrentMonth">
              <span class="text-sm font-semibold" 
                    [class.text-zinc-600]="!day.isCurrentMonth"
                    [class.text-white]="day.isCurrentMonth"
                    [class.bg-yellow-500]="day.isToday"
                    [class.text-black]="day.isToday"
                    [class.rounded-full]="day.isToday"
                    [class.w-7]="day.isToday"
                    [class.h-7]="day.isToday"
                    [class.inline-flex]="day.isToday"
                    [class.items-center]="day.isToday"
                    [class.justify-center]="day.isToday">
                {{ day.dayOfMonth }}
              </span>

              <!-- Appointments -->
              <div class="mt-1 space-y-1">
                @for(appointment of getAppointmentsForDay(day.date); track appointment.id) {
                  <div (click)="viewAppointment(appointment)" class="p-1.5 rounded-md text-xs cursor-pointer" [ngClass]="getStatusClasses(appointment.status).card">
                     <p class="font-bold truncate" [ngClass]="getStatusClasses(appointment.status).text">{{ appointment.clientName }}</p>
                     <p class="text-xs" [ngClass]="getStatusClasses(appointment.status).textOp">{{ appointment.dateTime | date:'HH:mm' }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Appointment Detail Modal -->
    @if (selectedAppointment(); as appointment) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ appointment.clientName }}</h2>
              <p class="text-zinc-400">{{ appointment.service }}</p>
            </div>
            <button (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="space-y-4 text-zinc-300">
            <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-zinc-500"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" /></svg> <span>{{ appointment.dateTime | date:'fullDate' }}</span></div>
            <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-zinc-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> <span>{{ appointment.dateTime | date:'HH:mm' }} ({{ appointment.duration }} min)</span></div>
            <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-zinc-500"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> <span>{{ appointment.professional }}</span></div>
            <div class="flex items-center gap-2 text-sm font-medium" [ngClass]="getStatusClasses(appointment.status).text">
              <div class="w-2.5 h-2.5 rounded-full" [ngClass]="getStatusClasses(appointment.status).dot"></div>
              <span>{{ appointment.status | titlecase }}</span>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-end gap-4">
             <button class="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Cancelar Agendamento</button>
             <button class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors">Confirmar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AgendaComponent {
  isFilterOpen = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  currentDate = signal(new Date());

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  appointments: Appointment[] = (() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    return [
      { id: 1, clientName: 'João Silva', service: 'Corte', professional: 'Bruno', dateTime: new Date(currentYear, currentMonth, currentDay, 10, 0), duration: 45, status: 'confirmado' },
      { id: 2, clientName: 'Carlos Pereira', service: 'Combo AGM', professional: 'Gabriel', dateTime: new Date(currentYear, currentMonth, currentDay + 2, 11, 30), duration: 75, status: 'marcado' },
      { id: 3, clientName: 'Ana Costa', service: 'Barba', professional: 'Carlos', dateTime: new Date(currentYear, currentMonth, currentDay + 2, 14, 0), duration: 30, status: 'concluido' },
      { id: 4, clientName: 'Pedro Martins', service: 'Corte', professional: 'Bruno', dateTime: new Date(currentYear, currentMonth, currentDay + 3, 16, 30), duration: 45, status: 'cancelado' },
      { id: 5, clientName: 'Lucas Almeida', service: 'Corte', professional: 'Gabriel', dateTime: new Date(currentYear, currentMonth, currentDay, 15, 0), duration: 45, status: 'marcado' },
    ];
  })();

  calendarDays = computed<CalendarDay[]>(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const days: CalendarDay[] = [];

    // Days from previous month
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek; i > 0; i--) {
      const day = lastDayOfPrevMonth - i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        dayOfMonth: day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString(),
      });
    }

    // Days from next month
    const remainingCells = 42 - days.length; // Ensure 6 rows for consistent layout
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        dayOfMonth: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  });

  toggleFilters() {
    this.isFilterOpen.update(v => !v);
  }

  changeMonth(offset: number) {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  }
  
  getAppointmentsForDay(date: Date): Appointment[] {
    return this.appointments.filter(a => a.dateTime.toDateString() === date.toDateString())
      .sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  viewAppointment(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
  }
  
  closeModal() {
    this.selectedAppointment.set(null);
  }

  getStatusClasses(status: Appointment['status']) {
    switch (status) {
      case 'confirmado':
        return { card: 'bg-green-800/40 hover:bg-green-800/60', text: 'text-green-300', textOp: 'text-green-300/70', dot: 'bg-green-400' };
      case 'marcado':
        return { card: 'bg-yellow-800/40 hover:bg-yellow-800/60', text: 'text-yellow-300', textOp: 'text-yellow-300/70', dot: 'bg-yellow-400' };
      case 'cancelado':
        return { card: 'bg-red-800/40 hover:bg-red-800/60', text: 'text-red-300', textOp: 'text-red-300/70', dot: 'bg-red-400' };
      case 'concluido':
        return { card: 'bg-zinc-700/40 hover:bg-zinc-700/60', text: 'text-zinc-300', textOp: 'text-zinc-300/70', dot: 'bg-zinc-400' };
      default:
        return { card: 'bg-zinc-700/40 hover:bg-zinc-700/60', text: 'text-zinc-300', textOp: 'text-zinc-300/70', dot: 'bg-zinc-400' };
    }
  }
}
