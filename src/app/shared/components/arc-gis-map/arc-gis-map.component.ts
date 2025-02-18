import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import config from '@arcgis/core/config';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Locate from '@arcgis/core/widgets/Locate';

@Component({
  selector: 'app-arc-gis-map',
  standalone: true,
  imports: [],
  templateUrl: './arc-gis-map.component.html',
  styleUrl: './arc-gis-map.component.scss',
})
export class ArcGisMapComponent {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  @Output() mapReady = new EventEmitter();

  esriConfig = config;
  mapView!: MapView;
  spatialReference = SpatialReference.WebMercator;

  async initMap() {
    try {
      this.mapView = this.initialize({
        container: this.mapViewEl.nativeElement,
        basemap: 'dark-gray-vector',
      });
      return await this.mapView.when();
    } catch (error) {
      console.error('Error initializing the map:', error);
      throw error;
    }
  }

  async ngOnInit() {
    try {
      await this.initMap().then(() => {
        this.mapReady.emit();
        let locateWidget = new Locate({
          view: this.mapView,
        });

        this.mapView.ui.add(locateWidget, 'top-right');
      });
    } catch (error) {
      console.error('Error initializing the map:', error);
    }
  }

  initialize(config: {
    container: HTMLDivElement;
    basemap: string;
  }): __esri.MapView {
    const map = new Map({
      basemap: config.basemap,
    });

    const view = new MapView({
      container: config.container,
      map,
      center: [-121.3153, 44.0582],
      popupEnabled: true,
      zoom: 11,
      popup: {
        dockEnabled: false,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false,
          position: 'top-right',
        },
        visibleElements: {
          closeButton: false,
          collapseButton: false,
          featureNavigation: false,
          heading: false,
          actionBar: false,
        },
      },
      spatialReference: this.spatialReference,
      ui: {
        components: ['zoom'],
      },
    });

    this.mapView = view;

    return this.mapView;
  }

  ngOnDestroy(): void {
    if (this.mapView && this.mapView.initialized) {
      this.mapView.destroy();
    }
  }
}
