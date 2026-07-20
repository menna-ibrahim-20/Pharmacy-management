import { Component, Output, EventEmitter } from '@angular/core'; // 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  categories = [
    { name: 'All Product', icon: 'fa-solid fa-bars' },
    { name: 'Anti-Biotics', icon: 'fa-solid fa-prescription-bottle-medical' },
    { name: 'Tablets & Capsules', icon: 'fa-solid fa-capsules' },
    { name: 'Creams & Ointment', icon: 'fa-solid fa-boxes-packing' },
    { name: 'Suppsitories', icon: 'fa-solid fa-monument' },
    { name: 'Eye Care', icon: 'fas fa-eye' },
    { name: 'First Aid', icon: 'fa-solid fa-kit-medical' },
    { name: 'Injections', icon: 'fa-solid fa-syringe' }
  ];
  activeItem: string = 'All Product'; 


  @Output() onCategorySelect = new EventEmitter<string>(); 

  setActive(itemName: string, event: Event) {
    event.preventDefault(); 
    this.activeItem = itemName; 
    
  
    this.onCategorySelect.emit(itemName); 
  }
}