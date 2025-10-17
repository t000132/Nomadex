import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from '../../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', Validators.required),
    }, { validators: this.checkPasswords });
  }

  addUser() {
    if (this.registerForm.invalid) return;
    this.authService.addUser({
      username: this.registerForm.value.username,
      password: this.registerForm.value.password
    });
    this.router.navigate(['/login']);
  }

  private checkPasswords(control: FormGroup) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password?.value !== confirmPassword?.value ? { missMatch: true } : null;
  }

  private checkUsernamePassword(formGroup: FormGroup) {
    const username = formGroup.get('username')?.value;
    const passwordValue = formGroup.get('password')?.value;
    const passwordControl = formGroup.get('password');
    if (!username || !passwordValue) return null;
    if (passwordValue.includes(username)) {
      passwordControl?.setErrors({ usernamePassword: true });
      return { usernamePassword: true };
    }
    return null;
  }

  get getErrorLabel() {
    const usernameCtrl = this.registerForm.get('username');
    const passwordCtrl = this.registerForm.get('password');
    const confirmPasswordCtrl = this.registerForm.get('confirmPassword');

    if (usernameCtrl?.hasError('required') || passwordCtrl?.hasError('required') || confirmPasswordCtrl?.hasError('required')) {
      return 'Tous les champs sont obligatoires';
    }

    if (passwordCtrl?.hasError('minlength')) {
      const len = passwordCtrl.errors?.['minlength']?.requiredLength;
      return `Le mot de passe doit contenir au moins ${len} caractères`;
    }

    if (this.registerForm.hasError('missMatch')) {
      return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }

}
