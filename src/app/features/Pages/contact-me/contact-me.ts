import { Component } from '@angular/core';
import { Navbar } from "../../../shared/Components/navbar/navbar";
import { Footer } from "../../../shared/Components/footer/footer";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cart } from "../../../shared/Components/cart/cart";

import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-contact-me',
  imports: [Navbar, Footer,CommonModule,FormsModule, Cart],
  templateUrl: './contact-me.html',
  styleUrl: './contact-me.css',
})
export class ContactMe {
  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(public settingsService: SettingsService) {}

  onSubmit() {
    console.log('Contact Form Submitted:', this.formData);
    alert('Thank you for contacting ' + this.settingsService.getStoreName() + '! We will get back to you soon.');
    this.formData = { name: '', email: '', subject: '', message: '' };
  }
}
