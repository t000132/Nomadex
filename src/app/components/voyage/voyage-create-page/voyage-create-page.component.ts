import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { Voyage } from '../../../models/voyage.model';
import { VoyageService } from '../../../services/voyage.service';
import { VoyageFormComponent } from '../voyage-form/voyage-form.component';

@Component({
  selector: 'app-voyage-create-page',
  standalone: true,
  imports: [CommonModule, VoyageFormComponent],
  templateUrl: './voyage-create-page.component.html',
  styleUrl: './voyage-create-page.component.scss'
})
export class VoyageCreatePageComponent {
  @ViewChild(VoyageFormComponent) formComponent?: VoyageFormComponent;

  isSubmitting = false;
  errorMessage: string | null = null;
  showSuccessModal = false;
  lastCreatedVoyage: Voyage | null = null;

  constructor(private readonly voyageService: VoyageService, private readonly router: Router) {}

  handleSubmit(voyage: Voyage): void {
    this.isSubmitting = true;
    this.errorMessage = null;

    this.voyageService
      .createVoyage(voyage)
      .pipe(
        take(1),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (savedVoyage) => {
          this.lastCreatedVoyage = savedVoyage;
          this.showSuccessModal = true;
        },
        error: (err) => {
          console.error('Voyage creation failed', err);
          this.errorMessage = "Impossible d'enregistrer le voyage pour le moment.";
        }
      });
  }

  handleCancel(): void {
    this.router.navigate(['/voyages']);
  }

  goToVoyages(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/voyages']);
  }

  createAnother(): void {
    this.showSuccessModal = false;
    this.lastCreatedVoyage = null;
    this.formComponent?.resetForm();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.showSuccessModal) {
      this.showSuccessModal = false;
    }
  }
}
