import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDataFormComponent } from './purchase-data-form.component';

describe('PurchaseDataFormComponent', () => {
  let component: PurchaseDataFormComponent;
  let fixture: ComponentFixture<PurchaseDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
