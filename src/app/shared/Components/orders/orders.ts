import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../core/Services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent implements OnInit {
  searchQuery = '';
  activeTab = 'All';
  
  // Detail modal state
  selectedOrder: Order | null = null;
  isDetailModalOpen = false;

  constructor(public orderService: OrderService) {}

  ngOnInit(): void {}

  getStatusCount(status: string): number {
    const list = this.orderService.orders();
    if (status === 'All') return list.length;
    return list.filter(o => o.status.toLowerCase() === status.toLowerCase()).length;
  }

  get filteredOrders(): Order[] {
    let list = this.orderService.orders();
    
    if (this.activeTab !== 'All') {
      list = list.filter(o => o.status.toLowerCase() === this.activeTab.toLowerCase());
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      list = list.filter(o => 
        o.orderId.toLowerCase().includes(query) || 
        o.customerName.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query)
      );
    }

    return list;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedOrder = null;
  }

  changeStatus(orderId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Order['status'];
    this.orderService.updateOrderStatus(orderId, newStatus);
  }
}
