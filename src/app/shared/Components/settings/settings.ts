import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent implements OnInit {

  products: any[] = []; 
  settings: any = {
    storeName: '',
    email: '',
    phone: '',
    deliveryThreshold: 0,
    lowStockAlert: true, 
    newOrderAlerts: true,
    returnRequests: false
  };

  constructor(
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    this.settingsService.getSettings().subscribe(data => {
      this.settings = data;
      
      const savedAlertSetting = typeof localStorage !== 'undefined' ? localStorage.getItem('lowStockAlert') : null;
      if (savedAlertSetting !== null) {
        this.settings.lowStockAlert = savedAlertSetting === 'true';
      }
      
      this.checkAndBroadcastAlerts();
      this.cdr.detectChanges(); 
    });

    this.settingsService.getProducts().subscribe((data: any) => {
      const allProducts = Array.isArray(data) ? data : (data.products || data.data || []);
      this.products = allProducts.filter((p: any) => (p.stock ?? p.quantity) <= 10);
      
      this.checkAndBroadcastAlerts();
      this.cdr.detectChanges(); 
    });
  }

  checkAndBroadcastAlerts() {
    if (this.settings.lowStockAlert) {
      this.settingsService.updateLowStockAlerts(this.products);
    } else {
      this.settingsService.updateLowStockAlerts([]);
    }
  }

  saveChanges() {
    localStorage.setItem('lowStockAlert', String(this.settings.lowStockAlert));

    this.settingsService.updateSettings(this.settings).subscribe({
      next: (res) => {
        this.checkAndBroadcastAlerts();
        alert('Settings Saved Successfully!');
      },
      error: (err) => {
        console.error('Something went wrong', err);
        alert('Cannot Save Data');
      }
    });
  }
}