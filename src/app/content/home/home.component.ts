import { Component, OnInit, inject } from '@angular/core';
import { HomeHeroComponent } from "./home-hero/home-hero.component";
import { FeatureIconsComponent } from "./feature-icons/feature-icons.component";
import { SubscribeBoxComponent } from "../../shared/components/subscriptions/subscribe-box/subscribe-box.component";
import { FeaturedPostsComponent } from "./featured-posts/featured-posts.component";
import { metaTagDefaults } from '../../../../shared-models/meta/metatags.model';
import { PublicAppRoutes } from '../../../../shared-models/routes-and-paths/app-routes.model';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [HomeHeroComponent, FeatureIconsComponent, SubscribeBoxComponent, FeaturedPostsComponent]
})
export class HomeComponent implements OnInit {
  
  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.configSeoAndAnalytics();
  }

  private configSeoAndAnalytics() {

    const title = metaTagDefaults.expnPublic.metaTagDefaultTitle;
    const description = metaTagDefaults.expnPublic.metaTagDefaultDescription;
    const localImagePath = metaTagDefaults.expnPublic.metaTagDefaultImage;
    const canonicalUrlPath = PublicAppRoutes.HOME;

    this.analyticsService.setSeoTags(title, description, localImagePath, canonicalUrlPath);
  }
  
}
