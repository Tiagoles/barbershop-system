import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BarbersService, BarberPayload } from '../../../services/barbers.service';
import { SettingsService } from '../../../services/settings.service';
import { ToastService } from '../../../app/services/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">Equipe</h2>
        <button (click)="openAddModal()" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Novo Barbeiro
        </button>
      </div>

      <!-- Barbers List Table -->
      <div class="bg-zinc-950 rounded-lg border border-zinc-800 overflow-x-auto">
        <table class="w-full text-sm text-left text-zinc-400">
          <thead class="text-xs text-zinc-500 uppercase bg-zinc-900">
            <tr>
              <th scope="col" class="px-6 py-3 min-w-[250px]">Barbeiro</th>
              <th scope="col" class="px-6 py-3">Contato</th>
              <th scope="col" class="px-6 py-3">Comissão</th>
              <th scope="col" class="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (barber of barbers(); track barber.id) {
              <tr class="border-b border-zinc-800 hover:bg-zinc-900">
                <td class="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                    <img *ngIf="barber.avatar" [src]="barber.avatar" [alt]="barber.name" class="w-full h-full object-cover">
                    <span *ngIf="!barber.avatar" class="text-xs text-zinc-400">{{ getInitials(barber.name) }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-base">{{ barber.name | uppercase}}</span>
                    <span class="text-xs text-zinc-500">{{ barber.email ? (barber.email | lowercase) : 'Sem Email'  }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                   <div class="flex flex-col">
                    <span>{{ barber.phone || '-' }}</span>
                   </div>
                </td>
                <td class="px-6 py-4 text-yellow-400 font-semibold">
                  {{ barber.commission ? barber.commission + '%' : 'Sem Comissão' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="openEditModal(barber)" class="font-medium text-yellow-500 hover:text-yellow-400 mr-3">Editar</button>
                  <button (click)="deleteBarber(barber)" class="font-medium text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="text-center py-10 text-zinc-500">Nenhum barbeiro cadastrado.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if(isModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl" (click)="$event.stopPropagation()">
          <form [formGroup]="barberForm" (ngSubmit)="saveBarber()">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 class="text-xl font-bold text-white">{{ selectedBarber() ? 'Editar Barbeiro' : 'Novo Barbeiro' }}</h2>
              <button type="button" (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <!-- Body -->
            <div class="p-6 max-h-[70vh] overflow-y-auto">
              <div class="flex flex-col md:flex-row gap-6">
                <!-- Avatar Upload -->
                <div class="flex-shrink-0 flex flex-col items-center gap-3">
                   <div class="w-32 h-32 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden relative group cursor-pointer" (click)="fileInput.click()">
                      <img *ngIf="previewUrl || (selectedBarber() && selectedBarber().avatar)" [src]="previewUrl || selectedBarber().avatar" class="w-full h-full object-cover">
                      <div *ngIf="!previewUrl && (!selectedBarber() || !selectedBarber().avatar)" class="text-zinc-500 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mb-1"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                        <span class="text-xs">Foto</span>
                      </div>
                      <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white text-xs font-semibold">Alterar</span>
                      </div>
                   </div>
                   <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
                   <button type="button" (click)="fileInput.click()" class="text-xs text-yellow-500 hover:text-yellow-400 font-medium">Carregar foto</button>
                </div>

                <!-- Fields -->
                <div class="flex-grow space-y-4 w-full">
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Nome Completo</label>
                    <input type="text" formControlName="name" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" placeholder="Ex: João da Silva">
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-zinc-300 mb-2">Email (Opcional)</label>
                      <input type="email" formControlName="email" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" placeholder="email@exemplo.com">
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-zinc-300 mb-2">Telefone</label>
                         <input type="tel" formControlName="phone" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" placeholder="(00) 00000-0000">
                    </div>
                  </div>

                  <div>
                     <label class="block text-sm font-medium text-zinc-300 mb-2">Comissão (%)</label>
                     <input type="number" formControlName="commission" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500" placeholder="Ex: 50">
                     <p class="text-xs text-zinc-500 mt-1">Se deixar em branco, será usada a comissão padrão do estabelecimento.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeModal()" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-md">Cancelar</button>
              <button type="submit" [disabled]="barberForm.invalid || isSubmitting" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TeamComponent implements OnInit {
  barbersService = inject(BarbersService);
  settingsService = inject(SettingsService);
  toast = inject(ToastService);
  fb = inject(FormBuilder);

  barbers = signal<any[]>([]);
  isModalOpen = signal(false);
  selectedBarber = signal<any | null>(null);
  isSubmitting = false;

  barberForm!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor() {
    // Effect to reload barbers when establishment ID changes (e.g. on page load)
    effect(() => {
      const estId = this.settingsService.estabelecimentoId();
      if (estId) {
        this.loadBarbers(estId);
      }
    });
  }

  ngOnInit() {
    this.barberForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]], // Email optional
      phone: [''],
      commission: [null, [Validators.min(0), Validators.max(100)]]
    });
  }

  getInitials(name: string): string {
    return (name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  async loadBarbers(estId: string) {
    try {
      const data = await this.barbersService.listByEstabelecimento(estId);
      this.barbers.set(data);
    } catch (e) {
      console.error('Erro ao carregar barbeiros', e);
      this.toast.error('Erro ao carregar equipe.');
    }
  }

  openAddModal() {
    this.selectedBarber.set(null);
    this.selectedFile = null;
    this.previewUrl = null;
    this.barberForm.reset();
    this.isModalOpen.set(true);
  }

  openEditModal(barber: any) {
    this.selectedBarber.set(barber);
    this.selectedFile = null;
    this.previewUrl = null;
    this.barberForm.patchValue({
      name: barber.name,
      email: barber.email,
      phone: barber.phone,
      commission: barber.commission
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  async saveBarber() {
    if (this.barberForm.invalid) return;

    this.isSubmitting = true;
    const estId = this.settingsService.estabelecimentoId();
    if (!estId) {
      this.toast.error('Estabelecimento não identificado.');
      this.isSubmitting = false;
      return;
    }

    const payload: BarberPayload = {
      name: this.barberForm.value.name,
      email: this.barberForm.value.email || null,
      phone: this.barberForm.value.phone || null,
      commission: this.barberForm.value.commission || null,
      avatarFile: this.selectedFile
    };

    try {
      const existing = this.selectedBarber();
      if (existing) {
        await this.barbersService.update(existing.id, payload); // passing link id (barbearia_barbeiros.id)
        this.toast.success('Barbeiro atualizado com sucesso!');
      } else {
        await this.barbersService.create(estId, payload);
        this.toast.success('Barbeiro cadastrado com sucesso!');
      }
      this.closeModal();
      this.loadBarbers(estId);
    } catch (e) {
      console.error('Erro ao salvar barbeiro', e);
      this.toast.error('Erro ao salvar barbeiro.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteBarber(barber: any) {
    if (!confirm(`Tem certeza que deseja remover ${barber.name}?`)) return;

    try {
      await this.barbersService.remove(barber.id); // barbearia_barbeiros.id
      this.toast.success('Barbeiro removido.');
      const estId = this.settingsService.estabelecimentoId();
      if (estId) this.loadBarbers(estId);
    } catch (e) {
      console.error('Erro ao remover barbeiro', e);
      this.toast.error('Erro ao remover barbeiro.');
    }
  }
}
