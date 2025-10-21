import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

export interface LocationOption {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName?: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

interface NominatimReverseResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly cache = new Map<string, LocationOption[]>();

  searchLocations(query: string): Observable<LocationOption[]> {
    const normalizedQuery = this.normalize(query);
    if (!normalizedQuery) {
      return of([]);
    }

    const cached = this.cache.get(normalizedQuery);
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('addressdetails', '1')
      .set('limit', '8')
      .set('email', 'contact@nomadex.app');

    return this.http
      .get<NominatimResult[]>(this.baseUrl, {
        params,
        headers: { 'Accept-Language': 'fr' }
      })
      .pipe(
        map((results) =>
          results
            .map((item) => this.toLocationOption(item))
            .filter((item): item is LocationOption => item !== null)
        ),
        tap((results) => this.cache.set(normalizedQuery, results)),
        catchError((error) => {
          console.error('Location lookup failed', error);
          return of<LocationOption[]>([]);
        })
      );
  }

  reverseGeocode(latitude: number, longitude: number): Observable<LocationOption | null> {
    const params = new HttpParams()
      .set('lat', latitude)
      .set('lon', longitude)
      .set('format', 'json')
      .set('addressdetails', '1')
      .set('email', 'contact@nomadex.app');

    return this.http
      .get<NominatimReverseResult>('https://nominatim.openstreetmap.org/reverse', {
        params,
        headers: { 'Accept-Language': 'fr' }
      })
      .pipe(
        map((result) => (result ? this.toLocationOption(result) : null)),
        catchError((error) => {
          console.error('Reverse geocode failed', error);
          return of(null);
        })
      );
  }

  private toLocationOption(result: NominatimResult): LocationOption | null {
    const latitude = Number.parseFloat(result.lat);
    const longitude = Number.parseFloat(result.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    const city =
      result.address?.city ??
      result.address?.town ??
      result.address?.village ??
      result.address?.municipality ??
      result.address?.county ??
      result.display_name.split(',')[0]?.trim();

    const country = result.address?.country ?? '';

    if (!city || !country) {
      return null;
    }

    return {
      city,
      country,
      latitude,
      longitude,
      displayName: result.display_name
    };
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
