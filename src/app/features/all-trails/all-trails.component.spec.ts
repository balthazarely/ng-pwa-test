import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTrailsComponent } from './all-trails.component';

describe('AllTrailsComponent', () => {
  let component: AllTrailsComponent;
  let fixture: ComponentFixture<AllTrailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTrailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTrailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
