import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/Services/product.services';
import { Navbar } from '../../../shared/Components/navbar/navbar';
import { Hero } from '../../../shared/Components/hero/hero';
import { Categories } from '../../../shared/Components/categories/categories';
import { Footer } from '../../../shared/Components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../../shared/Components/product-card/product-card';
import { Cart } from '../../../shared/Components/cart/cart';
import { WhyChoose } from '../../../shared/Components/why-choose/why-choose';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  imports: [
    Navbar,
    Hero,
    Categories,
    Cart,
    Footer,
    CommonModule,
    RouterOutlet,
    ProductCard,
    WhyChoose, 

  ],
})
export class HomeComponent implements OnInit {

  products: any[] = [];         
  filteredProducts: any[] = []; 
  selectedCategory: string = 'All Product'; 

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res.products;
        this.filteredProducts = res.products;
      }
    });
  }

  filterCategory(categoryName: string) {
    this.selectedCategory = categoryName; 

    if (categoryName === 'All Product' || categoryName.includes('All')) {
      this.filteredProducts = this.products; 
    } else {
      this.filteredProducts = this.products.filter(prod => prod.badgeType === categoryName.toLowerCase());
    }
  }

}