import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutBodyComponent } from './about-body.component';

describe('AboutBodyComponent', () => {
  let component: AboutBodyComponent;
  let fixture: ComponentFixture<AboutBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutBodyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
