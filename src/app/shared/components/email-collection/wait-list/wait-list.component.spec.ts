import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitListComponent } from './wait-list.component';

describe('WaitListComponent', () => {
  let component: WaitListComponent;
  let fixture: ComponentFixture<WaitListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
