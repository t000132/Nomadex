import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VoyageService } from '../../../services/voyage.service';
import { AuthService } from '../../../services/auth.service';
import { dateRangeValidator } from '../../../validators/date-range.validator';

@Component({
  selector: 'app-voyage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './voyage-form.component.html',
  styleUrl: './voyage-form.component.scss'
})
export class VoyageFormComponent implements OnInit {
  voyageForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private voyageService: VoyageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.voyageForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
      pays: ['', [Validators.required]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      isPublic: [true]
    }, { validators: dateRangeValidator() });
  }

  onSubmit(): void {
    if (this.voyageForm.invalid) {
      this.markFormGroupTouched(this.voyageForm);
      return;
    }

    const currentUser = this.authService.user;
    if (!currentUser) {
      this.errorMessage = 'Vous devez être connecté pour créer un voyage';
      return;
    }

    this.isSubmitting = true;
    const voyageData = {
      ...this.voyageForm.value,
      userId: currentUser.id
    };

    this.voyageService.createVoyage(voyageData).subscribe({
      next: (voyage) => {
        this.router.navigate(['/voyages', voyage.id]);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création du voyage';
        this.isSubmitting = false;
        console.error(error);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get titre() { return this.voyageForm.get('titre'); }
  get destination() { return this.voyageForm.get('destination'); }
  get pays() { return this.voyageForm.get('pays'); }
  get dateDebut() { return this.voyageForm.get('dateDebut'); }
  get dateFin() { return this.voyageForm.get('dateFin'); }
  get description() { return this.voyageForm.get('description'); }
}
