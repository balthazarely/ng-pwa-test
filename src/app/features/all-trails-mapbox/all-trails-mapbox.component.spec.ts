import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTrailsMapboxComponent } from './all-trails-mapbox.component';

describe('AllTrailsMapboxComponent', () => {
  let component: AllTrailsMapboxComponent;
  let fixture: ComponentFixture<AllTrailsMapboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTrailsMapboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTrailsMapboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
