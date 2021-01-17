import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RemoteCoachComponent } from './remote-coach.component';

describe('RemoteCoachComponent', () => {
  let component: RemoteCoachComponent;
  let fixture: ComponentFixture<RemoteCoachComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteCoachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
