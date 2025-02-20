import { Component } from '@angular/core';
import { TrailsService } from '../../core/services/trails.service';
import { map } from 'rxjs';
import { Trail } from '../../core/types/trail.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline.component.html',
  styleUrl: './offline.component.scss',
})
export class OfflineComponent {
  trail: Trail | undefined;
  isLoading: boolean = false;

  constructor(private trailsService: TrailsService) {}

  ngOnInit() {
    console.log('getSingleTrail');

    this.getSingleTrail('281506');
  }

  getSingleTrail(trailId: string) {
    this.isLoading = true;
    this.trailsService
      .getTrail(trailId)
      .pipe(map((trails) => trails?.data[0]))
      .subscribe((trails) => {
        this.trail = trails;
        this.isLoading = false;
      });
  }
}
