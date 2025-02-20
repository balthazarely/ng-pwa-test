export interface MapBoundary {
  type: 'FeatureCollection';
  name: string;
  key: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: Feature[];
}

export interface Feature {
  type: 'Feature';
  properties: Properties;
  geometry: Geometry;
}

interface Properties {
  Name: string;
  [key: string]: any; // Allow additional properties
}

export interface Geometry {
  type: 'MultiPolygon';
  coordinates: number[][][][]; // Correct type for MultiPolygon
}
