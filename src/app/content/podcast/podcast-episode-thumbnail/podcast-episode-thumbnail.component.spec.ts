import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastEpisodeThumbnailComponent } from './podcast-episode-thumbnail.component';

describe('PodcastEpisodeThumbnailComponent', () => {
  let component: PodcastEpisodeThumbnailComponent;
  let fixture: ComponentFixture<PodcastEpisodeThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastEpisodeThumbnailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PodcastEpisodeThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
