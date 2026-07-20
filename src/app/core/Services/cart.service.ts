import { Injectable, signal, computed } from '@angular/core';
import { SettingsService } from '../../services/settings';
import { NotificationService } from './notification.service';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signals for reactive cart state
  cartItems = signal<CartItem[]>([]);
  isDrawerOpen = signal<boolean>(false);
  isCheckoutOpen = signal<boolean>(false);

  // Computed properties
  cartCount = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  });

  cartSubtotal = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  isFreeDeliveryApplied = computed(() => {
    return this.cartSubtotal() >= this.settingsService.getDeliveryThreshold();
  });

  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService
  ) {
    // Load initial cart from localStorage in browser context
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems.set(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage:', e);
        }
      }
    }
  }

  private saveCartToLocalStorage(items: CartItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }

  addToCart(product: any, quantity: number = 1) {
    const items = [...this.cartItems()];
    const existingIndex = items.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand || 'MediStore',
        quantity: quantity
      });
    }

    this.cartItems.set(items);
    this.saveCartToLocalStorage(items);

    // Show Toast alert to confirm addition
    this.notificationService.show(`🟢 ${product.name} added to cart!`, 'success');
  }

  updateQuantity(productId: string, delta: number) {
    let items = [...this.cartItems()];
    const idx = items.findIndex(item => item.id === productId);
    if (idx > -1) {
      items[idx].quantity += delta;
      if (items[idx].quantity <= 0) {
        items = items.filter(item => item.id !== productId);
      }
      this.cartItems.set(items);
      this.saveCartToLocalStorage(items);
    }
  }

  removeFromCart(productId: string) {
    const items = this.cartItems().filter(item => item.id !== productId);
    this.cartItems.set(items);
    this.saveCartToLocalStorage(items);
  }

  openDrawer() {
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer() {
    this.isDrawerOpen.set(!this.isDrawerOpen());
  }

  clearCart() {
    this.cartItems.set([]);
    this.saveCartToLocalStorage([]);
  }

  openCheckout() {
    this.isCheckoutOpen.set(true);
    this.isDrawerOpen.set(false); // Close drawer when checkout opens
  }

  closeCheckout() {
    this.isCheckoutOpen.set(false);
  }
}
