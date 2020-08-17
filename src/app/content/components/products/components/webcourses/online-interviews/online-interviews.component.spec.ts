import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineInterviewsComponent } from './online-interviews.component';

describe('OnlineInterviewsComponent', () => {
  let component: OnlineInterviewsComponent;
  let fixture: ComponentFixture<OnlineInterviewsComponent>;

  beforeEach(async(() => {
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
