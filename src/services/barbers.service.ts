import { Injectable } from '@angular/core';
import { supabase } from '../app/core/supabase/supabase.client';

export interface BarberPayload {
    name: string;
    email?: string;
    phone?: string;
    commission?: number;
    avatarFile?: File | null;
}

@Injectable({ providedIn: 'root' })
export class BarbersService {
    // Lista os barbeiros vinculados a um estabelecimento
    async listByEstabelecimento(estabelecimentoId: string) {
        if (!estabelecimentoId) return [];

        const { data, error } = await supabase
            .from('barbearia_barbeiros')
            .select(`
        id,
        estabelecimento_id,
        barbeiro_id,
        comissao_especifica,
        avatar_url,
        data_vinculo,
        barbeiros(
          id,
          nome,
          email,
          telefone,
          ativo
        )
      `)
            .eq('estabelecimento_id', estabelecimentoId);

        if (error) {
            console.warn('[BarbersService] list error', error);
            return [];
        }

        // Normaliza para o formato consumido pelo componente
        const mapped = (data as any[]).map(r => {
            const b = r.barbeiros ?? {};

            // Resolve URL público se avatar_url é um path
            let avatar = b.avatar_url ?? r.avatar_url ?? null;
            if (avatar && !String(avatar).startsWith('http')) {
                try {
                    const { data: p } = supabase.storage.from('barbeiros').getPublicUrl(avatar);
                    avatar = p?.publicUrl ?? avatar;
                } catch (e) {
                    /* ignore */
                }
            }

            return {
                id: r.id,
                barbeiro_id: b.id ?? r.barbeiro_id,
                name: b.nome ?? '',
                email: b.email ?? null,
                phone: b.telefone ?? null,
                commission: r.comissao_especifica ?? null,
                avatar: avatar
            };
        });

        return mapped;
    }

    // Cria um novo barbeiro (barbeiros -> barbearia_barbeiros) e faz upload da foto para o bucket 'barbeiros'
    async create(estabelecimentoId: string, payload: BarberPayload) {
        if (!estabelecimentoId) throw new Error('estabelecimentoId required');

        // 1) Cria barbeiro diretamente
        const { data: barberData, error: barberError } = await supabase
            .from('barbeiros')
            .insert({
                nome: payload.name,
                email: payload.email ?? null,
                telefone: payload.phone ?? null,
                ativo: true
            })
            .select()
            .single();

        if (barberError) {
            console.warn('[BarbersService] error inserting barbeiros', barberError);
            throw barberError;
        }

        const barbeiroId = barberData.id;

        // 2) Upload avatar se houver
        let avatarPath: string | null = null;
        if (payload.avatarFile) {
            const ext = (payload.avatarFile.name.split('.').pop() || '').split('?')[0];
            const filename = `${estabelecimentoId}/${crypto.randomUUID()}_${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage.from('barbeiros').upload(filename, payload.avatarFile, { upsert: true });
            if (uploadError) {
                console.warn('[BarbersService] upload error', uploadError);
                throw uploadError;
            }

            avatarPath = filename;
        }

        // 3) Cria vinculo barbearia_barbeiros
        const { data: linkData, error: linkError } = await supabase
            .from('barbearia_barbeiros')
            .insert({ estabelecimento_id: estabelecimentoId, barbeiro_id: barbeiroId, comissao_especifica: payload.commission ?? null, avatar_url: avatarPath, data_vinculo: new Date().toISOString() })
            .select()
            .single();

        if (linkError) {
            console.warn('[BarbersService] error inserting barbearia_barbeiros', linkError);
            throw linkError;
        }

        return { barbeiro: barberData, link: linkData };
    }

    async remove(barbeariaId: number) {
        // Primeiro busca para obter barbeiro_id e avatar_url
        const { data, error } = await supabase.from('barbearia_barbeiros').select('*').eq('id', barbeariaId).maybeSingle();
        if (error) throw error;
        if (!data) return null;

        const avatarPath = data.avatar_url;
        const barbeiroId = data.barbeiro_id;

        // Deletar vinculo
        const { error: delLinkError } = await supabase.from('barbearia_barbeiros').delete().eq('id', barbeariaId);
        if (delLinkError) console.warn('[BarbersService] error deleting link', delLinkError);

        // Deletar barbeiro
        if (barbeiroId) {
            const { error: delBarberError } = await supabase.from('barbeiros').delete().eq('id', barbeiroId);
            if (delBarberError) console.warn('[BarbersService] error deleting barbeiro', delBarberError);
        }

        // Deletar avatar do storage
        if (avatarPath) {
            const { error: delStorageError } = await supabase.storage.from('barbeiros').remove([avatarPath]);
            if (delStorageError) console.warn('[BarbersService] error deleting storage', delStorageError);
        }

        return { removed: true };
    }

    // Atualiza um vínculo (barbearia_barbeiros) e seus dados relacionados (barbeiros)
    async update(barbeariaId: number, payload: Partial<BarberPayload & { barbeiro_id?: number }>) {
        // Busca registro existente
        const { data: existing, error: existingErr } = await supabase.from('barbearia_barbeiros').select('*').eq('id', barbeariaId).maybeSingle();
        if (existingErr) throw existingErr;
        if (!existing) throw new Error('Registro não encontrado');

        const barbeiroId = existing.barbeiro_id;

        // Atualiza barbeiros (nome, email, telefone)
        const barberUpdate: any = {};
        if (payload.name !== undefined) barberUpdate.nome = payload.name;
        if (payload.email !== undefined) barberUpdate.email = payload.email;
        if (payload.phone !== undefined) barberUpdate.telefone = payload.phone;

        if (Object.keys(barberUpdate).length) {
            const { error: barberUpdateError } = await supabase.from('barbeiros').update(barberUpdate).eq('id', barbeiroId);
            if (barberUpdateError) console.warn('[BarbersService] barber update error', barberUpdateError);
        }

        // Se houver novo avatar, faz upload e atualiza avatar_url
        let avatarPath = existing.avatar_url;
        if (payload.avatarFile) {
            const ext = (payload.avatarFile.name.split('.').pop() || '').split('?')[0];
            const filename = `${existing.estabelecimento_id}/${crypto.randomUUID()}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('barbeiros').upload(filename, payload.avatarFile, { upsert: true });
            if (uploadError) throw uploadError;
            avatarPath = filename;
            // Remove antiga imagem se existir
            if (existing.avatar_url) {
                const { error: removeError } = await supabase.storage.from('barbeiros').remove([existing.avatar_url]);
                if (removeError) console.warn('[BarbersService] error removing old avatar', removeError);
            }
        }

        // Atualiza vinculo com comissao_especifica e avatar_url
        const linkUpdate: any = {};
        if (payload.commission !== undefined) linkUpdate.comissao_especifica = payload.commission;
        if (avatarPath !== undefined) linkUpdate.avatar_url = avatarPath;

        if (Object.keys(linkUpdate).length) {
            const { error: linkUpdateError } = await supabase.from('barbearia_barbeiros').update(linkUpdate).eq('id', barbeariaId);
            if (linkUpdateError) console.warn('[BarbersService] link update error', linkUpdateError);
        }

        return { updated: true };
    }
}
