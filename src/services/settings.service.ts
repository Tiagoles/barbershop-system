import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { supabase } from '../app/core/supabase/supabase.client';
import { AuthService } from './auth.service';
import { ToastService } from '../app/services/toast.service';

export interface BarbershopSettings {
  nome: string;
  telefone_principal: string;
  uf: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string | number;
  link_instagram: string;
  nr_whatsapp: string;
  slug?: string;
  photo_url: string | null;
  photo_background_url: string | null; // URL da imagem de fundo (photo_background_url no DB)
  usuario_id?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Signal vazio inicialmente - será carregado do Supabase
  settings = signal<BarbershopSettings>({
    nome: '',
    telefone_principal: '',
    uf: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    link_instagram: '',
    nr_whatsapp: '',
    slug: '',
    photo_url: null,
    photo_background_url: null,
  });

  // Opcional: Armazena localmente o id do estabelecimento criado/atualizado
  estabelecimentoId = signal<string | null>(null);

  setEstabelecimentoId(id: string | number | null) {
    this.estabelecimentoId.set(id ? String(id) : null);
  }

  // Gera um path seguro para usar com Supabase Storage (codifica segmentos)
  private toStorageSafePath(raw: string) {
    if (!raw) return raw;
    let p = String(raw).trim();
    if (!p) return p;

    // Remove slash inicial se houver
    if (p.startsWith('/')) p = p.slice(1);

    // Se já for uma URL pública completa, extrai a parte após '/object/public/<bucket>/'
    if (p.startsWith('http')) {
      try {
        const url = new URL(p);
        const idx = url.pathname.indexOf('/object/public/');
        if (idx !== -1) {
          const parts = url.pathname.slice(idx + '/object/public/'.length).split('/');
          // remove o bucket (primeiro item) e retorna o restante codificado
          return parts.slice(1).map(encodeURIComponent).join('/');
        }
      } catch (e) {
        // se falhar, apenas continue
      }
    }

    return p.split('/').map(encodeURIComponent).join('/');
  }

  // Carrega estabelecimento associado ao usuário (por usuario_id) diretamente do Supabase
  async loadSettingsByUserId(userId: string) {
    if (!userId) return null;

    try {

      // Busca um estabelecimento que tenha usuario_id = userId
      const { data, error } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('usuario_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao carregar estabelecimento por usuario_id:', error);
        return null;
      }

      if (!data) {
        console.debug('[SettingsService] nenhum estabelecimento encontrado para usuario:', userId);
        return null;
      }


      const normalized: BarbershopSettings = {
        nome: data.nome ?? data.name ?? '',
        telefone_principal: data.telefone_principal ?? data.phone ?? '',
        uf: data.uf ?? data.state ?? '',
        cidade: data.cidade ?? data.city ?? '',
        bairro: data.bairro ?? data.neighborhood ?? '',
        rua: data.rua ?? data.street ?? '',
        numero: data.numero ?? data.number ?? '',
        link_instagram: data.link_instagram ?? data.instagram ?? '',
        nr_whatsapp: data.nr_whatsapp ?? data.whatsapp ?? '',
        slug: data.slug ?? '',
        photo_url: data.photo_url ?? data.photoUrl ?? data.logoUrl ?? null,
        photo_background_url: data.photo_background_url ?? data.photoBackgroundUrl ?? null,
        usuario_id: data.usuario_id ?? null
      };

      // Atualiza o signal fora do ciclo atual para evitar ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => this.settings.set(normalized));
      // se retornou um id, armazena localmente para futuras edições
      if (data.id) this.setEstabelecimentoId(data.id);

      return normalized;
    } catch (e) {
      console.error('Erro inesperado ao carregar estabelecimento por usuario:', e);
      return null;
    }
  }

  constructor(private authService: AuthService, private toast: ToastService) {
    this.loadSettings();
  }

  async loadSettings(): Promise<BarbershopSettings | null> {
    try {
      const user = this.authService?.currentUser?.() ?? null;

      // Sem usuário logado: não carrega nada
      if (!user?.id) {
        this.setEstabelecimentoId(null);
        this.settings.set({
          nome: '',
          telefone_principal: '',
          uf: '',
          cidade: '',
          bairro: '',
          rua: '',
          numero: '',
          link_instagram: '',
          nr_whatsapp: '',
          slug: '',
          photo_url: null,
          photo_background_url: null,
          usuario_id: null
        });
        return null;
      }

      // Carrega somente o estabelecimento do usuário logado
      const loaded = await this.loadSettingsByUserId(user.id);

      // Se não encontrou estabelecimento, zera state e sai
      if (!loaded) {
        this.setEstabelecimentoId(null);
        this.settings.set({
          nome: '',
          telefone_principal: '',
          uf: '',
          cidade: '',
          bairro: '',
          rua: '',
          numero: '',
          link_instagram: '',
          nr_whatsapp: '',
          slug: '',
          photo_url: null,
          photo_background_url: null,
          usuario_id: user.id
        });
        return null;
      }

      return loaded;
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
      this.toast.error('Erro ao carregar configurações.');
      return null;
    }
  }



  async updateSettings(newSettings: Partial<BarbershopSettings>): Promise<any> {
    try {
      const estId = this.estabelecimentoId();
      if (estId) {
        const { data, error } = await supabase.from('estabelecimentos').update(newSettings as any).eq('id', estId).select().single();
        if (error) {
          console.error('[SettingsService] update error', error);
          throw error;
        }
        // reload to normalize and set signals
        await this.loadSettings();
        try { this.toast.success('Configurações atualizadas.'); } catch (e) { }
        return data;
      } else {
        const payload: any = { ...(newSettings as any), usuario_id: this.authService.currentUser()?.id ?? null };
        const { data, error } = await supabase.from('estabelecimentos').insert(payload).select().single();
        if (error) {
          console.error('[SettingsService] insert error', error);
          throw error;
        }
        if (data?.id) this.setEstabelecimentoId(data.id);
        await this.loadSettings();
        try { this.toast.success('Configurações criadas.'); } catch (e) { }
        return data;
      }
    } catch (e) {
      console.error('Erro ao salvar configurações no Supabase:', e);
      try { this.toast.error('Erro ao salvar configurações'); } catch (e) { }
      throw e;
    }
  }
}
