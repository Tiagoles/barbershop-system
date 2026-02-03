import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvailabilityStatus {
  isOpen: boolean;
  message: string;
  nextOpeningTime: string | null;
  currentDay: string;
  currentTime: string;
  todayHours?: any;
}

export interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'http://localhost:3001/api/availability';
  
  availabilityStatus = signal<AvailabilityStatus | null>(null);
  businessHours = signal<BusinessHours | null>(null);

  constructor(private http: HttpClient) {}

  checkAvailability(): Observable<AvailabilityStatus> {
    return this.http.get<AvailabilityStatus>(`${this.apiUrl}/status`);
  }

  getBusinessHours(): Observable<BusinessHours> {
    return this.http.get<BusinessHours>(`${this.apiUrl}/business-hours`);
  }

  refreshAvailability() {
    this.checkAvailability().subscribe({
      next: (status) => {
        this.availabilityStatus.set(status);
      },
      error: (error) => {
        console.error('Erro ao verificar disponibilidade:', error);
        this.availabilityStatus.set(null);
      }
    });
  }

  refreshBusinessHours() {
    this.getBusinessHours().subscribe({
      next: (hours) => {
        this.businessHours.set(hours);
      },
      error: (error) => {
        console.error('Erro ao carregar horário de atendimento:', error);
        this.businessHours.set(null);
      }
    });
  }

  // Método para inicializar os dados
  initialize() {
    this.refreshAvailability();
    this.refreshBusinessHours();
    
    // Atualizar a cada minuto
    setInterval(() => {
      this.refreshAvailability();
    }, 60000);
  }
}
