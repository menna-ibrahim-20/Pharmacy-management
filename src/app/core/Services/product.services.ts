import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs'; 
import { map } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  searchQuery: string = ''; 
  apiUrl = 'https://raw.githubusercontent.com/Mariem184/pharmacy-api/refs/heads/main/products.json';  
  categoryChanged = new BehaviorSubject<string>('All Product'); 
  
  private productsSubject = new BehaviorSubject<any[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initProducts();
  }

  private initProducts() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pharmacy_products');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mapped = this.mapStockProperties(parsed);
          this.productsSubject.next(mapped);
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }

    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        const list = res.products || [];
        const mapped = this.mapStockProperties(list);
        this.productsSubject.next(mapped);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pharmacy_products', JSON.stringify(mapped));
        }
      },
      error: (err) => console.error('Failed to fetch initial products', err)
    });
  }

  private mapStockProperties(list: any[]): any[] {
    return list.map(p => {
      let stockVal = 0;
      if (p.stock !== undefined) {
        stockVal = Number(p.stock);
      } else if (p.quantity !== undefined) {
        stockVal = Number(p.quantity);
      } else if (p.inStock === true) {
        stockVal = 15;
      }
      return {
        ...p,
        stock: stockVal,
        quantity: stockVal,
        inStock: stockVal > 0
      };
    });
  }

  getProducts(): Observable<any[]> {
    return this.products$;
  }

  addProduct(product: any) {
    const list = [...this.productsSubject.value, product];
    this.productsSubject.next(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmacy_products', JSON.stringify(list));
    }
  }

  updateProduct(updatedProduct: any) {
    const list = this.productsSubject.value.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    this.productsSubject.next(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmacy_products', JSON.stringify(list));
    }
  }

  deleteProduct(id: any) {
    const list = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmacy_products', JSON.stringify(list));
    }
  }

  searchProducts(keyword: string): Observable<any[]> {
    return this.products$.pipe(
      map(productsList => {
        if (!keyword.trim()) return productsList;
        return productsList.filter((product: any) => {
          const productName = product.name || product.title || product.productName || '';
          return productName.toLowerCase().includes(keyword.toLowerCase());
        });
      })
    );
  }

  changeCategory(categoryName: string) {
    this.categoryChanged.next(categoryName); 
  }
}