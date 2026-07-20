import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/Services/product.services';
import { SettingsService } from '../../../services/settings';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchText: string = '';
  selectedCategory: string = 'All';

  categories: string[] = ['All', 'Anti-Biotics', 'Tablets & Capsules', 'Creams & Ointment', 'Suppsitories', 'Eye Care', 'First Aid', 'Injections'];

  // Modal Control
  showModal: boolean = false;
  isEditing: boolean = false;

  // Form Fields
  productId: any = null;
  productName: string = '';
  productBrand: string = '';
  productCategory: string = 'Anti-Biotics';
  productPrice: number = 0;
  productOriginalPrice: number = 0;
  productStock: number = 0;
  productImage: string = '';
  productRating: number = 5.0;
  productReviewsCount: number = 0;
  productBadge: string = '';
  productBadgeType: string = '';

  constructor(
    private productService: ProductService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(list => {
      this.products = list.map(p => {
        let stockVal = 0;
        if (p.stock !== undefined) {
          stockVal = Number(p.stock);
        } else if (p.quantity !== undefined) {
          stockVal = Number(p.quantity);
        } else if (p.inStock === true) {
          stockVal = 15; // default normal stock
        }
        
        return {
          ...p,
          stock: stockVal,
          inStock: stockVal > 0
        };
      });
      this.applyFilterAndSearch();
      this.cdr.detectChanges();
    });
  }

  applyFilterAndSearch() {
    this.filteredProducts = this.products.filter(p => {
      const name = (p.name || p.title || p.productName || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const category = p.category || '';
      
      const matchesSearch = name.includes(this.searchText.toLowerCase()) || brand.includes(this.searchText.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || category.toLowerCase() === this.selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }

  onSearch() {
    this.applyFilterAndSearch();
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilterAndSearch();
  }

  openAddModal() {
    this.isEditing = false;
    this.productId = null;
    this.productName = '';
    this.productBrand = '';
    this.productCategory = 'Anti-Biotics';
    this.productPrice = 0;
    this.productOriginalPrice = 0;
    this.productStock = 10;
    this.productImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop';
    this.productRating = 5.0;
    this.productReviewsCount = 0;
    this.productBadge = '';
    this.productBadgeType = '';
    this.showModal = true;
  }

  openEditModal(product: any) {
    this.isEditing = true;
    this.productId = product.id;
    this.productName = product.name || product.title || product.productName || '';
    this.productBrand = product.brand || '';
    this.productCategory = product.category || 'Anti-Biotics';
    this.productPrice = product.price || 0;
    this.productOriginalPrice = product.oldPrice || product.originalPrice || 0;
    
    let stockVal = 0;
    if (product.stock !== undefined) {
      stockVal = Number(product.stock);
    } else if (product.quantity !== undefined) {
      stockVal = Number(product.quantity);
    } else if (product.inStock === true) {
      stockVal = 15;
    }
    this.productStock = stockVal;
    
    this.productImage = product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop';
    this.productRating = product.rating || 5.0;
    this.productReviewsCount = product.reviewsCount || 0;
    this.productBadge = product.badge || '';
    this.productBadgeType = product.badgeType || '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveProduct() {
    if (!this.productName.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const payload = {
      id: this.productId || 'prod-' + Math.floor(1000 + Math.random() * 9000),
      name: this.productName,
      brand: this.productBrand,
      category: this.productCategory,
      price: Number(this.productPrice),
      oldPrice: this.productOriginalPrice ? Number(this.productOriginalPrice) : undefined,
      stock: Number(this.productStock),
      quantity: Number(this.productStock),
      inStock: Number(this.productStock) > 0,
      badge: this.productBadge || undefined,
      badgeType: this.productBadgeType || undefined,
      image: this.productImage,
      rating: Number(this.productRating),
      reviewsCount: Number(this.productReviewsCount)
    };

    if (this.isEditing) {
      this.productService.updateProduct(payload);
    } else {
      this.productService.addProduct(payload);
    }

    this.closeModal();
  }

  deleteProduct(id: any) {
    if (confirm('Are you sure you want to delete this product from catalog?')) {
      this.productService.deleteProduct(id);
    }
  }
}
