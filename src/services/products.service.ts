import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3001/api';
  
  // Signal vazio inicialmente - será carregado do backend
  products = signal<Product[]>([]);

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe({
      next: (products) => {
        this.products.set(products);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
      }
    });
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${updatedProduct.id}`, updatedProduct);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }
}
