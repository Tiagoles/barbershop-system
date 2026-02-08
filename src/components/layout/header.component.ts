import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center gap-3 cursor-pointer" routerLink="/home" (click)="isMobileMenuOpen.set(false)">
             @if (settings().photo_url) {
                <img [src]="settings().photo_url" alt="Logo" class="w-8 h-8 rounded-full object-cover">
             } @else {
               <div class="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
                 BP
               </div>
             }
             <span class="font-bold text-sm tracking-tight text-gray-900 dark:text-white uppercase">
               {{ barbershopNameFirst() }} <span class="text-gold-500">{{ barbershopNameRest() }}</span>
             </span>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-8">
            <a routerLink="/home" routerLinkActive="text-gold-600 dark:text-gold-400 font-semibold" class="text-gray-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors text-sm font-medium">Início</a>
            <a routerLink="/services" routerLinkActive="text-gold-600 dark:text-gold-400 font-semibold" class="text-gray-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors text-sm font-medium">Serviços</a>
            <a routerLink="/products" routerLinkActive="text-gold-600 dark:text-gold-400 font-semibold" class="text-gray-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors text-sm font-medium">Produtos</a>
            <a routerLink="/appointments" routerLinkActive="text-gold-600 dark:text-gold-400 font-semibold" class="text-gray-600 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400 transition-colors text-sm font-medium">Meus Agendamentos</a>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-2 md:gap-4">
            
            <!-- Cart Icon -->
            <button class="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span class="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">2</span>
            </button>

            <!-- Theme Toggle -->
            <button (click)="themeService.toggleTheme()" class="p-2 text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors focus:outline-none">
              @if (themeService.isDark()) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
              }
            </button>

            <!-- Admin Link -->
            <a routerLink="/admin" class="hidden md:inline-flex text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Admin
            </a>
            
            <!-- CTA Button -->
            <button routerLink="/booking" class="hidden sm:inline-block bg-gold-500 hover:bg-gold-600 text-white dark:text-gray-900 font-bold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 text-sm">
              Agendar Agora
            </button>
                        <button (click)="authService.logout()" class="text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
              Sair
            </button>
            
            <!-- Mobile menu button -->
            <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" type="button" class="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              @if (isMobileMenuOpen()) {
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              } @else {
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden" id="mobile-menu">
          <div class="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <a (click)="isMobileMenuOpen.set(false)" routerLink="/home" routerLinkActive="bg-gold-500 text-black font-semibold" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300">Início</a>
            <a (click)="isMobileMenuOpen.set(false)" routerLink="/services" routerLinkActive="bg-gold-500 text-black font-semibold" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300">Serviços</a>
            <a (click)="isMobileMenuOpen.set(false)" routerLink="/products" routerLinkActive="bg-gold-500 text-black font-semibold" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300">Produtos</a>
            <a (click)="isMobileMenuOpen.set(false)" routerLink="/appointments" routerLinkActive="bg-gold-500 text-black font-semibold" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300">Meus Agendamentos</a>
            <a (click)="isMobileMenuOpen.set(false)" routerLink="/admin" routerLinkActive="bg-gold-500 text-black font-semibold" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300">Admin</a>
          </div>
          <div class="pt-4 pb-3 border-t border-gray-200 dark:border-zinc-700">
             <div class="px-2 space-y-2">
                <a (click)="isMobileMenuOpen.set(false)" routerLink="/booking" class="block w-full text-center bg-gold-500 hover:bg-gold-600 text-white dark:text-gray-900 font-bold py-2 px-4 rounded-lg shadow-sm">
                  Agendar Agora
                </a>
                <button (click)="logout()" class="block w-full text-center bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-2 px-4 rounded-lg">
                  Sair
                </button>
             </div>
          </div>
        </div>
      }
    </header>
    <!-- Spacer for fixed header -->
    <div class="h-16"></div>
  `
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  settings = this.settingsService.settings;
  isMobileMenuOpen = signal(false);

  barbershopNameFirst = computed(() => this.settings().nome.split(' ')[0] || '');
  barbershopNameRest = computed(() => this.settings().nome.split(' ').slice(1).join(' ') || '');

  logout() {
    this.isMobileMenuOpen.set(false);
    this.authService.logout();
  }
}