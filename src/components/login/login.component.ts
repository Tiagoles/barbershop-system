
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950 px-4 py-12 transition-colors duration-300">
      
      <!-- Card Container -->
      <div class="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-800 transition-colors duration-300">
        
        <div class="p-8">
          <!-- Logo & Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mb-4 shadow-lg">
              <!-- Placeholder Logo Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                <path stroke-linecap="round" stroke-linejoin="round" d="CONTENT_CUT_ICON_PATH" /> 
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Barber<span class="text-gold-500">Shop</span></h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              @if (mode() === 'login') { Bem-vindo de volta! }
              @if (mode() === 'register') { Crie sua conta }
              @if (mode() === 'forgot') { Recuperação de conta }
            </p>
          </div>

          <!-- Forms -->
          @if (mode() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
              
              <!-- Google Login -->
              <button type="button" class="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </button>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200 dark:border-zinc-700"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white dark:bg-zinc-900 text-gray-500">ou continue com email</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" formControlName="email" class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none" placeholder="seu@email.com">
              </div>

              <div>
                 <div class="flex justify-between items-center mb-1">
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                   <button type="button" (click)="setMode('forgot')" class="text-xs text-gold-600 dark:text-gold-500 hover:text-gold-700 font-medium">Esqueceu a senha?</button>
                 </div>
                <input type="password" formControlName="password" class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none" placeholder="••••••••">
              </div>

              <button type="submit" [disabled]="loginForm.invalid || authService.isLoading()" class="w-full bg-gold-500 hover:bg-gold-600 text-white dark:text-zinc-900 font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (authService.isLoading()) {
                  Carregando...
                } @else {
                  Entrar
                }
              </button>
            </form>

            <div class="mt-6 text-center text-sm">
              <span class="text-gray-500 dark:text-gray-400">Não tem uma conta?</span>
              <button (click)="setMode('register')" class="ml-1 font-semibold text-gold-600 dark:text-gold-500 hover:text-gold-700">Cadastre-se</button>
            </div>
          }

          @if (mode() === 'register') {
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">
               <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" formControlName="email" class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                <input type="password" formControlName="password" class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
                <input type="password" formControlName="confirmPassword" class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none">
              </div>

               <button type="submit" [disabled]="registerForm.invalid" class="w-full bg-gold-500 hover:bg-gold-600 text-white dark:text-zinc-900 font-bold py-2.5 px-4 rounded-lg shadow-md transition-all mt-2">
                Criar Conta
              </button>
            </form>

             <div class="mt-6 text-center text-sm">
              <span class="text-gray-500 dark:text-gray-400">Já tem uma conta?</span>
              <button (click)="setMode('login')" class="ml-1 font-semibold text-gold-600 dark:text-gold-500 hover:text-gold-700">Entrar</button>
            </div>
          }

          @if (mode() === 'forgot') {
            <div class="text-center space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Digite seu email abaixo e enviaremos um link para redefinir sua senha.
              </p>
               <input type="email" placeholder="seu@email.com" class="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white outline-none">
               
               <button class="w-full bg-gold-500 hover:bg-gold-600 text-white dark:text-zinc-900 font-bold py-2.5 px-4 rounded-lg shadow-md transition-all">
                Enviar Link
              </button>

              <button (click)="setMode('login')" class="block w-full text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mt-4">
                Voltar para Login
              </button>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);
  
  mode = signal<AuthMode>('login');

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  setMode(m: AuthMode) {
    this.mode.set(m);
    this.loginForm.reset();
    this.registerForm.reset();
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email } = this.loginForm.value;
      this.authService.login(email);
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      // Mock registration logic
      alert('Conta criada com sucesso! Faça login.');
      this.setMode('login');
    }
  }
}
