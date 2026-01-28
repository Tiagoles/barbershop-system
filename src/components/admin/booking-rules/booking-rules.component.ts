import { Component, OnInit, inject, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <form [formGroup]="rulesForm" (ngSubmit)="saveRules()">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-white">Regras da Agenda</h1>
            <p class="text-zinc-400 mt-1">Defina o horário de funcionamento e as políticas de agendamento.</p>
          </div>
          <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors shadow-md flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Salvar Alterações
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Left Column: Settings -->
          <div class="space-y-8">
            <!-- Operating Hours -->
            <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
              <h2 class="text-lg font-semibold text-white mb-1">Horário de Funcionamento</h2>
              <p class="text-sm text-zinc-500 mb-6">Defina os dias e horários em que a barbearia está aberta.</p>
              <div formArrayName="workingHours" class="space-y-4">
                @for (dayGroup of workingHours.controls; track dayGroup; let i = $index) {
                  <div [formGroupName]="i" class="grid grid-cols-3 items-center gap-4 p-3 rounded-lg" [class.bg-zinc-900]="!dayGroup.get('isActive')?.value">
                    <div class="col-span-1 flex items-center gap-3">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" formControlName="isActive" class="sr-only peer">
                        <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                      <span class="font-medium text-white">{{ dayGroup.get('dayName')?.value }}</span>
                    </div>
                    <div class="col-span-2 grid grid-cols-2 gap-2">
                       <input type="time" formControlName="open" [attr.disabled]="!dayGroup.get('isActive')?.value ? true : null" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed">
                       <input type="time" formControlName="close" [attr.disabled]="!dayGroup.get('isActive')?.value ? true : null" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Intervals/Breaks -->
            <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
               <h2 class="text-lg font-semibold text-white mb-1">Intervalos e Pausas</h2>
               <p class="text-sm text-zinc-500 mb-6">Configure pausas como almoço. Estes horários não estarão disponíveis para agendamento.</p>
               <div formArrayName="intervals" class="space-y-3">
                 @for (intervalGroup of intervals.controls; track intervalGroup; let i = $index) {
                   <div [formGroupName]="i" class="flex items-center gap-3">
                     <input type="time" formControlName="start" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500">
                     <span class="text-zinc-500">até</span>
                     <input type="time" formControlName="end" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-sm text-white focus:ring-yellow-500 focus:border-yellow-500">
                     <button type="button" (click)="removeInterval(i)" class="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-full hover:bg-zinc-800">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                     </button>
                   </div>
                 }
               </div>
                <button type="button" (click)="addInterval()" class="mt-4 text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Adicionar Intervalo
                </button>
            </div>

            <!-- General Rules -->
            <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800" [formGroupName]="'generalRules'">
              <h2 class="text-lg font-semibold text-white mb-1">Regras Gerais</h2>
              <p class="text-sm text-zinc-500 mb-6">Políticas aplicadas a todos os agendamentos.</p>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <label class="font-medium text-white">Intervalo mínimo entre horários</label>
                  <select formControlName="minTimeStep" class="w-32 bg-zinc-800 border-zinc-700 text-zinc-300 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>
                <div class="flex items-center justify-between border-t border-zinc-800 pt-4">
                  <label class="font-medium text-white">Permitir encaixes</label>
                   <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="allowBookingOverlap" class="sr-only peer">
                    <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                 <div class="flex items-center justify-between border-t border-zinc-800 pt-4">
                  <label class="font-medium text-white">Agendamentos simultâneos</label>
                   <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="allowSimultaneousBookings" class="sr-only peer">
                    <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right Column: Summary -->
          <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 self-start">
             <h2 class="text-lg font-semibold text-white mb-1">Resumo da Agenda</h2>
             <p class="text-sm text-zinc-500 mb-6">Visualização de como sua semana está configurada.</p>
             <div class="space-y-5">
              @if (summaryData(); as summary) {
                @for (day of summary.workingHours; track day.dayName) {
                  <div>
                    <div class="flex justify-between items-center mb-2">
                       <h3 class="font-semibold text-white">{{ day.dayName }}</h3>
                       @if(day.isActive) {
                         <span class="text-sm text-zinc-400">{{ day.open }} - {{ day.close }}</span>
                       } @else {
                         <span class="text-sm font-semibold text-red-400">Fechado</span>
                       }
                    </div>
                    <div class="relative w-full h-8 bg-zinc-800 rounded-md overflow-hidden">
                       @if(day.isActive) {
                         <div class="absolute h-full bg-green-500/50" [style.left.%]="day.openPercent" [style.width.%]="day.durationPercent"></div>
                         @for (interval of summary.intervals; track interval) {
                            <div class="absolute h-full bg-red-500/60" [style.left.%]="interval.startPercent" [style.width.%]="interval.durationPercent" title="Intervalo: {{interval.start}} - {{interval.end}}"></div>
                         }
                       }
                    </div>
                  </div>
                }
              }
             </div>
             <div class="mt-6 pt-6 border-t border-zinc-800 space-y-2 text-sm">
                <div class="flex justify-between text-zinc-400"><span>Encaixes:</span> <span class="font-medium" [class.text-green-400]="summaryData()?.generalRules?.allowBookingOverlap" [class.text-red-400]="!summaryData()?.generalRules?.allowBookingOverlap">{{ summaryData()?.generalRules?.allowBookingOverlap ? 'Permitido' : 'Não Permitido' }}</span></div>
                <div class="flex justify-between text-zinc-400"><span>Agend. Simultâneos:</span> <span class="font-medium" [class.text-green-400]="summaryData()?.generalRules?.allowSimultaneousBookings" [class.text-red-400]="!summaryData()?.generalRules?.allowSimultaneousBookings">{{ summaryData()?.generalRules?.allowSimultaneousBookings ? 'Permitido' : 'Não Permitido' }}</span></div>
             </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class BookingRulesComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  rulesForm: FormGroup;
  private formChanges: Signal<any>;
  summaryData: Signal<any>;

  constructor() {
    this.rulesForm = this.fb.group({
      workingHours: this.fb.array([]),
      intervals: this.fb.array([]),
      generalRules: this.fb.group({
        minTimeStep: ['30'],
        allowBookingOverlap: [false],
        allowSimultaneousBookings: [true]
      })
    });

    this.formChanges = toSignal(this.rulesForm.valueChanges, { initialValue: this.rulesForm.value });

    this.summaryData = computed(() => {
      const value = this.formChanges();
      if (!value) return null;

      const timeToPercent = (time: string) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return ((hours * 60 + minutes) / 1440) * 100;
      };

      return {
        workingHours: value.workingHours.map((day: any) => {
          const openPercent = timeToPercent(day.open);
          const closePercent = timeToPercent(day.close);
          return {
            ...day,
            openPercent,
            durationPercent: closePercent - openPercent
          };
        }),
        intervals: value.intervals.map((interval: any) => {
          const startPercent = timeToPercent(interval.start);
          const endPercent = timeToPercent(interval.end);
          return {
            ...interval,
            startPercent,
            durationPercent: endPercent - startPercent
          };
        }),
        generalRules: value.generalRules
      };
    });
  }

  ngOnInit() {
    this.createWorkingHours().forEach(group => this.workingHours.push(group));
    this.addInterval('12:00', '13:00');
  }
  
  // Helper to get FormArray controls for the template
  get workingHours() {
    return this.rulesForm.get('workingHours') as FormArray;
  }

  get intervals() {
    return this.rulesForm.get('intervals') as FormArray;
  }

  private createWorkingHours(): FormGroup[] {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days.map((day, index) => {
      // Deactivate Sunday and Saturday by default
      const isActive = index > 0 && index < 6; 
      return this.fb.group({
        dayName: [day],
        isActive: [isActive],
        open: ['09:00'],
        close: ['19:00']
      });
    });
  }
  
  addInterval(start = '', end = '') {
    const intervalGroup = this.fb.group({
      start: [start],
      end: [end]
    });
    this.intervals.push(intervalGroup);
  }

  removeInterval(index: number) {
    this.intervals.removeAt(index);
  }

  saveRules() {
    if (this.rulesForm.valid) {
      console.log('Regras Salvas:', this.rulesForm.value);
      alert('Regras da agenda salvas com sucesso!');
    }
  }
}
