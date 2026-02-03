import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from "../../app/components/loading-spinner.component";
import { from } from 'rxjs'; // Importante importar o 'from'
import { Router } from '@angular/router';
import { ToastService } from '../../app/services/toast.service';
type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinnerComponent],
})
export class LoginComponent implements OnInit {

  constructor(private router: Router,
    private toast: ToastService
  ) { }
  ngOnInit() {
  }

  isLoading = signal<boolean>(false);

  authService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);

  mode = signal<AuthMode>('login');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    dataNascimento: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  setMode(m: AuthMode) {
    this.mode.set(m);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset();
    this.forgotForm.reset();
    this.resetForm.reset();
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
      });
    }
  }


  onRegister() {
    if (this.registerForm.valid) {
      const { name, lastName, dataNascimento, email, password, confirmPassword } = this.registerForm.value;

      if (password !== confirmPassword) {
        this.errorMessage.set('As senhas não conferem');
        this.toast.error(this.errorMessage());
        this.successMessage.set('');
        return;
      }

      // Evita envios duplicados: se já estiver processando, ignora
      if (this.authService.isLoading()) return;

      // RESET TOTAL ANTES DE COMEÇAR
      this.errorMessage.set('');
      this.successMessage.set('');
      this.authService.isLoading.set(true);

      from(this.authService.register(email, password, name, lastName, dataNascimento)).subscribe({
        next: (data) => {
          this.authService.isLoading.set(false);
          this.errorMessage.set(''); // Garante que não há erro

          // Se você usa o signal no HTML:
          this.successMessage.set("Registro efetuado com sucesso. Faça o login!");

          // Se você usa o Toast:
          this.toast.success(this.successMessage());

          this.mode.set('login');
        },
        error: (err) => {
          this.authService.isLoading.set(false);
          this.successMessage.set('');

          // Pega a mensagem de dentro do erro do Supabase
          const supabaseMessage = err.message || '';
          let userFriendlyMessage = 'Erro ao criar conta.';

          // 1️⃣ E-mail já registrado (O erro que você está recebendo agora)
          if (supabaseMessage.includes('already registered')) {
            userFriendlyMessage = 'Este e-mail já está em uso por outra conta.';

            // 2️⃣ Limite de requisições (Spam)
          } else if (err.status === 429 || supabaseMessage.includes('rate limit')) {
            userFriendlyMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';

            // 3️⃣ Senha fraca
          } else if (supabaseMessage.includes('weak_password') || err.code === 'weak_password') {
            userFriendlyMessage = 'A senha é muito fraca. Use letras, números e símbolos.';
          }

          // Define o Signal que o seu @if no HTML está vigiando
          this.errorMessage.set(userFriendlyMessage);

          this.toast.error(this.errorMessage())

          console.error('Mensagem Amigável Definida:', userFriendlyMessage);
        }
      });
    }
  }

  onForgotPassword() {
    if (this.forgotForm.valid) {
      this.errorMessage.set('');
      this.successMessage.set('');
      const { email } = this.forgotForm.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.setMode('reset');
          this.resetForm.patchValue({ email });
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao enviar código. Tente novamente.');
        }
      });
    }
  }

  onResetPassword() {
    if (this.resetForm.valid) {
      const { email, code, newPassword, confirmPassword } = this.resetForm.value;

      if (newPassword !== confirmPassword) {
        this.errorMessage.set('As senhas não conferem');
        return;
      }

      this.errorMessage.set('');
      this.authService.resetPassword(email, code, newPassword).subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          setTimeout(() => {
            this.setMode('login');
          }, 2000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao redefinir senha. Verifique o código.');
        }
      });
    }
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }
}
