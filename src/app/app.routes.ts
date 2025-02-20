import { Routes } from '@angular/router';
import { AllTrailsComponent } from './features/all-trails/all-trails.component';
import { OfflineComponent } from './features/offline/offline.component';
import { AllTrailsMapboxComponent } from './features/all-trails-mapbox/all-trails-mapbox.component';
import { AllTrailsMapboxClustersComponent } from './features/all-trails-mapbox-clusters/all-trails-mapbox-clusters.component';

export const routes: Routes = [
  { path: '', component: AllTrailsComponent },
  { path: 'offline-route', component: OfflineComponent },
  { path: 'mapbox', component: AllTrailsMapboxComponent },
  {
    path: 'mapbox-donut-clusters',
    component: AllTrailsMapboxClustersComponent,
  },
];
