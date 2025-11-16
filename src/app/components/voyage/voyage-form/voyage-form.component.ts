import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, switchMap, take } from 'rxjs';
import { of } from 'rxjs';
import { Voyage } from '../../../models/voyage.model';
import { LocationOption, LocationService } from '../../../services/location.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-voyage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './voyage-form.component.html',
  styleUrl: './voyage-form.component.scss'
})
export class VoyageFormComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() initialValue: Voyage | null = null;
  @Input() submitting = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<Voyage>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  readonly voyageForm: FormGroup;
  locationResults$ = of<LocationOption[]>([]);
  locationIsFocused = false;
  mapHint = 'Cliquez sur la carte ou utilisez la recherche pour choisir un lieu.';
  private static leafletLoader: Promise<void> | null = null;
  private map: any;
  private marker: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly locationService: LocationService,
    private readonly authService: AuthService
  ) {
    this.voyageForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      locationSearch: [''],
      destination: ['', [Validators.required]],
      pays: ['', [Validators.required]],
      latitude: [''],
      longitude: [''],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      imageData: [''],
      galleries: this.fb.control<string[]>([]),
      isPublic: [true]
    });

    this.setupLocationSearch();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      const existingGallery = this.buildGalleryFromInitialValue();

      this.voyageForm.reset(
        {
          titre: this.initialValue?.titre ?? '',
          description: this.initialValue?.description ?? '',
          locationSearch: this.initialValue
            ? `${this.initialValue.destination}, ${this.initialValue.pays}`
            : '',
          destination: this.initialValue?.destination ?? '',
          pays: this.initialValue?.pays ?? '',
          latitude: this.initialValue?.latitude ?? '',
          longitude: this.initialValue?.longitude ?? '',
          dateDebut: this.initialValue?.dateDebut ?? '',
          dateFin: this.initialValue?.dateFin ?? '',
          imageData: existingGallery[0] ?? '',
          isPublic: this.initialValue?.isPublic ?? true
        },
        { emitEvent: false }
      );

      this.voyageForm.get('galleries')?.setValue(existingGallery);
      this.updateMapFromForm();
    }
  }

  onSubmit(): void {
    if (this.voyageForm.invalid) {
      this.voyageForm.markAllAsTouched();
      return;
    }

    const formValue = this.voyageForm.value as Voyage & { locationSearch: string; galleries?: string[] };
    const { locationSearch: _locationSearch, galleries, ...voyageData } = formValue;
    const galleryList = galleries?.filter(Boolean) ?? [];

    const base: Partial<Voyage> = this.initialValue
      ? {
          id: this.initialValue.id,
          userId: this.initialValue.userId,
          createdAt: this.initialValue.createdAt
        }
      : {
          userId: this.authService.user?.id || 1,
          createdAt: new Date().toISOString()
        };

    const payload: Voyage = {
      ...base,
      ...voyageData,
      galleries: galleryList
    } as Voyage;

    const cover = galleryList[0] ?? voyageData.imageData ?? undefined;
    if (cover) {
      payload.imageData = cover;
    } else {
      delete (payload as { imageData?: string }).imageData;
    }

    delete (payload as { imageUrl?: string }).imageUrl;

    if (!this.initialValue) {
      delete (payload as { id?: number }).id;
    }

    this.submitForm.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetForm(): void {
    this.voyageForm.reset(
      {
        titre: '',
        description: '',
        locationSearch: '',
        destination: '',
        pays: '',
        latitude: '',
        longitude: '',
        dateDebut: '',
        dateFin: '',
        imageData: '',
        isPublic: true
      },
      { emitEvent: false }
    );
    this.voyageForm.get('galleries')?.setValue([]);
    this.locationIsFocused = false;
    this.removeMapMarker();
    this.map?.setView([20, 0], 2);
  }

  focusLocation(): void {
    this.locationIsFocused = true;
  }

  blurLocation(): void {
    window.setTimeout(() => {
      this.locationIsFocused = false;
    }, 150);
  }

  selectLocation(option: LocationOption): void {
    this.voyageForm.patchValue(
      {
        locationSearch: `${option.city}, ${option.country}`,
        destination: option.city,
        pays: option.country,
        latitude: option.latitude,
        longitude: option.longitude
      },
      { emitEvent: false }
    );
    this.locationIsFocused = false;
    this.updateMapMarker(option.latitude, option.longitude);
  }

  clearLocation(): void {
    this.voyageForm.patchValue({
      locationSearch: '',
      destination: '',
      pays: '',
      latitude: '',
      longitude: ''
    });
    this.locationIsFocused = true;
    this.removeMapMarker();
    this.map?.setView([20, 0], 2);
  }

  triggerFileDialog(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.voyage-form__gallery')) {
      return;
    }
    this.fileInput?.nativeElement.click();
  }

  private async initializeMap(): Promise<void> {
    if (this.map || !this.mapContainer) {
      return;
    }

    await this.loadLeafletResources();
    const L = (window as any).L;
    if (!L) {
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;
      this.onMapClick(lat, lng);
    });

    this.map.setView([20, 0], 2);
    setTimeout(() => this.map?.invalidateSize(), 150);
    this.updateMapFromForm(false);
  }

  private async loadLeafletResources(): Promise<void> {
    if ((window as any).L) {
      return;
    }

    if (!VoyageFormComponent.leafletLoader) {
      VoyageFormComponent.leafletLoader = new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.crossOrigin = '';
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      });
    }

    return VoyageFormComponent.leafletLoader!;
  }

  private updateMapFromForm(pan = true): void {
    if (!this.map) {
      return;
    }
    const lat = Number(this.voyageForm.value.latitude);
    const lon = Number(this.voyageForm.value.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      this.removeMapMarker();
      this.map.setView([20, 0], 2, { animate: true });
      return;
    }
    this.updateMapMarker(lat, lon, pan);
  }

  private updateMapMarker(latitude: number, longitude: number, pan = true): void {
    if (!this.map) {
      return;
    }
    const L = (window as any).L;
    if (!this.marker) {
      this.marker = L.marker([latitude, longitude]).addTo(this.map);
    } else {
      this.marker.setLatLng([latitude, longitude]);
    }
    if (pan) {
      this.map.setView([latitude, longitude], 9, { animate: true });
    }
  }

  private removeMapMarker(): void {
    if (this.map && this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  private onMapClick(latitude: number, longitude: number): void {
    this.voyageForm.patchValue(
      {
        latitude,
        longitude
      },
      { emitEvent: false }
    );
    this.updateMapMarker(latitude, longitude);

    this.locationService
      .reverseGeocode(latitude, longitude)
      .pipe(take(1))
      .subscribe((option) => {
        if (option) {
          this.voyageForm.patchValue(
            {
              destination: option.city,
              pays: option.country,
              locationSearch: option.displayName ?? `${option.city}, ${option.country}`
            },
            { emitEvent: false }
          );
        }
      });
  }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!event.dataTransfer?.files?.length) {
      return;
    }
    this.readFiles(Array.from(event.dataTransfer.files));
  }

  onFileBrowse(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.readFiles(Array.from(input.files));
    }
  }

  clearImage(index?: number): void {
    const galleries = [...(this.voyageForm.value.galleries ?? [])];
    if (index === undefined) {
      galleries.length = 0;
      this.voyageForm.patchValue({ imageData: '' });
      this.voyageForm.get('galleries')?.setValue(galleries);
    } else {
      galleries.splice(index, 1);
      this.voyageForm.patchValue({ imageData: galleries[0] ?? '' });
      this.voyageForm.get('galleries')?.setValue(galleries);
    }

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  get hasCoordinates(): boolean {
    return Boolean(this.voyageForm.value.latitude && this.voyageForm.value.longitude);
  }

  private setupLocationSearch(): void {
    this.locationResults$ = this.voyageForm.get('locationSearch')!.valueChanges.pipe(
      startWith(this.voyageForm.get('locationSearch')!.value ?? ''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query?.trim()) {
          return of<LocationOption[]>([]);
        }
        return this.locationService.searchLocations(query);
      })
    );
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private readFiles(files: File[]): void {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
      return;
    }
    const readers = imageFiles.map((file) => this.readFileAsDataUrl(file));
    Promise.all(readers).then((base64images) => {
      const existing = [...(this.voyageForm.value.galleries ?? [])];
      const galleries = [...existing, ...base64images];
      this.voyageForm.patchValue({ imageData: galleries[0] ?? '' });
      this.voyageForm.get('galleries')?.setValue(galleries);
      if (this.fileInput?.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private buildGalleryFromInitialValue(): string[] {
    if (!this.initialValue) {
      return [];
    }

    const galleries = this.initialValue.galleries?.filter(Boolean) ?? [];

    if (!galleries.length && this.initialValue.imageData) {
      galleries.push(this.initialValue.imageData);
    }

    if (!galleries.length && this.initialValue.imageUrl) {
      galleries.push(this.initialValue.imageUrl);
    }

    return galleries;
  }
}
