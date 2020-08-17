import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupInterviewsComponent } from './group-interviews.component';

describe('GroupInterviewsComponent', () => {
  let component: GroupInterviewsComponent;
  let fixture: ComponentFixture<GroupInterviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupInterviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
