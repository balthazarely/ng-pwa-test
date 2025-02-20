import { Component } from '@angular/core';
import { MapboxMapComponent } from '../../shared/components/mapbox-map/mapbox-map.component';

@Component({
  selector: 'app-all-trails-mapbox',
  standalone: true,
  imports: [MapboxMapComponent],
  templateUrl: './all-trails-mapbox.component.html',
  styleUrl: './all-trails-mapbox.component.scss',
})
export class AllTrailsMapboxComponent {}
