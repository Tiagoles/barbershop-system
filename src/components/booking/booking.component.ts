
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Service {
  id: number;
  title: string;
  duration: number; // in minutes
  price: number;
  image: string;
}

interface Professional {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white pt-20 pb-20 px-4 font-sans selection:bg-gold-500 selection:text-black">
      
      <!-- Stepper Header -->
      <div class="max-w-4xl mx-auto mb-12">
        <div class="flex justify-between items-center relative">
          <!-- Connecting Line -->
          <div class="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 transform -translate-y-1/2"></div>
          
          <!-- Step 1 -->
          <div class="flex flex-col items-center gap-2 bg-zinc-950 px-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2"
                 [class.bg-gold-500]="step() >= 1"
                 [class.text-black]="step() >= 1"
                 [class.border-gold-500]="step() >= 1"
                 [class.bg-zinc-900]="step() < 1"
                 [class.text-zinc-500]="step() < 1"
                 [class.border-zinc-800]="step() < 1">
              1
            </div>
            <span class="text-xs font-medium uppercase tracking-wider" [class.text-gold-500]="step() >= 1" [class.text-zinc-600]="step() < 1">Serviços</span>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col items-center gap-2 bg-zinc-950 px-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2"
                 [class.bg-gold-500]="step() >= 2"
                 [class.text-black]="step() >= 2"
                 [class.border-gold-500]="step() >= 2"
                 [class.bg-zinc-900]="step() < 2"
                 [class.text-zinc-500]="step() < 2"
                 [class.border-zinc-800]="step() < 2">
              2
            </div>
             <span class="text-xs font-medium uppercase tracking-wider" [class.text-gold-500]="step() >= 2" [class.text-zinc-600]="step() < 2">Profissional</span>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col items-center gap-2 bg-zinc-950 px-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2"
                 [class.bg-gold-500]="step() >= 3"
                 [class.text-black]="step() >= 3"
                 [class.border-gold-500]="step() >= 3"
                 [class.bg-zinc-900]="step() < 3"
                 [class.text-zinc-500]="step() < 3"
                 [class.border-zinc-800]="step() < 3">
              3
            </div>
             <span class="text-xs font-medium uppercase tracking-wider" [class.text-gold-500]="step() >= 3" [class.text-zinc-600]="step() < 3">Horário</span>
          </div>

          <!-- Step 4 -->
          <div class="flex flex-col items-center gap-2 bg-zinc-950 px-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2"
                 [class.bg-gold-500]="step() >= 4"
                 [class.text-black]="step() >= 4"
                 [class.border-gold-500]="step() >= 4"
                 [class.bg-zinc-900]="step() < 4"
                 [class.text-zinc-500]="step() < 4"
                 [class.border-zinc-800]="step() < 4">
              4
            </div>
             <span class="text-xs font-medium uppercase tracking-wider" [class.text-gold-500]="step() >= 4" [class.text-zinc-600]="step() < 4">Confirmação</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="max-w-3xl mx-auto bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-8 min-h-[500px] flex flex-col relative">
        
        <!-- Summary Box (Visible on Step 2, 3, 4) -->
        @if (step() > 1) {
          <div class="bg-black/40 border border-zinc-800 rounded-lg p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="font-bold text-white text-lg">{{ selectedServices().length }} Serviço(s) selecionado(s)</h3>
              <p class="text-zinc-400 text-sm">
                {{ totalDuration() }} min • Total: <span class="text-gold-500 font-bold">{{ totalPrice() | currency:'BRL':'symbol':'1.0-0' }}</span>
              </p>
            </div>
            
            @if (step() > 2) {
               <div class="text-right">
                  <p class="text-zinc-400 text-xs uppercase tracking-wide">Profissional</p>
                  <p class="text-white font-medium">{{ selectedProfessional()?.name }}</p>
               </div>
            }

            @if (step() > 3) {
                <div class="text-right">
                  <p class="text-zinc-400 text-xs uppercase tracking-wide">Data</p>
                  <p class="text-white font-medium">{{ selectedDate() }} às {{ selectedTime() }}</p>
               </div>
            }
          </div>

          <button (click)="prevStep()" class="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Voltar
          </button>
        }

        <!-- STEP 1: SERVICES -->
        @if (step() === 1) {
          <h2 class="text-2xl font-bold text-white mb-2">Selecione os Serviços</h2>
          <p class="text-zinc-500 mb-8">Você pode selecionar mais de um serviço.</p>

          <div class="space-y-4 flex-grow">
            @for (service of services; track service.id) {
              <div 
                (click)="toggleService(service)"
                class="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group"
                [class.bg-zinc-800]="isServiceSelected(service.id)"
                [class.border-zinc-700]="isServiceSelected(service.id)"
                [class.bg-zinc-900]="!isServiceSelected(service.id)"
                [class.border-zinc-800]="!isServiceSelected(service.id)"
                [class.hover:border-zinc-600]="!isServiceSelected(service.id)">
                
                <div class="flex items-center gap-4">
                  <!-- Custom Checkbox -->
                  <div class="w-6 h-6 rounded border flex items-center justify-center transition-colors"
                       [class.bg-gold-500]="isServiceSelected(service.id)"
                       [class.border-gold-500]="isServiceSelected(service.id)"
                       [class.border-zinc-600]="!isServiceSelected(service.id)">
                    @if (isServiceSelected(service.id)) {
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-black">
                        <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.012l-7.5 13a.75.75 0 0 1-1.297 0l-3.75-6.5a.75.75 0 0 1 1.297-.75L12 17.062l6.904-11.965a.75.75 0 0 1 1.012-.207Z" clip-rule="evenodd" />
                      </svg>
                    }
                  </div>
                  
                  <!-- Image -->
                  <div class="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                     <img [src]="service.image" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                  </div>

                  <div>
                    <h3 class="font-bold text-white">{{ service.title }}</h3>
                    <p class="text-zinc-500 text-sm">{{ service.duration }} min</p>
                  </div>
                </div>

                <span class="font-bold text-white">{{ service.price | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
            }
          </div>
          
          <div class="mt-8 flex justify-end">
             <button 
                [disabled]="selectedServices().length === 0"
                (click)="nextStep()"
                class="bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                Próximo
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
             </button>
          </div>
        }

        <!-- STEP 2: PROFESSIONAL -->
        @if (step() === 2) {
          <h2 class="text-2xl font-bold text-white mb-8">Escolha o Profissional</h2>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            @for (prof of professionals; track prof.id) {
              <div 
                (click)="selectProfessional(prof)"
                class="flex flex-col items-center p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105"
                [class.bg-zinc-800]="selectedProfessional()?.id === prof.id"
                [class.border-gold-500]="selectedProfessional()?.id === prof.id"
                [class.bg-zinc-900]="selectedProfessional()?.id !== prof.id"
                [class.border-zinc-800]="selectedProfessional()?.id !== prof.id"
                [class.hover:border-zinc-600]="selectedProfessional()?.id !== prof.id">
                
                <div class="w-24 h-24 rounded-full bg-zinc-700 mb-4 overflow-hidden border-2"
                     [class.border-gold-500]="selectedProfessional()?.id === prof.id"
                     [class.border-transparent]="selectedProfessional()?.id !== prof.id">
                  <img [src]="prof.avatar" [alt]="prof.name" class="w-full h-full object-cover">
                </div>
                
                <h3 class="font-bold text-lg text-white text-center">{{ prof.name }}</h3>
                <p class="text-zinc-500 text-sm">{{ prof.role }}</p>
              </div>
            }
          </div>
        }

        <!-- STEP 3: DATE & TIME -->
        @if (step() === 3) {
          <h2 class="text-2xl font-bold text-white mb-2">Data e Horário</h2>
          
          <div class="flex flex-col lg:flex-row gap-8 mt-6">
            
            <!-- Calendar -->
            <div class="flex-1 bg-black/40 p-6 rounded-2xl border border-zinc-800">
               <div class="flex items-center justify-between mb-6">
                 <button class="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                 </button>
                 <span class="font-bold text-white text-lg">Janeiro 2026</span>
                 <button class="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                 </button>
               </div>

               <!-- Week Days -->
               <div class="grid grid-cols-7 mb-4 text-center">
                 <span class="text-zinc-500 text-xs font-medium uppercase">Dom</span>
                 <span class="text-zinc-500 text-xs font-medium uppercase">Seg</span>
                 <span class="text-zinc-500 text-xs font-medium uppercase">Ter</span>
                 <span class="text-zinc-500 text-xs font-medium uppercase">Qua</span>
                 <span class="text-zinc-500 text-xs font-medium uppercase">Qui</span>
                 <span class="text-zinc-500 text-xs font-medium uppercase">Sex</span>
                 <span class="text-zinc-500 text-xs font-medium uppercase">Sáb</span>
               </div>

               <!-- Days Grid -->
               <div class="grid grid-cols-7 gap-2 text-center">
                  <!-- Empty days -->
                  <span class="p-2"></span><span class="p-2"></span><span class="p-2"></span><span class="p-2"></span>
                  
                  @for (day of monthDays; track day) {
                    <button 
                      (click)="selectDate(day)"
                      class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                      [class.bg-gold-500]="selectedDate() === '2026-01-' + day.toString().padStart(2, '0')"
                      [class.text-black]="selectedDate() === '2026-01-' + day.toString().padStart(2, '0')"
                      [class.font-bold]="selectedDate() === '2026-01-' + day.toString().padStart(2, '0')"
                      [class.hover:bg-zinc-800]="selectedDate() !== '2026-01-' + day.toString().padStart(2, '0')"
                      [class.text-zinc-300]="selectedDate() !== '2026-01-' + day.toString().padStart(2, '0')">
                      {{ day }}
                    </button>
                  }
               </div>
            </div>

            <!-- Time Slots -->
            <div class="flex-1">
               <h3 class="text-zinc-400 text-sm uppercase tracking-wide mb-4">Horários Disponíveis</h3>
               @if (!selectedDate()) {
                 <p class="text-zinc-500 text-sm italic">Selecione uma data no calendário.</p>
               } @else {
                 <div class="grid grid-cols-3 gap-3">
                    @for (time of timeSlots; track time) {
                      <button 
                        (click)="selectTime(time)"
                        class="py-2 rounded-lg border text-sm font-medium transition-all"
                        [class.bg-zinc-800]="selectedTime() === time"
                        [class.border-gold-500]="selectedTime() === time"
                        [class.text-gold-500]="selectedTime() === time"
                        [class.bg-transparent]="selectedTime() !== time"
                        [class.border-zinc-700]="selectedTime() !== time"
                        [class.text-zinc-300]="selectedTime() !== time"
                        [class.hover:border-zinc-500]="selectedTime() !== time">
                        {{ time }}
                      </button>
                    }
                 </div>
               }

               <div class="mt-8 flex justify-end">
                <button 
                    [disabled]="!selectedDate() || !selectedTime()"
                    (click)="nextStep()"
                    class="w-full bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    Continuar
                </button>
               </div>
            </div>

          </div>
        }

        <!-- STEP 4: CONFIRMATION -->
        @if (step() === 4) {
          <h2 class="text-2xl font-bold text-white mb-6">Finalizar Agendamento</h2>

          <!-- Payment Method -->
           <h3 class="text-sm text-zinc-400 font-bold mb-3">Forma de Pagamento</h3>
           <div class="grid grid-cols-3 gap-4 mb-8">
              <button 
                (click)="paymentMethod.set('card')"
                class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all"
                 [class.bg-zinc-800]="paymentMethod() === 'card'"
                 [class.border-gold-500]="paymentMethod() === 'card'"
                 [class.text-gold-500]="paymentMethod() === 'card'"
                 [class.bg-transparent]="paymentMethod() !== 'card'"
                 [class.border-zinc-700]="paymentMethod() !== 'card'"
                 [class.text-zinc-400]="paymentMethod() !== 'card'">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
                 <span class="text-xs font-bold uppercase">Cartão</span>
              </button>

               <button 
                (click)="paymentMethod.set('pix')"
                class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all"
                 [class.bg-zinc-800]="paymentMethod() === 'pix'"
                 [class.border-gold-500]="paymentMethod() === 'pix'"
                 [class.text-gold-500]="paymentMethod() === 'pix'"
                 [class.bg-transparent]="paymentMethod() !== 'pix'"
                 [class.border-zinc-700]="paymentMethod() !== 'pix'"
                 [class.text-zinc-400]="paymentMethod() !== 'pix'">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
                 <span class="text-xs font-bold uppercase">Pix</span>
              </button>

               <button 
                (click)="paymentMethod.set('cash')"
                class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all"
                 [class.bg-zinc-800]="paymentMethod() === 'cash'"
                 [class.border-gold-500]="paymentMethod() === 'cash'"
                 [class.text-gold-500]="paymentMethod() === 'cash'"
                 [class.bg-transparent]="paymentMethod() !== 'cash'"
                 [class.border-zinc-700]="paymentMethod() !== 'cash'"
                 [class.text-zinc-400]="paymentMethod() !== 'cash'">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
                 <span class="text-xs font-bold uppercase">Dinheiro</span>
              </button>
           </div>

           <!-- Details Form -->
           <form [formGroup]="form" (ngSubmit)="confirmBooking()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-zinc-400 mb-1 uppercase">Nome Completo</label>
                <input formControlName="name" type="text" placeholder="Seu nome" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block text-xs font-bold text-zinc-400 mb-1 uppercase">WhatsApp</label>
                   <input formControlName="phone" type="tel" placeholder="(00) 00000-0000" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none">
                </div>
                 <div>
                   <label class="block text-xs font-bold text-zinc-400 mb-1 uppercase">E-mail (Opcional)</label>
                   <input formControlName="email" type="email" placeholder="seu@email.com" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-zinc-400 mb-1 uppercase">Observações (Opcional)</label>
                <textarea formControlName="notes" rows="2" placeholder="Ex: Tenho alergia a..." class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none"></textarea>
              </div>

               <button 
                  type="submit"
                  [disabled]="form.invalid || !paymentMethod()"
                  class="w-full bg-gold-500 hover:bg-gold-600 text-black font-black uppercase tracking-wider py-4 rounded-lg shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 transform active:scale-[0.99]">
                  Confirmar Agendamento
               </button>
           </form>
        }

      </div>
    </div>
  `
})
export class BookingComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);

  // State
  step = signal<number>(1);
  selectedServices = signal<Service[]>([]);
  selectedProfessional = signal<Professional | null>(null);
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  paymentMethod = signal<'card' | 'pix' | 'cash' | null>(null);

  // Form
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    notes: ['']
  });

  // Data
  services: Service[] = [
    { id: 1, title: 'Corte de Cabelo', duration: 45, price: 50, image: 'https://images.pexels.com/photos/2521978/pexels-photo-2521978.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 2, title: 'Combo AGM (Corte + Barba)', duration: 75, price: 80, image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 3, title: 'Barba Completa', duration: 30, price: 40, image: 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg?auto=compress&cs=tinysrgb&w=800' },
  ];

  professionals: Professional[] = [
    { id: 1, name: 'Bruno', role: 'Barbeiro', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Carlos', role: 'Barbeiro', avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
    { id: 3, name: 'Gabriel', role: 'Barbeiro Sênior', avatar: 'https://randomuser.me/api/portraits/men/86.jpg' },
  ];

  monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];

  // Computed
  totalPrice = computed(() => this.selectedServices().reduce((acc, s) => acc + s.price, 0));
  totalDuration = computed(() => this.selectedServices().reduce((acc, s) => acc + s.duration, 0));

  // Methods
  toggleService(service: Service) {
    this.selectedServices.update(current => {
      const exists = current.find(s => s.id === service.id);
      if (exists) {
        return current.filter(s => s.id !== service.id);
      } else {
        return [...current, service];
      }
    });
  }

  isServiceSelected(id: number) {
    return this.selectedServices().some(s => s.id === id);
  }

  nextStep() {
    this.step.update(s => s + 1);
  }

  prevStep() {
    this.step.update(s => s - 1);
  }

  selectProfessional(prof: Professional) {
    this.selectedProfessional.set(prof);
    this.nextStep();
  }

  selectDate(day: number) {
    // Format YYYY-MM-DD
    this.selectedDate.set(`2026-01-${day.toString().padStart(2, '0')}`);
  }

  selectTime(time: string) {
    this.selectedTime.set(time);
  }

  confirmBooking() {
    if (this.form.valid) {
      alert('Agendamento realizado com sucesso!');
      this.router.navigate(['/home']);
    }
  }
}
