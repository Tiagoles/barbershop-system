import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { supabase } from '../app/core/supabase/supabase.client';
import { ToastService } from '../app/services/toast.service';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  media: string[];
  isPremium: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:3001/api';

  // Signal vazio inicialmente - será carregado do backend
  products = signal<Product[]>([]);
  private readonly BUCKET = 'produtos';
  constructor(private http: HttpClient,
    private toast: ToastService
  ) {
    this.loadProducts();
  }


  async getMeuEstabelecimento(id: any) {


    // 2. Faz o select filtrando pelo UUID
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('*')
      .eq('usuario_id', id) // Filtra onde a coluna usuario_id é igual ao ID do auth
      .single(); // Retorna apenas um objeto em vez de um array

    if (error) {
      console.error('Erro ao buscar estabelecimento:', error);
      return null;
    }

    return data;
  }

  async getProductsByEstabelecimento(estabelecimentoId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from('estabelecimentos_produtos')
      .select(`
      *,
      produtos (
        nome
      )
    `)
      .eq('estabelecimento_id', estabelecimentoId);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      produto_id: item.produto_id,
      name: item.produtos.nome,
      price: item.preco,
      discountPrice: item.desconto, // Ajuste para bater com o nome na sua Interface
      description: item.descricao,
      isPremium: item.is_premium,
      active: item.ativo,
      // --- Campos que faltavam ---
      stock: item.estoque || 0, // Verifique se o nome na tabela é 'estoque'
      media: item.imagem_url ? [item.imagem_url] : [] // Transforma a URL string em array para bater com Product
    }));
  }
  async uploadProductImage(file: File, estId: number): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${estId}/${fileName}`; // Organiza por ID do estabelecimento

    const { error } = await supabase.storage
      .from('produtos')
      .upload(filePath, file);

    if (error) throw error;

    return filePath; // Retorna o caminho para salvar na tabela 'imagem_url'
  }
  // No products.service.ts
  async loadProducts() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;

    const userObj = JSON.parse(userJson);
    // Garanta que está pegando a propriedade correta (id ou user_id)
    const uuid = userObj.id || userObj.id;

    // 1. Pega o ID numérico do estabelecimento
    const { data: est, error: estError } = await supabase
      .from('estabelecimentos')
      .select('id')
      .eq('usuario_id', uuid)
      .single();

    if (estError || !est) {
      console.error("Estabelecimento não encontrado para este usuário");
      return;
    }

    // 2. Busca os produtos. O '*' já inclui a nova coluna 'imagem_url'
    const { data, error } = await supabase
      .from('estabelecimentos_produtos')
      .select(`
      *,
      produtos (nome)
    `)
      .eq('estabelecimento_id', est.id)
      .order('id', { ascending: false });

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return;
    }

    // 3. Mapeia os dados gerando as URLs públicas do Storage
    const mapped = data.map(item => {
      // Busca o caminho salvo na nova coluna que você criou
      const path = item.imagem_url;

      // Use uma URL de fallback válida (online) para evitar o erro "Cannot GET /assets/..."
      let publicImageUrl = 'https://placehold.co/400x400/27272a/yellow?text=Sem+Foto';

      if (path) {
        // Gera a URL pública do bucket 'produtos'
        const { data: imgData } = supabase.storage
          .from('produtos')
          .getPublicUrl(path);

        publicImageUrl = imgData.publicUrl;
      }

      return {
        id: item.id,
        name: item.produtos?.nome || 'Produto Sem Nome',
        price: item.preco || 0,
        discountPrice: item.desconto,
        stock: item.estoque || 0,
        description: item.descricao || '',
        isPremium: item.is_premium || false,
        // Retorna como array para manter compatibilidade com seu HTML product.media[0]
        media: [publicImageUrl]
      };
    });

    // Atualiza o signal para refletir na tela
    this.products.set(mapped);
  }

  async saveProduct(product: any): Promise<void> {
    const BUCKET = 'produtos';

    try {
      // 1️⃣ Recuperar o user_id (estabelecimento_id) do LocalStorage
      const userJson = localStorage.getItem('user');
      if (!userJson) throw new Error('Usuário não autenticado');

      const userObj = JSON.parse(userJson);
      const userId = userObj.id || userObj.user_id;

      let estabelecimento = await this.getMeuEstabelecimento(userId);

      // 2️⃣ Upload da Imagem
      let imagePathForDb = ''; // Variável para guardar o caminho que vai para o banco

      if (product.media && product.media.length > 0) {
        const base64 = product.media[0];
        // Criamos um nome único para o arquivo
        const fileName = `${estabelecimento.id}/${crypto.randomUUID()}.jpg`;
        const file = this.base64ToFile(base64, fileName);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // ✅ IMPORTANTE: Guardamos o 'fileName' (o caminho relativo dentro do bucket)
        imagePathForDb = fileName;
      }

      // 3️⃣ Inserir na tabela 'produtos'
      const { data: novoProduto, error: errProd } = await supabase
        .from('produtos')
        .insert({ nome: product.name })
        .select()
        .single();

      if (errProd) throw errProd;

      // 4️⃣ Inserir na tabela associativa 'estabelecimentos_produtos'
      const { error: errAssoc } = await supabase
        .from('estabelecimentos_produtos')
        .insert({
          estabelecimento_id: estabelecimento.id,
          produto_id: novoProduto.id,
          preco: product.price,
          descricao: product.description,
          desconto: product.discount || 0,
          is_premium: product.isPremium || false,
          ativo: true,
          estoque: product.stock || 0,
          // ✅ AQUI A MÁGICA ACONTECE:
          imagem_url: imagePathForDb
        });

      if (errAssoc) throw errAssoc;

      this.toast.success("Sucesso! Produto cadastrado.");

      // Opcional: Recarregar a lista após o sucesso
      this.loadProducts();

    } catch (error) {
      console.error('Falha na operação completa:', error);
      this.toast.error("Erro ao salvar produto.");
      throw error;
    }
  }

  base64ToFile(base64: string, filename: string): File {
    const [meta, data] = base64.split(',');
    const mime = meta.match(/:(.*?);/)![1];
    const binary = atob(data);
    const array = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new File([array], filename, { type: mime });
  }


  // updateProduct(updatedProduct: Product): Observable<Product> {

  // }

  // deleteProduct(id: number): Observable<void> {

  // }
}
