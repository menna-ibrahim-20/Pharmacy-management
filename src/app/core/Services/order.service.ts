import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { SettingsService } from '../../services/settings';
import { AuthService } from './auth';

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  itemsCount: number;
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  rating?: number;
  reviewComment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  orders = signal<Order[]>([]);

  private mockOrders: Order[] = [
    {
      orderId: 'ORD-7841',
      customerName: 'Sarah Mitchell',
      customerEmail: 'sarah.m@email.com',
      customerPhone: '01065432198',
      date: '2026-06-18',
      itemsCount: 3,
      status: 'Delivered',
      total: 67.47,
      paymentMethod: 'cod',
      shippingAddress: '12 El-Galaa St, Heliopolis, Cairo',
      items: [
        { id: 1, name: 'Panadol Extra Tablets', price: 15.00, quantity: 2 },
        { id: 2, name: 'Vitamin D3 1000 IU', price: 37.47, quantity: 1 }
      ]
    },
    {
      orderId: 'ORD-7840',
      customerName: 'James Thornton',
      customerEmail: 'j.thornton@email.com',
      customerPhone: '01123456780',
      date: '2026-06-18',
      itemsCount: 2,
      status: 'Shipped',
      total: 29.99,
      paymentMethod: 'cod',
      shippingAddress: '45 Pyramids Rd, Giza',
      items: [
        { id: 3, name: 'Ibuprofen 200mg Tablets', price: 8.99, quantity: 2 }
      ]
    },
    {
      orderId: 'ORD-7839',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.s@email.com',
      customerPhone: '01298765430',
      date: '2026-06-17',
      itemsCount: 5,
      status: 'Processing',
      total: 112.35,
      paymentMethod: 'card',
      shippingAddress: '78 Ramsis St, Cairo',
      items: [
        { id: 10, name: 'Multivitamin Adults', price: 24.99, quantity: 3 },
        { id: 11, name: 'Lubricating Eye Drops', price: 7.99, quantity: 2 }
      ]
    },
    {
      orderId: 'ORD-7838',
      customerName: 'Carlos Ruiz',
      customerEmail: 'c.ruiz@email.com',
      customerPhone: '01512345678',
      date: '2026-06-17',
      itemsCount: 1,
      status: 'Pending',
      total: 18.99,
      paymentMethod: 'instapay',
      shippingAddress: '9 Abbas El-Akkad, Cairo',
      items: [
        { id: 7, name: 'Antiseptic Healing Cream', price: 14.50, quantity: 1 }
      ]
    },
    {
      orderId: 'ORD-7837',
      customerName: 'Emma Walsh',
      customerEmail: 'emma.w@email.com',
      customerPhone: '01011223344',
      date: '2026-06-16',
      itemsCount: 4,
      status: 'Delivered',
      total: 54.96,
      paymentMethod: 'card',
      shippingAddress: '15 El-Tahrir Sq, Cairo',
      items: [
        { id: 5, name: 'Vitamin C 1000mg', price: 12.00, quantity: 4 }
      ]
    },
    {
      orderId: 'ORD-7836',
      customerName: 'Mohammed Al-Rashid',
      customerEmail: 'm.alrashid@email.com',
      customerPhone: '01233445566',
      date: '2026-06-16',
      itemsCount: 6,
      status: 'Delivered',
      total: 88.47,
      paymentMethod: 'cod',
      shippingAddress: '30 El-Hagaz St, Heliopolis, Cairo',
      items: [
        { id: 6, name: 'Strepsils Honey & Lemon', price: 4.25, quantity: 6 }
      ]
    }
  ];

  private cloudUrl = 'https://api.restful-api.dev/objects/ff8081819d82fab6019f3a78543d2679';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private authService: AuthService
  ) {
    this.loadOrders();
    this.setupStorageSync();
  }

  private loadOrders() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pharmacy_orders');
      if (stored) {
        try {
          this.orders.set(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        this.orders.set(this.mockOrders);
        localStorage.setItem('pharmacy_orders', JSON.stringify(this.mockOrders));
      }
    } else {
      this.orders.set(this.mockOrders);
    }

    this.http.get<any>(this.cloudUrl).subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data.orders)) {
          const cloudOrders: Order[] = res.data.orders;
          
          if (cloudOrders.length > 0) {
            const localOrders = this.orders();
            const merged = [...cloudOrders];
            localOrders.forEach(lo => {
              const exists = merged.some(co => co.orderId === lo.orderId);
              if (!exists) {
                merged.push(lo);
              }
            });

            this.orders.set(merged);
            if (typeof window !== 'undefined') {
              localStorage.setItem('pharmacy_orders', JSON.stringify(merged));
            }
          } else {
            this.syncToCloudDirect(this.orders());
          }
        }
      },
      error: (err) => console.log('Could not fetch cloud orders, using local storage.', err)
    });
  }

  addOrder(order: Order) {
    if (typeof window !== 'undefined') {
      const deletedStr = localStorage.getItem('deleted_customer_ids');
      if (deletedStr) {
        try {
          let deleted: string[] = JSON.parse(deletedStr);
          const emailClean = order.customerEmail.toLowerCase().replace(/[^a-z0-9]/g, '');
          deleted = deleted.filter(id => {
            return id !== 'ord-' + emailClean && id !== 'reg-' + emailClean && !id.includes(emailClean) && id !== order.customerEmail.toLowerCase();
          });
          localStorage.setItem('deleted_customer_ids', JSON.stringify(deleted));
        } catch (e) {
          console.error(e);
        }
      }
    }

    const localUpdated = [order, ...this.orders()];
    this.orders.set(localUpdated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmacy_orders', JSON.stringify(localUpdated));
    }

    this.http.get<any>(this.cloudUrl).subscribe({
      next: (res) => {
        let cloudOrders: Order[] = [];
        if (res && res.data && Array.isArray(res.data.orders)) {
          cloudOrders = res.data.orders;
        }

        const merged = [order, ...cloudOrders];
        this.orders().forEach(lo => {
          const exists = merged.some(co => co.orderId === lo.orderId);
          if (!exists) {
            merged.push(lo);
          }
        });

        this.orders.set(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pharmacy_orders', JSON.stringify(merged));
        }

        this.syncToCloudDirect(merged);
      },
      error: (err) => {
        console.error('Failed to get cloud orders for saving, syncing locally only', err);
        this.syncToCloudDirect(localUpdated);
      }
    });

    if (this.settingsService.getNewOrderAlerts() && this.authService.isAdmin()) {
      this.notificationService.show(
        `🎉 New Order Placed! ID: ${order.orderId} by ${order.customerName}`,
        'success'
      );
    }
  }

  private syncToCloudDirect(ordersList: Order[]) {
    this.http.put(this.cloudUrl, {
      name: 'Pharmacy_Orders_Mariem_Store',
      data: { orders: ordersList }
    }).subscribe({
      next: () => console.log('Orders synced to cloud successfully.'),
      error: (err) => console.error('Cloud orders sync failed', err)
    });
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const updated = this.orders().map(o => o.orderId === orderId ? { ...o, status } : o);
    this.orders.set(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmacy_orders', JSON.stringify(updated));
    }
    
    this.http.get<any>(this.cloudUrl).subscribe({
      next: (res) => {
        let cloudOrders: Order[] = [];
        if (res && res.data && Array.isArray(res.data.orders)) {
          cloudOrders = res.data.orders;
        }

        const merged = cloudOrders.map(o => o.orderId === orderId ? { ...o, status } : o);
        updated.forEach(lo => {
          const exists = merged.some(co => co.orderId === lo.orderId);
          if (!exists) {
            merged.push(lo);
          }
        });

        this.orders.set(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pharmacy_orders', JSON.stringify(merged));
        }
        this.syncToCloudDirect(merged);
      },
      error: (err) => {
        this.syncToCloudDirect(updated);
      }
    });
  }

  updateOrderReview(orderId: string, rating: number, comment: string) {
    const updated = this.orders().map(o => o.orderId === orderId ? { ...o, rating, reviewComment: comment } : o);
    this.orders.set(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmacy_orders', JSON.stringify(updated));
    }
    
    this.http.get<any>(this.cloudUrl).subscribe({
      next: (res) => {
        let cloudOrders: Order[] = [];
        if (res && res.data && Array.isArray(res.data.orders)) {
          cloudOrders = res.data.orders;
        }

        const merged = cloudOrders.map(o => o.orderId === orderId ? { ...o, rating, reviewComment: comment } : o);
        updated.forEach(lo => {
          const exists = merged.some(co => co.orderId === lo.orderId);
          if (!exists) {
            merged.push(lo);
          }
        });

        this.orders.set(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pharmacy_orders', JSON.stringify(merged));
        }
        this.syncToCloudDirect(merged);
      },
      error: (err) => {
        this.syncToCloudDirect(updated);
      }
    });
  }

  private setupStorageSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'pharmacy_orders' && event.newValue) {
          try {
            const oldOrders = this.orders();
            const newOrders: Order[] = JSON.parse(event.newValue);
            
            if (newOrders.length > oldOrders.length) {
              const addedOrders = newOrders.filter(
                newO => !oldOrders.some(oldO => oldO.orderId === newO.orderId)
              );
              
              addedOrders.forEach(order => {
                if (this.settingsService.getNewOrderAlerts() && this.authService.isAdmin()) {
                  this.notificationService.show(
                    `🎉 New Order Placed! ID: ${order.orderId} by ${order.customerName}`,
                    'success'
                  );
                }
              });
            }
            
            this.orders.set(newOrders);
          } catch (e) {
            console.error('Error handling storage sync:', e);
          }
        }
      });
    }
  }
}
