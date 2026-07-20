import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "../../../shared/Components/navbar/navbar";
import { Footer } from "../../../shared/Components/footer/footer";
import { Cart } from "../../../shared/Components/cart/cart";

@Component({
  selector: 'app-about-us',
  imports: [CommonModule, Navbar, Footer, Cart],
  standalone:true,
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs  {}
