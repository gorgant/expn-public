import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastHeroComponent } from './podcast-hero.component';

describe('PodcastHeroComponent', () => {
  let component: PodcastHeroComponent;
  let fixture: ComponentFixture<PodcastHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodcastHeroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PodcastHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
