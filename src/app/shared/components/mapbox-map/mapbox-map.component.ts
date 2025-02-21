import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { TrailsService } from '../../../core/services/trails.service';
import { map } from 'rxjs';
import { Trail } from '../../../core/types/trail.model';
import { BaytownBoundaries } from './kmz/Baytown';
import {
  createClusterCountLayerObject,
  createClusterLayerObject,
  createGeoJsonDataSet,
  createUnclusterLayerObject,
} from './utilities/mapbox.pins';
import { Geometry, MapBoundary } from './kmz/types';
import { HoustonEastBoundaries } from './kmz/HOU_East';
import { HoustonNorthBoundaries } from './kmz/HOU_North';
import { HoustonWestBoundaries } from './kmz/HOU_West';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { computeBoundaryCentroid } from './utilities/mapbox.borders';
import { decodePolyline } from './utilities/mapbox.lines';

@Component({
  selector: 'app-mapbox-map',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    FormsModule,
  ],
  templateUrl: './mapbox-map.component.html',
  styleUrl: './mapbox-map.component.scss',
})
export class MapboxMapComponent {
  mapboxToken =
    'pk.eyJ1IjoiYmFsdGhhemFyZWx5MSIsImEiOiJjbTc1M3B5N20wZ2ttMmxwcmkycHB5NjN4In0.DApwNy1xYklz4BNPFj-DmA';

  mapStyle?: string = 'dark-v11';

  map: mapboxgl.Map | undefined;
  style = `mapbox://styles/mapbox/dark-v11`;
  lat: number = 44.0582;
  lng: number = -121.3153;

  // updateMapStyle() {
  //   if (!this.map) return;

  //   this.map.getStyle()?.layers?.forEach((layer) => {
  //     this.map!.removeLayer(layer.id);
  //   });

  //   const sources = this.map.getStyle()?.sources;
  //   if (sources) {
  //     Object.keys(sources).forEach((source) => {
  //       this.map!.removeSource(source);
  //     });
  //   }

  //   // Set new style
  //   this.map.setStyle(`mapbox://styles/mapbox/${this.mapStyle}`);

  //   // Wait for the new style to load, then re-add everything
  //   this.map.once('style.load', () => {
  //     setTimeout(() => {
  //       this.loadTrails(); // Reload cluster layers
  //       this.addBoundaries('Baytown', BaytownBoundaries);
  //       this.addBoundaries('Hou-East', HoustonEastBoundaries);
  //       this.addBoundaries('Hou-North', HoustonNorthBoundaries);
  //       this.addBoundaries('Hou-West', HoustonWestBoundaries);
  //     }, 500); // Small delay ensures the new style is fully loaded
  //   });
  // }

  difficultyFilter: string | null = 'Intermediate';
  showClusters: boolean = true;
  trailsData: Trail[] = [];
  loadingLoop: boolean = false;

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
      // this.loadTrailsLoop();
      this.addBoundaries('Baytown', BaytownBoundaries);
      this.addBoundaries('Hou-East', HoustonEastBoundaries);
      this.addBoundaries('Hou-North', HoustonNorthBoundaries);
      this.addBoundaries('Hou-West', HoustonWestBoundaries);

      this.createLegend();
      this.createLinePath();
    });
  }

  loadTrailsLoop() {
    this.loadingLoop = true;

    const places = [
      {
        //boulder
        lat: 40.015,
        lng: -105.2705,
      },
      {
        //bend
        lat: 44.0582,
        lng: -121.3153,
      },
      {
        //Bellingham
        lat: 48.7519,
        lng: -122.4787,
      },
      {
        //Durango
        lat: 37.2753,
        lng: -107.8801,
      },
      {
        //Moab
        lat: 38.5733,
        lng: -109.5498,
      },
      {
        //Tuscon
        lat: 32.254,
        lng: -110.9742,
      },
      {
        //Grand Junction
        lat: 39.0639,
        lng: -108.5506,
      },
      {
        //Frederick, MD
        lat: 39.4143,
        lng: -77.4105,
      },
      {
        //Annapolis, MD
        lat: 38.9784,
        lng: -76.4922,
      },
      {
        //Cacapon State, MD
        lat: 39.5128,
        lng: -78.3218,
      },
    ];

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const fetchTrailsWithDelay = async () => {
      const allTrails: Trail[] = [];
      for (const place of places) {
        const trails = await this.trailsService
          .getTrails(place.lat, place.lng)
          .pipe(map((trails) => trails?.data ?? []))
          .toPromise();
        if (trails) {
          allTrails.push(...trails);
        }
        await delay(1000); // Delay of 1 second between requests
      }
      this.addClusterLayer(allTrails);
      this.loadingLoop = false;
    };

    fetchTrailsWithDelay();
  }

  loadTrails() {
    this.trailsService
      .getTrails(44.0582, -121.3153)
      .pipe(map((trails) => trails?.data ?? []))
      .subscribe((trails) => this.addClusterLayer(trails));
  }

  addMapLayer(
    map: mapboxgl.Map,
    dataSource: any,
    sourceName: string,
    baseColor: string
  ) {
    map.addSource(`${sourceName}-trails`, {
      type: 'geojson',
      data: dataSource,
      cluster: true,
      clusterMaxZoom: 50,
      clusterRadius: 50,
    });

    const advancedClusterConfig = createClusterLayerObject(
      `${sourceName}-clusters`,
      `${sourceName}-trails`,
      baseColor
    ) as mapboxgl.CircleLayerSpecification;
    const advancedClusterCountConfig = createClusterCountLayerObject(
      `${sourceName}-clusters-count`,
      `${sourceName}-trails`
    ) as mapboxgl.CircleLayerSpecification;
    const advancedUnclusterConfig = createUnclusterLayerObject(
      `${sourceName}-unclustered-point`,
      `${sourceName}-trails`,
      baseColor
    ) as mapboxgl.CircleLayerSpecification;

    map.addLayer(advancedClusterConfig);
    map.addLayer(advancedClusterCountConfig);
    map.addLayer(advancedUnclusterConfig);
  }

  addClusterLayer(trails: Trail[]) {
    if (!this.map) return;

    this.trailsData = trails;

    // Remove existing source if it already exists
    if (this.map.getSource('easy-trails')) {
      this.map.removeLayer('easy-clusters');
      this.map.removeLayer('easy-cluster-count');
      this.map.removeLayer('easy-unclustered-point');
    }
    if (this.map.getSource('intermediate-trails')) {
      this.map.removeLayer('intermediate-clusters');
      this.map.removeLayer('intermediate-cluster-count');
      this.map.removeLayer('intermediate-unclustered-point');
    }
    if (this.map.getSource('advanced-trails')) {
      this.map.removeLayer('advanced-clusters');
      this.map.removeLayer('advanced-cluster-count');
      this.map.removeLayer('advanced-unclustered-point');
    }
    const easyTrails = createGeoJsonDataSet(
      trails.filter((trail) => trail.difficulty === '')
    );

    const intermediateTrails = createGeoJsonDataSet(
      trails.filter((trail) => trail.difficulty === 'Intermediate')
    );

    const advancedTrails = createGeoJsonDataSet(
      trails.filter((trail) => trail.difficulty === 'Advanced')
    );

    this.addMapLayer(this.map, easyTrails, 'easy', '#26a626');
    this.addMapLayer(this.map, intermediateTrails, 'intermediate', '#0000FF');
    this.addMapLayer(this.map, advancedTrails, 'advanced', '#000000');

    // Add click event for unclustered points (trail popups)
    this.map.on('click', 'easy-unclustered-point', (e) =>
      this.mapClickListener(e)
    );
    this.map.on('click', 'intermediate-unclustered-point', (e) =>
      this.mapClickListener(e)
    );
    this.map.on('click', 'advanced-unclustered-point', (e) =>
      this.mapClickListener(e)
    );
    this.map.on('click', 'easy-clusters', (e) =>
      this.mapClickListenerCluster(e, 'easy')
    );
    this.map.on('click', 'intermediate-clusters', (e) =>
      this.mapClickListenerCluster(e, 'intermediate')
    );
    this.map.on('click', 'advanced-clusters', (e) =>
      this.mapClickListenerCluster(e, 'advanced')
    );

    this.map.on('click', 'filtered-trails', (e) => {
      this.mapClickListener(e);
    });
  }

  mapClickListener(e: mapboxgl.MapMouseEvent) {
    const coordinates = (e.features?.[0].geometry as GeoJSON.Point).coordinates;
    const name = e.features?.[0].properties?.['name'];
    const difficulty = e.features?.[0].properties?.['difficulty'];
    new mapboxgl.Popup()
      .setLngLat(coordinates as [number, number])
      .setHTML(
        `<div><h3>Name: ${name}</h3> <h5>difficulty: ${difficulty}</h5></div>`
      )
      .addTo(this.map!);
  }

  async mapClickListenerCluster(e: mapboxgl.MapMouseEvent, layer: string) {
    if (!this.map) return;

    const features = this.map.queryRenderedFeatures(e.point, {
      layers: [`${layer}-clusters`],
    });

    if (!features.length) return;

    const clusterId = features[0].properties!['cluster_id'];
    const source = this.map.getSource(
      `${layer}-trails`
    ) as mapboxgl.GeoJSONSource;

    source.getClusterLeaves(clusterId, 10, 0, (err, leaves) => {
      if (err) return console.error('Error fetching cluster leaves:', err);

      let popupContent = `
        <h3>Trails in Cluster</h3>
        <ul id="trail-list">
          ${leaves!
            .map(
              (leaf, index) => `
            <li>
              <a href="#" class="trail-item" data-trail-id="${index}">
                ${leaf.properties!['name']} - ${leaf.properties!['difficulty']}
              </a>
            </li>
          `
            )
            .join('')}
        </ul>
      `;

      // Create the popup (store reference)
      const popup = new mapboxgl.Popup()
        .setLngLat(
          (features[0].geometry as GeoJSON.Point).coordinates as [
            number,
            number
          ]
        )
        .setHTML(popupContent)
        .addTo(this.map!);

      // Function to attach event listeners (including "Back to List")
      const attachEventListeners = () => {
        document.querySelectorAll('.trail-item').forEach((item) => {
          item.addEventListener('click', (event) => {
            event.preventDefault();
            const trailIndex = (event.target as HTMLElement).getAttribute(
              'data-trail-id'
            );

            if (trailIndex !== null) {
              const trailData = leaves![parseInt(trailIndex)];
              if (trailData) {
                // Update the same popup with trail details
                popup.setHTML(`
                  <h3>${trailData.properties!['name']}</h3>
                  <p><strong>Difficulty:</strong> ${
                    trailData.properties!['difficulty']
                  }</p>
                  <p><strong>Length:</strong> ${
                    trailData.properties!['length'] || 'N/A'
                  } miles</p>
                  <p><strong>Rating:</strong> ${
                    trailData.properties!['rating'] || 'N/A'
                  }</p>
                  <a href="#" id="back-to-list">Back to List</a>
                `);

                // Add event listener for "Back to List"
                setTimeout(() => {
                  const backButton = document.getElementById('back-to-list');
                  if (backButton) {
                    backButton.addEventListener('click', (event) => {
                      event.preventDefault(); // 🚀 **Fix: Prevent navigation**
                      popup.setHTML(popupContent); // Reset to original list
                      attachEventListeners(); // Reattach click listeners
                    });
                  }
                }, 50);
              }
            }
          });
        });
      };

      // Attach initial event listeners
      setTimeout(() => attachEventListeners(), 100);
    });
  }

  showTrailDetails(trail: GeoJSON.Feature<GeoJSON.Point>) {
    const { name, difficulty, description, length } = trail.properties!;
    new mapboxgl.Popup()
      .setLngLat(trail.geometry.coordinates as [number, number])
      .setHTML(
        `
        <h3>${name}</h3>
        <p><strong>Difficulty:</strong> ${difficulty}</p>
        <p><strong>Length:</strong> ${length} miles</p>
        <p><strong>Description:</strong> ${
          description || 'No description available.'
        }</p>
      `
      )
      .addTo(this.map!);
  }

  setDifficultyFilter(difficulty: string | null) {
    if (!this.map) return;

    this.difficultyFilter = difficulty;

    if (difficulty) {
      // Hide the original cluster & unclustered layers
      this.map.setLayoutProperty(
        'easy-unclustered-point',
        'visibility',
        'none'
      );
      this.map.setLayoutProperty('easy-clusters', 'visibility', 'none');
      this.map.setLayoutProperty('easy-clusters-count', 'visibility', 'none');

      this.map.setLayoutProperty('intermediate-clusters', 'visibility', 'none');
      this.map.setLayoutProperty(
        'intermediate-unclustered-point',
        'visibility',
        'none'
      );
      this.map.setLayoutProperty(
        'intermediate-clusters-count',
        'visibility',
        'none'
      );

      this.map.setLayoutProperty('advanced-clusters', 'visibility', 'none');
      this.map.setLayoutProperty(
        'advanced-unclustered-point',
        'visibility',
        'none'
      );
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
      this.map.setLayoutProperty(
        'easy-unclustered-point',
        'visibility',
        'visible'
      );
      this.map.setLayoutProperty('easy-clusters', 'visibility', 'visible');
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
        'intermediate-unclustered-point',
        'visibility',
        'visible'
      );
      this.map.setLayoutProperty(
        'intermediate-clusters-count',
        'visibility',
        'visible'
      );

      this.map.setLayoutProperty('advanced-clusters', 'visibility', 'visible');
      this.map.setLayoutProperty(
        'advanced-unclustered-point',
        'visibility',
        'visible'
      );
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

  addBoundaries(boundaryName: string, boundaryData: MapBoundary) {
    if (!this.map) return;

    // Remove existing source if it exists
    if (this.map.getSource(`${boundaryName}-boundaries`)) {
      this.map.removeLayer(`${boundaryName}-fill`);
      this.map.removeLayer(`${boundaryName}-outline`);
      this.map.removeLayer(`${boundaryName}-labels`);
      this.map.removeSource(`${boundaryName}-boundaries`);
      this.map.removeLayer(`${boundaryName}-boundary-label`);
    }

    // Compute centroid for the entire boundary
    const boundaryCentroid = computeBoundaryCentroid(boundaryData);

    // Create a GeoJSON for the overall boundary label
    // Create a GeoJSON for the overall boundary label
    const boundaryLabelGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: boundaryName }, // Boundary name label
          geometry: {
            type: 'Point',
            coordinates: boundaryCentroid, // Ensure this is [longitude, latitude]
          },
        },
      ],
    };

    this.map.addSource(`${boundaryName}-boundaries`, {
      type: 'geojson',
      data: boundaryData, // Use the imported GeoJSON
    });

    this.map.addSource(`${boundaryName}-boundary-label`, {
      type: 'geojson',
      data: boundaryLabelGeoJSON,
    });

    // Add a fill layer to color the boundaries
    this.map.addLayer({
      id: `${boundaryName}-fill`,
      type: 'fill',
      source: `${boundaryName}-boundaries`,
      paint: {
        'fill-color': '#0074ad', // Red fill color
        'fill-opacity': 0.3, // Semi-transparent
      },
    });

    // Add a line layer for the boundary edges
    this.map.addLayer({
      id: `${boundaryName}-outline`,
      type: 'line',
      source: `${boundaryName}-boundaries`,
      paint: {
        'line-color': '#ffffff', // White border
        'line-width': 2,
        'line-opacity': 0.5,
      },
    });

    this.map.addLayer({
      id: `${boundaryName}-labels`,
      type: 'symbol',
      source: `${boundaryName}-boundaries`,
      layout: {
        'text-field': ['get', 'Name'], // Get the Name property from GeoJSON
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        // 'text-size': [
        //   'interpolate',
        //   ['linear'],
        //   ['zoom'],
        //   8,
        //   10, // At zoom 8, text size is 10
        //   12,
        //   14, // At zoom 12, text size is 14
        //   16,
        //   18, // At zoom 16, text size is 18
        // ],
        'text-anchor': 'center', // Center text over polygon
      },
      paint: {
        'text-color': '#ffffff', // white text
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          0, // At zoom 8, fully transparent (hidden)
          10,
          0.5, // Start appearing
          12,
          1, // Fully visible at zoom 12+
        ],
      },
    });

    this.map.addLayer({
      id: `${boundaryName}-boundary-label`,
      type: 'symbol',
      source: `${boundaryName}-boundary-label`,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 24,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#ffcc00',
        'text-halo-color': '#000000',
        'text-halo-width': 4,
      },
    });

    // **Click Event for Boundaries**
    this.map.on('click', `${boundaryName}-fill`, (e) => {
      const features = e.features;

      if (!features || features.length === 0) return;

      const feature = e.features?.[0];
      if (!feature) return;

      const name = feature.properties?.['Name'];

      const geometry = feature.geometry as Geometry;
      const coordinates = geometry.coordinates;

      if (coordinates) {
        // // Highlight the clicked boundary
        this.map!.setPaintProperty(`${boundaryName}-fill`, 'fill-color', [
          'case',
          ['==', ['get', 'Name'], name],
          '#00FF00', // Highlight in green
          '#0074ad', // Default red
        ]);
      }
    });
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

  createLegend() {
    const legendData = [
      { name: 'Easy Trails', color: '#26a626' },
      { name: 'Intermediate Trails', color: '#0000FF' },
      { name: 'Advanced Trails', color: '#FF0000' },
    ];

    const legendList = document.getElementById('legendList') as HTMLElement;
    legendList.innerHTML = ''; // Clear previous content

    legendData.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'legend-item';
      listItem.innerHTML = `
        <span class="legend-color" style="background-color:${item.color}"></span>
        ${item.name}
      `;
      legendList.appendChild(listItem);
    });
  }

  // How to add a simple line to the map
  // API call ex: https://maps.googleapis.com/maps/api/directions/json?origin=44.063941615368016,-121.35892329473634&destination=44.050193697768584,-121.19625682727586&mode=driving&key=
  routeGeoJSON: GeoJSON.Feature<GeoJSON.Geometry> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: decodePolyline(
        'sf}kGj|ucVa@D_AVk@V}@j@e@`@Mc@Mi@Qo@Y{BGeAI}A?u@AiA@UeAg@_Bw@AA{EcCQMCGE_@AMMWJcARmAp@wCjBeGpAeE^kB^cC^iB^cAb@y@`AcBh@uA^oAXyAPuARmBLcAHa@J_@HC`@wAL@HEHQBUCQGMEm@ESNmB`A_HX{AlBuGfB_GN_ADi@FMDm@?}@Jc@B[EMGIBg@?aACeG?iQ?cBJ_BJMDYCQCIGEMsA?cNQiBAiDAmICmADOD_BFGBIBSAOEMCCE[@iC?cAES?SAeC@iGAoL?mH?i@DU~AaGVy@RSlAgC`A{Bv@uBVgAL_AJm@Bk@bA}BL_@BWBwA@eC?gK?}AAmDAuLHc@?wC?}B@yCKi@?}A?cA@mHAqT?cW?mKHe@ByBNqBLy@Nm@Xu@j@iA\\c@Z[~AkAjAy@v@q@d@i@x@oAf@aAn@iBb@qBZoBPaBDoALqEFuE@s@Iu@BgCDqBJuAFg@`@sAP_ArAuGh@iCd@aC?e@T}AHu@LeBBkA@}MBsNFkYBuNHeC?oBB}FC_SAeHCMAye@AuDGmCKiAG_@Om@gA}CASGWW{A?g@BUFQJODOBWCWIQEEMg@I_AKqBEgAESD{AHkDA}@_@yG{@uNo@mJ_AcOe@cH}Bk_@k@aJMeCGyAAiBCyGBaCBaAF}BNkCDs@Dc@P}BPaBH{@?S|@kIf@gEV}AZeBl@gCp@{BzEuO~BuHzAqFh@}BlBmIhEeTnGs['
      ),
    },
  };

  createLinePath() {
    this.map?.addSource('route', {
      type: 'geojson',
      data: this.routeGeoJSON,
    });

    this.map?.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#007AFF', // Blue color
        'line-width': 5,
      },
    });
  }
}
