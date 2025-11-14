import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VoyageService } from '../../../services/voyage.service';
import { AuthService } from '../../../services/auth.service';
import { Voyage } from '../../../models/voyage.model';
import { VoyageCardComponent } from '../voyage-card/voyage-card.component';

@Component({
  selector: 'app-voyage-list',
  standalone: true,
  imports: [CommonModule, RouterLink, VoyageCardComponent],
  templateUrl: './voyage-list.component.html',
  styleUrl: './voyage-list.component.scss'
})
export class VoyageListComponent implements OnInit {
  voyages: Voyage[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private voyageService: VoyageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVoyages();
  }

  loadVoyages(): void {
    const currentUser = this.authService.user;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.voyageService.getVoyagesByUserId(currentUser.id).subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des voyages';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  onVoyageClick(voyage: Voyage): void {
    this.router.navigate(['/voyages', voyage.id]);
  }

  onDeleteVoyage(voyageId: number): void {
    this.voyageService.deleteVoyage(voyageId).subscribe({
      next: () => {
        this.voyages = this.voyages.filter(v => v.id !== voyageId);
      },
      error: (error) => {
        alert('Erreur lors de la suppression du voyage');
        console.error(error);
      }
    });
  }

  onEditVoyage(voyageId: number): void {
    // Navigation vers la page d'édition (peut être implémentée plus tard)
    console.log('Edit voyage:', voyageId);
  }
}
