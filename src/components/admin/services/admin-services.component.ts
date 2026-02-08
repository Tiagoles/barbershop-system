import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { supabase } from '../../../app/core/supabase/supabase.client';
import { SettingsService } from '../../../services/settings.service';
import { ToastService } from '../../../app/services/toast.service';

interface ServiceRow {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  status: 'ativo' | 'inativo';

  // ✅ separa o que vai pro DB do que vai pra UI
  imagePath: string | null; // DB: "12/uuid.webp"
  imageUrl: string;         // UI: signedUrl ou publicUrl
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-end">
        <button (click)="openAddModal()"
          class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
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
                  <img [src]="service.imageUrl" [alt]="service.name"
                       class="w-12 h-12 rounded-md object-cover bg-zinc-800">
                  <span>{{ service.name }}</span>
                </td>
                <td class="px-6 py-4">{{ service.duration }} min</td>
                <td class="px-6 py-4 font-semibold text-yellow-400">{{ service.price | currency:'BRL' }}</td>
                <td class="px-6 py-4 text-center">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                           [checked]="service.status === 'ativo'"
                           (change)="toggleStatus(service, $event)"
                           class="sr-only peer">
                    <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer
                                peer-checked:after:translate-x-full peer-checked:after:border-white
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                after:bg-white after:border-zinc-300 after:border after:rounded-full
                                after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </td>
                <td class="px-6 py-4 text-right">
                  <button (click)="openEditModal(service)" class="font-medium text-yellow-500 hover:text-yellow-400">
                    Editar
                  </button>
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
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 shadow-2xl"
             (click)="$event.stopPropagation()">
          <form [formGroup]="serviceForm" (ngSubmit)="saveService()">

            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 class="text-xl font-bold text-white">{{ selectedService() ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
              <button type="button" (click)="closeModal()"
                      class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- Left Column -->
                <div class="md:col-span-1 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Foto do Serviço</label>

                    <div class="aspect-square bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-700
                                flex items-center justify-center overflow-hidden">
                      <img *ngIf="serviceForm.get('image')?.value"
                           [src]="serviceForm.get('image')?.value"
                           alt="Pré-visualização"
                           class="w-full h-full object-cover">

                      <svg *ngIf="!serviceForm.get('image')?.value" class="w-12 h-12 text-zinc-600"
                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                           stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
                          1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5
                          0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5
                          0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                      </svg>
                    </div>

                    <input #imageUpload type="file" (change)="onFileSelected($event)"
                           accept="image/jpeg,image/png,image/webp" class="hidden">

                    <button type="button" (click)="imageUpload.click()"
                      class="w-full mt-3 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold
                             py-2 px-4 rounded-md transition-colors">
                      Enviar Foto
                    </button>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                    <button type="button" (click)="toggleModalStatus()"
                      class="w-full flex items-center justify-between p-3 rounded-lg text-left"
                      [class.bg-green-900/50]="serviceForm.get('status')?.value === 'ativo'"
                      [class.bg-zinc-800]="serviceForm.get('status')?.value !== 'ativo'">
                      <span class="font-semibold">
                        {{ serviceForm.get('status')?.value === 'ativo' ? 'Ativo' : 'Inativo' }}
                      </span>
                      <div class="relative inline-flex items-center cursor-pointer">
                        <div class="w-11 h-6 rounded-full"
                          [class.bg-yellow-500]="serviceForm.get('status')?.value === 'ativo'"
                          [class.bg-zinc-700]="serviceForm.get('status')?.value !== 'ativo'"></div>
                        <div class="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform"
                          [class.translate-x-5]="serviceForm.get('status')?.value === 'ativo'"></div>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="md:col-span-2 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Nome do Serviço</label>
                    <input type="text" formControlName="name"
                      class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white
                             focus:ring-yellow-500 focus:border-yellow-500">
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-zinc-300 mb-2">Preço (R$)</label>
                      <input type="number" formControlName="price"
                        class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white
                               focus:ring-yellow-500 focus:border-yellow-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-zinc-300 mb-2">Duração (min)</label>
                      <input type="number" formControlName="duration"
                        class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white
                               focus:ring-yellow-500 focus:border-yellow-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-zinc-300 mb-2">Descrição</label>
                    <textarea formControlName="description" rows="4"
                      class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white
                             focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                  </div>
                </div>

              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeModal()"
                class="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-md">
                Cancelar
              </button>
              <button type="submit" [disabled]="serviceForm.invalid"
                class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors
                       shadow-md disabled:opacity-50">
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
  services = signal<ServiceRow[]>([]);
  isModalOpen = signal(false);
  selectedService = signal<ServiceRow | null>(null);

  serviceForm!: FormGroup;
  selectedImageFile: File | null = null;

  // opcional: para UX
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toast: ToastService
  ) { }

  async ngOnInit() {
    this.serviceForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      image: [''], // preview only
      status: ['ativo', Validators.required]
    });

    // ✅ GARANTE estId antes de carregar
    await this.initLoad();
  }

  private async initLoad() {
    this.isLoading.set(true);
    try {
      const estId = await this.waitForEstabelecimentoId();
      if (!estId) {
        console.warn('Nenhum estabelecimentoId disponível.');
        return;
      }
      await this.loadServicesForEstabelecimento(estId);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * ✅ Espera o SettingsService carregar e setar estabelecimentoId
   * - tenta ler por alguns segundos; se não vier, retorna null
   */
  private async waitForEstabelecimentoId(timeoutMs = 8000, intervalMs = 150): Promise<string | null> {
    const start = Date.now();

    // 1) se já tem, retorna
    const now = this.settingsService.estabelecimentoId();
    if (now) return now;

    // 2) tenta forçar o load (caso o SettingsService ainda não tenha carregado)
    // (isso não quebra se já carregou)
    try {
      await this.settingsService.loadSettings();
    } catch { }

    // 3) aguarda id aparecer
    while (Date.now() - start < timeoutMs) {
      const id = this.settingsService.estabelecimentoId();
      if (id) return id;
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return null;
  }

  private async toDisplayImageUrl(pathOrUrl: string | null): Promise<string> {
    if (!pathOrUrl) return '';
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    if (pathOrUrl.startsWith('data:image/')) return pathOrUrl;

    const { data, error } = await supabase.storage
      .from('servicos')
      .createSignedUrl(pathOrUrl, 60 * 60);

    if (error) {
      console.warn('Erro ao gerar signedUrl:', error);
      return '';
    }
    return data.signedUrl;
  }

  // ✅ agora recebe estId garantido
  private async loadServicesForEstabelecimento(estId: string) {
    const { data, error } = await supabase
      .from('estabelecimento_servicos')
      .select('*')
      .eq('estabelecimento_id', Number(estId))
      .order('id', { ascending: false });

    if (error) {
      console.error('Erro ao carregar serviços:', error);
      return;
    }

    const mapped = await Promise.all((data ?? []).map(async (s: any) => {
      const path = s.imagem_url ?? null;
      return {
        id: s.id,
        name: s.nome,
        description: s.descricao ?? '',
        duration: s.duracao ?? 0,
        price: s.preco ?? 0,
        status: s.ativo ? 'ativo' : 'inativo',
        imagePath: path,
        imageUrl: await this.toDisplayImageUrl(path)
      } as ServiceRow;
    }));

    this.services.set(mapped);
  }

  // se você ainda quiser chamar manualmente em alguns pontos:
  async loadServices() {
    const estId = this.settingsService.estabelecimentoId();
    if (!estId) return;
    await this.loadServicesForEstabelecimento(estId);
  }

  openAddModal() {
    this.selectedService.set(null);
    this.selectedImageFile = null;

    this.serviceForm.reset({
      id: null,
      name: '',
      price: 0,
      duration: 0,
      description: '',
      image: '',
      status: 'ativo'
    });

    this.isModalOpen.set(true);
  }

  openEditModal(service: ServiceRow) {
    this.selectedService.set(service);
    this.selectedImageFile = null;

    this.serviceForm.patchValue({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description,
      status: service.status,
      image: service.imageUrl // preview
    });

    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedImageFile = null;
  }

  toggleModalStatus() {
    const currentStatus = this.serviceForm.get('status')?.value;
    this.serviceForm.get('status')?.setValue(currentStatus === 'ativo' ? 'inativo' : 'ativo');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.toast.error('Formato inválido. Use JPG, PNG ou WEBP.');
      return;
    }

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => this.serviceForm.patchValue({ image: reader.result as string });
    reader.readAsDataURL(file);
  }

  private async uploadServiceImage(file: File): Promise<string> {
    const estId = this.settingsService.estabelecimentoId();
    if (!estId) throw new Error('estabelecimentoId não definido.');

    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${estId}/${fileName}`; // storage path

    const { error } = await supabase.storage
      .from('servicos')
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (error) throw error;

    return filePath; // salva PATH no DB
  }

  async saveService() {
    if (this.serviceForm.invalid) return;

    const estId = await this.waitForEstabelecimentoId();
    if (!estId) {
      this.toast.error('Estabelecimento não encontrado.');
      return;
    }

    const v = this.serviceForm.value;
    const existing = this.selectedService();

    // mantém PATH no DB
    let imagePath: string | null = existing?.imagePath ?? null;

    // upload se selecionou novo arquivo
    if (this.selectedImageFile) {
      imagePath = await this.uploadServiceImage(this.selectedImageFile);
    }

    const payload = {
      estabelecimento_id: Number(estId),
      nome: String(v.name ?? '').trim(),
      descricao: String(v.description ?? '').trim() || null,
      duracao: Number(v.duration),
      preco: Number(v.price),
      ativo: v.status === 'ativo',
      imagem_url: imagePath
    };

    try {
      if (existing?.id) {
        const { error } = await supabase
          .from('estabelecimento_servicos')
          .update(payload)
          .eq('id', existing.id)
          .eq('estabelecimento_id', Number(estId));

        if (error) throw error;
        this.toast.success('Serviço alterado com sucesso!');
      } else {
        const { error } = await supabase
          .from('estabelecimento_servicos')
          .insert(payload);

        if (error) throw error;
        this.toast.success('Serviço incluído com sucesso!');
      }

      await this.loadServicesForEstabelecimento(estId);
      this.closeModal();
    } catch (e: any) {
      console.error('Erro ao salvar serviço:', e);
      this.toast.error(e?.message || 'Erro ao salvar serviço.');
    }
  }

  async toggleStatus(service: ServiceRow, event: Event) {
    event.stopPropagation();

    const estId = await this.waitForEstabelecimentoId();
    if (!estId) return;

    const newAtivo = service.status !== 'ativo';

    const { error } = await supabase
      .from('estabelecimento_servicos')
      .update({ ativo: newAtivo })
      .eq('id', service.id)
      .eq('estabelecimento_id', Number(estId));

    if (error) {
      console.error('Erro ao atualizar status:', error);
      this.toast.error('Erro ao atualizar status.');
      return;
    }

    await this.loadServicesForEstabelecimento(estId);
  }
}