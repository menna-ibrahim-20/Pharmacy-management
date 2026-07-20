import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../../core/Services/auth';
import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-sidebar',
  standalone: true, 
  imports: [RouterModule, CommonModule], 
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  onClose() {
    this.closeMenu.emit();
  }

  adminName: string = 'Admin';
  adminEmail: string = '';
  storeNameFirst: string = 'Medi';
  storeNameSecond: string = 'Store';

  constructor(
    private router: Router,
    private _AuthService: AuthService,
    public settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._AuthService.userData.subscribe({
      next: (user: any) => {
        if (user) {
          this.adminName = user.name || 'Admin';
          this.adminEmail = user.email || '';
        } else {
          this.adminName = 'Admin';
          this.adminEmail = '';
        }
        this.cdr.detectChanges();
      }
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
  }

  logout() {
    this._AuthService.logout();
  }
}