import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlineInterviewsComponent } from './online-interviews.component';

describe('OnlineInterviewsComponent', () => {
  let component: OnlineInterviewsComponent;
  let fixture: ComponentFixture<OnlineInterviewsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineInterviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
