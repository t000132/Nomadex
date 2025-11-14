import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [''],
      password: [''],
    });
  }

  login() {
    this.authService.login(this.loginForm.value).subscribe({
      next: (users: User[]) => {
        if (users.length === 0)
          alert('Erreur dans le pseudo ou le mot de passe');
        this.authService.user = users[0];
        if (!this.authService.user) return;
        this.authService.saveUser();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        alert('Erreur dans la requête');
      },
    });
  }
}
