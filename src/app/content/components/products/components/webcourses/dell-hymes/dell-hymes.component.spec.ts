import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DellHymesComponent } from './dell-hymes.component';

describe('DellHymesComponent', () => {
  let component: DellHymesComponent;
  let fixture: ComponentFixture<DellHymesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DellHymesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DellHymesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
