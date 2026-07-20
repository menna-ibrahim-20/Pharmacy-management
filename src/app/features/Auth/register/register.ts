import { Component, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/Services/auth';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  apiError: string = '';
  isLoading: boolean = false;

  constructor(
    private _AuthService: AuthService, 
    private _Router: Router,
    private _customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  regForm: FormGroup = new FormGroup(
    {
      name: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/),
      ]),
      rePassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/),
      ]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    },
    { validators: this.matchpass }
  );

  Register() {
    this.apiError = '';
    this.regForm.markAllAsTouched();
    if (this.regForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();

      this._AuthService.register(this.regForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log(res);
          if (res.message == 'success') {
            this._customerService.saveLocalUser({
              name: this.regForm.value.name,
              email: this.regForm.value.email,
              phone: this.regForm.value.phone
            });
            this._Router.navigate(['/auth/login']);
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
      this.apiError = 'Please fix validation errors before registering.';
      this.cdr.detectChanges();
    }
    console.log(this.regForm.value);
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
    return 'Registration failed. E-mail may be already registered, or check your connection.';
  }

  matchpass(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const rePass = group.get('rePassword')?.value;
    if (pass == rePass) {
      return null;
    } else {
      return { misMatch: true };
    }
  }
}