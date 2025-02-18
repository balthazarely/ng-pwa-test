import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { TrailDto } from '../types/trail.model';
import { trailApiHost, trailApiKey } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrailsService {
  private trailApiBase = 'https://trailapi-trailapi.p.rapidapi.com/trails';

  constructor(private http: HttpClient) {}

  getTrails(lat: number, lon: number): Observable<TrailDto | null> {
    const headers = new HttpHeaders({
      'x-rapidapi-host': trailApiHost,
      'x-rapidapi-key': trailApiKey,
    });

    const params = {
      lat: lat.toString(),
      lon: lon.toString(),
    };

    return this.http
      .get<any>(`${this.trailApiBase}/explore`, { headers, params })
      .pipe(
        catchError((error) => {
          console.warn(
            'Network request failed, attempting offline cache...',
            error
          );
          return of(null); // Returns empty observable in case of network failure
        })
      );
  }

  getTrail(trailId: string): Observable<TrailDto> {
    const headers = new HttpHeaders({
      'x-rapidapi-host': trailApiHost,
      'x-rapidapi-key': trailApiKey,
    });

    return this.http.get<any>(`${this.trailApiBase}/${trailId}`, {
      headers,
    });
  }
}
