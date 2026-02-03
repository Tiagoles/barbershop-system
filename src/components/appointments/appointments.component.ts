
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-zinc-950 pt-40 px-4 font-sans flex flex-col items-center">
      
      <!-- Header Text -->
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight text-center">
        Meus Agendamentos
      </h1>
      <p class="text-zinc-500 text-lg mb-10 text-center font-light">
        Digite seu telefone para consultar seus horários.
      </p>

      <!-- Search Input Container -->
      <div class="w-full max-w-lg flex gap-3">
        
        <!-- Phone Input -->
        <input 
          type="tel" 
          [(ngModel)]="phoneNumber"
          (keyup.enter)="searchAppointments()"
          placeholder="(00) 00000-0000" 
          class="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all text-lg shadow-inner"
        >
        
        <!-- Search Button -->
        <button 
          (click)="searchAppointments()"
          class="bg-gold-500 hover:bg-gold-600 text-black rounded-lg w-16 flex items-center justify-center transition-all duration-300 shadow-lg shadow-gold-500/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>

      </div>

      <!-- Feedback Area (Mock functionality) -->
      @if (hasSearched) {
        <div class="mt-12 text-center animate-pulse">
          <p class="text-zinc-600 text-sm">Buscando agendamentos para {{ phoneNumber }}...</p>
        </div>
      }

    </div>
  `
})
export class AppointmentsComponent {
  phoneNumber: string = '';
  hasSearched: boolean = false;

  searchAppointments() {
    if (this.phoneNumber.trim()) {
      this.hasSearched = true;
      // TODO: Implementar busca real no backend
      console.log('Buscando agendamentos para:', this.phoneNumber);
    }
  }
}
