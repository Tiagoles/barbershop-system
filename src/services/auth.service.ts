
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'barber';
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  constructor(private router: Router) {}

  login(email: string) {
    this.isLoading.set(true);
    // Simulate API delay
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: 'Cliente Exemplo',
        email: email,
        role: email.includes('admin') ? 'admin' : 'client',
        avatar: 'https://picsum.photos/100/100'
      };
      this.currentUser.set(mockUser);
      this.isLoading.set(false);
      this.router.navigate(['/home']);
    }, 1000);
  }

  logout() {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return this.currentUser() !== null;
  }
}
