import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderComponent } from '../components/header/header.component';
import { SidenavComponent } from '../components/sidenav/sidenav.component';
import { FooterComponent } from '../components/footer/footer.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    SidenavComponent,
    FooterComponent,
  ],
  imports: [
    SharedModule,
    RouterModule
  ],
  // Must be exported to be used in the app component
  exports: [
    HeaderComponent,
    SidenavComponent,
    FooterComponent
  ]
})
export class NavigationModule { }
