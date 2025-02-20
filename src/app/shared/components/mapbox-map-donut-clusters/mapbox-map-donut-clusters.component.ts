import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { TrailsService } from '../../../core/services/trails.service';
import { map } from 'rxjs';
import { Trail } from '../../../core/types/trail.model';
import { BaytownBoundaries } from '../mapbox-map//kmz/Baytown';
import {
  createClusterCountLayerObject,
  createClusterLayerObject,
  createGeoJsonDataSet,
  createUnclusterLayerObject,
} from '../mapbox-map/utilities/mapbox.pins';
import { Geometry, MapBoundary } from '../mapbox-map/kmz/types';
import { HoustonEastBoundaries } from '../mapbox-map/kmz/HOU_East';
import { HoustonNorthBoundaries } from '../mapbox-map/kmz/HOU_North';
import { HoustonWestBoundaries } from '../mapbox-map/kmz/HOU_West';

@Component({
  selector: 'app-mapbox-map-donut-clusters',
  standalone: true,
  imports: [],
  templateUrl: './mapbox-map-donut-clusters.component.html',
  styleUrl: './mapbox-map-donut-clusters.component.scss',
})
export class MapboxMapDonutClustersComponent {
  mapboxToken =
    'pk.eyJ1IjoiYmFsdGhhemFyZWx5MSIsImEiOiJjbTc1M3B5N20wZ2ttMmxwcmkycHB5NjN4In0.DApwNy1xYklz4BNPFj-DmA';

  map: mapboxgl.Map | undefined;
  style = 'mapbox://styles/mapbox/light-v11';
  lat: number = 44.0582;
  lng: number = -121.3153;

  difficultyFilter: string | null = 'Intermediate';
  showClusters: boolean = true;
  trailsData: Trail[] = [];

  constructor(private trailsService: TrailsService) {}

  ngOnInit() {
    this.map = new mapboxgl.Map({
      accessToken: this.mapboxToken,
      container: 'map',
      style: this.style,
      zoom: 11,
      center: [this.lng, this.lat],
    });

    this.map.on('load', () => {
      this.loadTrails();
    });
  }

  loadTrails() {
    this.trailsService
      .getTrails(44.0582, -121.3153)
      .pipe(map((trails) => trails?.data ?? []))
      .subscribe((trails) => this.addClusterLayer(trails));
  }

  addClusterLayer(trails: Trail[]) {
    if (!this.map) return;

    this.trailsData = trails;

    // Remove existing source if it already exists
    if (this.map.getSource('all-trails')) {
      this.map.removeLayer('all-trails-clusters');
      this.map.removeLayer('all-trails-clusters-count');
      this.map.removeLayer('all-trails-unclustered');
      this.map.removeSource('all-trails');
    }

    const allTrails = createGeoJsonDataSet(trails);

    // Add clustered GeoJSON source
    this.map.addSource('all-trails', {
      type: 'geojson',
      data: allTrails,
      cluster: true,
      clusterMaxZoom: 50,
      clusterRadius: 50,
      clusterProperties: {
        easy: ['+', ['case', ['==', ['get', 'difficulty'], 'Easy'], 1, 0]],
        intermediate: [
          '+',
          ['case', ['==', ['get', 'difficulty'], 'Intermediate'], 1, 0],
        ],
        advanced: [
          '+',
          ['case', ['==', ['get', 'difficulty'], 'Advanced'], 1, 0],
        ],
        expert: ['+', ['case', ['==', ['get', 'difficulty'], 'Expert'], 1, 0]],
      },
    });

    // Add unclustered points (individual trails)
    this.map.addLayer({
      id: 'all-trails-unclustered',
      type: 'circle',
      source: 'all-trails',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'difficulty'],
          'Easy',
          '#00FF00', // Green
          'Intermediate',
          '#0000FF', // Blue
          'Advanced',
          '#000000', // Black
          'Expert',
          '#FF0000', // Red
          '#FF0000', // Default: Red
        ],
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Set up custom cluster rendering
    this.setupDonutClusters();
  }

  setDifficultyFilter(difficulty: string | null) {
    if (!this.map) return;

    this.difficultyFilter = difficulty;

    if (difficulty) {
      // Hide the original cluster & unclustered layers
      this.map.setLayoutProperty('easy-clusters', 'visibility', 'none');
      this.map.setLayoutProperty('easy-trails', 'visibility', 'none');
      this.map.setLayoutProperty('easy-clusters-count', 'visibility', 'none');

      this.map.setLayoutProperty('intermediate-clusters', 'visibility', 'none');
      this.map.setLayoutProperty('intermediate-trails', 'visibility', 'none');
      this.map.setLayoutProperty(
        'intermediate-clusters-count',
        'visibility',
        'none'
      );

      this.map.setLayoutProperty('advanced-clusters', 'visibility', 'none');
      this.map.setLayoutProperty('advanced-trails', 'visibility', 'none');
      this.map.setLayoutProperty(
        'advanced-clusters-count',
        'visibility',
        'none'
      );

      // this.map.setLayoutProperty('cluster-count', 'visibility', 'none');
      // this.map.setLayoutProperty('unclustered-point', 'visibility', 'none');

      // Remove existing temp filtered layer if it exists
      if (this.map.getLayer('filtered-trails')) {
        this.map.removeLayer('filtered-trails');
        this.map.removeSource('filtered-trails');
      }

      // Filter the trails based on difficulty
      const filteredTrails = this.trailsData.filter(
        (trail) => trail.difficulty === difficulty
      );

      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: filteredTrails.map((trail) => ({
          type: 'Feature',
          properties: { name: trail.name, difficulty: trail.difficulty },
          geometry: { type: 'Point', coordinates: [+trail.lon, +trail.lat] },
        })),
      };

      // Add the new filtered source
      this.map.addSource('filtered-trails', {
        type: 'geojson',
        data: geojson,
      });

      // Add a layer to display filtered trails
      this.map.addLayer({
        id: 'filtered-trails',
        type: 'circle',
        source: 'filtered-trails',
        paint: {
          'circle-color': [
            'match',
            ['get', 'difficulty'],
            'Easy',
            '#00FF00', // Green for Easy
            'Intermediate',
            '#0000FF', // Blue for Intermediate
            'Advanced',
            '#000000', // Black for Advanced
            'Expert',
            '#000000', // Black for Advanced
            '#00FF00', // Default: Green if no match
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });
    } else {
      // Reset: Show original layers and remove filtered layer
      this.map.setLayoutProperty('easy-clusters', 'visibility', 'visible');
      this.map.setLayoutProperty('easy-trails', 'visibility', 'visible');
      this.map.setLayoutProperty(
        'easy-clusters-count',
        'visibility',
        'visible'
      );

      this.map.setLayoutProperty(
        'intermediate-clusters',
        'visibility',
        'visible'
      );
      this.map.setLayoutProperty(
        'intermediate-trails',
        'visibility',
        'visible'
      );
      this.map.setLayoutProperty(
        'intermediate-clusters-count',
        'visibility',
        'visible'
      );

      this.map.setLayoutProperty('advanced-clusters', 'visibility', 'visible');
      this.map.setLayoutProperty('advanced-trails', 'visibility', 'visible');
      this.map.setLayoutProperty(
        'advanced-clusters-count',
        'visibility',
        'visible'
      );

      if (this.map.getLayer('filtered-trails')) {
        this.map.removeLayer('filtered-trails');
        this.map.removeSource('filtered-trails');
      }
    }
  }

  adjustFillOnLayer() {
    this.map!.setPaintProperty('baytown-fill', 'fill-color', [
      'case',
      ['==', ['get', 'Name'], '50001003'],
      '#00FF00', // Highlight in green
      '#FF0000', // Default red
    ]);
  }

  flyTo(lat: number, lon: number) {
    this.map!.easeTo({
      center: [lon, lat],
      zoom: 10, // Adjust zoom level as needed
    });
  }

  setupDonutClusters() {
    if (!this.map) return;

    const markers: { [key: string]: mapboxgl.Marker } = {};
    let markersOnScreen: { [key: string]: mapboxgl.Marker } = {};

    const updateMarkers = () => {
      if (!this.map) return;

      const newMarkers: { [key: string]: mapboxgl.Marker } = {};
      const features = this.map.querySourceFeatures('all-trails');

      for (const feature of features) {
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        const props = feature.properties;
        if (!props || !props['cluster']) continue;

        const id = props['cluster_id'];
        let marker = markers[id];

        if (!marker) {
          const el = this.createDonutChart(props);
          marker = markers[id] = new mapboxgl.Marker({ element: el }).setLngLat(
            coords as any
          );
        }

        newMarkers[id] = marker;

        if (!markersOnScreen[id]) marker.addTo(this.map);
      }

      for (const id in markersOnScreen) {
        if (!newMarkers[id]) markersOnScreen[id].remove();
      }

      markersOnScreen = newMarkers;
    };

    this.map.on('render', () => {
      if (!this.map || !this.map.isSourceLoaded('all-trails')) return;
      updateMarkers();
    });
  }

  createDonutChart(props: any): HTMLElement {
    const counts = [
      props.easy || 0,
      props.intermediate || 0,
      props.advanced || 0,
      props.expert || 0,
    ];
    const colors = ['#00FF00', '#0000FF', '#000000', '#FF0000']; // Easy, Intermediate, Advanced, Expert
    const offsets: number[] = [];
    let total = counts.reduce((sum, count) => sum + count, 0);

    let offset = 0;
    counts.forEach((count) => {
      offsets.push(offset);
      offset += count;
    });

    const fontSize = total >= 100 ? 20 : total >= 10 ? 18 : 16;
    const r = total >= 100 ? 50 : total >= 10 ? 32 : 24;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;

    let html = `<div>
        <svg width="${w}" height="${w}" viewBox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif;">
    `;

    for (let i = 0; i < counts.length; i++) {
      html += this.donutSegment(
        offsets[i] / total,
        (offsets[i] + counts[i]) / total,
        r,
        r0,
        colors[i]
      );
    }

    html += `
        <circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
        <text x="${r}" y="${r}" font-size="${fontSize}px" dominant-baseline="central" text-anchor="middle">
          ${total}
        </text>
        </svg>
      </div>`;

    const el = document.createElement('div');
    el.innerHTML = html;
    return el.firstChild as HTMLElement;
  }

  donutSegment(
    start: number,
    end: number,
    r: number,
    r0: number,
    color: string
  ): string {
    if (end - start === 1) end -= 0.00001;
    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0),
      y0 = Math.sin(a0);
    const x1 = Math.cos(a1),
      y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
      r + r * y0
    }
            A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1}
            L ${r + r0 * x1} ${r + r0 * y1}
            A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${r + r0 * y0}"
            fill="${color}" />`;
  }
}
