import { Trail } from '../../../../core/types/trail.model';

export function createGeoJsonDataSet(trails: Trail[]) {
  const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: trails.map((trail) => ({
      type: 'Feature',
      properties: {
        name: trail.name,
        difficulty: trail.difficulty,
      },
      geometry: {
        type: 'Point',
        coordinates: [+trail.lon, +trail.lat],
      },
    })),
  };
  return geojson;
}

export const createClusterLayerObject = (
  id: string,
  source: string,
  color: string
) => {
  const config = {
    id: id,
    type: 'circle',
    source: source,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': color,
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
      'circle-opacity': 1,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  };
  return config;
};

export const createClusterCountLayerObject = (id: string, source: string) => {
  const config = {
    id: id,
    type: 'symbol',
    source: source,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 14,
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    },
    paint: {
      'text-color': '#ffffff',
    },
  };
  return config;
};

export const createUnclusterLayerObject = (
  id: string,
  source: string,
  color: string
) => {
  const config = {
    id: id,
    type: 'circle',
    source: source,
    filter: ['!', ['has', 'point_count']], // Default: show all unclustered points
    paint: {
      'circle-color': color,
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  };
  return config;
};
