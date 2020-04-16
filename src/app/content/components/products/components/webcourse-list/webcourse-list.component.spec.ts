import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcourseListComponent } from './webcourse-list.component';

describe('WebcourseListComponent', () => {
  let component: WebcourseListComponent;
  let fixture: ComponentFixture<WebcourseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebcourseListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
