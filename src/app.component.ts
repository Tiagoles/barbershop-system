import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/layout/header.component';
import { LoginComponent } from './components/login/login.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { ToastComponent } from './app/components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoginComponent, ToastComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authService = inject(AuthService);
  router = inject(Router);

  private navigationEnd$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  );

  // Signal para forçar atualização quando localStorage mudar
  private storageUpdate = signal(0);

  isAdminRoute = toSignal(
    this.navigationEnd$.pipe(map(event => event.urlAfterRedirects.startsWith('/admin'))),
    { initialValue: this.router.url.startsWith('/admin') }
  );

  currentUrl = toSignal(
    this.navigationEnd$.pipe(map(event => event.urlAfterRedirects)),
    { initialValue: this.router.url }
  );

  isAuthSuccessRoute = computed(() => {
    const url = this.currentUrl();
    return url?.includes('/auth-success') || false;
  });

  // Verifica autenticação considerando tanto o signal quanto o localStorage
  isAuthenticated = computed(() => {
    // Lê o storageUpdate para forçar reavaliação quando localStorage mudar
    this.storageUpdate();

    const user = this.authService.currentUser();
    if (user) return true;

    // Fallback: verifica localStorage diretamente
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      // Tenta carregar no signal se não estiver
      try {
        const storedUser = JSON.parse(userStr);
        if (!user) {
          this.authService.currentUser.set(storedUser);
        }
      } catch (e) {
        // Ignora erro de parse
      }
      return true;
    }
    return false;
  });

  constructor() {
    // Listener para mudanças no localStorage (de outras abas ou do auth-success)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.storageUpdate.update(v => v + 1);
        // Tenta carregar usuário do localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            this.authService.currentUser.set(user);
          } catch (e) {
            // Ignora erro
          }
        }
      });

      // Também escuta eventos customizados
      window.addEventListener('auth-update', () => {
        this.storageUpdate.update(v => v + 1);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            this.authService.currentUser.set(user);
          } catch (e) {
            // Ignora erro
          }
        }
      });
    }
  }
}
