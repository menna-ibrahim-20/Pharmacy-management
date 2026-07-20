import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(public settingsService: SettingsService) {}
}
