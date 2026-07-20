import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../../core/Services/order.service';
import { CustomerService } from '../../../services/customer';
import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  totalProductsCount = signal<number>(12);
  customersCount = signal<number>(1284);
  lowStockProducts = signal<any[]>([]);

  constructor(
    public orderService: OrderService,
    private customerService: CustomerService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. Get Customers Count
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        const filtered = (res.users || []).filter((user: any) => {
          const email = user.email ? user.email.toLowerCase() : '';
          const role = user.role ? user.role.toLowerCase() : '';
          return !(role === 'admin' || email.includes('admin'));
        });
        this.customersCount.set(filtered.length);
        this.cdr.detectChanges();
      }
    });

    // 2. Get Products list (for total count and low stock)
    this.settingsService.getProducts().subscribe({
      next: (products: any[]) => {
        const allProducts = Array.isArray(products) ? products : ((products as any).products || (products as any).data || []);
        this.totalProductsCount.set(allProducts.length);
        
        // Filter low stock
        const lowStock = allProducts.filter((p: any) => (p.stock ?? p.quantity) <= 10);
        this.lowStockProducts.set(lowStock);
        
        this.cdr.detectChanges();
      }
    });
  }

  // Calculated stats
  get totalRevenue(): number {
    return this.orderService.orders()
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }

  get pendingOrdersCount(): number {
    return this.orderService.orders().filter(o => o.status === 'Pending').length;
  }

  get recentOrders(): Order[] {
    return this.orderService.orders().slice(0, 6);
  }
}
