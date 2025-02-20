import {
  Component,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { TrailsService } from '../../core/services/trails.service';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs';
import { ArcGisService } from '../../core/services/arc-gis-pin.service';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import { ArcGisMapComponent } from '../../shared/components/arc-gis-map/arc-gis-map.component';
import { ArcGisTrailService } from '../../core/services/arc-gis-trail.service';
import { Trail } from '../../core/types/trail.model';
import { CounterComponent } from '../../shared/components/counter/counter.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-all-trails',
  standalone: true,
  imports: [
    CommonModule,
    ArcGisMapComponent,
    CounterComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './all-trails.component.html',
  styleUrl: './all-trails.component.scss',
})
export class AllTrailsComponent {
  @Output() mapReady = new EventEmitter<void>();
  @ViewChild(ArcGisMapComponent, { static: true })
  mapComponent!: ArcGisMapComponent;

  private arcGisService = inject(ArcGisService);

  private pinFeatureLayer!: __esri.FeatureLayer;
  workOrderFeatureLayer!: __esri.FeatureLayer;
  trailsRaw: Trail[] = [];
  trailRaw: Trail | undefined;
  pokemon: any;

  constructor(
    private trailsService: TrailsService,
    private arcGisTrailService: ArcGisTrailService
  ) {}

  isLoading: boolean = false;

  ngOnInit() {
    this.getTrails();
  }

  getTrails() {
    this.isLoading = true;
    this.trailsService
      .getTrails(44.0582, -121.3153)
      .pipe(
        map((trails) => trails?.data),
        filter((trails) => !!trails)
      )
      .subscribe((trails) => {
        this.initTrailFeatureLayer(trails);
        this.trailsRaw = trails;
        this.isLoading = false;
      });
  }

  getSingleTrail(trailId: string) {
    this.trailsService
      .getTrail(trailId)
      .pipe(map((trails) => trails?.data[0]))
      .subscribe((trails) => {
        this.trailRaw = trails;
      });
  }

  clearTrails() {
    this.workOrderFeatureLayer.destroy();
    this.trailsRaw = [];
  }

  // TODO: turn back on
  async onMapReady() {
    try {
      this.mapReady.emit();
      // this.initalizeClickHandlers();

      this.initMapLayers();
    } catch (error) {
      console.error('Error in onMapReady:', error);
    }
  }

  initalizeClickHandlers() {
    this.mapComponent?.mapView?.on('click', (event) => {
      const mapPoint = event.mapPoint;
      const markerSymbol = {
        type: 'simple-marker',
        color: [226, 119, 40],
        size: 12,
      };

      const graphic = new Graphic({
        geometry: new Point({
          longitude: mapPoint.longitude,
          latitude: mapPoint.latitude,
          spatialReference: this.mapComponent.mapView.spatialReference,
        }),
        symbol: markerSymbol,
      });

      this.pinFeatureLayer.applyEdits({ addFeatures: [graphic] });
    });
  }

  initMapLayers() {
    this.pinFeatureLayer = this.arcGisService.buildPinFeatureLayer();
    this.mapComponent.mapView.map.add(this.pinFeatureLayer);
  }

  initTrailFeatureLayer(trails: Trail[]) {
    this.workOrderFeatureLayer =
      this.arcGisTrailService.buildWOrkOrderFeatureLayer(trails);
    this.mapComponent.mapView.map.add(this.workOrderFeatureLayer);
    this.arcGisTrailService.enableClustering(this.workOrderFeatureLayer);
  }
}
