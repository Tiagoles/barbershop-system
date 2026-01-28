import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ServiceHistoryItem {
  id: number;
  dateTime: Date;
  client: { name: string; phone: string; avatar: string; };
  service: string;
  professional: string;
  value: number;
  status: 'Realizado' | 'Cancelado' | 'Falta';
  notes?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Histórico de Serviços</h1>
        <p class="text-zinc-400 mt-1">Visualize e filtre todos os serviços prestados.</p>
      </div>

      <!-- Filters -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input type="date" class="bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
          <input type="date" class="bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
          <select class="bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
            <option>Todos Profissionais</option>
            <option>Bruno</option>
            <option>Carlos</option>
            <option>Gabriel</option>
          </select>
          <select class="bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
            <option>Todos Serviços</option>
            <option>Corte de Cabelo</option>
            <option>Barba Completa</option>
            <option>Combo AGM</option>
          </select>
          <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar cliente..." class="bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h3 class="text-sm font-medium text-zinc-400 mb-2">Total de Serviços</h3>
          <p class="text-3xl font-bold text-white">{{ summaryData().totalServices }}</p>
        </div>
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h3 class="text-sm font-medium text-zinc-400 mb-2">Faturamento Total</h3>
          <p class="text-3xl font-bold text-white">{{ summaryData().totalRevenue | currency:'BRL' }}</p>
        </div>
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h3 class="text-sm font-medium text-zinc-400 mb-2">Serviço Mais Realizado</h3>
          <p class="text-3xl font-bold text-white">{{ summaryData().topService }}</p>
        </div>
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h3 class="text-sm font-medium text-zinc-400 mb-2">Profissional Destaque</h3>
          <p class="text-3xl font-bold text-white">{{ summaryData().topProfessional }}</p>
        </div>
      </div>

      <!-- History Table -->
      <div class="bg-zinc-950 rounded-lg border border-zinc-800 overflow-x-auto">
        <table class="w-full text-sm text-left text-zinc-400">
          <thead class="text-xs text-zinc-500 uppercase bg-zinc-900">
            <tr>
              <th scope="col" class="px-6 py-3">Data & Hora</th>
              <th scope="col" class="px-6 py-3">Cliente</th>
              <th scope="col" class="px-6 py-3">Serviço</th>
              <th scope="col" class="px-6 py-3">Profissional</th>
              <th scope="col" class="px-6 py-3">Valor</th>
              <th scope="col" class="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredHistory(); track item.id) {
              <tr (click)="viewDetails(item)" class="border-b border-zinc-800 hover:bg-zinc-900 cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap">{{ item.dateTime | date:'dd/MM/yy, HH:mm' }}</td>
                <td class="px-6 py-4 font-medium text-white flex items-center gap-3">
                  <img [src]="item.client.avatar" class="w-8 h-8 rounded-full">
                  {{ item.client.name }}
                </td>
                <td class="px-6 py-4">{{ item.service }}</td>
                <td class="px-6 py-4">{{ item.professional }}</td>
                <td class="px-6 py-4 font-semibold text-yellow-400">{{ item.value | currency:'BRL' }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="px-3 py-1 text-xs font-semibold rounded-full" [ngClass]="getStatusClasses(item.status)">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="text-center py-12 text-zinc-500">Nenhum registro encontrado para os filtros selecionados.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    @if (selectedItem(); as item) {
       <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex justify-between items-start p-6 border-b border-zinc-800">
            <div>
              <h2 class="text-xl font-bold text-white">{{ item.service }}</h2>
              <p class="text-zinc-400">{{ item.dateTime | date:'fullDate' }} às {{ item.dateTime | date:'HH:mm' }}</p>
            </div>
            <button (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <!-- Body -->
          <div class="p-6 space-y-4">
            <div class="bg-zinc-900 p-4 rounded-lg">
              <h3 class="text-xs uppercase text-zinc-500 font-bold mb-2">Cliente</h3>
              <div class="flex items-center gap-3">
                <img [src]="item.client.avatar" class="w-10 h-10 rounded-full">
                <div>
                  <p class="font-semibold text-white">{{ item.client.name }}</p>
                  <p class="text-sm text-zinc-400">{{ item.client.phone }}</p>
                </div>
              </div>
            </div>
            <div class="bg-zinc-900 p-4 rounded-lg">
              <h3 class="text-xs uppercase text-zinc-500 font-bold mb-2">Detalhes</h3>
              <div class="text-sm space-y-2 text-zinc-300">
                <p><strong>Profissional:</strong> {{ item.professional }}</p>
                <p><strong>Valor:</strong> <span class="font-bold text-yellow-400">{{ item.value | currency:'BRL' }}</span></p>
                <p><strong>Status:</strong> <span class="font-semibold" [class.text-green-400]="item.status === 'Realizado'" [class.text-red-400]="item.status === 'Cancelado'" [class.text-yellow-400]="item.status === 'Falta'">{{ item.status }}</span></p>
                @if(item.notes) {
                  <p><strong>Observações:</strong> {{ item.notes }}</p>
                }
              </div>
            </div>
          </div>
        </div>
       </div>
    }
  `
})
export class ServicesHistoryComponent implements OnInit {
  searchTerm = signal('');
  private allHistory = signal<ServiceHistoryItem[]>([]);
  selectedItem = signal<ServiceHistoryItem | null>(null);

  filteredHistory = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.allHistory();
    return this.allHistory().filter(item => 
      item.client.name.toLowerCase().includes(term)
    );
  });

  summaryData = computed(() => {
    const history = this.filteredHistory();
    const realized = history.filter(h => h.status === 'Realizado');
    
    const totalServices = realized.length;
    const totalRevenue = realized.reduce((acc, item) => acc + item.value, 0);

    const serviceCounts = realized.reduce((acc, item) => {
      acc[item.service] = (acc[item.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topService = Object.keys(serviceCounts).sort((a,b) => serviceCounts[b] - serviceCounts[a])[0] || 'N/A';
    
    const profCounts = realized.reduce((acc, item) => {
      acc[item.professional] = (acc[item.professional] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topProfessional = Object.keys(profCounts).sort((a,b) => profCounts[b] - profCounts[a])[0] || 'N/A';
    
    return { totalServices, totalRevenue, topService, topProfessional };
  });

  ngOnInit() {
    this.allHistory.set([
      { id: 1, dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), client: { name: 'Marcos Vinicius', phone: '(27) 99887-6543', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' }, service: 'Corte de Cabelo', professional: 'Bruno', value: 50, status: 'Realizado' },
      { id: 2, dateTime: new Date(new Date().setDate(new Date().getDate() - 1)), client: { name: 'Fernando Lima', phone: '(21) 99123-4567', avatar: 'https://randomuser.me/api/portraits/men/86.jpg' }, service: 'Combo AGM', professional: 'Gabriel', value: 80, status: 'Realizado', notes: 'Cliente pediu para aparar a sobrancelha.' },
      { id: 3, dateTime: new Date(new Date().setDate(new Date().getDate() - 2)), client: { name: 'Juliana Costa', phone: '(11) 98765-4321', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }, service: 'Barba Completa', professional: 'Carlos', value: 40, status: 'Cancelado' },
      { id: 4, dateTime: new Date(new Date().setDate(new Date().getDate() - 2)), client: { name: 'Ricardo Alves', phone: '(31) 98877-1234', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' }, service: 'Corte de Cabelo', professional: 'Bruno', value: 50, status: 'Realizado' },
      { id: 5, dateTime: new Date(new Date().setDate(new Date().getDate() - 3)), client: { name: 'Gabriel Souza', phone: '(51) 98123-9876', avatar: 'https://randomuser.me/api/portraits/men/51.jpg' }, service: 'Combo AGM', professional: 'Gabriel', value: 80, status: 'Falta' },
      { id: 6, dateTime: new Date(new Date().setDate(new Date().getDate() - 3)), client: { name: 'Larissa Andrade', phone: '(61) 99654-3210', avatar: 'https://randomuser.me/api/portraits/women/23.jpg' }, service: 'Corte de Cabelo', professional: 'Carlos', value: 50, status: 'Realizado' },
      { id: 7, dateTime: new Date(new Date().setDate(new Date().getDate() - 4)), client: { name: 'Fernando Lima', phone: '(21) 99123-4567', avatar: 'https://randomuser.me/api/portraits/men/86.jpg' }, service: 'Barba Completa', professional: 'Gabriel', value: 40, status: 'Realizado' },
    ]);
  }
  
  viewDetails(item: ServiceHistoryItem) {
    this.selectedItem.set(item);
  }

  closeModal() {
    this.selectedItem.set(null);
  }

  getStatusClasses(status: ServiceHistoryItem['status']) {
    switch (status) {
      case 'Realizado': return 'bg-green-900/80 text-green-300';
      case 'Cancelado': return 'bg-red-900/80 text-red-300';
      case 'Falta': return 'bg-yellow-900/80 text-yellow-300';
      default: return 'bg-zinc-700 text-zinc-300';
    }
  }
}
