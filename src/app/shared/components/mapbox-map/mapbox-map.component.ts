import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { TrailsService } from '../../../core/services/trails.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-mapbox-map',
  standalone: true,
  imports: [],
  templateUrl: './mapbox-map.component.html',
  styleUrl: './mapbox-map.component.scss',
})
export class MapboxMapComponent {
  mapboxToken =
    'pk.eyJ1IjoiYmFsdGhhemFyZWx5MSIsImEiOiJjbTc1M3B5N20wZ2ttMmxwcmkycHB5NjN4In0.DApwNy1xYklz4BNPFj-DmA';

  map: mapboxgl.Map | undefined;
  style = 'mapbox://styles/mapbox/dark-v11';
  lat: number = 44.0582;
  lng: number = -121.3153;

  constructor(private trailsService: TrailsService) {}

  ngAFterViewInit() {}
  // ngOnInit() {
  //   this.map = new mapboxgl.Map({
  //     accessToken: this.mapboxToken,
  //     container: 'map',
  //     style: this.style,
  //     zoom: 11,
  //     center: [this.lng, this.lat],
  //   });

  //   this.map.on('load', () => {
  //     console.log('Mapbox map has fully loaded!');
  //     this.loadTrails();
  //   });
  // }

  // loadTrails() {
  //   this.trailsService
  //     .getTrails(44.0582, -121.3153)
  //     .pipe(map((trails) => trails.data))
  //     .subscribe((trails) => {
  //       console.log(trails);

  //       trails.forEach((marker) => {
  //         new mapboxgl.Marker({ anchor: 'center' })
  //           .setLngLat([+marker.lon, +marker.lat])
  //           .setPopup(new mapboxgl.Popup().setText(marker.name))
  //           .addTo(this.map!);
  //       });
  //     });
  // }
}
