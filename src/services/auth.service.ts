import { supabase } from './../app/core/supabase/supabase.client';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from './theme.service';
import { ToastService } from '../app/services/toast.service';
import { Observable, tap, catchError, throwError, from } from 'rxjs';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: 'admin' | 'client' | 'barber';
  avatar?: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001';

  // Signals
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient,
    private themeService: ThemeService,
    private toastService: ToastService
  ) {
    // Tenta carregar usuário salvo (mesmo que token possa estar ausente)
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    // Verifica se o token expirou
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      console.warn('Token expirado — fazendo logout automático.');
      this.logout();
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        if (!token) {
          // Apenas aviso; ainda retemos o usuário para UX melhor após reload
          console.warn('Token ausente no localStorage — verifique se o token deveria ser salvo no login.');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        // Limpa dados inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastName');
        localStorage.removeItem('tokenExpiry');
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    this.isLoading.set(true);
    const promise = supabase.auth.signInWithPassword({
      email,
      password,
    });


    return from(promise).pipe(
      tap(({ data, error }) => {
        if (error) throw error;
        const meta = (data.user && (data.user as any).user_metadata) ? (data.user as any).user_metadata : {};

        // tenta várias fontes para primeiro nome
        const rawFirst = meta['first_name'] ?? (data.user as any)?.first_name ?? meta['nome'] ?? (data.user as any)?.nome ?? meta['home'] ?? (data.user as any)?.home ?? '';
        // tenta várias fontes para sobrenome
        const rawLast = meta['sobrenome'] ?? (data.user as any)?.last_name ?? (data.user as any)?.lastName ?? (data.user as any)?.sobrenome ?? '';

        const firstName = (rawFirst || '').toString().trim();
        const lastName = (rawLast || '').toString().trim();

        let fullName = (firstName + ' ' + lastName).trim();
        if (!fullName) {
          const email = data.user?.email || '';
          fullName = email ? email.split('@')[0] : 'Usuário';
        }

        console.debug('Name source:', { firstName, lastName, fullName, userMeta: meta });

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: fullName,
          lastName: lastName,
          role: (meta['role'] ?? (data.user as any)?.role) || 'client'
        };

        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('lastName', lastName);

        // Salva token se estiver presente na sessão de retorno
        const token = (data as any)?.session?.access_token ?? (data as any)?.access_token ?? null;
        if (token) {
          localStorage.setItem('token', token);
          // Define expiração em 24 horas (86400000 ms)
          const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }

        // Tenta completar qualquer pendingUserInsert (ex.: quando a criação pública deu 403 no registro inicial)
        try {
          this.flushPendingUserInsert();
        } catch (e) {
          console.warn('Erro ao tentar flushPendingUserInsert after login:', e);
        }

        this.isLoading.set(false);
        this.router.navigate(['/home']);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  async register(email: string, pass: string, nome: string, sobrenome: string, dataNascimento?: string) {
    // 1) Cria no auth.users (supabase auth)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: {
          first_name: nome,
          last_name: sobrenome,
          data_nascimento: dataNascimento ?? null
        }
      }
    });

    if (error) throw error;

    // 2) Depois, cria um registro correspondente em public.usuarios com o mesmo id
    try {
      const userId = (data as any)?.user?.id;
      const emailReturned = (data as any)?.user?.email ?? email;

      if (userId) {
        const payload = {
          id: userId,
          nome: nome ?? '',
          sobrenome: sobrenome ?? '',
          email: emailReturned,
          data_nascimento: dataNascimento ?? null,
          role: 'client'
        };

        const { data: inserted, error: insertError } = await supabase
          .from('usuarios')
          .insert(payload);

        if (insertError) {
          console.warn('Erro ao inserir em public.usuarios:', insertError);
          // Se for erro de permissão (usuário ainda não autenticado/sem token válido), registramos para tentar novamente
          if (String(insertError?.message || '').toLowerCase().includes('permission') || String(insertError?.message || '').toLowerCase().includes('forbidden') || String(insertError?.message || '').toLowerCase().includes('not authenticated')) {
            try {
              localStorage.setItem('pendingUserInsert', JSON.stringify(payload));
              console.warn('Inserção adiada. Será tentativa novamente no próximo login do usuário.');
            } catch (e) {
              console.error('Erro ao armazenar pendingUserInsert:', e);
            }
            // Não propaga o erro - cadastro no Auth já foi bem sucedido
          } else {
            // para outros erros, propaga
            throw insertError;
          }
        }
      }
    } catch (err) {
      console.error('Erro ao criar usuário em public.usuarios:', err);
      throw err;
    }

    return data;
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, {
      email,
      code,
      newPassword
    });
  }

  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  logout() {
    // Força tema claro ao sair do painel
    try {
      this.themeService.isDark.set(false);
    } catch (e) {
      // se ThemeService não estiver disponível por algum motivo, ignora
      console.warn('Não foi possível resetar tema:', e);
    }

    // Exibe toast de confirmação
    try {
      this.toastService.success('Logout feito com sucesso!');
    } catch (e) {
      // ignora se ToastService não disponível
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastName');
    localStorage.removeItem('tokenExpiry');
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  isAuthenticated() {
    return this.currentUser() !== null;
  }

  getFormattedUserName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ===== Pending user insert handling for cases where creating public.usuarios fails with 403
  private async flushPendingUserInsert() {
    const raw = localStorage.getItem('pendingUserInsert');
    if (!raw) return;

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.error('pendingUserInsert inválido no localStorage:', e);
      localStorage.removeItem('pendingUserInsert');
      return;
    }

    try {
      const { data, error } = await supabase.from('usuarios').insert(payload).select().single();
      if (error) {
        console.warn('Ainda não foi possível inserir pendingUserInsert:', error);
        return;
      }

      // Se inserido com sucesso, remove o pendente
      localStorage.removeItem('pendingUserInsert');
      try { this.toastService.success('Perfil de usuário criado com sucesso.'); } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('Erro ao tentar flushPendingUserInsert:', e);
    }
  }
}
