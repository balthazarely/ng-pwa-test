import { Injectable } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root',
})
export class ArcGisService {
  buildPinFeatureLayer(): __esri.FeatureLayer {
    const featureLayer = new FeatureLayer({
      source: [],
      objectIdField: 'ObjectID',
      geometryType: 'point',
      popupTemplate: {
        title: 'Clicked Location',
        content: 'This is a pin that you clicked',
      },
      fields: [
        { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
        { name: 'latitude', alias: 'Latitude', type: 'double' },
        { name: 'longitude', alias: 'Longitude', type: 'double' },
      ],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          color: [155, 176, 40],
          size: 16,
          outline: {
            color: [255, 255, 255],
            width: 4,
          },
        },
      } as any,
    });

    return featureLayer;
  }
}
