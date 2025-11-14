import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VoyageService } from '../../services/voyage.service';
import { Voyage } from '../../models/voyage.model';
import { VoyageCardComponent } from '../voyage/voyage-card/voyage-card.component';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, RouterLink, VoyageCardComponent],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.scss'
})
export class ExplorerComponent implements OnInit {
  voyages: Voyage[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private voyageService: VoyageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPublicVoyages();
  }

  loadPublicVoyages(): void {
    this.voyageService.getPublicVoyages().subscribe({
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
}
