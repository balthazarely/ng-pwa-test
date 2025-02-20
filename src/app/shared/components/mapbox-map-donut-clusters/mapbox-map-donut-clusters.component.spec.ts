import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxMapDonutClustersComponent } from './mapbox-map-donut-clusters.component';

describe('MapboxMapDonutClustersComponent', () => {
  let component: MapboxMapDonutClustersComponent;
  let fixture: ComponentFixture<MapboxMapDonutClustersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapboxMapDonutClustersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapboxMapDonutClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
