import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestamonialComponent } from './testamonial.component';

describe('TestamonialsComponent', () => {
  let component: TestamonialComponent;
  let fixture: ComponentFixture<TestamonialComponent>;

  beforeEach(async(() => {
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
