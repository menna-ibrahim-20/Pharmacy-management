import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../services/settings';
import { AuthService } from '../../../core/Services/auth';
import { OrderService } from '../../../core/Services/order.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Output() toggleSidebarMenu = new EventEmitter<void>();

  toggleSidebar() {
    this.toggleSidebarMenu.emit();
  }
  
  lowStockCount: number = 0;
  alertProducts: any[] = [];
  alertProductNames: string = '';
  outOfStockCount: number = 0;
  outOfStockProductNames: string = '';
  showNotificationBox: boolean = false; 
  adminInitials: string = 'AM';
  dismissedNotificationIds = signal<string[]>([]);
  storeNameFirst: string = 'Medi';
  storeNameSecond: string = 'Store';

  constructor(
    public settingsService: SettingsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dismissed_notifications');
      if (stored) {
        try {
          this.dismissedNotificationIds.set(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }

    this.authService.userData.subscribe((user: any) => {
      if (user && user.name) {
        this.adminInitials = this.getInitials(user.name);
      } else {
        this.adminInitials = 'AM';
      }
      this.cdr.detectChanges();
    });

    this.settingsService.settings$.subscribe(settings => {
      const name = settings.storeName || 'MediStore';
      const spaceIdx = name.indexOf(' ');
      if (spaceIdx > 0) {
        this.storeNameFirst = name.substring(0, spaceIdx);
        this.storeNameSecond = name.substring(spaceIdx).trim();
      } else {
        const uppercaseMatches = [...name.matchAll(/[A-Z]/g)];
        if (uppercaseMatches.length >= 2) {
          const secondCapIdx = uppercaseMatches[1].index!;
          this.storeNameFirst = name.substring(0, secondCapIdx);
          this.storeNameSecond = name.substring(secondCapIdx);
        } else {
          const mid = Math.ceil(name.length / 2);
          this.storeNameFirst = name.substring(0, mid);
          this.storeNameSecond = name.substring(mid);
        }
      }
      this.cdr.detectChanges();
    });
    this.settingsService.lowStockProducts$.subscribe(products => {
      const isAlertEnabled = this.settingsService.getLowStockAlert();

      if (isAlertEnabled) {
        const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 10);
        this.alertProducts = lowStock;
        this.lowStockCount = lowStock.length;
        this.alertProductNames = lowStock.map(p => p.name || p.title || 'Product').join(', ');

        const outOfStock = products.filter(p => Number(p.stock) === 0);
        this.outOfStockCount = outOfStock.length;
        this.outOfStockProductNames = outOfStock.map(p => p.name || p.title || 'Product').join(', ');
      } else {
        this.alertProducts = [];
        this.lowStockCount = 0;
        this.alertProductNames = '';
        this.outOfStockCount = 0;
        this.outOfStockProductNames = '';
      }

      this.cdr.detectChanges();
    });
  }

  toggleNotificationBox() {
    this.showNotificationBox = !this.showNotificationBox;
  }

  getInitials(name: string): string {
    if (!name) return 'AM';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  get orderNotifications() {
    const dismissed = this.dismissedNotificationIds();
    const showNewOrders = this.settingsService.getNewOrderAlerts();
    const showReturnRequests = this.settingsService.getReturnRequests();

    return this.orderService.orders().filter(o => {
      if (dismissed.includes(o.orderId)) return false;
      if (o.status === 'Pending') return showNewOrders;
      if (o.status === 'Cancelled') return showReturnRequests;
      return false;
    });
  }

  get totalNotificationCount(): number {
    return this.lowStockCount + this.outOfStockCount + this.orderNotifications.length;
  }

  dismissNotification(orderId: string, event: Event) {
    event.stopPropagation();
    const updated = [...this.dismissedNotificationIds(), orderId];
    this.dismissedNotificationIds.set(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
    }
    this.cdr.detectChanges();
  }
}