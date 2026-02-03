import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
interface Appointment {
  id: number;
  clientName: string;
  services: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  professional: {
    id: number;
    name: string;
  };
  dateTime: Date;
  duration: number; // in minutes
  status: 'marcado' | 'confirmado' | 'cancelado' | 'concluido';
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
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
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
})
export class AgendaComponent implements OnInit {
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  isFilterOpen = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  currentDate = signal(new Date());
  appointments = signal<Appointment[]>([]);

  // Filters
  selectedProfessional = signal('');
  selectedService = signal('');
  selectedStatus = signal('');

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  professionals$!: Observable<any[]>;
  services$!: Observable<any[]>;

  ngOnInit() {
    this.loadAppointments();
    this.professionals$ = this.http.get<any[]>(`${this.apiUrl}/professionals`);
    this.services$ = this.http.get<any[]>(`${this.apiUrl}/services`);
  }

  loadAppointments() {
    const params = new URLSearchParams();
    if (this.selectedProfessional()) params.append('professionalId', this.selectedProfessional());
    if (this.selectedService()) params.append('serviceId', this.selectedService());
    if (this.selectedStatus()) params.append('status', this.selectedStatus());

    this.http.get<Appointment[]>(`${this.apiUrl}/appointments?${params}`).subscribe({
      next: (appointments) => {
        // Convert dateTime strings to Date objects
        const processedAppointments = appointments.map(apt => ({
          ...apt,
          dateTime: new Date(apt.dateTime)
        }));
        this.appointments.set(processedAppointments);
      },
      error: (error) => {
        console.error('Erro ao carregar agendamentos:', error);
        this.appointments.set([]);
      }
    });
  }

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
    return this.appointments().filter(a => a.dateTime.toDateString() === date.toDateString())
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  viewAppointment(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
  }

  closeModal() {
    this.selectedAppointment.set(null);
  }

  getServicesNames(services: any[]): string {
    return services.map(s => s.name).join(', ');
  }

  confirmAppointment(id: number) {
    this.http.patch(`${this.apiUrl}/appointments/${id}`, { status: 'confirmado' }).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeModal();
      },
      error: (error) => console.error('Erro ao confirmar agendamento:', error)
    });
  }

  cancelAppointment(id: number) {
    this.http.patch(`${this.apiUrl}/appointments/${id}`, { status: 'cancelado' }).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeModal();
      },
      error: (error) => console.error('Erro ao cancelar agendamento:', error)
    });
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
