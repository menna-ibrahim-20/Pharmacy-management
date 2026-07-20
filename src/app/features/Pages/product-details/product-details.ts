import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/Services/product.services';
import { CustomerService } from '../../../services/customer';
import { CartService } from '../../../core/Services/cart.service';
import { Navbar } from '../../../shared/Components/navbar/navbar';
import { Cart } from '../../../shared/Components/cart/cart';
import { AuthService } from '../../../core/Services/auth';

 
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Cart],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit {
 
  product: any = null;
  relatedProducts: any[] = [];
  loading = true;
  error = '';
 
  quantity = 1;
  selectedImageIndex = 0;
  activeTab = 'description';
 
  reviews: any[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private customerService: CustomerService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProduct(params['id']);
    });
    this.loadReviews();
  }
 
  loadProduct(id: string): void {
    this.loading = true;
    this.error = '';
    this.product = null;
    this.selectedImageIndex = 0;
    this.quantity = 1;
 
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        const products = data.products ?? data;
 
        this.product = products.find((p: any) => String(p.id) === String(id));
 
        if (!this.product) {
          this.error = 'Product not found.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
 
        this.relatedProducts = products
          .filter((p: any) =>
            p.category === this.product.category &&
            p.id !== this.product.id
          )
          .slice(0, 3);
 
        this.loading = false;
        this.cdr.detectChanges();
      },
 
      error: () => {
        this.error = 'Error loading product.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  get productImages(): string[] {
    return this.product ? [this.product.image] : [];
  }
 
  get discountPercent(): number {
    if (!this.product?.oldPrice) return 0;
    return Math.round(
      ((this.product.oldPrice - this.product.price) / this.product.oldPrice) * 100
    );
  }
 
  get originalPrice(): number | null {
    return this.product?.oldPrice || null;
  }
 
  get productStock(): number {
    return this.product?.inStock ? 100 : 0;
  }
 
  get productInStock(): boolean {
    return this.product?.inStock;
  }
 
  getStarArray(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(rating));
  }
 
  getRatingBars() {
    return [
      { label: '5', percent: 78 },
      { label: '4', percent: 15 },
      { label: '3', percent: 5  },
      { label: '2', percent: 1  },
      { label: '1', percent: 1  },
    ];
  }
 
  selectImage(i: number) { this.selectedImageIndex = i; }
  decreaseQty()          { if (this.quantity > 1) this.quantity--; }
  increaseQty()          { if (this.quantity < this.productStock) this.quantity++; }
  setTab(tab: string)    { this.activeTab = tab; }
  addToCart() {
    if (!this.authService.userData.value) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
    }
  }

  loadReviews(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (res: any) => {
        const users = res.users || [];
        const staticComments = [
          'Excellent product, highly recommended!',
          'Great value for money and fast shipping.',
          'Very effective! Will definitely buy again.',
          'Good quality, matches the description perfectly.',
          'Decent product, works as expected.'
        ];
        
        this.reviews = users.slice(0, 3).map((user: any, index: number) => {
          const rating = index === 0 ? 5 : (index === 1 ? 5 : 4);
          const date = new Date(user.createdAt);
          const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          const comment = staticComments[index % staticComments.length];
          
          return {
            name: user.name,
            rating: rating,
            date: formattedDate,
            comment: comment,
            verified: index % 2 === 0
          };
        });
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reviews from customer service', err);
        this.reviews = [
          { name: 'Ahmed M.', rating: 5, date: 'June 2025', comment: 'Great product! Highly recommend.', verified: true },
          { name: 'Sara K.',  rating: 5, date: 'May 2025',  comment: 'Good quality and fast delivery.', verified: true },
          { name: 'Omar H.',  rating: 4, date: 'April 2025', comment: 'Effective and well priced.', verified: false },
        ];
        this.cdr.detectChanges();
      }
    });
  }
}