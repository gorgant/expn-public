import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlineTeamworkComponent } from './online-teamwork.component';

describe('OnlineTeamworkComponent', () => {
  let component: OnlineTeamworkComponent;
  let fixture: ComponentFixture<OnlineTeamworkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineTeamworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineTeamworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
