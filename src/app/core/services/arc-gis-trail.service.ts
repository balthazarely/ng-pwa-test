import { Injectable } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { BehaviorSubject } from 'rxjs';
import { Trail } from '../types/trail.model';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
export const spatialReference = SpatialReference.WebMercator;
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';

@Injectable({
  providedIn: 'root',
})
export class ArcGisTrailService {
  mapView!: __esri.MapView;
  zoomedPin$: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  buildWOrkOrderFeatureLayer(data: Trail[]): __esri.FeatureLayer {
    const ftLayer = new FeatureLayer({
      source: this.buildWorkOrderGraphics(data),
      geometryType: 'point',
      renderer: this.buildWorkOrderRenderer(),
      objectIdField: 'objectId',
      fields: [
        {
          name: 'name',
          alias: 'name',
          type: 'string',
        },
      ],
      outFields: ['*'],
      minScale: 100000000000,
      maxScale: 0,
    });
    return ftLayer;
  }

  //*** Build Graphics for each work order **//
  buildWorkOrderGraphics(data: any[]): __esri.Graphic[] {
    return data.map((item) => {
      const attributes = {
        name: item.name,
      };

      return new Graphic({
        geometry: this.buildGeoPoint(item as any),
        attributes,
      });
    });
  }

  //*** Define coordinates for work order **//
  buildGeoPoint(params: { lat: number; lon: number }): __esri.Point {
    return new Point({
      latitude: params.lat,
      longitude: params.lon,
    });
  }

  //*** This is the pin style (not clustered) **//
  buildWorkOrderRenderer(): __esri.Renderer {
    return new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        color: [226, 119, 40],
        size: 16,
        outline: {
          color: [255, 255, 255],
          width: 4,
        },
      }),
    });
  }

  enableClustering(featureLayer: __esri.FeatureLayer) {
    const clusterColor = [226, 119, 40];
    const clusterColorText = 'white';

    const clusterConfig: any = {
      type: 'cluster',
      maxScale: 1000,
      clusterRadius: '100px',
      clusterMinSize: '50px',
      clusterMaxSize: '50px',

      symbol: {
        type: 'simple-marker',
        color: clusterColor,
        outline: {
          color: clusterColorText,
          width: 4,
        },
      },

      labelingInfo: [
        {
          deconflictionStrategy: 'none',
          labelExpressionInfo: {
            expression: "Text($feature.cluster_count, '#,###')",
          },
          symbol: {
            type: 'text',
            color: clusterColorText,
            font: {
              weight: 'bold',
              size: '18px',
            },
          },
          labelPlacement: 'center-center',
        },
      ],
    };
    featureLayer.featureReduction = clusterConfig;
  }
}
