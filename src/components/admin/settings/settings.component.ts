import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Configurações da Barbearia</h1>
        <p class="text-zinc-400 mt-1">Gerencie as informações públicas e a aparência da sua página.</p>
      </div>

      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="space-y-8">
        
        <!-- Bloco: Informações Básicas e Contato -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
          <h2 class="text-lg font-semibold text-white mb-1">Informações e Contato</h2>
          <p class="text-sm text-zinc-500 mb-6">Essas informações serão exibidas na sua página inicial.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nome da Barbearia -->
            <div>
              <label for="name" class="block text-sm font-medium text-zinc-300 mb-2">Nome da Barbearia</label>
              <input type="text" id="name" formControlName="name" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>
            
            <!-- Telefone Principal -->
            <div>
              <label for="phone" class="block text-sm font-medium text-zinc-300 mb-2">Telefone Principal</label>
              <input type="text" id="phone" formControlName="phone" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>
            
            <!-- Endereço Completo -->
            <div class="md:col-span-2">
              <label for="address" class="block text-sm font-medium text-zinc-300 mb-2">Endereço Completo</label>
              <input type="text" id="address" formControlName="address" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>

            <!-- Instagram -->
            <div>
              <label for="instagram" class="block text-sm font-medium text-zinc-300 mb-2">Instagram (Link)</label>
              <input type="text" id="instagram" formControlName="instagram" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>

            <!-- WhatsApp -->
            <div>
              <label for="whatsapp" class="block text-sm font-medium text-zinc-300 mb-2">WhatsApp (Link ou Número)</label>
              <input type="text" id="whatsapp" formControlName="whatsapp" class="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
            </div>
          </div>
        </div>

        <!-- Bloco: Mídia -->
        <div class="bg-zinc-950 p-6 rounded-lg border border-zinc-800">
           <h2 class="text-lg font-semibold text-white mb-1">Mídia</h2>
           <p class="text-sm text-zinc-500 mb-6">Personalize a identidade visual da sua página.</p>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Upload Logo -->
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Logo da Barbearia</label>
                <div class="mt-2 flex items-center gap-4">
                  <div class="w-24 h-24 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    @if (logoPreview()) {
                      <img [src]="logoPreview()" alt="Pré-visualização da logo" class="w-full h-full object-contain">
                    } @else {
                      <svg class="w-10 h-10 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    }
                  </div>
                   <input #logoUpload type="file" (change)="onFileSelected($event, 'logo')" accept="image/*" class="hidden">
                  <button type="button" (click)="logoUpload.click()" class="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors">
                    Enviar Foto
                  </button>
                </div>
              </div>

              <!-- Upload Vídeo -->
               <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Vídeo de Fundo (Loop)</label>
                <div class="mt-2 flex items-center justify-center w-full">
                  <label for="video-upload" class="flex flex-col items-center justify-center w-full h-24 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition-colors">
                      <div class="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg class="w-8 h-8 mb-2 text-zinc-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                          <p class="text-xs text-zinc-500"><span class="font-semibold">Clique para enviar</span> ou arraste</p>
                      </div>
                      <input id="video-upload" type="file" (change)="onFileSelected($event, 'video')" accept="video/mp4,video/quicktime" class="hidden" />
                  </label>
                </div> 
                @if (videoFileName()) {
                   <p class="text-xs text-zinc-400 mt-2">Novo arquivo: {{ videoFileName() }}</p>
                }
                @if (settingsForm.get('backgroundVideoUrl')?.value) {
                  <div class="mt-4">
                    <p class="text-xs text-zinc-400 mb-2">Pré-visualização do vídeo:</p>
                    <video [src]="settingsForm.get('backgroundVideoUrl')?.value" controls muted class="w-full rounded-lg border border-zinc-700 max-h-48"></video>
                  </div>
                }
              </div>
           </div>
        </div>

        <!-- Botão Salvar -->
        <div class="flex justify-end">
          <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settingsService = inject(SettingsService);
  // FIX: Explicitly type FormBuilder to avoid type inference issues.
  private fb: FormBuilder = inject(FormBuilder);

  settingsForm!: FormGroup;
  logoPreview = signal<string | null>(null);
  videoFileName = signal<string | null>(null);

  ngOnInit() {
    const currentSettings = this.settingsService.settings();
    this.settingsForm = this.fb.group({
      name: [currentSettings.name],
      phone: [currentSettings.phone],
      address: [currentSettings.address],
      instagram: [currentSettings.instagram],
      whatsapp: [currentSettings.whatsapp],
      logoUrl: [currentSettings.logoUrl],
      backgroundVideoUrl: [currentSettings.backgroundVideoUrl]
    });
    this.logoPreview.set(currentSettings.logoUrl);
  }

  onFileSelected(event: Event, type: 'logo' | 'video') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (type === 'video') {
      // Use URL.createObjectURL for better performance and to avoid size limits with videos
      const videoUrl = URL.createObjectURL(file);
      this.videoFileName.set(file.name);
      this.settingsForm.patchValue({ backgroundVideoUrl: videoUrl });
    } else { // type === 'logo'
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.logoPreview.set(result);
        this.settingsForm.patchValue({ logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      this.settingsService.updateSettings(this.settingsForm.value);
      alert('Configurações salvas com sucesso!');
      this.videoFileName.set(null);
    }
  }
}
