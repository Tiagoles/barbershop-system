import { Injectable, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  media: string[]; // URLs of images/videos
  isPremium: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private initialProducts: Product[] = [
    { id: 1, name: 'Pomada Modeladora Matte', description: 'Alta fixação com efeito seco natural.', price: 45, discountPrice: null, stock: 50, media: ['https://i.imgur.com/gJ922zS.png'], isPremium: true },
    { id: 2, name: 'Óleo para Barba', description: 'Hidratação profunda e brilho para barbas.', price: 35, discountPrice: null, stock: 30, media: ['https://i.imgur.com/w2AR8P0.png'], isPremium: true },
    { id: 3, name: 'Shampoo 3 em 1', description: 'Para cabelo, barba e corpo.', price: 28, discountPrice: 25, stock: 100, media: ['https://i.imgur.com/S5a8Jj5.png'], isPremium: true },
    { id: 4, name: 'Minoxidil 5%', description: 'Tônico capilar para crescimento.', price: 60, discountPrice: null, stock: 15, media: ['https://i.imgur.com/V25k52O.png'], isPremium: false },
    { id: 5, name: 'Pente de Madeira', description: 'Antiestático, alinha os fios sem frizz.', price: 20, discountPrice: null, stock: 0, media: ['https://i.imgur.com/fQ2L09X.png'], isPremium: true },
  ];

  products = signal<Product[]>(this.initialProducts);

  addProduct(product: Omit<Product, 'id'>) {
    const newId = Math.max(...this.products().map(p => p.id), 0) + 1;
    this.products.update(products => [...products, { ...product, id: newId }]);
  }

  updateProduct(updatedProduct: Product) {
    this.products.update(products =>
      products.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  }
}
