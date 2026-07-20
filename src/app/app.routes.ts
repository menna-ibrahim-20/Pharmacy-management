import { Routes } from '@angular/router';
import { HomeComponent } from './features/Pages/home/home';
import { Cart } from './shared/Components/cart/cart';
import { AboutUs } from './features/Pages/about-us/about-us';
import { AdminLayout } from './features/Layout/admin-layout/admin-layout';
import { CustomerList } from './shared/Components/customer-list/customer-list';
import { SettingsComponent } from './shared/Components/settings/settings';
import { OrdersComponent } from './shared/Components/orders/orders';
import { ContactMe } from './features/Pages/contact-me/contact-me';
import { DashboardComponent } from './shared/Components/dashboard/dashboard';
import { AuthLayout } from './features/Layout/auth-layout/auth-layout';
import { Login } from './features/Auth/login/login';
import { Register } from './features/Auth/register/register';
import { ProductDetails } from './features/Pages/product-details/product-details';
import { LocationComponent } from './features/Pages/location/location';
import { ProductsComponent } from './shared/Components/products/products';
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'cart',
    component: Cart
  },
  {
    path: 'location',
    component: LocationComponent
  },
  {
    path: 'about-us',
    component: AboutUs
  },
  {
    path:'contact-me',
    component:ContactMe
  },
  {
    path:'product-details/:id',
    component:ProductDetails
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      }
    ]
  }
  ,
  {
    path: 'admin',
    component: AdminLayout,
    children:[
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomerList },
      { path: 'settings', component: SettingsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'products', component: ProductsComponent }
    ]
  },
  { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full'}
];