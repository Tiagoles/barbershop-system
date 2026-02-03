import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-zinc-900 text-gray-200 font-sans overflow-hidden">
      
      <!-- Overlay for mobile -->
      @if (isSidebarOpen()) {
        <div (click)="isSidebarOpen.set(false)" class="fixed inset-0 bg-black/60 z-30 md:hidden"></div>
      }

      <!-- Sidebar -->
      <aside 
        class="w-64 flex-shrink-0 bg-zinc-950 flex flex-col border-r border-zinc-800 fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0"
        [class.-translate-x-full]="!isSidebarOpen()"
        [class.translate-x-0]="isSidebarOpen()">
        
        <!-- Logo/Header -->
        <div class="h-16 flex items-center justify-center border-b border-zinc-800">
          <h1 class="text-xl font-bold text-white tracking-wider">AGM Painel</h1>
        </div>
        
        <!-- Nav -->
        <nav class="flex-1 px-4 py-6 space-y-1">
          @for (item of navItems; track item.label) {
            <a [routerLink]="item.link" 
               routerLinkActive="bg-yellow-500 text-black font-bold"
               (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon" />
              </svg>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
        
        <!-- User Info -->
        <div class="p-4 border-t border-zinc-800">
          <div class="flex items-center gap-3 min-w-0">
             <div class="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
               {{ (authService.currentUser()?.name || 'U').charAt(0).toUpperCase() }}
             </div>
             <div class="min-w-0 flex-1">
               <p class="text-sm font-semibold text-white truncate" [title]="authService.getFormattedUserName()">{{ authService.getFormattedUserName() }}</p>
               <p class="text-xs text-zinc-400 truncate" [title]="authService.currentUser()?.email">{{ authService.currentUser()?.email }}</p>
             </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div class="flex items-center gap-2">
            <!-- Mobile Menu Button -->
            <button (click)="isSidebarOpen.set(true)" class="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <span class="text-lg font-semibold text-white">{{ pageTitle() }}</span>
          </div>
          <div class="flex items-center gap-4">
             <button (click)="authService.logout()" class="text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
              Sair
            </button>
             <a routerLink="/home" class="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
              Ver Site
            </a>
          </div>
        </header>
        
        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-zinc-900">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  isSidebarOpen = signal(false);
  private router = inject(Router);

  private navigationEnd$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  );

  private currentUrl = toSignal(
    this.navigationEnd$.pipe(map(event => event.urlAfterRedirects)),
    { initialValue: this.router.url }
  );

  pageTitle = computed(() => {
    const url = this.currentUrl() ?? '';
    const activeItem = this.navItems.find(item => url.startsWith(item.link));
    return activeItem?.label || 'Painel';
  });

  navItems = [
    { label: 'Visão Geral', link: '/admin/dashboard', icon: 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z' },
    { label: 'Configurações', link: '/admin/settings', icon: 'M9.594 3.94c.09-.542.56-1.003 1.11-1.226a17.902 17.902 0 0 1 2.592 0c.55.223 1.02.684 1.11 1.226.09.542-.023 1.08-.32 1.506l-.529.636a11.2 11.2 0 0 0-1.63 1.282c-.22.18-.465.354-.717.517l-.24.161a11.152 11.152 0 0 1-3.822 0l-.24-.161a11.2 11.2 0 0 0-.717-.517 11.2 11.2 0 0 0-1.63-1.282l-.529-.636C9.617 5.02 9.504 4.482 9.594 3.94ZM14.5 2.25a2.25 2.25 0 0 0-2.25 2.25c0 1.334.694 2.522 1.764 3.197.39.243.776.516 1.144.814a1.125 1.125 0 0 1 .288 1.448l-2.022 2.7c-.43.573-.243 1.45.33 1.722a18.062 18.062 0 0 0 5.232 0c.573-.272.76-.95.33-1.722l-2.022-2.7a1.125 1.125 0 0 1 .288-1.448c.368-.298.754-.571 1.144-.814 1.07-0.675 1.764-1.863 1.764-3.197a2.25 2.25 0 0 0-2.25-2.25h-5.25Z' },
    { label: 'Agenda', link: '/admin/agenda', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18' },
    { label: 'Clientes', link: '/admin/clientes', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.53-2.473-4.125 4.125 0 0 0-7.53 2.473A9.337 9.337 0 0 0 3.375 19.5a9.38 9.38 0 0 0 2.625-.372M9.375 12.125a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12.75-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
    { label: 'Equipe', link: '/admin/equipe', icon: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.162c1.683 0 3.062-1.379 3.062-3.062s-1.379-3.062-3.062-3.062-3.062 1.379-3.062 3.062 1.379 3.062 3.062 3.062M12 13.875a9.094 9.094 0 0 0-3.741-.479 3 3 0 0 0-4.682 2.72M6.344 18.72a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72M12 3.75a9.094 9.094 0 0 1 3.741.479 3 3 0 0 1-4.682 2.72M6.344 6.28a9.094 9.094 0 0 1-3.741.479 3 3 0 0 1 4.682-2.72' },
    { label: 'Serviços', link: '/admin/servicos', icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118 7.5 7.5 0 0 0 10.569 0 2.25 2.25 0 0 1-2.475-2.118 3 3 0 0 0-5.78-1.128Zm-2.53-2.122a3 3 0 0 0 .7-2.903 2.25 2.25 0 0 1 4.5 0 3 3 0 0 0 .7 2.903m10.038 0a3 3 0 0 0 .7-2.903 2.25 2.25 0 0 1 4.5 0 3 3 0 0 0 .7 2.903m-4.59-4.87a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118 7.5 7.5 0 0 0 10.569 0 2.25 2.25 0 0 1-2.475-2.118 3 3 0 0 0-5.78-1.128Z' },
    { label: 'Produtos', link: '/admin/produtos', icon: 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' },
  ];
}