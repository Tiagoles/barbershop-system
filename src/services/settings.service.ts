import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { supabase } from '../app/core/supabase/supabase.client';

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
  private apiUrl = 'http://localhost:3001/api';

  // Signal vazio inicialmente - será carregado do backend
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
      console.debug('[SettingsService] loadSettingsByUserId:', userId);
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

      console.debug('[SettingsService] estabelecimento retornado:', data);

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

  constructor(private http: HttpClient) {
    this.loadSettings();
  }

  loadSettings() {
    this.http.get<BarbershopSettings>(`${this.apiUrl}/settings`).subscribe({
      next: (settings: any) => {
        // Normaliza campos que podem vir em snake_case do backend
        const normalized: BarbershopSettings = {
          nome: settings.nome ?? settings.name ?? '',
          telefone_principal: settings.telefone_principal ?? settings.telefone_principal ?? settings.phone ?? '',
          uf: settings.uf ?? settings.state ?? '',
          cidade: settings.cidade ?? settings.city ?? '',
          bairro: settings.bairro ?? settings.neighborhood ?? '',
          rua: settings.rua ?? settings.street ?? '',
          numero: settings.numero ?? settings.number ?? '',
          link_instagram: settings.link_instagram ?? settings.instagram ?? '',
          nr_whatsapp: settings.nr_whatsapp ?? settings.whatsapp ?? '',
          slug: settings.slug ?? '',
          photo_url: settings.photo_url ?? settings.photoUrl ?? settings.logoUrl ?? null,
          photo_background_url: settings.photo_background_url ?? settings.photoBackgroundUrl ?? null,
          usuario_id: settings.usuario_id ?? settings.usuarioId ?? settings.user_id ?? settings.userId ?? null
        };

        // Se os campos de imagem estiverem armazenados como paths (ex: 'avatares/xyz.jpg'),
        // resolve-os para URLs públicas do Supabase Storage para uso no frontend.
        const resolvePublicUrl = (rawPath: string) => {
          try {
            const path = this.toStorageSafePath(rawPath);
            const { data: p } = supabase.storage.from('estabelecimentos').getPublicUrl(path);
            return p?.publicUrl ?? rawPath;
          } catch (e) {
            console.warn('Não foi possível resolver publicUrl para', rawPath, e);
            return rawPath;
          }
        };

        if (normalized.photo_url && !normalized.photo_url.startsWith('http')) {
          normalized.photo_url = resolvePublicUrl(normalized.photo_url);
        }

        if (normalized.photo_background_url && !normalized.photo_background_url.startsWith('http')) {
          normalized.photo_background_url = resolvePublicUrl(normalized.photo_background_url);
        }
        // Atualiza o signal no próximo tick para evitar ExpressionChangedAfterItHasBeenCheckedError
        Promise.resolve().then(() => this.settings.set(normalized));
        // Se a API retornar um id, armazena localmente para futuras operações
        this.setEstabelecimentoId(settings.id ?? settings.estabelecimento_id ?? null);
      },
      error: (error: any) => {
        if (error && error.status === 0) {
          console.error('Erro ao carregar configurações: API indisponível (verifique se o backend em http://localhost:3001 está rodando).', error);
        } else {
          console.error('Erro ao carregar configurações:', error);
        }
      }
    });
  }

  updateSettings(newSettings: Partial<BarbershopSettings>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/settings`, newSettings);
  }
}
