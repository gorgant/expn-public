import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EpisodeItemComponent } from './episode-item.component';

describe('EpisodeItemComponent', () => {
  let component: EpisodeItemComponent;
  let fixture: ComponentFixture<EpisodeItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EpisodeItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpisodeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
