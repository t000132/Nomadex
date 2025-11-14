import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VoyageService } from '../../services/voyage.service';
import { JournalService } from '../../services/journal.service';
import { Voyage } from '../../models/voyage.model';
import { Journal } from '../../models/journal.model';
import { forkJoin } from 'rxjs';
import { VoyageDetailComponent } from '../voyage/voyage-detail/voyage-detail.component';
import { VoyageFormComponent } from '../voyage/voyage-form/voyage-form.component';

interface DashboardStats {
  totalVoyages: number;
  publicVoyages: number;
  privateVoyages: number;
  totalJournals: number;
  topDestinations: { pays: string; count: number }[];
  recentVoyages: Voyage[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, VoyageDetailComponent, VoyageFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private voyageService = inject(VoyageService);
  private journalService = inject(JournalService);

  stats: DashboardStats = {
    totalVoyages: 0,
    publicVoyages: 0,
    privateVoyages: 0,
    totalJournals: 0,
    topDestinations: [],
    recentVoyages: []
  };

  myVoyages: Voyage[] = [];
  selectedVoyage: Voyage | null = null;
  editingVoyage: Voyage | null = null;
  showForm = false;
  isSaving = false;
  isLoading = true;
  username = '';

  ngOnInit(): void {
    this.username = this.authService.user?.username || 'Voyageur';
    
    // Si l'utilisateur n'est pas chargé, attendre qu'il le soit
    if (!this.authService.user && this.authService.getSavedUser()) {
      this.authService.getSavedUserInfo().subscribe({
        next: (users) => {
          if (users && users.length > 0) {
            this.authService.user = users[0];
            this.username = users[0].username;
            this.loadDashboardData();
          } else {
            this.isLoading = false;
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadDashboardData();
    }
  }

  private loadDashboardData(): void {
    const userId = this.authService.user?.id;
    if (!userId) return;

    forkJoin({
      allVoyages: this.voyageService.getPublicVoyages(),
      myVoyages: this.voyageService.getVoyagesByUserId(userId),
      journals: this.journalService.getJournauxByUserId(userId)
    }).subscribe({
      next: ({ allVoyages, myVoyages, journals }) => {
        this.myVoyages = myVoyages;
        this.calculateStats(allVoyages, myVoyages, journals);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.isLoading = false;
      }
    });
  }

  private calculateStats(allVoyages: Voyage[], myVoyages: Voyage[], journals: Journal[]): void {
    this.stats.totalVoyages = myVoyages.length;
    this.stats.publicVoyages = myVoyages.filter(v => v.isPublic).length;
    this.stats.privateVoyages = myVoyages.filter(v => !v.isPublic).length;
    this.stats.totalJournals = journals.length;

    // Top destinations
    const destinationMap = new Map<string, number>();
    myVoyages.forEach(voyage => {
      const pays = voyage.pays || voyage.destination;
      if (pays) {
        destinationMap.set(pays, (destinationMap.get(pays) || 0) + 1);
      }
    });

    this.stats.topDestinations = Array.from(destinationMap.entries())
      .map(([pays, count]) => ({ pays, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent public voyages (tous les voyages publics)
    this.stats.recentVoyages = allVoyages
      .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
      .slice(0, 6);
  }

  viewVoyage(voyage: Voyage): void {
    this.selectedVoyage = voyage;
  }

  closeDetail(): void {
    this.selectedVoyage = null;
  }

  editVoyage(voyage: Voyage): void {
    this.editingVoyage = { ...voyage };
    this.selectedVoyage = null;
    this.showForm = true;
  }

  closeForm(): void {
    this.editingVoyage = null;
    this.showForm = false;
  }

  handleFormSubmit(voyage: Voyage): void {
    this.isSaving = true;
    this.voyageService.updateVoyage(voyage).subscribe({
      next: (updatedVoyage) => {
        // Mettre à jour dans myVoyages
        const index = this.myVoyages.findIndex(v => v.id === updatedVoyage.id);
        if (index !== -1) {
          this.myVoyages[index] = updatedVoyage;
        }
        // Recharger les données
        this.loadDashboardData();
        this.closeForm();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        this.isSaving = false;
      }
    });
  }

  removeVoyage(voyage: Voyage): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le voyage "${voyage.titre}" ?`)) {
      return;
    }

    this.voyageService.deleteVoyage(voyage.id).subscribe({
      next: () => {
        // Retirer le voyage de la liste
        this.myVoyages = this.myVoyages.filter(v => v.id !== voyage.id);
        // Fermer la popup
        this.closeDetail();
        // Recharger les données pour mettre à jour les stats
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        alert('Impossible de supprimer ce voyage. Veuillez réessayer.');
      }
    });
  }
}
