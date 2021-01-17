import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TestamonialComponent } from './testamonial.component';

describe('TestamonialsComponent', () => {
  let component: TestamonialComponent;
  let fixture: ComponentFixture<TestamonialComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestamonialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestamonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
