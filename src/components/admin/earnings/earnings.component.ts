import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

// --- Interfaces ---
interface ServiceRecord {
  id: number;
  serviceName: string;
  price: number;
  date: Date;
}

interface ProfessionalEarning {
  id: number;
  name: string;
  avatar: string;
  commissionRate: number; // percentage
  services: ServiceRecord[];
}

// --- Component ---
@Component({
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Comissão & Ganhos da Equipe</h1>
        <p class="text-zinc-400 mt-1">Acompanhe o desempenho financeiro do seu time.</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Commissions -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400">Total de Comissões</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-600"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">{{ summaryData().totalCommission | currency:'BRL' }}</p>
        </div>
        <!-- Total Revenue -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
           <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400">Faturamento da Equipe</h3>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-600"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">{{ summaryData().totalRevenue | currency:'BRL' }}</p>
        </div>
        <!-- Top Performer -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
           <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-zinc-400">Maior Faturamento</h3>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-zinc-600"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 1 0 0-13.5h9a9.75 9.75 0 1 0 0 13.5ZM10.5 6.75h.008v.008h-.008V6.75ZM12 9.75h.008v.008H12V9.75Zm.008 3h-.008v.008h.008v-.008Zm-3 0h.008v.008h-.008v-.008h-.008v.008h.008v-.008Zm-3 0h.008v.008H9V12.75Zm3 3h.008v.008H12V15.75Z" /></svg>
          </div>
          <p class="text-3xl font-bold text-white">{{ summaryData().topPerformer?.name }}</p>
          <p class="text-sm text-green-400 font-semibold">{{ summaryData().topPerformer?.totalRevenue | currency:'BRL' }}</p>
        </div>
      </div>
      
      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-3 bg-zinc-950 p-6 rounded-lg border border-zinc-800">
           <h2 class="text-lg font-bold text-white mb-6">Faturamento por Profissional</h2>
           <div class="flex items-end gap-4 h-64">
             @for (prof of professionalStats(); track prof.id) {
               <div class="flex-1 flex flex-col items-center gap-2">
                 <div class="w-full h-full flex items-end">
                   <div class="w-full bg-yellow-500/20 hover:bg-yellow-500/40 rounded-t-md transition-colors" [style.height]="prof.revenuePercentage + '%'"></div>
                 </div>
                 <span class="text-xs font-medium text-zinc-400">{{ prof.name }}</span>
               </div>
             }
           </div>
        </div>
        <!-- Commission Chart -->
        <div class="lg:col-span-2 bg-zinc-950 p-6 rounded-lg border border-zinc-800">
           <h2 class="text-lg font-bold text-white mb-6">Distribuição de Comissões</h2>
            <div class="space-y-4">
              @for (prof of professionalStats(); track prof.id) {
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-white">{{ prof.name }}</span>
                    <span class="text-sm font-bold text-green-400">{{ prof.totalCommission | currency:'BRL' }}</span>
                  </div>
                  <div class="w-full bg-zinc-800 rounded-full h-2.5">
                    <div class="bg-green-500 h-2.5 rounded-full" [style.width]="prof.commissionPercentage + '%'"></div>
                  </div>
                </div>
              }
            </div>
        </div>
      </div>

      <!-- Professionals Table -->
      <div class="bg-zinc-950 rounded-lg border border-zinc-800">
        <table class="w-full text-sm text-left text-zinc-400">
          <thead class="text-xs text-zinc-500 uppercase bg-zinc-900">
            <tr>
              <th scope="col" class="px-6 py-3">Profissional</th>
              <th scope="col" class="px-6 py-3 text-center">Comissão</th>
              <th scope="col" class="px-6 py-3">Faturamento Total</th>
              <th scope="col" class="px-6 py-3">Comissão a Receber</th>
              <th scope="col" class="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (prof of professionalStats(); track prof.id) {
              <tr class="border-b border-zinc-800 hover:bg-zinc-900">
                <td class="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-3">
                  <img [src]="prof.avatar" [alt]="prof.name" class="w-10 h-10 rounded-full">
                  {{ prof.name }}
                </td>
                <td class="px-6 py-4 text-center">{{ prof.commissionRate }}%</td>
                <td class="px-6 py-4">{{ prof.totalRevenue | currency:'BRL' }}</td>
                <td class="px-6 py-4 font-semibold text-green-400">{{ prof.totalCommission | currency:'BRL' }}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="viewDetails(prof.id)" class="font-medium text-yellow-500 hover:text-yellow-400">Ver Extrato</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    @if (selectedProfessional(); as professional) {
       <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex justify-between items-start p-6 border-b border-zinc-800">
            <div class="flex items-center gap-4">
              <img [src]="professional.avatar" [alt]="professional.name" class="w-14 h-14 rounded-full">
              <div>
                <h2 class="text-xl font-bold text-white">Extrato de {{ professional.name }}</h2>
                <p class="text-sm text-zinc-400">Comissão a receber: <span class="font-bold text-green-400">{{ professional.totalCommission | currency:'BRL' }}</span></p>
              </div>
            </div>
            <button (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <!-- Body -->
          <div class="p-6 max-h-[60vh] overflow-y-auto">
            <table class="w-full text-sm text-left text-zinc-400">
              <thead class="text-xs text-zinc-500 uppercase bg-zinc-900 sticky top-0">
                <tr>
                  <th scope="col" class="px-4 py-3">Serviço</th>
                  <th scope="col" class="px-4 py-3">Data</th>
                  <th scope="col" class="px-4 py-3">Valor</th>
                  <th scope="col" class="px-4 py-3">Comissão</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                @for (service of professional.services; track service.id) {
                  <tr>
                    <td class="px-4 py-3 font-medium text-white">{{ service.serviceName }}</td>
                    <td class="px-4 py-3">{{ service.date | date:'dd/MM/yyyy' }}</td>
                    <td class="px-4 py-3">{{ service.price | currency:'BRL' }}</td>
                    <td class="px-4 py-3 font-semibold text-green-400">{{ (service.price * professional.commissionRate / 100) | currency:'BRL' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
       </div>
    }
  `
})
export class EarningsComponent implements OnInit {
  
  private professionalData = signal<ProfessionalEarning[]>([]);
  selectedProfessionalId = signal<number | null>(null);

  professionalStats = computed(() => {
    return this.professionalData().map(prof => {
      const totalRevenue = prof.services.reduce((acc, s) => acc + s.price, 0);
      const totalCommission = totalRevenue * (prof.commissionRate / 100);
      return {
        ...prof,
        totalRevenue,
        totalCommission
      };
    });
  });
  
  summaryData = computed(() => {
    const stats = this.professionalStats();
    const totalRevenue = stats.reduce((acc, prof) => acc + prof.totalRevenue, 0);
    const totalCommission = stats.reduce((acc, prof) => acc + prof.totalCommission, 0);
    const topPerformer = [...stats].sort((a,b) => b.totalRevenue - a.totalRevenue)[0] || null;

    // Add percentages for charts
    this.professionalStats().forEach(prof => {
        (prof as any).revenuePercentage = totalRevenue > 0 ? (prof.totalRevenue / totalRevenue) * 100 : 0;
        (prof as any).commissionPercentage = totalCommission > 0 ? (prof.totalCommission / totalCommission) * 100 : 0;
    });

    return { totalRevenue, totalCommission, topPerformer };
  });

  selectedProfessional = computed(() => {
    const id = this.selectedProfessionalId();
    if (id === null) return null;
    return this.professionalStats().find(p => p.id === id) || null;
  });

  ngOnInit(): void {
    this.professionalData.set([
      { 
        id: 1, name: 'Bruno', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', commissionRate: 50,
        services: [
          {id: 101, serviceName: 'Corte de Cabelo', price: 50, date: new Date()},
          {id: 102, serviceName: 'Combo AGM', price: 80, date: new Date()},
          {id: 103, serviceName: 'Corte de Cabelo', price: 50, date: new Date()},
        ]
      },
      { 
        id: 2, name: 'Carlos', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', commissionRate: 45,
        services: [
           {id: 201, serviceName: 'Barba Completa', price: 40, date: new Date()},
           {id: 202, serviceName: 'Corte de Cabelo', price: 50, date: new Date()},
        ]
      },
      { 
        id: 3, name: 'Gabriel', avatar: 'https://randomuser.me/api/portraits/men/86.jpg', commissionRate: 55,
        services: [
            {id: 301, serviceName: 'Combo AGM', price: 80, date: new Date()},
            {id: 302, serviceName: 'Combo AGM', price: 80, date: new Date()},
            {id: 303, serviceName: 'Selagem Capilar', price: 90, date: new Date()},
        ]
      },
    ]);
  }

  viewDetails(id: number) {
    this.selectedProfessionalId.set(id);
  }

  closeModal() {
    this.selectedProfessionalId.set(null);
  }
}
