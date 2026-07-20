import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/Services/cart.service';
import { AuthService } from '../../../core/Services/auth';
import { OrderService } from '../../../core/Services/order.service';
import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  // Shipping Form Fields
  shippingName = '';
  shippingPhone = '';
  shippingAddress = '';
  shippingCity = 'Fifth Settlement';

  // Payment Selection
  selectedPaymentMethod = 'cod'; // 'cod', 'card', 'instapay'

  // Card details
  cardNumber = '';
  cardHolder = '';
  cardExpiry = '';
  cardCvv = '';

  // Wallet details
  mobileNumber = '';

  // Processing States
  isProcessingPayment = false;
  isOrderCompleted = false;
  generatedOrderId = '';
  activeTab: 'cart' | 'orders' = 'cart';

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    public settingsService: SettingsService
  ) {}

  ngOnInit(): void {}

  get customerOrders() {
    const email = (this.authService.userData.value as any)?.email || 'guest@email.com';
    return this.orderService.orders().filter(o => o.customerEmail === email);
  }

  cancelOrder(orderId: string) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.updateOrderStatus(orderId, 'Cancelled');
    }
  }

  confirmArrival(orderId: string) {
    if (confirm('Confirm that you have received this order?')) {
      this.orderService.updateOrderStatus(orderId, 'Delivered');
    }
  }

  orderRatings: { [orderId: string]: number } = {};
  orderComments: { [orderId: string]: string } = {};

  selectStar(orderId: string, rating: number) {
    this.orderRatings[orderId] = rating;
  }

  submitOrderReview(orderId: string) {
    const rating = this.orderRatings[orderId] || 5;
    const comment = this.orderComments[orderId] || '';
    
    this.orderService.updateOrderReview(orderId, rating, comment);
    alert('Thank you for your feedback! Your review has been saved.');
  }

  closeCart() {
    this.cartService.closeDrawer();
  }

  updateQuantity(productId: string, delta: number) {
    this.cartService.updateQuantity(productId, delta);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  openCheckout() {
    // Reset state
    this.isOrderCompleted = false;
    this.isProcessingPayment = false;
    this.cartService.openCheckout();
  }

  closeCheckout() {
    this.cartService.closeCheckout();
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

  submitPayment() {
    // Basic validation
    if (!this.shippingName || !this.shippingPhone || !this.shippingAddress) {
      alert('Please fill in all shipping details.');
      return;
    }

    if (this.selectedPaymentMethod === 'card') {
      if (!this.cardNumber || !this.cardHolder || !this.cardExpiry || !this.cardCvv) {
        alert('Please fill in all credit card details.');
        return;
      }
    } else if (this.selectedPaymentMethod === 'instapay') {
      if (!this.mobileNumber) {
        alert('Please enter your mobile wallet number.');
        return;
      }
    }

    this.isProcessingPayment = true;

    // Simulate Payment processing
    setTimeout(() => {
      this.isProcessingPayment = false;
      this.isOrderCompleted = true;
      this.generatedOrderId = 'PH-' + Math.floor(100000 + Math.random() * 900000);
      
      // Save Order to OrderService
      const newOrder = {
        orderId: this.generatedOrderId,
        customerName: this.shippingName,
        customerEmail: (this.authService.userData.value as any)?.email || 'guest@email.com',
        customerPhone: this.shippingPhone || '',
        date: new Date().toISOString().split('T')[0],
        itemsCount: this.cartService.cartCount(),
        items: this.cartService.cartItems().map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        status: 'Pending' as const,
        total: this.cartService.cartSubtotal() + (this.cartService.isFreeDeliveryApplied() ? 0 : 35),
        paymentMethod: this.selectedPaymentMethod,
        shippingAddress: `${this.shippingAddress}, ${this.shippingCity}`
      };
      
      this.orderService.addOrder(newOrder);

      // Clear Cart items
      this.cartService.clearCart();
    }, 2000);
  }
}
