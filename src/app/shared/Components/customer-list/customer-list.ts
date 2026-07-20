import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CustomerService } from '../../../services/customer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/Services/order.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit {
  searchText: string = '';
  selectedFilter: string = 'All';
  
  // Use Angular Signal to trigger Zoneless change detection automatically on state update
  customers = signal<any[]>([]);

  constructor(
    private _customerService: CustomerService,
    private _orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._customerService.getAllCustomers().subscribe({
      next: (res) => {
        const deletedStr = typeof localStorage !== 'undefined' ? localStorage.getItem('deleted_customer_ids') : null;
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];

        // Exclude admin accounts and deleted customers from the customer list
        const filtered = (res.users || []).filter((user: any) => {
          const email = user.email ? user.email.toLowerCase() : '';
          const role = user.role ? user.role.toLowerCase() : '';
          return !(role === 'admin' || email.includes('admin') || deletedIds.includes(user._id));
        });
        
        // Setting the signal notifies Angular to schedule change detection automatically
        this.customers.set(filtered);
        console.log('Client Information', filtered[0]);
      },
      error: (err) => {
        console.log('Error', err);
      }
    });
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  get filteredCustomers() {
    const apiAndLocalCustomers = this.customers();
    const mergedList = [...apiAndLocalCustomers];

    const orders = this._orderService.orders();
    orders.forEach(order => {
      const email = order.customerEmail;
      const name = order.customerName;
      if (email && name) {
        const exists = mergedList.some(c => c.email && c.email.toLowerCase() === email.toLowerCase());
        if (!exists) {
          mergedList.push({
            _id: 'ord-' + email.toLowerCase().replace(/[^a-z0-9]/g, ''),
            name: name,
            email: email,
            phone: order.customerPhone || '',
            createdAt: order.date || new Date().toISOString()
          });
        }
      }
    });

    const deletedStr = typeof localStorage !== 'undefined' ? localStorage.getItem('deleted_customer_ids') : null;
    const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];

    return mergedList
      .filter(c => !deletedIds.includes(c._id))
      .map(c => {
        const userEmail = c.email ? c.email.toLowerCase() : '';
        const userName = c.name ? c.name.toLowerCase() : '';
        
        const userOrders = orders.filter(o => 
          (o.customerEmail && o.customerEmail.toLowerCase() === userEmail) || 
          (o.customerName && o.customerName.toLowerCase() === userName)
        );
        
        const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
        
        return {
          ...c,
          orders: userOrders.length,
          spent: totalSpent
        };
      }).filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(this.searchText.toLowerCase());

        const now = new Date();
        const cDate = new Date(c.createdAt);
        let matchesFilter = false;

        if (this.selectedFilter === 'All') {
          matchesFilter = true;
        } else if (this.selectedFilter === 'Today') {
          matchesFilter = cDate.toDateString() === now.toDateString();
        } else if (this.selectedFilter === 'This Month') {
          matchesFilter = cDate.getMonth() === now.getMonth() &&
            cDate.getFullYear() === now.getFullYear();
        } else if (this.selectedFilter === 'This Year') {
          matchesFilter = cDate.getFullYear() === now.getFullYear();
        }
        return matchesSearch && matchesFilter;
      });
  }

  setFilter(filter: string) {
    console.log('doneeeeeeeeeee', filter);
    this.selectedFilter = filter;
    this.cdr.detectChanges();
  }

  deleteCustomer(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      if (typeof localStorage !== 'undefined') {
        const deletedStr = localStorage.getItem('deleted_customer_ids') || '[]';
        try {
          const deleted = JSON.parse(deletedStr);
          deleted.push(id);
          localStorage.setItem('deleted_customer_ids', JSON.stringify(deleted));
        } catch (e) {
          console.error(e);
        }
      }
      this.customers.set(this.customers().filter(c => c._id !== id));
      console.log('Deleted customer with ID:', id);
    }
  }
}
