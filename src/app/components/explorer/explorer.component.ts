import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VoyageService } from '../../services/voyage.service';
import { Voyage } from '../../models/voyage.model';
import { VoyageCardComponent } from '../voyage/voyage-card/voyage-card.component';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, RouterLink, VoyageCardComponent],
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {
  voyages: Voyage[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private voyageService: VoyageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPublicVoyages();
  }

  loadPublicVoyages(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.voyageService.getPublicVoyages().subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des voyages:', error);
        this.errorMessage = 'Impossible de charger les voyages publics';
        this.isLoading = false;
      }
    });
  }

  onVoyageClick(voyage: Voyage): void {
    this.router.navigate(['/voyage', voyage.id]);
  }

  logout(): void {
    this.authService.logout();
  }

  get isUserConnected(): boolean {
    return this.authService.isUserConnected();
  }

  get getUsername(): string {
    return this.authService.user?.username || '';
  }
}
