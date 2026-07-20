import { Component, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/Services/auth';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  apiError: string = '';
  isLoading: boolean = false;

  constructor(
    private _AuthService: AuthService, 
    private _Router: Router,
    private _customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  logForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/),
    ]),
  });

  Login() {
    this.apiError = '';
    this.logForm.markAllAsTouched();

    if (this.logForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();

      this._AuthService.login(this.logForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log(res);

          if (res.message == 'success') {
            localStorage.setItem('userToken', res.token);
            if (res.user && res.user.email) {
              localStorage.setItem('userEmail', res.user.email);
              
              // Register this user details locally so they show up in the Admin Customer list
              this._customerService.saveLocalUser({
                name: res.user.name || res.user.email.split('@')[0],
                email: res.user.email,
                phone: res.user.phone || ''
              });
            }
            this._AuthService.decodeUserdata();
            
            if (this._AuthService.isAdmin()) {
              this._Router.navigate(['/admin/dashboard']);
            } else {
              this._Router.navigate(['/home']);
            }
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err);
          this.apiError = this.getErrorMessage(err);
          this.cdr.detectChanges();
        },
      });
    } else {
      this.apiError = 'Please fix validation errors before logging in.';
      this.cdr.detectChanges();
    }
  }

  private getErrorMessage(err: any): string {
    if (err.error) {
      if (err.error.errors) {
        if (err.error.errors.msg) {
          return err.error.errors.msg;
        }
        if (Array.isArray(err.error.errors)) {
          return err.error.errors.map((e: any) => e.msg).join(', ');
        }
        if (typeof err.error.errors === 'object') {
          const keys = Object.keys(err.error.errors);
          if (keys.length > 0) {
            const firstErr = err.error.errors[keys[0]];
            if (typeof firstErr === 'string') return firstErr;
            if (firstErr && firstErr.msg) return firstErr.msg;
          }
        }
      }
      if (err.error.message && err.error.message !== 'fail' && err.error.message !== 'error') {
        return err.error.message;
      }
    }
    return 'Login failed. Please check your credentials or internet connection.';
  }
}