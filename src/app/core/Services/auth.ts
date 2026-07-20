import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth } from '../../shared/Interface/auth';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: BehaviorSubject<null | JwtPayload> = new BehaviorSubject<null | JwtPayload>(null);

  constructor(private _HttpClient: HttpClient, @Inject(PLATFORM_ID) id:object, private _Router: Router) {
    if(isPlatformBrowser(id)){
      if(localStorage.getItem('userToken') != null)
      {
        this.decodeUserdata();
      }
    }
  }

  decodeUserdata() {
    const token = localStorage.getItem('userToken')!;
    const decode = jwtDecode(token) as any;
    if (typeof localStorage !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      if (email) {
        decode.email = email;
      }
    }
    this.userData.next(decode);
    console.log(decode);
  }

  isAdmin(): boolean {
    const user = this.userData.value as any;
    if (!user) return false;
    return user.role === 'admin' || (user.email && user.email.toLowerCase().includes('admin'));
  }

  login(data: Auth): Observable<any> {
    return this._HttpClient.post(`https://ecommerce.routemisr.com/api/v1/auth/signin`, data);
  }

  register(data: Auth): Observable<any> {
    return this._HttpClient.post(`https://ecommerce.routemisr.com/api/v1/auth/signup`, data);
  }

  logout(){
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    this.userData.next(null);
    this._Router.navigate(['/auth/login'])
  }
}