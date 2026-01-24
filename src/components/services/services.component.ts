
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  image: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 pt-20 pb-20 px-4 font-sans">
      
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-black text-white uppercase tracking-wide mb-4">
          Nossos <span class="text-gold-500">Serviços</span>
        </h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
          Conheça nosso menu de serviços e escolha o melhor para o seu estilo.
        </p>
      </div>

      <!-- Services Grid -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        @for (service of services; track service.id) {
          <!-- Service Card -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 group flex flex-col h-full">
            
            <!-- Image Header -->
            <div class="relative h-64 overflow-hidden">
              <img [src]="service.image" [alt]="service.title" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700">
              
              <!-- Price Badge (Top Right) -->
              <div class="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-gold-500/30 px-4 py-2 rounded-lg shadow-lg">
                <span class="text-gold-500 font-bold text-lg">
                  {{ service.price | currency:'BRL':'symbol':'1.0-0' }}
                </span>
              </div>
            </div>

            <!-- Content Body -->
            <div class="p-6 flex flex-col flex-grow">
              <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-gold-500 transition-colors">
                {{ service.title }}
              </h3>
              <p class="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
                {{ service.description }}
              </p>

              <!-- Footer (Time & Action) -->
              <div class="flex items-center justify-between pt-6 border-t border-zinc-800 mt-auto">
                <!-- Duration -->
                <div class="flex items-center gap-2 text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span class="text-sm font-medium">{{ service.duration }} min</span>
                </div>

                <!-- Button -->
                <button routerLink="/booking" class="bg-gold-500 hover:bg-gold-600 text-black font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-gold-500/20 text-sm uppercase tracking-wide">
                  Agendar
                </button>
              </div>
            </div>

          </div>
        }

      </div>
    </div>
  `
})
export class ServicesComponent {
  services: Service[] = [
    {
      id: 1,
      title: 'Corte de Cabelo',
      description: 'Corte moderno com acabamento na navalha e lavagem inclusa.',
      price: 50,
      duration: 45,
      image: 'https://images.pexels.com/photos/2521978/pexels-photo-2521978.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 2,
      title: 'Combo AGM (Corte + Barba)',
      description: 'O serviço completo para o homem moderno. Renovação total do visual.',
      price: 80,
      duration: 75,
      image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 3,
      title: 'Barba Completa',
      description: 'Barboterapia com toalha quente e óleos essenciais para hidratação profunda.',
      price: 40,
      duration: 30,
      image: 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 4,
      title: 'Acabamento / Pezinho',
      description: 'Manutenção do contorno do cabelo e barba para manter o visual alinhado.',
      price: 25,
      duration: 20,
      image: 'https://images.pexels.com/photos/2040189/pexels-photo-2040189.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 5,
      title: 'Sobrancelha',
      description: 'Design e limpeza de sobrancelha com navalha ou pinça.',
      price: 15,
      duration: 15,
      image: 'https://images.pexels.com/photos/2235288/pexels-photo-2235288.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 6,
      title: 'Selagem Capilar',
      description: 'Tratamento para redução de volume e alinhamento dos fios.',
      price: 90,
      duration: 90,
      image: 'https://images.pexels.com/photos/3998403/pexels-photo-3998403.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];
}
