import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';

interface FeaturedService {
  id: number;
  title: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="bg-zinc-950">
      <!-- Hero Container -->
      <div class="bg-black text-white font-sans relative min-h-[calc(100vh-4rem)] flex flex-col">
        
        <!-- Video Background & Overlay -->
        <div class="absolute inset-0 w-full h-full z-0">
          <video autoplay loop muted playsinline class="w-full h-full object-cover" [src]="settings().backgroundVideoUrl">
            Seu navegador não suporta vídeos HTML5.
          </video>
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          <div class="absolute inset-0 bg-black/60"></div>
        </div>
        
        <!-- Hero Content -->
        <div class="relative z-10 flex-grow flex flex-col">

          <!-- Main Content -->
          <div class="flex-grow flex flex-col items-center justify-center text-center p-4">
            
            <!-- Main Logo -->
            <div class="relative mb-5">
              @if (settings().logoUrl) {
                <img [src]="settings().logoUrl" alt="Logo Barbearia" class="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-zinc-800 shadow-2xl bg-zinc-900">
                <div class="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-5 h-5 bg-green-500 border-2 border-black rounded-full shadow-lg"></div>
              }
            </div>

            <!-- Name -->
            <h1 class="text-3xl md:text-4xl font-black uppercase tracking-wider text-shadow">
              {{ barbershopNameFirst() }} {{ barbershopNameRest() }}
            </h1>

            <!-- Badges -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 my-5">
              <div class="flex items-center gap-2 bg-green-900/50 border border-green-500/30 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-green-300 font-semibold tracking-wide">Disponível Agora</span>
              </div>
              <div class="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/80 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-yellow-500"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.005Z" clip-rule="evenodd" /></svg>
                <span class="font-bold text-white">4.9</span>
                <span class="text-zinc-400">(120)</span>
              </div>
            </div>

            <!-- Address -->
            <div class="flex items-center justify-center gap-2 text-zinc-300 text-sm mb-8 text-center px-4 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 flex-shrink-0 text-zinc-500"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 5.16-4.057l-1.18-1.18a15.475 15.475 0 0 1-3.982 3.28l-1.26-.84A11.475 11.475 0 0 1 12 15.652v-2.323l-1.24.825a11.475 11.475 0 0 1-5.134-4.505l-1.55-.83a15.475 15.475 0 0 1 3.982-3.28l1.18 1.18a16.975 16.975 0 0 0-5.16 4.057l-.071.041-.028.015a.76.76 0 0 0 0 .723l.028.015.07.04a16.975 16.975 0 0 0 5.16 4.057l1.18 1.18a15.475 15.475 0 0 1 3.982-3.28l1.26.84a11.475 11.475 0 0 1 5.134 4.505l1.55.83a15.475 15.475 0 0 1-3.982 3.28l-1.18-1.18a16.975 16.975 0 0 0 5.16-4.057l.071-.04.028-.016a.76.76 0 0 0-.723 0l-.028.015-.07.041a16.975 16.975 0 0 0-5.16-4.057L12 3.848 4.867 8.048a.75.75 0 0 0-.005 1.318l1.55.83a11.475 11.475 0 0 1 5.134 4.505l1.24-.825v2.323a11.475 11.475 0 0 1-5.134-4.505l-1.55-.83a.75.75 0 0 0-1.002 1.114l1.55.83a13.475 13.475 0 0 0 6.082 5.29l1.26.84-1.18 1.18a13.475 13.475 0 0 0-3.505-2.87l-1.26.84a.75.75 0 0 0-.44 1.223l1.26.84a13.475 13.475 0 0 0 3.505 2.87l1.18 1.18a.75.75 0 0 0 1.26-.84l-1.18-1.18a13.475 13.475 0 0 0 3.505-2.87l1.26-.84a.75.75 0 0 0 .44-1.223l-1.26-.84a13.475 13.475 0 0 0-3.505-2.87l-1.18-1.18ZM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" clip-rule="evenodd" /></svg>
              <span>{{ settings().address }}</span>
            </div>

            <!-- CTA Button -->
            <button routerLink="/booking" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-12 rounded-full text-lg uppercase tracking-wider flex items-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 active:scale-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3-3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd" /></svg>
              <span>Agendar Agora</span>
            </button>
          </div>

          <!-- Info Section -->
          <div class="w-full max-w-5xl mx-auto p-4 md:p-8">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 backdrop-blur-sm bg-black/30 border border-zinc-800/50 rounded-2xl p-6">
                  <!-- Horário -->
                  <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-4">
                      <div class="flex-shrink-0 w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-yellow-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      </div>
                      <div>
                          <h3 class="font-bold text-lg text-white">Horário</h3>
                          <p class="text-zinc-400 text-sm">Seg-Sex: 09:00 - 19:00</p>
                          <p class="text-zinc-400 text-sm">Sáb: 09:00 - 14:00</p>
                      </div>
                  </div>

                  <!-- Localização -->
                  <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-4">
                      <div class="flex-shrink-0 w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-yellow-500">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      </div>
                      <div>
                          <h3 class="font-bold text-lg text-white">Localização</h3>
                          <p class="text-zinc-400 text-sm">{{ addressFirstLine() }}</p>
                          <p class="text-zinc-400 text-sm">{{ addressSecondLine() }}</p>
                          <a [href]="'https://www.google.com/maps/search/?api=1&query=' + settings().address" target="_blank" class="text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors">Ver no Mapa</a>
                      </div>
                  </div>

                  <!-- Contato -->
                  <div class="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-4">
                       <div class="flex-shrink-0 w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-yellow-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      </div>
                      <div>
                          <h3 class="font-bold text-lg text-white">Contato</h3>
                          <a [href]="'tel:' + settings().phone" class="text-zinc-400 hover:text-white text-sm transition-colors block">{{ settings().phone }}</a>
                          <a [href]="settings().instagram" target="_blank" class="text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors">Ver Instagram</a>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

       <!-- New Sections Container -->
      <div class="py-20 px-4 font-sans text-white">
        <div class="max-w-7xl mx-auto">
          
          <!-- Produtos Premium Section -->
          <div class="mb-20">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-3xl md:text-4xl font-black uppercase tracking-wide">
                Produtos <span class="text-gold-500">Premium</span>
              </h2>
              <a routerLink="/products" class="text-gold-500 hover:text-gold-400 font-semibold text-sm flex items-center gap-2 transition-colors">
                Ver Todos
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>
              </a>
            </div>
            <p class="text-zinc-400 max-w-2xl mb-8">Cuidamos do seu estilo também em casa.</p>
            
            <!-- Product Carousel -->
            <div class="w-full overflow-hidden relative carousel-container py-6">
              <div class="flex gap-6 animate-carousel">
                <!-- Render products twice for infinite loop effect -->
                @for (product of premiumProducts(); track product.id) {
                  <div class="flex-shrink-0 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col group cursor-pointer hover:border-zinc-700 transition-colors">
                    <div class="h-52 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      @if(product.image) {
                        <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-zinc-600">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25 1.313M12 12.75V15m0 6.75v-2.25M6.375 15l-2.25-1.313M6.375 15l2.25 1.313M6.375 15V12.75m11.25 0l-2.25 1.313M17.625 15V12.75" />
                        </svg>
                      }
                    </div>
                    <h3 class="font-bold text-lg text-white group-hover:text-gold-500 transition-colors flex-grow">{{ product.name }}</h3>
                    <p class="text-xl font-bold text-gold-500 mt-2">{{ product.price | currency:'BRL':'symbol':'1.0-0' }}</p>
                  </div>
                }
                @for (product of premiumProducts(); track product.id; let i = $index) {
                  <div class="flex-shrink-0 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col group cursor-pointer hover:border-zinc-700 transition-colors" [attr.aria-hidden]="true">
                    <div class="h-52 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      @if(product.image) {
                        <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-zinc-600">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25 1.313M12 12.75V15m0 6.75v-2.25M6.375 15l-2.25-1.313M6.375 15l2.25 1.313M6.375 15V12.75m11.25 0l-2.25 1.313M17.625 15V12.75" />
                        </svg>
                      }
                    </div>
                    <h3 class="font-bold text-lg text-white group-hover:text-gold-500 transition-colors flex-grow">{{ product.name }}</h3>
                    <p class="text-xl font-bold text-gold-500 mt-2">{{ product.price | currency:'BRL':'symbol':'1.0-0' }}</p>
                  </div>
                }
              </div>
              <!-- Fades -->
              <div class="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none"></div>
              <div class="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <!-- Nossos Serviços Section -->
          <div>
            <div class="text-center mb-12">
               <h2 class="text-3xl md:text-4xl font-black uppercase tracking-wide">
                Nossos <span class="text-gold-500">Serviços</span>
              </h2>
              <div class="w-24 h-1 bg-gold-500 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <!-- Services Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              @for (service of featuredServices; track service.id) {
                <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col text-left group">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-white group-hover:text-gold-500 transition-colors w-2/3">{{ service.title }}</h3>
                    <span class="text-2xl font-bold text-gold-500 text-right">{{ service.price | currency:'BRL':'symbol':'1.0-0' }}</span>
                  </div>
                  <p class="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">{{ service.description }}</p>
                  <button routerLink="/booking" class="w-full mt-auto bg-black hover:bg-zinc-800 border border-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                    Agendar
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Buttons -->
      <a [href]="settings().instagram" target="_blank" class="fixed bottom-24 right-5 z-20 w-14 h-14 rounded-full bg-instagram flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
         <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" /><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M16.5 7.5l0 .01" /></svg>
      </a>
      <a [href]="settings().whatsapp" target="_blank" class="fixed bottom-6 right-5 z-20 w-14 h-14 rounded-full bg-whatsapp flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
         <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" stroke-width="1.5" stroke="none" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.458l-6.167 1.681zM7.494 6.023h.01c.422-.003.838.162 1.15.473.312.31.476.728.473 1.152v.01c0 .422-.164.838-.473 1.15-.313.31-.729.474-1.152.473h-.01c-.422.003-.838-.162-1.15-.473-.312-.31-.476-.728-.473-1.152v-.01c0-.422.164-.838.473-1.15.313-.31.729-.474 1.152-.473zm4.846 0h.01c.422-.003.838.162 1.15.473.312.31.476.728.473 1.152v.01c0 .422-.164.838-.473 1.15-.313.31-.729.474-1.152.473h-.01c-.422.003-.838-.162-1.15-.473-.312-.31-.476-.728-.473-1.152v-.01c0-.422.164-.838.473-1.15.313-.31.729-.474 1.152-.473zm4.846 0h.01c.422-.003.838.162 1.15.473.312.31.476.728.473 1.152v.01c0 .422-.164.838-.473 1.15-.313.31-.729.474-1.152.473h-.01c-.422.003-.838-.162-1.15-.473-.312-.31-.476-.728-.473-1.152v-.01c0-.422.164-.838.473-1.15.313-.31.729-.474 1.152-.473z"/></svg>
      </a>
    </div>
  `,
  styles: `
    .text-shadow {
      text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
    }
    
    .carousel-container:hover .animate-carousel {
      animation-play-state: paused;
    }

    @keyframes carousel {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    .animate-carousel {
      animation: carousel 30s linear infinite;
    }
  `
})
export class HomeComponent {
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  productsService = inject(ProductsService);
  settings = this.settingsService.settings;

  barbershopNameFirst = computed(() => this.settings().name.split(' ')[0] || '');
  barbershopNameRest = computed(() => this.settings().name.split(' ').slice(1).join(' ') || '');

  addressFirstLine = computed(() => this.settings().address.split(' - ')[0] || '');
  addressSecondLine = computed(() => this.settings().address.split(' - ').slice(1).join(' - ') || '');

  premiumProducts = computed(() => 
    this.productsService.products()
      .filter(p => p.isPremium)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.discountPrice || p.price,
        image: p.media[0]
      }))
  );

  featuredServices: FeaturedService[] = [
    { 
      id: 1, 
      title: 'Corte de Cabelo', 
      price: 50.00, 
      description: 'Corte moderno com acabamento premium e lavagem inclusa.' 
    },
    { 
      id: 2, 
      title: 'Barba Completa', 
      price: 40.00, 
      description: 'Barboterapia com toalha quente e óleos essenciais.' 
    },
    { 
      id: 3, 
      title: 'Combo AGM', 
      price: 80.00, 
      description: 'Corte + Barba + Sobrancelha. O pacote completo.' 
    },
  ];
}
