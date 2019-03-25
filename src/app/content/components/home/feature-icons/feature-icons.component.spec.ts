import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureIconsComponent } from './feature-icons.component';

describe('FeatureIconsComponent', () => {
  let component: FeatureIconsComponent;
  let fixture: ComponentFixture<FeatureIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
