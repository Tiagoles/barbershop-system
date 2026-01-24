import { Component, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  visits: number;
  totalSpend: number;
  status: 'Ativo' | 'Inativo';
  memberSince: Date;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-between">
        <div class="relative w-full max-w-sm">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            placeholder="Buscar por nome ou telefone..." 
            class="w-full bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 pl-10 p-2.5 transition-colors">
        </div>
      </div>

      <!-- Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Clients by Visits -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h2 class="text-lg font-bold text-white mb-4">Top Clientes por Visitas</h2>
          <div class="space-y-4">
            @for(client of topClientsByVisits(); track client.id; let i = $index) {
              <div class="flex items-center gap-4">
                <span class="font-bold text-zinc-500 text-sm w-4">{{ i + 1 }}</span>
                <img [src]="client.avatar" [alt]="client.name" class="w-10 h-10 rounded-full">
                <div class="flex-grow">
                  <p class="text-sm font-semibold text-white">{{ client.name }}</p>
                  <div class="w-full bg-zinc-800 rounded-full h-2 mt-1">
                    <div class="bg-yellow-500 h-2 rounded-full" [style.width]="(client.visits / (topClientsByVisits()[0]?.visits || 1) * 100) + '%'"></div>
                  </div>
                </div>
                <span class="font-bold text-white text-sm">{{ client.visits }} visitas</span>
              </div>
            }
          </div>
        </div>

        <!-- Top Clients by Spend -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h2 class="text-lg font-bold text-white mb-4">Top Clientes por Gasto Total</h2>
          <div class="space-y-4">
            @for(client of topClientsBySpend(); track client.id; let i = $index) {
              <div class="flex items-center gap-4">
                <span class="font-bold text-zinc-500 text-sm w-4">{{ i + 1 }}</span>
                <img [src]="client.avatar" [alt]="client.name" class="w-10 h-10 rounded-full">
                <div class="flex-grow">
                  <p class="text-sm font-semibold text-white">{{ client.name }}</p>
                  <div class="w-full bg-zinc-800 rounded-full h-2 mt-1">
                    <div class="bg-green-500 h-2 rounded-full" [style.width]="(client.totalSpend / (topClientsBySpend()[0]?.totalSpend || 1) * 100) + '%'"></div>
                  </div>
                </div>
                <span class="font-bold text-white text-sm">{{ client.totalSpend | currency:'BRL' }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Client List -->
      <div class="bg-zinc-950 rounded-lg border border-zinc-800">
        <div class="p-4 border-b border-zinc-800">
           <h3 class="font-bold text-white">{{ filteredClients().length }} clientes encontrados</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-zinc-400">
            <thead class="text-xs text-zinc-500 uppercase bg-zinc-900">
              <tr>
                <th scope="col" class="px-6 py-3">Cliente</th>
                <th scope="col" class="px-6 py-3">Contato</th>
                <th scope="col" class="px-6 py-3 text-center">Visitas</th>
                <th scope="col" class="px-6 py-3">Gasto Total</th>
                <th scope="col" class="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              @for(client of filteredClients(); track client.id) {
                <tr (click)="viewClient(client)" class="border-b border-zinc-800 hover:bg-zinc-900 cursor-pointer">
                  <th scope="row" class="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-3">
                    <img [src]="client.avatar" [alt]="client.name" class="w-10 h-10 rounded-full">
                    {{ client.name }}
                  </th>
                  <td class="px-6 py-4">{{ client.phone }}</td>
                  <td class="px-6 py-4 text-center">{{ client.visits }}</td>
                  <td class="px-6 py-4 font-semibold text-zinc-200">{{ client.totalSpend | currency:'BRL' }}</td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                          [class.bg-green-900]="client.status === 'Ativo'"
                          [class.text-green-300]="client.status === 'Ativo'"
                          [class.bg-red-900]="client.status === 'Inativo'"
                          [class.text-red-300]="client.status === 'Inativo'">
                      {{ client.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                   <td colspan="5" class="text-center py-10 text-zinc-500">Nenhum cliente encontrado.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Client Detail Modal -->
    @if (selectedClient(); as client) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-4">
              <img [src]="client.avatar" [alt]="client.name" class="w-16 h-16 rounded-full border-2 border-zinc-700">
              <div>
                <h2 class="text-2xl font-bold text-white">{{ client.name }}</h2>
                <p class="text-zinc-400">Cliente desde {{ client.memberSince | date:'dd/MM/yyyy' }}</p>
              </div>
            </div>
            <button (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-300 border-t border-zinc-800 pt-6">
             <div class="space-y-4">
                <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-zinc-500"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg><span>{{ client.phone }}</span></div>
                <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-zinc-500"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" /></svg><span>{{ client.email }}</span></div>
             </div>
             <div class="bg-zinc-900 p-4 rounded-lg flex items-center justify-around text-center">
                <div>
                  <p class="text-2xl font-bold text-white">{{ client.visits }}</p>
                  <p class="text-xs text-zinc-400">Visitas</p>
                </div>
                 <div>
                  <p class="text-2xl font-bold text-white">{{ client.totalSpend | currency:'BRL' }}</p>
                  <p class="text-xs text-zinc-400">Gasto Total</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ClientsComponent {
  searchTerm = signal('');
  selectedClient = signal<Client | null>(null);

  private allClients = signal<Client[]>([
    { id: 1, name: 'Marcos Vinicius', phone: '(27) 99887-6543', email: 'marcos@email.com', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', visits: 25, totalSpend: 2150.50, status: 'Ativo', memberSince: new Date('2022-01-15') },
    { id: 2, name: 'Juliana Costa', phone: '(11) 98765-4321', email: 'juliana@email.com', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', visits: 18, totalSpend: 1540.00, status: 'Ativo', memberSince: new Date('2022-03-20') },
    { id: 3, name: 'Fernando Lima', phone: '(21) 99123-4567', email: 'fernando@email.com', avatar: 'https://randomuser.me/api/portraits/men/86.jpg', visits: 32, totalSpend: 2890.00, status: 'Ativo', memberSince: new Date('2021-11-10') },
    { id: 4, name: 'Ricardo Alves', phone: '(31) 98877-1234', email: 'ricardo@email.com', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', visits: 12, totalSpend: 980.00, status: 'Ativo', memberSince: new Date('2023-02-05') },
    { id: 5, name: 'Beatriz Martins', phone: '(41) 99955-8899', email: 'beatriz@email.com', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', visits: 21, totalSpend: 1750.80, status: 'Ativo', memberSince: new Date('2022-08-30') },
    { id: 6, name: 'Gabriel Souza', phone: '(51) 98123-9876', email: 'gabriel@email.com', avatar: 'https://randomuser.me/api/portraits/men/51.jpg', visits: 8, totalSpend: 650.00, status: 'Inativo', memberSince: new Date('2023-01-12') },
    { id: 7, name: 'Larissa Andrade', phone: '(61) 99654-3210', email: 'larissa@email.com', avatar: 'https://randomuser.me/api/portraits/women/23.jpg', visits: 28, totalSpend: 2300.00, status: 'Ativo', memberSince: new Date('2022-06-18') },
  ]);

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
        return this.allClients();
    }
    return this.allClients().filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.phone.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
    );
  });

  topClientsByVisits = computed(() => {
    return [...this.allClients()]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  });
  
  topClientsBySpend = computed(() => {
    return [...this.allClients()]
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);
  });

  viewClient(client: Client) {
    this.selectedClient.set(client);
  }

  closeModal() {
    this.selectedClient.set(null);
  }
}
