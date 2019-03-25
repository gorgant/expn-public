import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InActionComponent } from './in-action.component';

describe('InActionComponent', () => {
  let component: InActionComponent;
  let fixture: ComponentFixture<InActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
