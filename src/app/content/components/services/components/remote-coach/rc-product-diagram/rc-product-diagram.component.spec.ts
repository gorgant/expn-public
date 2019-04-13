import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RcProductDiagramComponent } from './rc-product-diagram.component';

describe('RcProductDiagramComponent', () => {
  let component: RcProductDiagramComponent;
  let fixture: ComponentFixture<RcProductDiagramComponent>;

  beforeEach(async(() => {
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
