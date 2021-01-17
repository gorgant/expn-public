import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductSummaryComponent } from './product-summary.component';

describe('ProductSummaryComponent', () => {
  let component: ProductSummaryComponent;
  let fixture: ComponentFixture<ProductSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
