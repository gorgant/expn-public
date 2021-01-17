import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StripeElementsComponent } from './stripe-elements.component';

describe('StripeElementsComponent', () => {
  let component: StripeElementsComponent;
  let fixture: ComponentFixture<StripeElementsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StripeElementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
