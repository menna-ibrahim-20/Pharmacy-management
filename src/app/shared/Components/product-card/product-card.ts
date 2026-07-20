import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ProductService } from '../../../core/Services/product.services';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/Services/cart.service';
import { AuthService } from '../../../core/Services/auth';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, HttpClientModule, RouterLink],
  standalone: true,
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnInit, OnDestroy {
  
  private _currentCategory: string = 'all';

  @Input()
  set currentCategory(value: string) {
    this._currentCategory = value;
    this.filterByCategory(value);
  }

  get currentCategory(): string {
    return this._currentCategory;
  }

  // Use Angular Signals to trigger reactive updates under Zoneless CD
  products = signal<any[]>([]);        
  filteredProducts = signal<any[]>([]);
  totalProducts: number = 0;

  constructor(
    private http: HttpClient, 
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.fetchProductsFromAPI(); 
    if (typeof window !== 'undefined') {
      window.addEventListener('search-triggered', this.handleNavbarSearch);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('search-triggered', this.handleNavbarSearch);
    }
  }

  handleNavbarSearch = () => {
    this.filterBySearch(this.productService.searchQuery);
  }

  fetchProductsFromAPI() {
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products.set(prods);      
        this.totalProducts = prods.length; 
        
        if (this.productService.searchQuery) {
          this.filterBySearch(this.productService.searchQuery);
        } else if (!this.currentCategory || this.currentCategory.toLowerCase().includes('all')) {
          this.filteredProducts.set(prods); 
        } else {
          this.filterByCategory(this.currentCategory);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('حدث خطأ أثناء جلب البيانات الطبية:', err);
      }
    });
  }

  filterBySearch(query: string) {
    if (!query || query.trim() === '') {
      if (!this.currentCategory || this.currentCategory.toLowerCase().includes('all')) {
        this.filteredProducts.set(this.products());
      } else {
        this.filterByCategory(this.currentCategory);
      }
      return;
    }
    
    const cleanQuery = query.toLowerCase().trim();
    const matches = this.products().filter(prod => 
      prod.name && prod.name.toLowerCase().includes(cleanQuery)
    );
    this.filteredProducts.set(matches);
  }

  filterByCategory(categoryName: string) {
    this._currentCategory = categoryName; 

    if (!this.products() || this.products().length === 0) return;

    if (!categoryName || categoryName.trim() === '' || categoryName.toLowerCase().includes('all')) {
      this.filteredProducts.set(this.products());
      return;
    }

    const categoryMapping: { [key: string]: string } = {
      'anti-biotics': 'مضادات حيوية',
      'tablets & capsules': 'أقراص وكبسولات',
      'creams & ointment': 'كريمات ومراهم',
      'suppsitories': 'لبوس ومستحضرات شرجية',
      'eye care': 'قطرات ومستحضرات العين',
      'first aid': 'إسعافات أولية ومطهرات',
      'injections': 'حقن وأمبولات'
    };

    const selectedClean = categoryName.trim().toLowerCase();
    const arabicTranslation = categoryMapping[selectedClean] || selectedClean;

    const matches = this.products().filter(prod => {
      const targetField = prod.category || '';
      const prodClean = targetField.trim().toLowerCase();
      
      return prodClean === selectedClean || 
             prodClean === arabicTranslation || 
             prodClean.includes(arabicTranslation) || 
             arabicTranslation.includes(prodClean);
    });

    this.filteredProducts.set(matches);
  }

  getDiscount(price: number, oldPrice?: number): number {
    if (!oldPrice) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  addToCart(product: any) {
    if (!this.authService.userData.value) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.addToCart(product);
  }
}