import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RcProductDiagramComponent } from './rc-product-diagram.component';

describe('RcProductDiagramComponent', () => {
  let component: RcProductDiagramComponent;
  let fixture: ComponentFixture<RcProductDiagramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RcProductDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RcProductDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
