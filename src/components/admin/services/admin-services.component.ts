import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
  status: 'ativo' | 'inativo';
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-end">
        <button (click)="openAddModal()" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Novo Serviço
        </button>
      </div>

      <!-- Services List Table -->
      <div class="bg-zinc-950 rounded-lg border border-zinc-800 overflow-x-auto">
        <table class="w-full text-sm text-left text-zinc-400">
          <thead class="text-xs text-zinc-500 uppercase bg-zinc-900">
            <tr>
              <th scope="col" class="px-6 py-3 min-w-[250px]">Nome do Serviço</th>
              <th scope="col" class="px-6 py-3">Duração</th>
              <th scope="col" class="px-6 py-3">Preço</th>
              <th scope="col" class="px-6 py-3 text-center">Status</th>
              <th scope="col" class="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (service of services(); track service.id) {
              <tr class="border-b border-zinc-800 hover:bg-zinc-900">
                <td class="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-4">
                  <img [src]="service.image" [alt]="service.name" class="w-12 h-12 rounded-md object-cover bg-zinc-800">
                  <span>{{ service.name }}</span>
                </td>
                <td class="px-6 py-4">{{ service.duration }} min</td>
                <td class="px-6 py-4 font-semibold text-yellow-400">{{ service.price | currency:'BRL' }}</td>
                <td class="px-6 py-4 text-center">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [checked]="service.status === 'ativo'" (change)="toggleStatus(service, $event)" class="sr-only peer">
                    <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </td>
                <td class="px-6 py-4 text-right space-x-4">
                  <button (click)="openEditModal(service)" class="font-medium text-yellow-500 hover:text-yellow-400">Editar</button>
                  <button (click)="openDeleteModal(service)" class="font-medium text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-center py-10 text-zinc-500">Nenhum serviço cadastrado.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if(isModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 shadow-2xl" (click)="$event.stopPropagation()">
          <form [formGroup]="serviceForm" (ngSubmit)="saveService()">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 class="text-xl font-bold text-white">{{ selectedService() ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
              <button type="button" (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <!-- Body -->
            <div class="p-6 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Left Column (Image) -->
                <div class="md:col-span-1 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Foto do Serviço</label>
                    <div class="aspect-square bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                      <img *ngIf="serviceForm.get('image')?.value" [src]="serviceForm.get('image')?.value" alt="Pré-visualização" class="w-full h-full object-cover">
                      <svg *ngIf="!serviceForm.get('image')?.value" class="w-12 h-12 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" /></svg>
                    </div>
                    <input #imageUpload type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
                    <button type="button" (click)="imageUpload.click()" class="w-full mt-3 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                      Enviar Foto
                    </button>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                    <button type="button" (click)="toggleModalStatus()" class="w-full flex items-center justify-between p-3 rounded-lg text-left" [class.bg-green-900/50]="serviceForm.get('status')?.value === 'ativo'" [class.bg-zinc-800]="serviceForm.get('status')?.value !== 'ativo'">
                      <span class="font-semibold">{{ serviceForm.get('status')?.value === 'ativo' ? 'Ativo' : 'Inativo' }}</span>
                      <div class="relative inline-flex items-center cursor-pointer">
                         <div class="w-11 h-6 rounded-full" [class.bg-yellow-500]="serviceForm.get('status')?.value === 'ativo'" [class.bg-zinc-700]="serviceForm.get('status')?.value !== 'ativo'"></div>
                         <div class="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform" [class.translate-x-5]="serviceForm.get('status')?.value === 'ativo'"></div>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Right Column (Fields) -->
                <div class="md:col-span-2 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Nome do Serviço</label>
                    <input type="text" formControlName="name" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-zinc-300 mb-2">Preço (R$)</label>
                      <input type="number" formControlName="price" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-zinc-300 mb-2">Duração (min)</label>
                      <input type="number" formControlName="duration" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Descrição</label>
                    <textarea formControlName="description" rows="4" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeModal()" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-md">Cancelar</button>
              <button type="submit" [disabled]="serviceForm.invalid" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-md disabled:opacity-50">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if(isDeleteModalOpen() && serviceToDelete(); as service) {
      <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="closeDeleteModal()">
        <div class="bg-zinc-950 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50 border border-red-500/30">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 class="mt-4 text-xl font-bold text-white">Excluir Serviço</h3>
            <div class="mt-2">
              <p class="text-sm text-zinc-400">
                Tem certeza que deseja excluir <span class="font-bold text-white">{{ service.name }}</span>? Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-center gap-4">
            <button type="button" (click)="closeDeleteModal()" class="w-full text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700">
              Cancelar
            </button>
            <button type="button" (click)="confirmDelete()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-md">
              Excluir
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminServicesComponent implements OnInit {
  services = signal<Service[]>([]);
  isModalOpen = signal(false);
  selectedService = signal<Service | null>(null);
  serviceForm!: FormGroup;

  isDeleteModalOpen = signal(false);
  serviceToDelete = signal<Service | null>(null);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.services.set([
      { id: 1, name: 'Corte de Cabelo', price: 50, duration: 45, description: 'Corte moderno com acabamento na navalha e lavagem inclusa.', image: 'https://images.pexels.com/photos/2521978/pexels-photo-2521978.jpeg?auto=compress&cs=tinysrgb&w=800', status: 'ativo' },
      { id: 2, name: 'Combo AGM (Corte + Barba)', price: 80, duration: 75, description: 'O serviço completo para o homem moderno. Renovação total do visual.', image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800', status: 'ativo' },
      { id: 3, name: 'Barba Completa', price: 40, duration: 30, description: 'Barboterapia com toalha quente e óleos essenciais para hidratação profunda.', image: 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg?auto=compress&cs=tinysrgb&w=800', status: 'inativo' },
    ]);

    this.serviceForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      image: [''],
      status: ['ativo', Validators.required]
    });
  }

  openAddModal() {
    this.selectedService.set(null);
    this.serviceForm.reset({ status: 'ativo' });
    this.isModalOpen.set(true);
  }

  openEditModal(service: Service) {
    this.selectedService.set(service);
    this.serviceForm.patchValue(service);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.serviceForm.patchValue({ image: e.target?.result as string });
    reader.readAsDataURL(file);
  }

  toggleStatus(service: Service, event: Event) {
    event.stopPropagation();
    const newStatus = service.status === 'ativo' ? 'inativo' : 'ativo';
    this.services.update(services =>
      services.map(s => (s.id === service.id ? { ...s, status: newStatus } : s))
    );
  }
  
  toggleModalStatus() {
      const currentStatus = this.serviceForm.get('status')?.value;
      this.serviceForm.get('status')?.setValue(currentStatus === 'ativo' ? 'inativo' : 'ativo');
  }

  saveService() {
    if (this.serviceForm.invalid) return;

    const formData = this.serviceForm.value;
    const existingService = this.selectedService();

    if (existingService) {
      this.services.update(services =>
        services.map(s => (s.id === existingService.id ? { ...s, ...formData } : s))
      );
    } else {
      const newId = Math.max(...this.services().map(s => s.id), 0) + 1;
      this.services.update(services => [...services, { ...formData, id: newId }]);
    }
    this.closeModal();
  }

  openDeleteModal(service: Service) {
    this.serviceToDelete.set(service);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.serviceToDelete.set(null);
  }

  confirmDelete() {
    const service = this.serviceToDelete();
    if (service) {
      this.services.update(services => services.filter(s => s.id !== service.id));
      this.closeDeleteModal();
    }
  }
}
