import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubProgressTrackerComponent } from './sub-progress-tracker.component';

describe('SubProgressTrackerComponent', () => {
  let component: SubProgressTrackerComponent;
  let fixture: ComponentFixture<SubProgressTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubProgressTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubProgressTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
