import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

interface DetailItem {
  description: string;
  value: number;
}

interface DetailView {
  title: string;
  items: DetailItem[];
  total: number;
}

interface ExpenseItem {
  id: number;
  description: string;
  value: number;
  type: 'Fixo' | 'Variável' | 'Investimento';
  date: Date;
}

interface RevenueItem {
  id: number;
  description: string;
  value: number;
  date: Date;
}


@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Visão Financeira</h1>
        <p class="text-zinc-400 mt-1">Acompanhe metas, faturamento e custos da barbearia.</p>
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 class="text-lg font-bold text-white">Ações Rápidas</h2>
          <div class="flex items-center gap-4">
            <button (click)="openExpenseModal()" class="bg-red-900/50 hover:bg-red-900/80 text-red-300 font-bold py-2 px-5 rounded-lg transition-colors text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" /></svg>
              Adicionar Despesa
            </button>
             <button (click)="openRevenueModal()" class="bg-green-900/50 hover:bg-green-900/80 text-green-300 font-bold py-2 px-5 rounded-lg transition-colors text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" /></svg>
              Adicionar Faturamento
            </button>
          </div>
      </div>


      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Daily Goal Card -->
        <div class="lg:col-span-1 bg-zinc-950 p-6 rounded-lg border border-zinc-800 flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-bold text-white mb-1">Meta Diária</h2>
            <p class="text-sm text-zinc-500 mb-6">Defina e acompanhe o objetivo do dia.</p>
            <div class="relative">
              <input type="number" [ngModel]="dailyGoal()" (ngModelChange)="dailyGoal.set(+$event)" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-center text-2xl font-bold text-yellow-400 focus:ring-yellow-500 focus:border-yellow-500">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">R$</span>
            </div>
          </div>
          <div class="mt-6">
            <div class="flex justify-between items-end mb-2">
              <span class="text-2xl font-bold text-white">{{ financialSummary().dailyRevenue | currency:'BRL' }}</span>
              <span class="text-sm font-semibold" [class.text-green-400]="dailyProgress() >= 100" [class.text-yellow-400]="dailyProgress() < 100">{{ dailyProgress() | number:'1.0-0' }}%</span>
            </div>
            <div class="w-full bg-zinc-800 rounded-full h-4 border border-zinc-700">
              <div class="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full transition-all duration-500" [style.width]="dailyProgress() + '%'"></div>
            </div>
          </div>
        </div>

        <!-- Analysis Cards -->
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Revenue vs Expenses -->
          <div (click)="showDetails('Análise de Despesas')" class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
            <h3 class="text-lg font-bold text-white mb-4">Faturamento × Despesas</h3>
            <div class="flex items-center justify-center gap-6">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-green-500/20" />
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-red-500"
                  [attr.stroke-dasharray]="financialSummary().expensesPercentage + ', 100'" 
                  stroke-linecap="round" />
              </svg>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-green-500"></div><span class="text-zinc-400">Faturamento: <strong class="text-white">{{ financialSummary().monthlyRevenue | currency:'BRL' }}</strong></span></div>
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-red-500"></div><span class="text-zinc-400">Despesas: <strong class="text-white">{{ financialSummary().totalExpenses | currency:'BRL' }}</strong></span></div>
              </div>
            </div>
          </div>
          <!-- Revenue vs Investments -->
          <div (click)="showDetails('Análise de Investimentos')" class="bg-zinc-950 p-6 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
             <h3 class="text-lg font-bold text-white mb-4">Faturamento × Investimentos</h3>
             <div class="flex items-center justify-center gap-6">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-green-500/20" />
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke-width="3" class="stroke-blue-500"
                  [attr.stroke-dasharray]="financialSummary().investmentsPercentage + ', 100'" 
                  stroke-linecap="round" />
              </svg>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-green-500"></div><span class="text-zinc-400">Faturamento: <strong class="text-white">{{ financialSummary().monthlyRevenue | currency:'BRL' }}</strong></span></div>
                <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-blue-500"></div><span class="text-zinc-400">Investimentos: <strong class="text-white">{{ financialSummary().totalInvestments | currency:'BRL' }}</strong></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Reports -->
      <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
        <div class="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 class="text-lg font-bold text-white">Relatórios de Faturamento</h2>
            <p class="text-sm text-zinc-500">Análise do desempenho de vendas diário e mensal.</p>
          </div>
          <div class="flex-shrink-0 flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            <button (click)="reportPeriod.set('daily')" [class.bg-zinc-700]="reportPeriod() === 'daily'" class="px-4 py-1.5 rounded-md text-sm font-semibold text-white transition-colors">Diário</button>
            <button (click)="reportPeriod.set('monthly')" [class.bg-zinc-700]="reportPeriod() === 'monthly'" class="px-4 py-1.5 rounded-md text-sm font-semibold text-white transition-colors">Mensal</button>
          </div>
        </div>

        @if (reportPeriod() === 'daily') {
          <!-- Daily Report -->
          <div class="h-72 flex items-end gap-4">
            @for (item of dailyRevenueFromServices; track item.hour) {
              <div class="flex-1 h-full flex flex-col justify-end items-center group">
                 <div class="w-full bg-yellow-500/20 hover:bg-yellow-500/40 rounded-t-md transition-colors" [style.height]="(item.value / 150 * 100) + '%'"></div>
                 <span class="text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors mt-2">{{ item.hour }}h</span>
              </div>
            }
          </div>
        } @else {
          <!-- Monthly Report -->
          <div class="h-72 w-full relative">
            <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#CA8A04" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#CA8A04" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path [attr.d]="monthlyChartPath()" fill="url(#chartGradient)" />
              <path [attr.d]="monthlyChartPath()" fill="none" stroke="#CA8A04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-zinc-500 px-2">
              <span>Dia 1</span>
              <span>Dia 15</span>
              <span>Dia 30</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Details Modal -->
    @if (detailView(); as details) {
       <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeDetailModal()">
        <div class="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-start p-6 border-b border-zinc-800">
            <div><h2 class="text-xl font-bold text-white">{{ details.title }}</h2><p class="text-sm text-zinc-400">Total: <span class="font-bold text-white">{{ details.total | currency:'BRL' }}</span></p></div>
            <button (click)="closeDetailModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 max-h-[60vh] overflow-y-auto"><ul class="space-y-3">
            @for (item of details.items; track item.description) {<li class="flex justify-between items-center text-sm p-3 bg-zinc-900 rounded-lg"><span class="text-zinc-300">{{ item.description }}</span><span class="font-semibold text-white">{{ item.value | currency:'BRL' }}</span></li>}
            @empty { <p class="text-zinc-500 text-center text-sm">Nenhum item para exibir.</p> }
          </ul></div>
        </div>
       </div>
    }

    <!-- Add Expense Modal -->
    @if (isExpenseModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="closeExpenseModal()">
        <div class="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl" (click)="$event.stopPropagation()">
          <form [formGroup]="expenseForm" (ngSubmit)="saveExpense()">
            <div class="p-6 border-b border-zinc-800"><h2 class="text-xl font-bold text-white">Adicionar Nova Despesa</h2></div>
            <div class="p-6 space-y-4">
              <div><label class="block text-sm font-medium text-zinc-300 mb-2">Descrição</label><input type="text" formControlName="description" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"></div>
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium text-zinc-300 mb-2">Valor (R$)</label><input type="number" formControlName="value" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"></div>
                <div><label class="block text-sm font-medium text-zinc-300 mb-2">Tipo</label><select formControlName="type" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"><option>Fixo</option><option>Variável</option><option>Investimento</option></select></div>
              </div>
            </div>
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeExpenseModal()" class="text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-md">Cancelar</button>
              <button type="submit" [disabled]="expenseForm.invalid" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50">Salvar Despesa</button>
            </div>
          </form>
        </div>
      </div>
    }

     <!-- Add Revenue Modal -->
    @if (isRevenueModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="closeRevenueModal()">
        <div class="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl" (click)="$event.stopPropagation()">
          <form [formGroup]="revenueForm" (ngSubmit)="saveRevenue()">
            <div class="p-6 border-b border-zinc-800"><h2 class="text-xl font-bold text-white">Adicionar Faturamento Manual</h2></div>
            <div class="p-6 space-y-4">
              <div><label class="block text-sm font-medium text-zinc-300 mb-2">Descrição</label><input type="text" formControlName="description" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"></div>
              <div><label class="block text-sm font-medium text-zinc-300 mb-2">Valor (R$)</label><input type="number" formControlName="value" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"></div>
            </div>
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeRevenueModal()" class="text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-md">Cancelar</button>
              <button type="submit" [disabled]="revenueForm.invalid" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50">Salvar Faturamento</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class FinancialComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  // --- UI State ---
  reportPeriod = signal<'daily' | 'monthly'>('daily');
  dailyGoal = signal(800);
  detailView = signal<DetailView | null>(null);
  isExpenseModalOpen = signal(false);
  isRevenueModalOpen = signal(false);

  // --- Forms ---
  expenseForm!: FormGroup;
  revenueForm!: FormGroup;

  // --- Data State ---
  private manualExpenses = signal<ExpenseItem[]>([]);
  private manualRevenues = signal<RevenueItem[]>([]);

  // Initial static data to simulate existing records
  private initialExpensesData: DetailItem[] = [
    { description: 'Aluguel', value: 1500 }, { description: 'Energia Elétrica', value: 450 },
    { description: 'Água', value: 150 }, { description: 'Internet', value: 120 },
    { description: 'Produtos', value: 800 }, { description: 'Marketing', value: 300 },
  ];
  private initialInvestmentsData: DetailItem[] = [
    { description: 'Nova Cadeira de Barbeiro', value: 900 }, { description: 'Curso de Aperfeiçoamento', value: 500 },
    { description: 'Ferramentas Novas', value: 350 },
  ];
  dailyRevenueFromServices = [
    { hour: 9, value: 50 }, { hour: 10, value: 80 }, { hour: 11, value: 90 },
    { hour: 12, value: 40 }, { hour: 13, value: 0 }, { hour: 14, value: 120 },
    { hour: 15, value: 95 }, { hour: 16, value: 130 }, { hour: 17, value: 45 },
    { hour: 18, value: 0 },
  ];
  monthlyRevenueFromServices = [ 300, 450, 500, 400, 600, 750, 800, 700, 900, 1100, 1000, 950, 1200 ];

  // --- Computed Signals for Dynamic Calculations ---
  financialSummary = computed(() => {
    // Revenue calculations
    const dailyRevenueFromServices = this.dailyRevenueFromServices.reduce((acc, item) => acc + item.value, 0);
    const dailyManualRevenue = this.manualRevenues().reduce((acc, item) => acc + item.value, 0); // Assuming manual is for today
    const dailyRevenue = dailyRevenueFromServices + dailyManualRevenue;
    
    const monthlyRevenueFromServices = this.monthlyRevenueFromServices.reduce((acc, val) => acc + val, 0);
    const monthlyRevenue = monthlyRevenueFromServices + dailyManualRevenue; // Simplified: adding today's manual to month total

    // Expense & Investment calculations
    const expensesFromManual = this.manualExpenses().filter(e => e.type !== 'Investimento');
    const investmentsFromManual = this.manualExpenses().filter(e => e.type === 'Investimento');

    const totalExpenses = this.initialExpensesData.reduce((acc, item) => acc + item.value, 0) + expensesFromManual.reduce((acc, item) => acc + item.value, 0);
    const totalInvestments = this.initialInvestmentsData.reduce((acc, item) => acc + item.value, 0) + investmentsFromManual.reduce((acc, item) => acc + item.value, 0);
    
    return {
      dailyRevenue,
      monthlyRevenue,
      totalExpenses,
      totalInvestments,
      expensesPercentage: monthlyRevenue > 0 ? (totalExpenses / monthlyRevenue) * 100 : 0,
      investmentsPercentage: monthlyRevenue > 0 ? (totalInvestments / monthlyRevenue) * 100 : 0,
    };
  });

  dailyProgress = computed(() => {
    const goal = this.dailyGoal() || 1;
    const progress = (this.financialSummary().dailyRevenue / goal) * 100;
    return Math.min(progress, 100);
  });

  monthlyChartPath = computed(() => {
    const data = this.monthlyRevenueFromServices; // Chart shows only service revenue for consistency
    if (data.length === 0) return "M 0 200 L 500 200";
    
    const maxValue = Math.max(...data);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 500;
      const y = 200 - (value / maxValue) * 180;
      return `${x},${y}`;
    });
    return `M 0,200 L ${points.join(' L ')} L 500,200 Z`;
  });
  
  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      type: ['Fixo', Validators.required]
    });

    this.revenueForm = this.fb.group({
      description: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  // --- Modal Methods ---
  showDetails(type: 'Análise de Despesas' | 'Análise de Investimentos') {
    let title = '';
    let items: DetailItem[] = [];
    let total = 0;

    if (type === 'Análise de Despesas') {
      title = 'Análise de Despesas';
      const manual = this.manualExpenses().filter(e => e.type !== 'Investimento');
      items = [...this.initialExpensesData, ...manual];
      total = this.financialSummary().totalExpenses;
    } else {
      title = 'Análise de Investimentos';
      const manual = this.manualExpenses().filter(e => e.type === 'Investimento');
      items = [...this.initialInvestmentsData, ...manual];
      total = this.financialSummary().totalInvestments;
    }
    this.detailView.set({ title, items, total });
  }

  closeDetailModal() { this.detailView.set(null); }
  openExpenseModal() { this.isExpenseModalOpen.set(true); }
  closeExpenseModal() { this.isExpenseModalOpen.set(false); this.expenseForm.reset({type: 'Fixo'}); }
  openRevenueModal() { this.isRevenueModalOpen.set(true); }
  closeRevenueModal() { this.isRevenueModalOpen.set(false); this.revenueForm.reset(); }

  // --- Form Submission Methods ---
  saveExpense() {
    if (this.expenseForm.invalid) return;
    const newExpense: ExpenseItem = {
      id: Date.now(),
      ...this.expenseForm.value,
      date: new Date()
    };
    this.manualExpenses.update(current => [...current, newExpense]);
    this.closeExpenseModal();
  }
  
  saveRevenue() {
    if (this.revenueForm.invalid) return;
    const newRevenue: RevenueItem = {
      id: Date.now(),
      ...this.revenueForm.value,
      date: new Date()
    };
    this.manualRevenues.update(current => [...current, newRevenue]);
    this.closeRevenueModal();
  }
}
