
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  inStock: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-zinc-950 pt-20 pb-20 px-4 font-sans">
      
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-black text-white uppercase tracking-wide mb-4">
          Nossos <span class="text-gold-500">Produtos</span>
        </h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
          Leve a experiência da barbearia para sua casa com nossa linha exclusiva.
        </p>
      </div>

      <!-- Products Grid -->
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        @for (product of products; track product.id) {
          <!-- Product Card -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 group flex flex-col h-full shadow-lg">
            
            <!-- Image Area -->
            <div class="relative h-64 bg-zinc-800 flex items-center justify-center p-4">
              @if (product.image) {
                <img [src]="product.image" [alt]="product.name" class="h-full w-full object-contain mix-blend-overlay group-hover:scale-105 transition-transform duration-500">
              } @else {
                <!-- Placeholder Icon (Bag) -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-zinc-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              }

              <!-- Stock Badge -->
              @if (product.inStock) {
                <span class="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                  Em Estoque
                </span>
              } @else {
                 <span class="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                  Esgotado
                </span>
              }
            </div>

            <!-- Content Body -->
            <div class="p-5 flex flex-col flex-grow bg-zinc-900">
              <h3 class="text-xl font-bold text-white mb-2 group-hover:text-gold-500 transition-colors">
                {{ product.name }}
              </h3>
              <p class="text-zinc-500 text-sm leading-relaxed mb-6 flex-grow">
                {{ product.description }}
              </p>

              <!-- Footer (Price & Action) -->
              <div class="flex items-center justify-between pt-4 mt-auto">
                <!-- Price -->
                <span class="text-gold-500 font-bold text-2xl tracking-tight">
                  {{ product.price | currency:'BRL':'symbol':'1.0-0' }}
                </span>

                <!-- Buy Button -->
                <button class="bg-white hover:bg-gray-100 text-black font-bold py-2 px-5 rounded-full transition-colors shadow-lg flex items-center gap-2 text-sm group/btn transform hover:scale-105 active:scale-95 duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-black">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  Comprar
                </button>
              </div>
            </div>

          </div>
        }

      </div>
    </div>
  `
})
export class ProductsComponent {
  products: Product[] = [
    {
      id: 1,
      name: 'Pomada Modeladora Matte',
      description: 'Alta fixação com efeito seco natural. Ideal para o dia a dia.',
      price: 45,
      inStock: true
    },
    {
      id: 2,
      name: 'Óleo para Barba',
      description: 'Hidratação profunda e brilho para barbas longas e curtas.',
      price: 35,
      inStock: true
    },
    {
      id: 3,
      name: 'Shampoo 3 em 1',
      description: 'Para cabelo, barba e corpo. Praticidade e refrescância.',
      price: 28,
      inStock: true
    },
    {
      id: 4,
      name: 'Minoxidil 5%',
      description: 'Tônico capilar para crescimento e fortalecimento dos fios.',
      price: 60,
      inStock: true
    },
    {
      id: 5,
      name: 'Pente de Madeira',
      description: 'Antiestático, alinha os fios sem quebrar ou causar frizz.',
      price: 20,
      inStock: false
    },
    {
      id: 6,
      name: 'Balm Pós-Barba',
      description: 'Acalma a pele após o barbear, evitando irritações.',
      price: 30,
      inStock: true
    },
     {
      id: 7,
      name: 'Kit Barba Pro',
      description: 'Combo com óleo, balm e pente de madeira personalizado.',
      price: 85,
      inStock: true
    },
     {
      id: 8,
      name: 'Gel Shaving',
      description: 'Gel transparente para um barbear preciso e desenhado.',
      price: 25,
      inStock: true
    }
  ];
}
