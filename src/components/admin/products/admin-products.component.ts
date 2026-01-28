import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService, Product } from '../../../services/products.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Action Bar -->
      <div class="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-end">
        <button (click)="openAddModal()" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-lg text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Novo Produto
        </button>
      </div>

      <!-- Products List Table -->
      <div class="bg-zinc-950 rounded-lg border border-zinc-800 overflow-x-auto">
        <table class="w-full text-sm text-left text-zinc-400">
          <thead class="text-xs text-zinc-500 uppercase bg-zinc-900">
            <tr>
              <th scope="col" class="px-6 py-3 min-w-[300px]">Produto</th>
              <th scope="col" class="px-6 py-3">Preço</th>
              <th scope="col" class="px-6 py-3 text-center">Estoque</th>
              <th scope="col" class="px-6 py-3 text-center">Premium</th>
              <th scope="col" class="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (product of productsService.products(); track product.id) {
              <tr class="border-b border-zinc-800 hover:bg-zinc-900">
                <td class="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-4">
                  <img [src]="product.media[0] || 'https://via.placeholder.com/150'" [alt]="product.name" class="w-12 h-12 rounded-md object-cover bg-zinc-800">
                  <span>{{ product.name }}</span>
                </td>
                <td class="px-6 py-4">
                  @if (product.discountPrice && product.discountPrice < product.price) {
                    <div class="flex flex-col">
                      <span class="font-semibold text-yellow-400">{{ product.discountPrice | currency:'BRL' }}</span>
                      <span class="text-xs text-zinc-500 line-through">{{ product.price | currency:'BRL' }}</span>
                    </div>
                  } @else {
                    <span class="font-semibold text-yellow-400">{{ product.price | currency:'BRL' }}</span>
                  }
                </td>
                <td class="px-6 py-4 text-center" [class.text-red-400]="product.stock === 0">
                  {{ product.stock > 0 ? product.stock + ' unidades' : 'Esgotado' }}
                </td>
                <td class="px-6 py-4 text-center">
                  @if (product.isPremium) {
                    <span class="inline-flex items-center gap-1.5 bg-yellow-900/50 text-yellow-300 text-xs font-medium px-2.5 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.005Z" clip-rule="evenodd" /></svg>
                      Premium
                    </span>
                  }
                </td>
                <td class="px-6 py-4 text-right space-x-4">
                  <button (click)="openEditModal(product)" class="font-medium text-yellow-500 hover:text-yellow-400">Editar</button>
                  <button (click)="openDeleteModal(product)" class="font-medium text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="text-center py-10 text-zinc-500">Nenhum produto cadastrado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if(isModalOpen()) {
      <div class="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" (click)="closeModal()">
        <div class="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 shadow-2xl" (click)="$event.stopPropagation()">
          <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 class="text-xl font-bold text-white">{{ selectedProduct() ? 'Editar Produto' : 'Novo Produto' }}</h2>
              <button type="button" (click)="closeModal()" class="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <!-- Body -->
            <div class="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <!-- Basic Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Nome do Produto</label>
                  <input type="text" formControlName="name" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Estoque (unidades)</label>
                  <input type="number" formControlName="stock" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Preço Normal (R$)</label>
                  <input type="number" formControlName="price" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                 <div>
                  <label class="block text-sm font-medium text-zinc-300 mb-2">Preço com Desconto (Opcional)</label>
                  <input type="number" formControlName="discountPrice" placeholder="Deixe 0 se não houver" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500">
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Descrição</label>
                <textarea formControlName="description" rows="3" class="w-full bg-zinc-800 border-zinc-700 rounded-md p-2.5 text-white focus:ring-yellow-500 focus:border-yellow-500"></textarea>
              </div>

              <!-- Media -->
              <div>
                <label class="block text-sm font-medium text-zinc-300 mb-2">Mídias do Produto</label>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  @for(mediaUrl of mediaPreviews(); track mediaUrl; let i = $index) {
                    <div class="relative group aspect-square">
                       <img [src]="mediaUrl" class="w-full h-full object-cover rounded-md bg-zinc-800 border border-zinc-700">
                       <button (click)="removeMedia(i)" type="button" class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
                       </button>
                    </div>
                  }
                  <label class="flex items-center justify-center w-full aspect-square border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-zinc-600"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    <input type="file" (change)="onFileSelected($event)" accept="image/*" multiple class="hidden">
                  </label>
                </div>
              </div>

              <!-- Premium Toggle -->
              <div class="flex items-center justify-between bg-zinc-800 p-4 rounded-lg">
                <div>
                  <h4 class="font-semibold text-white">Produto Premium</h4>
                  <p class="text-sm text-zinc-400">Destacar este produto na página inicial.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="isPremium" class="sr-only peer">
                  <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" (click)="closeModal()" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-md">Cancelar</button>
              <button type="submit" [disabled]="productForm.invalid" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg transition-colors shadow-md disabled:opacity-50">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if(isDeleteModalOpen() && productToDelete(); as product) {
      <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="closeDeleteModal()">
        <div class="bg-zinc-950 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50 border border-red-500/30">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 class="mt-4 text-xl font-bold text-white">Excluir Produto</h3>
            <div class="mt-2">
              <p class="text-sm text-zinc-400">
                Tem certeza que deseja excluir <span class="font-bold text-white">{{ product.name }}</span>? Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-center gap-4">
            <button type="button" (click)="closeDeleteModal()" class="w-full text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700">
              Cancelar
            </button>
            <button type="button" (click)="confirmDelete()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-md">
              Excluir
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminProductsComponent implements OnInit {
  productsService = inject(ProductsService);
  private fb = inject(FormBuilder);

  isModalOpen = signal(false);
  selectedProduct = signal<Product | null>(null);
  productForm!: FormGroup;
  mediaPreviews = signal<string[]>([]);

  isDeleteModalOpen = signal(false);
  productToDelete = signal<Product | null>(null);

  ngOnInit() {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [null],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      media: this.fb.array([], Validators.required),
      isPremium: [false]
    });
  }
  
  get mediaFormArray() {
    return this.productForm.get('media') as FormArray;
  }

  openAddModal() {
    this.selectedProduct.set(null);
    this.productForm.reset({ isPremium: false, stock: 0 });
    this.mediaPreviews.set([]);
    this.mediaFormArray.clear();
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product) {
    this.selectedProduct.set(product);
    this.productForm.patchValue(product);
    this.mediaPreviews.set([...product.media]);
    this.mediaFormArray.clear();
    product.media.forEach(m => this.mediaFormArray.push(this.fb.control(m)));
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.mediaPreviews.update(v => [...v, result]);
        this.mediaFormArray.push(this.fb.control(result));
      };
      reader.readAsDataURL(file);
    }
  }

  removeMedia(index: number) {
    this.mediaPreviews.update(v => v.filter((_, i) => i !== index));
    this.mediaFormArray.removeAt(index);
  }
  
  saveProduct() {
    if (this.productForm.invalid) return;

    const formData = this.productForm.value;
     // Handle empty discount price
    if (formData.discountPrice <= 0) {
      formData.discountPrice = null;
    }

    if (this.selectedProduct()) {
      this.productsService.updateProduct(formData);
    } else {
      const { id, ...newProduct } = formData;
      this.productsService.addProduct(newProduct);
    }
    this.closeModal();
  }

  openDeleteModal(product: Product) {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.productToDelete.set(null);
  }

  confirmDelete() {
    const product = this.productToDelete();
    if (product) {
      this.productsService.deleteProduct(product.id);
      this.closeDeleteModal();
    }
  }
}
