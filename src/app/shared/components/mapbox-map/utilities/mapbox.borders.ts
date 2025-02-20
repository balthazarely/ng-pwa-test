import { MapBoundary } from '../kmz/types';

export function computeBoundaryCentroid(
  boundaryData: MapBoundary
): [number, number] {
  let totalX = 0,
    totalY = 0,
    count = 0;

  boundaryData.features.forEach((feature) => {
    feature.geometry.coordinates.forEach((polygon: any) => {
      polygon[0].forEach((coord: [number, number]) => {
        totalX += coord[0];
        totalY += coord[1];
        count++;
      });
    });
  });

  return [totalX / count, totalY / count];
}
