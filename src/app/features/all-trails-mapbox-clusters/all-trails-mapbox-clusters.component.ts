import { Component } from '@angular/core';
import { MapboxMapComponent } from '../../shared/components/mapbox-map/mapbox-map.component';
import { MapboxMapDonutClustersComponent } from '../../shared/components/mapbox-map-donut-clusters/mapbox-map-donut-clusters.component';

@Component({
  selector: 'app-all-trails-mapbox-clusters',
  standalone: true,
  imports: [MapboxMapDonutClustersComponent],
  templateUrl: './all-trails-mapbox-clusters.component.html',
  styleUrl: './all-trails-mapbox-clusters.component.scss',
})
export class AllTrailsMapboxClustersComponent {}
