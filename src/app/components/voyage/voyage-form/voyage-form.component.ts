import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { Voyage } from '../../../models/voyage.model';
import { LocationOption, LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-voyage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './voyage-form.component.html',
  styleUrl: './voyage-form.component.scss'
})
export class VoyageFormComponent implements OnChanges {
  @Input() initialValue: Voyage | null = null;
  @Input() submitting = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<Voyage>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  readonly voyageForm: FormGroup;
  locationResults$ = of<LocationOption[]>([]);
  locationIsFocused = false;
  mapHint =
    'Sélectionnez une localisation pour afficher un aperçu. Le marqueur se positionnera automatiquement.';

  constructor(
    private readonly fb: FormBuilder,
    private readonly locationService: LocationService,
    private readonly sanitizer: DomSanitizer
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
          userId: 1,
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
  }

  triggerFileDialog(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.voyage-form__gallery')) {
      return;
    }
    this.fileInput?.nativeElement.click();
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

  get mapUrl(): SafeResourceUrl | null {
    if (!this.hasCoordinates) {
      return null;
    }
    const latitude = Number(this.voyageForm.value.latitude);
    const longitude = Number(this.voyageForm.value.longitude);
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=fr&z=6&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
