import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <!-- Card 1: Agendamentos de Hoje -->
      <a routerLink="/admin/agenda" class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between cursor-pointer group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Agendamentos de Hoje</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-600 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">12</p>
          <p class="text-xs text-green-500 font-semibold mt-1">+2 desde ontem</p>
        </div>
        <div class="mt-6 h-20">
          <!-- Simple Line Chart SVG -->
          <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#CA8A04" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#CA8A04" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path d="M 0 30 L 20 25 L 40 28 L 60 20 L 80 15 L 100 10" fill="none" stroke="#CA8A04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 0 40 L 0 30 L 20 25 L 40 28 L 60 20 L 80 15 L 100 10 L 100 40 Z" fill="url(#goldGradient)"/>
          </svg>
        </div>
      </a>

      <!-- Card 2: Faturamento do Dia -->
      <a routerLink="/admin/financeiro" class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between cursor-pointer group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Faturamento do Dia</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-600 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">{{ 650 | currency:'BRL' }}</p>
          <p class="text-xs text-zinc-500 font-medium mt-1">Meta de {{ 800 | currency:'BRL' }}</p>
        </div>
        <div class="mt-6 h-20 flex items-end">
          <!-- Simple Bar Chart / Progress Bar -->
          <div class="w-full bg-zinc-800 rounded-full h-2.5">
            <div class="bg-yellow-500 h-2.5 rounded-full" [style.width]="(650/800 * 100) + '%'"></div>
          </div>
        </div>
      </a>

      <!-- Card 3: Novos Clientes -->
      <a routerLink="/admin/clientes" class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between cursor-pointer group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Novos Clientes</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-600 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">4</p>
          <p class="text-xs text-zinc-500 font-medium mt-1">Na última semana</p>
        </div>
        <div class="mt-6 h-20 flex items-end gap-2">
          <!-- Simple Bar Chart -->
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 40%"></div>
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 60%"></div>
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 30%"></div>
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 80%"></div>
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 50%"></div>
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 70%"></div>
          <div class="w-full bg-yellow-500/20 rounded-t-sm" style="height: 100%"></div>
        </div>
      </a>

      <!-- Card 4: Serviços Realizados -->
      <a routerLink="/admin/servicos-historico" class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between cursor-pointer group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Serviços Realizados</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-600 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118 7.5 7.5 0 0 0 10.569 0 2.25 2.25 0 0 1-2.475-2.118 3 3 0 0 0-5.78-1.128Zm-2.53-2.122a3 3 0 0 0 .7-2.903 2.25 2.25 0 0 1 4.5 0 3 3 0 0 0 .7 2.903m10.038 0a3 3 0 0 0 .7-2.903 2.25 2.25 0 0 1 4.5 0 3 3 0 0 0 .7 2.903m-4.59-4.87a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118 7.5 7.5 0 0 0 10.569 0 2.25 2.25 0 0 1-2.475-2.118 3 3 0 0 0-5.78-1.128Z" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">21</p>
          <p class="text-xs text-zinc-500 font-medium mt-1">"Corte" é o mais popular</p>
        </div>
        <div class="mt-6 h-20 flex items-center justify-center">
          <!-- Simple Donut Chart -->
          <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-zinc-800" />
            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-yellow-500"
              stroke-dasharray="60, 100" 
              stroke-linecap="round" />
            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-yellow-700"
              stroke-dasharray="30, 100" 
              stroke-dashoffset="-60"
              stroke-linecap="round" />
          </svg>
        </div>
      </a>

    </div>
  `
})
export class DashboardComponent {}
