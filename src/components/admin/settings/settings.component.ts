import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../services/settings.service';
import { supabase } from '../../../app/core/supabase/supabase.client';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../app/services/toast.service';
import { LoadingSpinnerComponent } from '../../../app/components/loading-spinner.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="relative max-w-4xl mx-auto space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Configurações da Barbearia</h1>
        <p class="text-zinc-400 mt-1">Gerencie as informações públicas e a aparência da sua página.</p>
      </div>

      @if (isLoadingSettings()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-lg">
          <app-loading-spinner color="yellow" size="md"></app-loading-spinner>
        </div>
      }

      <form [formGroup]="settingsForm" (ngSubmit)="saveAllSettings()" class="space-y-8">
        
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h2 class="text-lg font-semibold text-white mb-1">Informações e Contato</h2>
          <p class="text-sm text-zinc-500 mb-6">Essas informações serão exibidas na sua página inicial.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="nome" class="block text-sm font-medium text-zinc-300 mb-2">Nome da Barbearia</label>
              <input type="text" id="nome" formControlName="nome" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>
            
            <div>
              <label for="telefone_principal" class="block text-sm font-medium text-zinc-300 mb-2">Telefone Principal</label>
              <input type="text" id="telefone_principal" formControlName="telefone_principal" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>
            
            <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="md:col-span-2">
                <label for="rua" class="block text-sm font-medium text-zinc-300 mb-2">Rua</label>
                <input type="text" id="rua" formControlName="rua" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>

              <div>
                <label for="numero" class="block text-sm font-medium text-zinc-300 mb-2">Número</label>
                <input type="text" id="numero" formControlName="numero" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>

              <div>
                <label for="bairro" class="block text-sm font-medium text-zinc-300 mb-2">Bairro</label>
                <input type="text" id="bairro" formControlName="bairro" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>

              <div>
                <label for="cidade" class="block text-sm font-medium text-zinc-300 mb-2">Cidade</label>
                <input type="text" id="cidade" formControlName="cidade" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>

              <div>
                <label for="uf" class="block text-sm font-medium text-zinc-300 mb-2">UF</label>
                <input type="text" id="uf" formControlName="uf" maxlength="2" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              </div>
            </div>

            <div>
              <label for="slug" class="block text-sm font-medium text-zinc-300 mb-2">Slug (URL amigável)</label>
              <input type="text" id="slug" formControlName="slug" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>

            <div>
              <label for="link_instagram" class="block text-sm font-medium text-zinc-300 mb-2">Instagram (Link)</label>
              <input type="text" id="link_instagram" formControlName="link_instagram" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>

            <div>
              <label for="nr_whatsapp" class="block text-sm font-medium text-zinc-300 mb-2">WhatsApp (Número)</label>
              <input type="text" id="nr_whatsapp" formControlName="nr_whatsapp" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>
          </div>
        </div>

        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
           <h2 class="text-lg font-semibold text-white mb-1">Mídia</h2>
           <p class="text-sm text-zinc-500 mb-6">Personalize a identidade visual da sua página.</p>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Logo da Barbearia</label>
                <div class="mt-2 flex items-center gap-4">
                  <div class="w-24 h-24 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    @if (logoPreview()) {
                      <img [src]="logoPreview()" alt="Logo" class="w-full h-full object-contain">
                    } @else {
                      <svg class="w-10 h-10 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    }
                  </div>
                  <input #logoUpload type="file" (change)="onFileSelected($event, 'logo')" accept="image/*" class="hidden">
                  <button type="button" (click)="logoUpload.click()" class="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                    Alterar Foto
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Imagem de Fundo (Background)</label>
                <div class="mt-2 flex items-center gap-4">
                  <div class="w-48 h-24 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    @if (backgroundPreview()) {
                      <img [src]="backgroundPreview()" alt="Background preview" class="w-full h-full object-cover">
                    } @else {
                      <svg class="w-8 h-8 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7M8 3v4M16 3v4M3 11h18M4 15l4-4 3 3 4-4 5 5" /></svg>
                    }
                  </div>
                  <input #bgUpload type="file" (change)="onFileSelected($event, 'background')" accept="image/*" class="hidden">
                  <button type="button" (click)="bgUpload.click()" class="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                    Alterar Background
                  </button>
                </div>
                @if (backgroundFileName()) {
                   <p class="text-xs text-yellow-500 mt-2 font-medium">Novo selecionado: {{ backgroundFileName() }}</p>
                }
                @if (settingsForm.get('photo_background_url')?.value) {
                  <div class="mt-4">
                    <img [src]="settingsForm.get('photo_background_url')?.value" class="w-full rounded-lg border border-zinc-700 max-h-48 object-cover" alt="Preview Background">
                  </div>
                }
              </div>
           </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" [disabled]="isSaving()" class="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
            {{ isSaving() ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  settingsForm!: FormGroup;

  // Signals para UI
  logoPreview = signal<string | null>(null);
  backgroundPreview = signal<string | null>(null);
  backgroundFileName = signal<string | null>(null);
  isSaving = signal<boolean>(false);
  // Carregamento do estabelecimento associado ao usuário
  isLoadingSettings = signal<boolean>(false);

  // Arquivos brutos para Upload
  selectedLogo: File | null = null;
  selectedBackground: File | null = null;



  async ngOnInit() {
    // Inicializa com valores locais (fallback rápido)
    const currentSettings = this.settingsService.settings();

    this.settingsForm = this.fb.group({
      nome: [currentSettings.nome || ''],
      telefone_principal: [currentSettings.telefone_principal || ''],
      uf: [currentSettings.uf || '', [Validators.maxLength(2), Validators.pattern(/^[A-Za-z]{2}$/)]],
      cidade: [currentSettings.cidade || ''],
      bairro: [currentSettings.bairro || ''],
      rua: [currentSettings.rua || ''],
      numero: [currentSettings.numero ?? '', [Validators.pattern(/^[0-9]+$/)]],
      link_instagram: [currentSettings.link_instagram || ''],
      nr_whatsapp: [currentSettings.nr_whatsapp || ''],
      slug: [currentSettings.slug || ''],
      photo_url: [currentSettings.photo_url || ''],
      photo_background_url: [currentSettings.photo_background_url || '']
    });

    this.logoPreview.set(currentSettings.photo_url);
    this.backgroundPreview.set(currentSettings.photo_background_url || null);

    // Se houver usuário logado, tenta carregar o estabelecimento associado a ele
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.isLoadingSettings.set(true);
      try {
        const loaded = await this.settingsService.loadSettingsByUserId(user.id);
        if (loaded) {
          // Atualiza o formulário com os dados do estabelecimento
          this.settingsForm.patchValue({
            nome: loaded.nome || '',
            telefone_principal: loaded.telefone_principal || '',
            uf: loaded.uf || '',
            cidade: loaded.cidade || '',
            bairro: loaded.bairro || '',
            rua: loaded.rua || '',
            numero: loaded.numero ?? '',
            link_instagram: loaded.link_instagram || '',
            nr_whatsapp: loaded.nr_whatsapp || '',
            slug: loaded.slug || '',
            photo_url: loaded.photo_url || '',
            photo_background_url: loaded.photo_background_url || ''
          });

          this.logoPreview.set(loaded.photo_url || null);
          this.backgroundPreview.set(loaded.photo_background_url || null);
        }
      } catch (e) {
        console.warn('Não foi possível carregar estabelecimento do usuário:', e);
      } finally {
        this.isLoadingSettings.set(false);
      }
    }
  }

  onFileSelected(event: Event, type: 'logo' | 'background') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (type === 'logo') {
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.selectedBackground = file;
      this.backgroundFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = (e) => this.backgroundPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  private async computeFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async uploadFile(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const hash = await this.computeFileHash(file);
    const fileName = `${hash}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Tenta fazer upload; se já existir, reutiliza a URL
    const { error: uploadError } = await supabase.storage
      .from('estabelecimentos')
      .upload(filePath, file);

    if (uploadError) {
      // Se falhou (provavelmente porque o arquivo já existe), tenta buscar a URL pública
      const { data: existing } = supabase.storage.from('estabelecimentos').getPublicUrl(filePath);
      if (existing?.publicUrl) {
        // Informação útil para o usuário, mas sem poluir logs
        this.toast.info('Arquivo já existe no storage; reutilizando a URL existente.');
        return existing.publicUrl;
      }
      throw uploadError;
    }

    const { data } = supabase.storage.from('estabelecimentos').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async saveAllSettings() {
    // 1) Bloqueia se já está salvando
    if (this.isSaving()) return;

    // 2) Valida e mostra toast (fica tudo aqui dentro)
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.toast.error(this.getFirstFormErrorMessage());
      return;
    }

    this.isSaving.set(true);

    try {
      // Use os valores corretos presentes no FormGroup
      let finalLogoUrl = this.settingsForm.value.photo_url;
      let finalBackgroundUrl = this.settingsForm.value.photo_background_url;

      // Normaliza Instagram e WhatsApp
      const finalInstagram = this.normalizeInstagram(this.settingsForm.value.link_instagram ?? '');
      const finalWhatsapp = this.normalizePhoneDigits(this.settingsForm.value.nr_whatsapp ?? '');

      // 1. Upload Logo se houver nova selecionada
      if (this.selectedLogo) {
        finalLogoUrl = await this.uploadFile(this.selectedLogo, 'avatares');
      }

      // 2. Upload Background Image se houver nova selecionada
      if (this.selectedBackground) {
        finalBackgroundUrl = await this.uploadFile(this.selectedBackground, 'backgrounds');
      }

      // 3. Atualizar objeto final (normaliza as chaves para backend)
      const ufValue = String(this.settingsForm.value.uf ?? '').trim().toUpperCase();
      const numeroRaw = this.settingsForm.value.numero;
      const numeroValue = numeroRaw !== undefined && numeroRaw !== null && String(numeroRaw).trim() !== ''
        ? Number(String(numeroRaw).replace(/\D/g, ''))
        : null;

      const updatedData = {
        nome: this.settingsForm.value.nome?.trim(),
        telefone_principal: this.normalizePhoneDigits(this.settingsForm.value.telefone_principal ?? ''),
        uf: ufValue,
        cidade: this.settingsForm.value.cidade?.trim(),
        bairro: this.settingsForm.value.bairro?.trim(),
        rua: this.settingsForm.value.rua?.trim(),
        numero: numeroValue,
        link_instagram: finalInstagram,
        nr_whatsapp: finalWhatsapp,
        slug: this.normalizeSlug(this.settingsForm.value.slug ?? ''),
        photo_url: finalLogoUrl ?? '',
        photo_background_url: finalBackgroundUrl ?? '',
        usuario_id: this.authService.currentUser()?.id ?? null
      };

      // 4. Decide entre INSERT ou UPDATE dependendo se já temos um id salvo
      const existingId = (this.settingsService as any)?.estabelecimentoId?.() || null;

      if (existingId) {
        // Update
        const { data: updated, error: dbError } = await supabase
          .from('estabelecimentos')
          .update(updatedData)
          .eq('id', existingId)
          .select()
          .single();

        if (dbError) throw dbError;

        // Atualiza serviço local com os novos valores
        this.settingsService.settings.set({ ...(this.settingsService.settings() as any), ...updatedData });

        this.backgroundFileName.set(null);
        this.selectedLogo = null;
        this.selectedBackground = null;

        this.toast.success('Estabelecimento atualizado com sucesso!');
      } else {
        // Insert
        const { data: inserted, error: dbError } = await supabase
          .from('estabelecimentos')
          .insert(updatedData)
          .select()
          .single();

        if (dbError) throw dbError;

        // Atualiza serviço local e armazena id criado
        this.settingsService.settings.set({ ...(this.settingsService.settings() as any), ...updatedData });
        const createdId = (inserted as any)?.id;
        if (createdId && (this.settingsService as any).setEstabelecimentoId) {
          (this.settingsService as any).setEstabelecimentoId(createdId);
        }

        this.backgroundFileName.set(null);
        this.selectedLogo = null;
        this.selectedBackground = null;

        this.toast.success('Estabelecimento criado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error);

      // Opcional: mensagem melhor se for erro de slug duplicado etc.
      const msg = this.mapSupabaseErrorToMessage(error);
      this.toast.error(msg);
    } finally {
      this.isSaving.set(false);
    }
  }

  /** ===== Helpers (ficam na mesma classe) ===== */

  private getFirstFormErrorMessage(): string {
    const fields: Array<{ key: string; label: string }> = [
      { key: 'nome', label: 'Nome' },
      { key: 'telefone_principal', label: 'Telefone principal' },
      { key: 'rua', label: 'Rua' },
      { key: 'numero', label: 'Número' },
      { key: 'bairro', label: 'Bairro' },
      { key: 'cidade', label: 'Cidade' },
      { key: 'uf', label: 'UF' },
      { key: 'link_instagram', label: 'Instagram' },
      { key: 'nr_whatsapp', label: 'WhatsApp' },
      { key: 'slug', label: 'Slug' },
      { key: 'photo_url', label: 'Logo (URL)' },
      { key: 'photo_background_url', label: 'Fundo (URL)' }
    ];

    for (const f of fields) {
      const c = this.settingsForm.get(f.key);
      if (!c || !c.errors) continue;

      // se não tocou ainda, mas está inválido, também queremos mostrar
      const e = c.errors;

      if (e['required']) return `${f.label} é obrigatório.`;
      if (e['whitespace']) return `${f.label} não pode ficar em branco.`;
      if (e['minlength']) return `${f.label} precisa ter no mínimo ${e['minlength'].requiredLength} caracteres.`;
      if (e['maxlength']) return `${f.label} precisa ter no máximo ${e['maxlength'].requiredLength} caracteres.`;
      if (e['pattern']) {
        if (f.key === 'slug') return `Slug inválido. Use letras minúsculas, números e hífen (ex: minha-loja-1).`;
        if (f.key === 'link_instagram') return `Link do Instagram inválido.`;
        if (f.key === 'uf') return `UF inválida. Deve conter 2 letras (ex: SP).`;
        if (f.key === 'numero') return `Número inválido. Use apenas dígitos.`;
        return `${f.label} inválido.`;
      }
      if (e['url']) return `${f.label} deve ser uma URL válida (http/https).`;
      if (e['phoneLength']) return `${f.label} deve ter entre ${e['phoneLength'].min} e ${e['phoneLength'].max} dígitos.`;
    }

    return 'Há campos inválidos. Verifique o formulário.';
  }

  private normalizePhoneDigits(value: string): string {
    return String(value ?? '').replace(/\D/g, '');
  }

  private normalizeSlug(value: string): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')          // espaços viram hífen
      .replace(/[^a-z0-9-]/g, '')    // remove caracteres inválidos
      .replace(/-+/g, '-')           // colapsa hífens
      .replace(/^-|-$/g, '');        // remove hífen nas pontas
  }

  private normalizeInstagram(value: string): string {
    const v = String(value ?? '').trim();
    if (!v) return '';

    // Se já for URL, mantém; se for @usuario ou usuario, converte em URL
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const handle = v.replace(/^@/, '').replace(/\s+/g, '');
    return `https://instagram.com/${handle}`;
  }

  private mapSupabaseErrorToMessage(error: any): string {
    const raw = (error?.message || '').toLowerCase();

    // exemplos comuns (dependem do constraint do banco)
    if (raw.includes('duplicate key') || raw.includes('unique constraint')) {
      if (raw.includes('slug')) return 'Este slug já está em uso. Escolha outro.';
      return 'Já existe um registro com esses dados.';
    }

    return 'Erro ao salvar: ' + (error?.message || 'Verifique o console');
  }

}