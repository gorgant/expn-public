import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EInActionComponent } from './e-in-action.component';

describe('EInActionComponent', () => {
  let component: EInActionComponent;
  let fixture: ComponentFixture<EInActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EInActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EInActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
