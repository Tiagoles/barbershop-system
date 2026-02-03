import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-success',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-zinc-950">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
        <p class="text-white">Autenticando...</p>
      </div>
    </div>
  `
})
export class AuthSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    console.log('🚀 AuthSuccessComponent inicializado');

    // Com hash location, precisamos pegar os parâmetros da URL corretamente
    const token = this.route.snapshot.queryParamMap.get('token');

    // Se não encontrar no query params, tenta pegar da URL completa
    const urlToken = this.getTokenFromUrl();
    const finalToken = token || urlToken;

    console.log('🔍 Token recebido (query):', !!token);
    console.log('� Token recebido (URL):', !!urlToken);
    console.log('🔍 Token final:', !!finalToken);
    console.log('�📍 URL atual:', window.location.href);

    if (finalToken) {
      try {
        console.log('💾 Salvando token no localStorage...');
        // Salva o token no localStorage
        localStorage.setItem('token', finalToken);

        console.log('🔓 Decodificando token...');
        // Decodifica o token para obter informações do usuário
        const payload = JSON.parse(atob(finalToken.split('.')[1]));
        console.log('📋 Payload do token:', payload);

        // Cria o objeto usuário
        const user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.name || payload.email.split('@')[0] || 'Usuário',
          lastName: payload.lastName,
          avatar: payload.avatar
        };

        console.log('👤 Objeto usuário criado:', user);

        // Salva o usuário no localStorage
        localStorage.setItem('user', JSON.stringify(user));

        // Atualiza o AuthService
        this.authService.currentUser.set(user);

        console.log('✅ Autenticação concluída!');
        console.log('🔄 Redirecionando para /home...');

        // Redireciona imediatamente para a home
        this.router.navigate(['/home'], { replaceUrl: true });

      } catch (error) {
        console.error('❌ Erro ao processar token:', error);
        this.router.navigate(['/login']);
      }
    } else {
      console.error('❌ Token não encontrado na URL');
      console.log('📍 Query params:', this.route.snapshot.queryParams);
      this.router.navigate(['/login']);
    }
  }

  private getTokenFromUrl(): string | null {
    // Tenta pegar o token da URL completa (para hash location)
    const url = window.location.href;
    const match = url.match(/[?&]token=([^&#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
