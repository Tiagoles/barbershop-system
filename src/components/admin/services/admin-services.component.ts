import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { supabase } from '../../../app/core/supabase/supabase.client';

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
                <td class="px-6 py-4 text-right">
                  <button (click)="openEditModal(service)" class="font-medium text-yellow-500 hover:text-yellow-400">Editar</button>
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
  `
})
export class AdminServicesComponent implements OnInit {
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  services = signal<Service[]>([]);
  isModalOpen = signal(false);
  selectedService = signal<Service | null>(null);
  serviceForm!: FormGroup;


  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.loadServices();

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

  loadServices() {
    this.http.get<Service[]>(`${this.apiUrl}/services`).subscribe({
      next: (services) => {
        this.services.set(services);
      },
      error: (error) => {
        console.error('Erro ao carregar serviços:', error);
        this.services.set([]);
      }
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



  toggleStatus(service: Service, event: Event) {
    event.stopPropagation();
    const newStatus = service.status === 'ativo' ? 'inativo' : 'ativo';

    this.http.patch(`${this.apiUrl}/services/${service.id}`, { status: newStatus }).subscribe({
      next: () => {
        this.loadServices();
      },
      error: (error) => console.error('Erro ao atualizar status:', error)
    });
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
      // Edit
      this.http.patch(`${this.apiUrl}/services/${existingService.id}`, formData).subscribe({
        next: () => {
          this.loadServices();
          this.closeModal();
        },
        error: (error) => console.error('Erro ao atualizar serviço:', error)
      });
    } else {
      // Add
      this.http.post(`${this.apiUrl}/services`, formData).subscribe({
        next: () => {
          this.loadServices();
          this.closeModal();
        },
        error: (error) => console.error('Erro ao criar serviço:', error)
      });
    }
  }

  deleteService(service: Service) {
    if (confirm(`Tem certeza que deseja excluir "${service.name}"?`)) {
      this.http.delete(`${this.apiUrl}/services/${service.id}`).subscribe({
        next: () => {
          this.loadServices();
        },
        error: (error) => console.error('Erro ao excluir serviço:', error)
      });
    }
  }
  onFileSelected(event: any) { }
}
