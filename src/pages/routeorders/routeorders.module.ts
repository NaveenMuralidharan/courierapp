import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RouteordersPage } from './routeorders';

@NgModule({
  declarations: [
    RouteordersPage,
  ],
  imports: [
    IonicPageModule.forChild(RouteordersPage),
  ],
})
export class RouteordersPageModule {}
