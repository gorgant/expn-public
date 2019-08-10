import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastBodyComponent } from './podcast-body.component';

describe('PodcastBodyComponent', () => {
  let component: PodcastBodyComponent;
  let fixture: ComponentFixture<PodcastBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PodcastBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PodcastBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
