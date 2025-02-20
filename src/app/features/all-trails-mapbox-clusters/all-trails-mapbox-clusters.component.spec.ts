import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTrailsMapboxClustersComponent } from './all-trails-mapbox-clusters.component';

describe('AllTrailsMapboxClustersComponent', () => {
  let component: AllTrailsMapboxClustersComponent;
  let fixture: ComponentFixture<AllTrailsMapboxClustersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTrailsMapboxClustersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTrailsMapboxClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
