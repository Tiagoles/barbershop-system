import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DashboardData {
  todayAppointments: number;
  todayRevenue: number;
  newClients: number;
  servicesStats: Array<{
    serviceName: string;
    count: number;
  }>;
  totalServices: number;
}

interface AppointmentsData {
  today: number;
  yesterday: number;
  difference: number;
}

interface RevenueData {
  today: number;
  target: number;
  percentage: number;
}

interface NewClientsData {
  week: number;
  period: string;
}

interface ServicesData {
  total: number;
  mostPopular: string;
  breakdown: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'

})
export class DashboardComponent implements OnInit {
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/dashboard';

  appointmentsData$!: Observable<AppointmentsData>;
  revenueData$!: Observable<RevenueData>;
  newClientsData$!: Observable<NewClientsData>;
  servicesData$!: Observable<ServicesData>;

  ngOnInit() {
    this.appointmentsData$ = this.http.get<AppointmentsData>(`${this.apiUrl}/appointments-today`);
    this.revenueData$ = this.http.get<RevenueData>(`${this.apiUrl}/revenue-today`);
    this.newClientsData$ = this.http.get<NewClientsData>(`${this.apiUrl}/new-clients-week`);
    this.servicesData$ = this.http.get<ServicesData>(`${this.apiUrl}/services-performed`);
  }
}
