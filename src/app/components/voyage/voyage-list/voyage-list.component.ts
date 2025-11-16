import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, catchError, finalize, map, take, takeUntil } from 'rxjs';
import { Voyage } from '../../../models/voyage.model';
import { VoyageService } from '../../../services/voyage.service';
import { VoyageCardComponent } from '../voyage-card/voyage-card.component';
import { VoyageDetailComponent } from '../voyage-detail/voyage-detail.component';
import { VoyageFormComponent } from '../voyage-form/voyage-form.component';

type VoyageVisibilityFilter = 'all' | 'public' | 'private';
type VoyageSortOption = 'recent' | 'oldest' | 'az' | 'za';

@Component({
  selector: 'app-voyage-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VoyageCardComponent, VoyageDetailComponent, VoyageFormComponent],
  templateUrl: './voyage-list.component.html',
  styleUrl: './voyage-list.component.scss'
})
export class VoyageListComponent implements OnInit, OnDestroy {
  private readonly voyageService = inject(VoyageService);
  private readonly destroy$ = new Subject<void>();

  voyages: Voyage[] = [];
  filteredVoyages: Voyage[] = [];

  searchTerm = '';
  visibilityFilter: VoyageVisibilityFilter = 'all';
  sortOption: VoyageSortOption = 'recent';

  showForm = false;
  editingVoyage: Voyage | null = null;
  selectedVoyage: Voyage | null = null;

  isLoading = false;
  isSaving = false;
  pendingDeleteId: number | null = null;
  error: string | null = null;
  toastMessage: string | null = null;
  toastVariant: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.loadVoyages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByVoyageId(_: number, voyage: Voyage): number {
    return voyage.id;
  }

  openCreateForm(): void {
    this.editingVoyage = null;
    this.selectedVoyage = null;
    this.showForm = true;
  }

  editVoyage(voyage: Voyage): void {
    const normalized = this.normalizeVoyage(voyage);
    this.editingVoyage = {
      ...normalized,
      galleries: [...(normalized.galleries ?? [])]
    };
    this.selectedVoyage = null;
    this.showForm = true;
  }

  handleFormSubmit(voyage: Voyage): void {
    const isEdit = Boolean(this.editingVoyage);
    this.isSaving = true;
    this.error = null;

    const save$ = (isEdit
      ? this.voyageService.updateVoyage(voyage).pipe(
          map((saved) => ({ saved, fallback: false })),
          catchError((err) => {
            if (err?.status === 404) {
              const { id: _, ...rest } = voyage;
              return this.voyageService
                .createVoyage(rest)
                .pipe(map((saved) => ({ saved, fallback: true })));
            }
            this.error = "Impossible d'enregistrer le voyage. Réessayez plus tard.";
            console.error('Voyage save failed', err);
            return EMPTY;
          })
        )
      : this.voyageService
          .createVoyage(voyage)
          .pipe(map((saved) => ({ saved, fallback: false }))))
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
        })
      );

    save$.subscribe(({ saved, fallback }) => {
      const normalized = this.normalizeVoyage(saved);
      if (isEdit) {
        if (fallback) {
          this.removeVoyageLocally(voyage.id);
          this.voyages = [normalized, ...this.voyages];
        } else {
          this.voyages = this.voyages.map((item) => (item.id === normalized.id ? normalized : item));
        }
      } else {
        this.voyages = [normalized, ...this.voyages];
      }

      this.applyFilters();
      this.closeForm();
      this.showToast(
        isEdit ? 'Voyage mis à jour avec succès.' : 'Nouveau voyage créé avec succès.',
        'success'
      );
      this.loadVoyages();
    });
  }

  closeForm(): void {
    this.editingVoyage = null;
    this.showForm = false;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  setVisibilityFilter(filter: VoyageVisibilityFilter): void {
    this.visibilityFilter = filter;
    this.applyFilters();
  }

  setSort(option: VoyageSortOption | string): void {
    this.sortOption = option as VoyageSortOption;
    this.applyFilters();
  }

  viewVoyage(voyage: Voyage): void {
    const normalized = this.normalizeVoyage(voyage);
    this.selectedVoyage = {
      ...normalized,
      galleries: [...(normalized.galleries ?? [])]
    };
  }

  closeDetail(): void {
    this.selectedVoyage = null;
  }

  removeVoyage(voyage: Voyage): void {
    this.pendingDeleteId = voyage.id;
    this.error = null;

    this.voyageService
      .deleteVoyage(voyage.id)
      .pipe(
        take(1),
        finalize(() => {
          this.pendingDeleteId = null;
        })
      )
      .subscribe({
        next: () => {
          this.removeVoyageLocally(voyage.id);
          this.showToast('Voyage supprimé.', 'success');
        },
        error: (err) => {
          if (err?.status === 404) {
            this.removeVoyageLocally(voyage.id);
            this.showToast('Voyage supprimé.', 'success');
            return;
          }
          this.error = 'Suppression impossible pour le moment.';
          console.error('Voyage delete failed', err);
          this.showToast('Suppression impossible pour le moment.', 'error');
        }
      });
  }

  private loadVoyages(): void {
    this.isLoading = true;
    this.error = null;

    this.voyageService
      .getPublicVoyages()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (voyages) => {
          this.voyages = voyages
            .map((voyage) => this.normalizeVoyage(voyage))
            .sort((a, b) => this.compareDates(b.dateDebut, a.dateDebut));
          this.applyFilters();
        },
        error: () => {
          this.error = 'Chargement des voyages impossible.';
          this.showToast('Chargement des voyages impossible.', 'error');
        }
      });
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    let collection = [...this.voyages];

    if (term) {
      collection = collection.filter((voyage) =>
        [voyage.titre, voyage.destination, voyage.pays, voyage.description]
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }

    if (this.visibilityFilter !== 'all') {
      collection = collection.filter((voyage) =>
        this.visibilityFilter === 'public' ? voyage.isPublic : !voyage.isPublic
      );
    }

    collection.sort((a, b) => this.sortVoyages(a, b));

    this.filteredVoyages = collection;
  }

  private sortVoyages(a: Voyage, b: Voyage): number {
    switch (this.sortOption) {
      case 'recent':
        return this.compareDates(b.dateDebut, a.dateDebut);
      case 'oldest':
        return this.compareDates(a.dateDebut, b.dateDebut);
      case 'az':
        return a.titre.localeCompare(b.titre, 'fr');
      case 'za':
        return b.titre.localeCompare(a.titre, 'fr');
      default:
        return 0;
    }
  }

  private compareDates(dateA: string, dateB: string): number {
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  }

  private normalizeVoyage(voyage: Voyage): Voyage {
    const galleries = voyage.galleries && voyage.galleries.length
      ? [...voyage.galleries]
      : voyage.imageData
      ? [voyage.imageData]
      : voyage.imageUrl
      ? [voyage.imageUrl]
      : [];
    const imageData = galleries[0];

    const normalized: Voyage = {
      ...voyage,
      galleries
    };

    if (imageData) {
      normalized.imageData = imageData;
    } else {
      delete (normalized as { imageData?: string }).imageData;
    }

    delete (normalized as { imageUrl?: string }).imageUrl;

    return normalized;
  }

  private removeVoyageLocally(id: number): void {
    this.voyages = this.voyages.filter((item) => item.id !== id);
    if (this.selectedVoyage?.id === id) {
      this.selectedVoyage = null;
    }
    if (this.editingVoyage?.id === id) {
      this.editingVoyage = null;
    }
    this.applyFilters();
  }

  private showToast(message: string, variant: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastVariant = variant;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3500);
  }
}
