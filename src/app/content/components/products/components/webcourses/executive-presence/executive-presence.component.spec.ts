import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExecutivePresenceComponent } from './executive-presence.component';

describe('ExecutivePresenceComponent', () => {
  let component: ExecutivePresenceComponent;
  let fixture: ComponentFixture<ExecutivePresenceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutivePresenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutivePresenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
