import { Routes } from '@angular/router';
import { AllTrailsComponent } from './features/all-trails/all-trails.component';
import { OfflineComponent } from './features/offline/offline.component';

export const routes: Routes = [
  { path: '', component: AllTrailsComponent },
  { path: 'offline-route', component: OfflineComponent },
];
