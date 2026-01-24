import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/layout/header.component';
import { LoginComponent } from './components/login/login.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoginComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  private navigationEnd$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  );

  isAdminRoute = toSignal(
    this.navigationEnd$.pipe(map(event => event.urlAfterRedirects.startsWith('/admin'))),
    { initialValue: this.router.url.startsWith('/admin') }
  );
}