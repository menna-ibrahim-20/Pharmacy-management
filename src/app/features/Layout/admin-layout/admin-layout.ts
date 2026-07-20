import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from '../../../shared/Components/header/header';
import { Sidebar } from '../../../shared/Components/sidebar/sidebar';
import { AuthService } from '../../../core/Services/auth';
import { SettingsService } from '../../../services/settings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  isSidebarOpen = false;
  lowStockProducts: any[] = [];
  isAlertEnabled = true;
  dismissedProductIds: string[] = [];

  constructor(
    private _AuthService: AuthService, 
    private _Router: Router,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this._AuthService.userData.value || !this._AuthService.isAdmin()) {
      this._Router.navigate(['/home']);
    }

    this.settingsService.settings$.subscribe(settings => {
      this.isAlertEnabled = settings.lowStockAlert;
      this.cdr.detectChanges();
    });

    this.settingsService.lowStockProducts$.subscribe(products => {
      // Filter out products that have already been dismissed during this session
      this.lowStockProducts = products.filter(p => !this.dismissedProductIds.includes(p.id));
      this.cdr.detectChanges();
    });
  }

  onToggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  dismissAlert(productId: any) {
    this.dismissedProductIds.push(productId);
    this.lowStockProducts = this.lowStockProducts.filter(p => p.id !== productId);
    this.cdr.detectChanges();
  }
}

