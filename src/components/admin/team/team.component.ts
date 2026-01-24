import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Professional {
  id: number;
  name: string;
  phone: string;
  email: string;
  commission: number;
  avatar: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-end">
        <button (click)="openAddModal()" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Novo Profissional
        </button>
      </div>

      <!-- Team Members Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for(member of teamMembers(); track member.id) {
          <div class="bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col items-center text-center p-6">
            <img [src]="member.avatar" [alt]="member.name" class="w-24 h-24 rounded-full mb-4 border-2 border-zinc-700">
            <h3 class="font-bold text-lg text-white">{{ member.name }}</h3>
            <p class="text-sm text-zinc-400">{{ member.email }}</p>
            <p class="text-sm text-zinc-500 mb-4">{{ member.phone }}</p>
            <div class="text-sm font-semibold bg-zinc-800 text-yellow-400 px-3 py-1 rounded-full mb-6">
              Comissão: {{ member.commission }}%
            </div>
            <div class="w-full mt-auto flex gap-2">
              <button (click)="openEditModal(member)" class="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                Editar
              </button>
              <button (click)="openDeleteModal(member)" class="bg-red-900/50 hover:bg-red-900/80 text-red-400 hover:text-red-300 text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                Excluir
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if(isModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl" (click)="$event.stopPropagation()">
          <form [formGroup]="professionalForm" (ngSubmit)="saveProfessional()">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 class="text-xl font-bold text-white">{{ selectedProfessional() ? 'Editar Profissional' : 'Novo Profissional' }}</h2>
              <button type="button" (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 space-y-6">
              <!-- Photo Upload -->
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Foto</label>
                <div class="flex items-center gap-4">
                   <img [src]="professionalForm.get('avatar')?.value" alt="Avatar" class="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 object-cover">
                   <input #avatarUpload type="file" (change)="onAvatarSelected($event)" accept="image/*" class="hidden">
                   <button type="button" (click)="avatarUpload.click()" class="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                    Alterar Foto
                  </button>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Nome Completo</label>
                  <input type="text" formControlName="name" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Telefone</label>
                  <input type="text" formControlName="phone" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">E-mail</label>
                  <input type="email" formControlName="email" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Comissão (%)</label>
                  <input type="number" formControlName="commission" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeModal()" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-md">Cancelar</button>
              <button type="submit" [disabled]="professionalForm.invalid" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-md disabled:opacity-50">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if(isDeleteModalOpen() && professionalToDelete(); as professional) {
      <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="closeDeleteModal()">
        <div class="bg-zinc-950 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50 border border-red-500/30">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 class="mt-4 text-xl font-bold text-white">Excluir Profissional</h3>
            <div class="mt-2">
              <p class="text-sm text-zinc-400">
                Tem certeza que deseja excluir <span class="font-bold text-white">{{ professional.name }}</span>? Esta ação não pode ser desfeita.
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
export class TeamComponent implements OnInit {
  teamMembers = signal<Professional[]>([]);
  isModalOpen = signal(false);
  selectedProfessional = signal<Professional | null>(null);
  professionalForm!: FormGroup;

  isDeleteModalOpen = signal(false);
  professionalToDelete = signal<Professional | null>(null);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.teamMembers.set([
      { id: 1, name: 'Bruno', phone: '(27) 99988-7767', email: 'bruno@barbershop.com', commission: 50, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, name: 'Carlos', phone: '(27) 98877-6655', email: 'carlos@barbershop.com', commission: 45, avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
      { id: 3, name: 'Gabriel', phone: '(27) 97766-5544', email: 'gabriel@barbershop.com', commission: 55, avatar: 'https://randomuser.me/api/portraits/men/86.jpg' },
    ]);

    this.professionalForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      commission: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      avatar: ['https://randomuser.me/api/portraits/lego/1.jpg', Validators.required]
    });
  }

  openAddModal() {
    this.selectedProfessional.set(null);
    this.professionalForm.reset({
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        commission: 40
    });
    this.isModalOpen.set(true);
  }

  openEditModal(professional: Professional) {
    this.selectedProfessional.set(professional);
    this.professionalForm.patchValue(professional);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.professionalForm.patchValue({ avatar: result });
    };
    reader.readAsDataURL(file);
  }

  saveProfessional() {
    if (this.professionalForm.invalid) return;

    const formData = this.professionalForm.value;
    const existingProfessional = this.selectedProfessional();

    if (existingProfessional) {
      // Edit
      this.teamMembers.update(members => 
        members.map(m => m.id === existingProfessional.id ? { ...m, ...formData } : m)
      );
    } else {
      // Add
      const newId = Math.max(...this.teamMembers().map(m => m.id), 0) + 1;
      this.teamMembers.update(members => [...members, { ...formData, id: newId }]);
    }
    this.closeModal();
  }

  openDeleteModal(professional: Professional) {
    this.professionalToDelete.set(professional);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.professionalToDelete.set(null);
  }

  confirmDelete() {
    const professional = this.professionalToDelete();
    if (professional) {
      this.teamMembers.update(members => members.filter(m => m.id !== professional.id));
      this.closeDeleteModal();
    }
  }
}
